/*
 * J2meJS - a Java ME emulator implemented in JavaScript.
 * Copyright (C) 2026 Rosabis & Zixing
 * 
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; version 2 of the License only.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, see <https://www.gnu.org/licenses/>.
 * 
 * Network use and the source code obligation:
 * J2meJS is a purely client-side application. The browser downloads the full
 * program and data into local storage (including IndexedDB) and runs everything
 * on the user's own device; no program code is executed on the server. Serving
 * a modified build from any web server therefore delivers a full, runnable copy
 * to every visitor and constitutes distribution under the GNU General Public
 * License version 2. As required by Sections 2(b) and 3 of that License, you
 * must make the complete corresponding source code of your modified version
 * available to every recipient at no charge. This restates existing License
 * terms and is not an additional restriction; neither network deployment nor
 * storage in IndexedDB exempts you from this obligation.
 */

/* J2ME runtime player controls. Keep ES5 syntax for KaiOS/older Firefox. */
(function () {
  'use strict';

  function tt(key) {
    return (window.I18n && I18n.t) ? I18n.t(key) : key;
  }

  var body = document.body;
  var stage = document.getElementById('player-stage');
  var displayContainer = document.getElementById('display-container');
  var main = document.getElementById('main');
  var canvas = document.getElementById('canvas');
  var keypad = document.getElementById('keypad');
  var titleLabel = document.getElementById('player-title');
  var fpsLabel = document.getElementById('player-fps');
  var speedSelect = document.getElementById('player-speed');
  var keypadButton = document.getElementById('player-toggle-keypad');
  var fullscreenButton = document.getElementById('player-toggle-fullscreen');
  var angle = 0;
  var frameCount = window.__j2meFrameCount || 0;
  var titlePollCount = 0;
  var lastContentSignature = '';
  var overlaySyncTimer = 0;

  function safeGet(storage, key) {
    try { return storage.getItem(key); } catch (e) { return null; }
  }

  function safeSet(storage, key, value) {
    try { storage.setItem(key, value); } catch (e) {}
  }

  function queryValue(name) {
    var match = new RegExp('(?:^|&)' + name + '=([^&]*)').exec(location.search.substring(1));
    if (!match) return '';
    try { return decodeURIComponent(match[1].replace(/\+/g, ' ')); } catch (e) { return match[1]; }
  }

  function basename(value) {
    value = String(value || '').split(':')[0].split('/').pop() || '';
    return value.replace(/\.jar$/i, '');
  }

  function gameIdentity() {
    return queryValue('localjar') || queryValue('jars') || 'j2me';
  }

  function initialTitle() {
    return basename(queryValue('localjar') || queryValue('jars')) || 'J2ME';
  }

  function refreshTitle() {
    var name = '';
    try {
      if (window.MIDP && MIDP.manifest) {
        name = MIDP.manifest['MIDlet-Name'] || '';
      }
    } catch (e) {}
    if (name) {
      titleLabel.textContent = name;
      document.title = name + ' — J2ME';
      return true;
    }
    if (!titleLabel.textContent || titleLabel.textContent === 'J2ME') {
      titleLabel.textContent = initialTitle();
    }
    return false;
  }

  function normaliseAngle(value) {
    value = parseInt(value, 10) || 0;
    value = ((value % 360) + 360) % 360;
    return Math.round(value / 90) * 90 % 360;
  }

  function rotationStorageKey() {
    return 'j2me.player.rotation.' + gameIdentity();
  }

  function configuredAngle() {
    if (main.classList.contains('rotate-left')) return 270;
    if (main.classList.contains('rotate-right')) return 90;
    if (main.classList.contains('rotate-180')) return 180;
    return 0;
  }

  function configuredScale() {
    var value = window.config && config.gameresize ? String(config.gameresize) : 'resize-auto';
    var scales = {
      'resize-0x5': 0.5,
      'resize-0x75': 0.75,
      'resize-1': 1,
      'resize-1x5': 1.5,
      'resize-2': 2,
      'resize-2x5': 2.5,
      'resize-3': 3
    };
    return Object.prototype.hasOwnProperty.call(scales, value) ? scales[value] : null;
  }

  function syncUnlimitedCanvas() {
    if (!window.config || config.canvasSize !== 'size-no') return;

    var width = Math.max(1, Math.round(displayContainer.clientWidth));
    var height = Math.max(1, Math.round(displayContainer.clientHeight));
    if (angle === 90 || angle === 270) {
      var swap = width;
      width = height;
      height = swap;
    }

    var fixedScale = configuredScale();
    var cssScale = fixedScale === null ? 1 : fixedScale;
    var changed = canvas.width !== width || canvas.height !== height;
    if (changed) {
      canvas.width = width;
      canvas.height = height;
      if (typeof window.lcdWidth !== 'undefined') window.lcdWidth = width;
      if (typeof window.lcdHeight !== 'undefined') window.lcdHeight = height;
    }
    canvas.style.width = Math.max(1, Math.round(width * cssScale)) + 'px';
    canvas.style.height = Math.max(1, Math.round(height * cssScale)) + 'px';
    if (changed) {
      try { canvas.dispatchEvent(new Event('canvasresize')); } catch (e) {}
    }
  }

  function syncLCDUIOverlay() {
    if (typeof window.syncLCDUIOverlayBounds !== 'function') return;
    window.syncLCDUIOverlayBounds();
    if (window.requestAnimationFrame) {
      window.requestAnimationFrame(window.syncLCDUIOverlayBounds);
    }
    window.clearTimeout(overlaySyncTimer);
    /* #main has a short transform transition. Sync once more at its final
       geometry so a visible LCDUI form cannot retain an intermediate rect. */
    overlaySyncTimer = window.setTimeout(window.syncLCDUIOverlayBounds, 260);
  }

  function visibleSoftkeyBarHeight() {
    var softkeyBar = document.getElementById('canvas-softkey-bar');
    if (!softkeyBar) return 0;
    var style = window.getComputedStyle(softkeyBar);
    if (style.display === 'none' || style.visibility === 'hidden') return 0;
    return softkeyBar.offsetHeight || 0;
  }

  function fitCanvas() {
    if (!stage || !displayContainer || !main || !canvas) return;

    main.style.transform = 'none';
    syncUnlimitedCanvas();
    /* Keep resize-auto tied to the configured logical canvas ratio, and reserve
       room for the on-screen LCDUI softkey bar so labels are not clipped by the
       virtual keypad / stage overflow. */
    var naturalWidth = canvas.offsetWidth || canvas.width || 1;
    var naturalHeight = (canvas.offsetHeight || canvas.height || 1) + visibleSoftkeyBarHeight();
    var isPhone = (window.innerWidth || document.documentElement.clientWidth || 0) <= 700;
    var unlimited = window.config && config.canvasSize === 'size-no';
    var keypadVisible = keypad && !body.classList.contains('keypad-hidden') &&
      window.getComputedStyle(keypad).display !== 'none';
    var canCompact = isPhone && keypadVisible && keypad.classList.contains('square-keypad');
    var stageInset = 0;
    var availableWidth = Math.max(1, displayContainer.clientWidth - stageInset);
    var actualAvailableHeight = Math.max(1, displayContainer.clientHeight - stageInset);
    var availableHeight = actualAvailableHeight;
    var quarterTurn = angle === 90 || angle === 270;
    var renderedWidth = quarterTurn ? naturalHeight : naturalWidth;
    var renderedHeight = quarterTurn ? naturalWidth : naturalHeight;
    /* Automatic mode fits the logical canvas to the available stage. Explicit
       gamerresize values were already applied to the canvas CSS size by MIDP
       and must not receive a second player-shell scale. */
    var fixedScale = configuredScale();
    var scale = unlimited ? 1 : (fixedScale === null ?
      Math.min(availableWidth / renderedWidth, availableHeight / renderedHeight) : 1);

    if (!isFinite(scale) || scale <= 0) scale = 1;
    var fittedHeight = renderedHeight * scale;
    var slack = Math.max(0, availableHeight - fittedHeight);
    var compact = canCompact && fittedHeight <= availableHeight &&
      slack <= Math.max(96, availableHeight * 0.22);

    body.classList.toggle('compact-stage', compact);
    body.classList.toggle('large-stage-gap', canCompact && !compact);
    if (compact) {
      body.style.setProperty('--player-compact-stage-height', Math.ceil(fittedHeight) + 'px');
    } else {
      body.style.removeProperty('--player-compact-stage-height');
    }
    main.style.transform = 'rotate(' + angle + 'deg) scale(' + scale + ')';
    syncLCDUIOverlay();
  }

  function hasFixedCanvasViewport() {
    var size = window.config && config.canvasSize ? String(config.canvasSize) : '';
    return /^size-\d+x\d+$/i.test(size);
  }

  function clearCanvasCrop() {
    if (!main.classList.contains('content-cropped')) return;
    main.classList.remove('content-cropped');
    main.style.removeProperty('--player-content-top');
    main.style.width = '';
    main.style.height = '';
    lastContentSignature = '';
    fitCanvas();
  }

  function detectCanvasContent() {
    /* A fixed size is a contract, not a hint. Programs such as NES emulators
       legitimately paint only a square subsection of a 240x320 surface. A
       frame-content crop would make their viewport jump and leave LCDUI HTML
       overlays using a different coordinate space. */
    if (hasFixedCanvasViewport()) {
      clearCanvasCrop();
      return;
    }
    if (!canvas || angle !== 0 || canvas.width <= 0 || canvas.height <= 0) {
      clearCanvasCrop();
      return;
    }

    var context;
    var pixels;
    try {
      context = canvas.getContext('2d', { willReadFrequently: true });
      pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
    } catch (e) {
      return;
    }

    var width = canvas.width;
    var height = canvas.height;
    var alphaMinY = height;
    var alphaMaxY = -1;
    var stepX = width > 480 ? 3 : 2;
    var y;
    var x;
    var rowVisible;

    for (y = 0; y < height; y++) {
      rowVisible = false;
      for (x = 0; x < width; x += stepX) {
        if (pixels[(y * width + x) * 4 + 3] > 8) {
          rowVisible = true;
          break;
        }
      }
      if (rowVisible) {
        if (alphaMinY === height) alphaMinY = y;
        alphaMaxY = y;
      }
    }

    if (alphaMaxY < 0) return;

    /* Some MIDlets clear the unused part of a portrait surface to an opaque,
       solid colour. Alpha bounds cannot see that padding, so also look for a
       large, nearly uniform tail at the bottom of the backing canvas. */
    var sampleCount = 0;
    var red = 0;
    var green = 0;
    var blue = 0;
    var alpha = 0;
    var sampleY;
    var index;
    var bottomSampleRows = Math.min(3, height);
    for (sampleY = height - bottomSampleRows; sampleY < height; sampleY++) {
      for (x = 0; x < width; x += stepX) {
        index = (sampleY * width + x) * 4;
        red += pixels[index];
        green += pixels[index + 1];
        blue += pixels[index + 2];
        alpha += pixels[index + 3];
        sampleCount++;
      }
    }
    red = Math.round(red / sampleCount);
    green = Math.round(green / sampleCount);
    blue = Math.round(blue / sampleCount);
    alpha = Math.round(alpha / sampleCount);

    var uniformTailRows = 0;
    var matching;
    var rowSamples;
    for (y = height - 1; y >= 0; y--) {
      matching = 0;
      rowSamples = 0;
      for (x = 0; x < width; x += stepX) {
        index = (y * width + x) * 4;
        if (Math.abs(pixels[index] - red) <= 10 &&
            Math.abs(pixels[index + 1] - green) <= 10 &&
            Math.abs(pixels[index + 2] - blue) <= 10 &&
            Math.abs(pixels[index + 3] - alpha) <= 10) {
          matching++;
        }
        rowSamples++;
      }
      if (matching / rowSamples < 0.985) break;
      uniformTailRows++;
    }

    var minY = 0;
    var maxY = height - 1;
    var alphaVisibleRows = alphaMaxY - alphaMinY + 1;
    if (alphaVisibleRows / height < 0.86) {
      minY = alphaMinY;
      maxY = alphaMaxY;
    }
    var minimumTail = Math.max(24, Math.round(height * 0.14));
    if (uniformTailRows >= minimumTail && uniformTailRows < height * 0.8) {
      maxY = Math.min(maxY, height - uniformTailRows - 1);
    }

    var visibleRows = maxY - minY + 1;
    var ratio = visibleRows / height;
    if (ratio >= 0.86 || height - visibleRows < 24) {
      clearCanvasCrop();
      return;
    }

    var signature = minY + ':' + maxY + ':' + canvas.offsetWidth + ':' + canvas.offsetHeight;
    if (signature === lastContentSignature) return;
    lastContentSignature = signature;

    var cssHeight = canvas.offsetHeight || height;
    var cssWidth = canvas.offsetWidth || width;
    var contentTop = cssHeight * minY / height;
    var contentHeight = cssHeight * visibleRows / height;
    main.classList.add('content-cropped');
    main.style.setProperty('--player-content-top', -contentTop + 'px');
    main.style.width = cssWidth + 'px';
    main.style.height = Math.max(1, contentHeight) + 'px';
    fitCanvas();
  }

  function applyRotation(nextAngle, persist) {
    angle = normaliseAngle(nextAngle);
    if (angle !== 0) clearCanvasCrop();
    main.classList.remove('rotate-left', 'rotate-right', 'rotate-180');
    body.classList.remove('rotated-mode', 'rotate-left', 'rotate-right');
    keypad.classList.remove('rotated');

    if (angle === 90) main.classList.add('rotate-right');
    if (angle === 180) main.classList.add('rotate-180');
    if (angle === 270) main.classList.add('rotate-left');
    if (persist !== false) safeSet(window.sessionStorage, rotationStorageKey(), String(angle));

    fitCanvas();
  }

  function rotate(delta) {
    applyRotation(angle + delta, true);
  }

  function isKeypadHidden() {
    return body.classList.contains('keypad-hidden');
  }

  function updateKeypadButton() {
    var visible = !isKeypadHidden();
    keypadButton.setAttribute('aria-pressed', visible ? 'true' : 'false');
    keypadButton.setAttribute('aria-label', visible ? tt('player.hideKeypad') : tt('player.showKeypad'));
    keypadButton.title = visible ? tt('player.hideKeypad') : tt('player.showKeypad');
    keypadButton.classList.toggle('is-off', !visible);
  }

  function setKeypadHidden(hidden, persist) {
    if (hidden && typeof window.releaseAllKeys === 'function') window.releaseAllKeys();
    body.classList.toggle('keypad-hidden', hidden);
    if (!hidden) {
      keypad.classList.remove('gamepad-0');
      keypad.style.display = '';
    }
    if (persist !== false) safeSet(window.localStorage, 'j2me.player.keypadHidden', hidden ? '1' : '0');
    updateKeypadButton();
    window.setTimeout(function () {
      fitCanvas();
      /* 无按键初始以 display:none 建 DOM；等舞台重排后再按真实尺寸缩放按键。 */
      if (!hidden && typeof window._resizeDynamicKeypad === 'function') {
        window._resizeDynamicKeypad();
      }
    }, 0);
  }

  function toggleKeypad() {
    setKeypadHidden(!isKeypadHidden(), true);
  }

  function fullscreenElement() {
    return document.fullscreenElement || document.webkitFullscreenElement || null;
  }

  function updateFullscreenButton() {
    var active = !!fullscreenElement();
    fullscreenButton.classList.toggle('is-fullscreen', active);
    fullscreenButton.setAttribute('aria-pressed', active ? 'true' : 'false');
    fullscreenButton.setAttribute('aria-label', active ? tt('player.exitFs') : tt('player.enterFs'));
    fullscreenButton.title = active ? tt('player.exitFs') : tt('player.enterFs');
    window.setTimeout(fitCanvas, 0);
  }

  function toggleFullscreen() {
    var root = document.documentElement;
    var result;
    try {
      if (fullscreenElement()) {
        result = document.exitFullscreen ? document.exitFullscreen() :
          (document.webkitExitFullscreen ? document.webkitExitFullscreen() : null);
      } else {
        result = root.requestFullscreen ? root.requestFullscreen() :
          (root.webkitRequestFullscreen ? root.webkitRequestFullscreen() : null);
      }
      if (result && typeof result.catch === 'function') result.catch(function () {});
    } catch (e) {}
  }

  function updateFps() {
    var current = window.__j2meFrameCount || 0;
    var fps = document.hidden ? 0 : Math.max(0, current - frameCount);
    frameCount = current;
    fpsLabel.textContent = fps + ' FPS';
  }

  function currentSpeedRate() {
    if (window.J2MESpeed && typeof J2MESpeed.getRate === 'function') {
      return J2MESpeed.getRate();
    }
    var parsed = parseFloat(queryValue('speed') || (window.config && config.speed) || '1');
    return parsed > 0 ? parsed : 1;
  }

  function syncSpeedSelect() {
    if (!speedSelect) return;
    var rate = currentSpeedRate();
    var value = String(rate);
    if (speedSelect.value !== value) {
      speedSelect.value = value;
      if (speedSelect.selectedIndex < 0) speedSelect.value = '1';
    }
  }

  function applySpeedFromSelect() {
    if (!speedSelect) return;
    var value = speedSelect.value || '1';
    if (window.J2MESpeed && typeof J2MESpeed.setRate === 'function') {
      J2MESpeed.setRate(value);
      syncSpeedSelect();
    } else if (window.config) {
      config.speed = value;
    }
    try { speedSelect.blur(); } catch (e) {}
  }

  function applyPlayerBackground() {
    var color = '#ffffff';
    try {
      if (window.KeyboardLayouts) color = KeyboardLayouts.getBgColor() || '#ffffff';
    } catch (e) {}
    document.documentElement.style.setProperty('--player-stage-bg', color);
    stage.style.backgroundColor = color;
    canvas.style.backgroundColor = color;
  }

  window.applyPlayerBackground = applyPlayerBackground;

  document.getElementById('player-back').addEventListener('click', function () { history.back(); });
  document.getElementById('player-rotate-left').addEventListener('click', function () { rotate(-90); });
  document.getElementById('player-rotate-right').addEventListener('click', function () { rotate(90); });
  keypadButton.addEventListener('click', toggleKeypad);
  fullscreenButton.addEventListener('click', toggleFullscreen);
  if (speedSelect) {
    speedSelect.addEventListener('change', applySpeedFromSelect);
    speedSelect.addEventListener('mousedown', function (event) { event.stopPropagation(); });
    speedSelect.addEventListener('touchstart', function (event) { event.stopPropagation(); }, { passive: true });
  }
  if (window.J2MESpeed && typeof J2MESpeed.installHooks === 'function') {
    J2MESpeed.installHooks();
  }
  window.addEventListener('j2me-speed-change', syncSpeedSelect);
  document.addEventListener('fullscreenchange', updateFullscreenButton);
  document.addEventListener('webkitfullscreenchange', updateFullscreenButton);
  window.addEventListener('resize', fitCanvas);
  window.addEventListener('orientationchange', function () { window.setTimeout(fitCanvas, 80); });
  canvas.addEventListener('canvasresize', function () { window.setTimeout(fitCanvas, 0); });

  if (window.ResizeObserver) {
    var resizeObserver = new ResizeObserver(fitCanvas);
    resizeObserver.observe(displayContainer);
    resizeObserver.observe(canvas);
    /* Softkey bar is appended under #main; observe it so Command updates refit. */
    resizeObserver.observe(main);
  }

  window.j2meFitPlayerCanvas = fitCanvas;

  titleLabel.textContent = initialTitle();
  applyPlayerBackground();
  refreshTitle();
  var titleTimer = window.setInterval(function () {
    titlePollCount++;
    if (refreshTitle() || titlePollCount > 30) window.clearInterval(titleTimer);
  }, 500);

  var storedRotation = safeGet(window.sessionStorage, rotationStorageKey());
  var rotationFromUrl = queryValue('screenRotation');
  applyRotation(rotationFromUrl ? configuredAngle() :
    (storedRotation === null ? configuredAngle() : storedRotation), false);

  var layoutFromUrl = queryValue('keyboardLayout');
  var configuredHidden = keypad.classList.contains('gamepad-0') ||
    queryValue('gamepad') === '0' || layoutFromUrl === '无按键';
  var storedHidden = safeGet(window.localStorage, 'j2me.player.keypadHidden');
  var keypadFromUrl = queryValue('gamepad') !== '' || layoutFromUrl !== '';
  setKeypadHidden(keypadFromUrl ? configuredHidden :
    (storedHidden === null ? configuredHidden : storedHidden === '1'), false);
  updateFullscreenButton();
  syncSpeedSelect();
  if (window.I18n) {
    I18n.apply(document);
    I18n.onChange(function () {
      I18n.apply(document);
      updateKeypadButton();
      updateFullscreenButton();
    });
  }
  window.setInterval(updateFps, 1000);
  window.setInterval(detectCanvasContent, 1000);
  window.setTimeout(detectCanvasContent, 1200);
  window.setTimeout(fitCanvas, 0);
})();
