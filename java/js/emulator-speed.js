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

/* J2ME emulator speed control. Keep ES5 syntax for KaiOS/older Firefox.
 *
 * Speeds up or slows down MIDlet time by scaling:
 *   - System.currentTimeMillis / JVM.monotonicTimeMillis (virtual clock)
 *   - Thread.sleep and Object.wait timeouts
 *   - DisplayDevice.refresh0 vsync / maxFps waits
 *
 * URL: ?speed=2  (also accepts 2x / x2). Range 0.5–16, default 1.
 */
(function (global) {
  'use strict';

  var MIN_RATE = 0.5;
  var MAX_RATE = 16;
  var RATES = [0.5, 0.75, 1, 1.5, 2, 3, 4, 6, 8, 12, 16];

  var rate = 1;
  var wallMs = Date.now();
  var virtMs = wallMs;
  var wallPerf = (typeof performance !== 'undefined' && performance.now) ? performance.now() : 0;
  var virtPerf = wallPerf;
  var hooksInstalled = false;

  function clampRate(value) {
    if (!(value > 0) || value !== value) return 1;
    if (value < MIN_RATE) return MIN_RATE;
    if (value > MAX_RATE) return MAX_RATE;
    return value;
  }

  function nearestRate(value) {
    var target = clampRate(value);
    var best = RATES[0];
    var bestDist = Math.abs(best - target);
    for (var i = 1; i < RATES.length; i++) {
      var dist = Math.abs(RATES[i] - target);
      if (dist < bestDist) {
        best = RATES[i];
        bestDist = dist;
      }
    }
    return best;
  }

  function parseRate(raw) {
    if (raw == null || raw === '') return NaN;
    var text = String(raw).replace(/,/g, '.').trim();
    if (!text) return NaN;
    text = text.replace(/^x/i, '').replace(/x$/i, '');
    var value = parseFloat(text);
    if (!(value > 0)) return NaN;
    return nearestRate(value);
  }

  function formatRate(value) {
    var n = nearestRate(value);
    if (n === Math.floor(n)) return n + '\u00d7';
    return String(n) + '\u00d7';
  }

  function nowMs() {
    return virtMs + (Date.now() - wallMs) * rate;
  }

  function nowPerf() {
    var perfNow = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
    return virtPerf + (perfNow - wallPerf) * rate;
  }

  function rebaseClock() {
    virtMs = nowMs();
    wallMs = Date.now();
    var perfNow = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
    virtPerf = nowPerf();
    wallPerf = perfNow;
  }

  function scaleDelay(ms) {
    if (!(ms > 0)) return 0;
    if (rate === 1) return ms;
    return Math.max(0, ms / rate);
  }

  function emitChange() {
    try {
      if (typeof CustomEvent === 'function') {
        global.dispatchEvent(new CustomEvent('j2me-speed-change', { detail: { rate: rate } }));
      } else if (global.document && document.createEvent) {
        var ev = document.createEvent('Event');
        ev.initEvent('j2me-speed-change', true, true);
        ev.detail = { rate: rate };
        global.dispatchEvent(ev);
      }
    } catch (e) {}
  }

  function setRate(next, fromUi) {
    var parsed = typeof next === 'number' ? nearestRate(next) : parseRate(next);
    if (!(parsed > 0)) parsed = 1;
    if (parsed === rate) {
      if (global.config) global.config.speed = String(rate);
      return rate;
    }
    rebaseClock();
    rate = parsed;
    if (global.config) global.config.speed = String(rate);
    emitChange();
    return rate;
  }

  function wrapTimeoutDuring(fn) {
    var origTimeout = global.setTimeout;
    global.setTimeout = function (callback, delay) {
      return origTimeout(callback, scaleDelay(delay || 0));
    };
    try {
      return fn();
    } finally {
      global.setTimeout = origTimeout;
    }
  }

  function wrapRefreshSchedule(fn) {
    var origRaf = global.requestAnimationFrame;
    var origTimeout = global.setTimeout;
    if (rate === 1 || typeof origRaf !== 'function') {
      return wrapTimeoutDuring(fn);
    }
    global.requestAnimationFrame = function (callback) {
      if (rate > 1) return origTimeout(callback, 0);
      return origTimeout(callback, 1000 / 60 / rate);
    };
    global.setTimeout = function (callback, delay) {
      return origTimeout(callback, scaleDelay(delay || 0));
    };
    try {
      return fn();
    } finally {
      global.requestAnimationFrame = origRaf;
      global.setTimeout = origTimeout;
    }
  }

  function wrapNative(name, wrapper) {
    if (typeof Native === 'undefined' || typeof Native[name] !== 'function') return false;
    var original = Native[name];
    Native[name] = wrapper(original);
    return true;
  }

  function installHooks() {
    if (hooksInstalled) return true;
    if (typeof Native === 'undefined') return false;

    wrapNative('java/lang/System.currentTimeMillis.()J', function () {
      return function (addr) {
        return J2ME.returnLongValue(nowMs());
      };
    });

    wrapNative('com/sun/cldchi/jvm/JVM.monotonicTimeMillis.()J', function () {
      return function (addr) {
        return J2ME.returnLongValue(nowPerf());
      };
    });

    wrapNative('java/lang/Thread.sleep.(J)V', function (original) {
      return function (addr, delayL, delayH) {
        if (rate === 1) return original.apply(this, arguments);
        return wrapTimeoutDuring(function () {
          return original.call(this, addr, delayL, delayH);
        });
      };
    });

    wrapNative('com/sun/midp/lcdui/DisplayDevice.refresh0.(IIIIII)V', function (original) {
      return function () {
        var args = arguments;
        var self = this;
        if (rate === 1) return original.apply(self, args);
        return wrapRefreshSchedule(function () {
          return original.apply(self, args);
        });
      };
    });

    if (global.J2ME && J2ME.Context && J2ME.Context.prototype && J2ME.Context.prototype.wait) {
      var originalWait = J2ME.Context.prototype.wait;
      J2ME.Context.prototype.wait = function (objectAddr, timeout) {
        if (timeout > 0) timeout = scaleDelay(timeout);
        return originalWait.call(this, objectAddr, timeout);
      };
    }

    hooksInstalled = true;
    return true;
  }

  function initFromConfig() {
    var fromUrl = parseRate(global.config && global.config.speed);
    if (fromUrl > 0) {
      rate = fromUrl;
    } else {
      rate = 1;
    }
    if (global.config) global.config.speed = String(rate);
    rebaseClock();
  }

  initFromConfig();

  var api = {
    MIN: MIN_RATE,
    MAX: MAX_RATE,
    RATES: RATES,
    parse: parseRate,
    format: formatRate,
    nearest: nearestRate,
    now: nowMs,
    nowPerf: nowPerf,
    scaleDelay: scaleDelay,
    getRate: function () { return rate; },
    setRate: setRate,
    installHooks: installHooks
  };

  global.J2MESpeed = api;
  installHooks();
})(typeof window !== 'undefined' ? window : this);
