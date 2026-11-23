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

/**
 * 从 config/build-version.json 读取版本号，为脚本与样式追加 ?v= 参数，避免缓存旧文件。
 * ES5 兼容（含 KaiOS / 旧 Firefox）。
 */
(function (global) {
  var VERSION_JSON = 'config/build-version.json';

  function withV(url, v) {
    return url + (url.indexOf('?') >= 0 ? '&' : '?') + 'v=' + encodeURIComponent(v);
  }

  /** 拉取版本清单（带时间戳避免 manifest 本身被强缓存） */
  function fetchVersionJson(cb) {
    var x = new XMLHttpRequest();
    x.open('GET', VERSION_JSON + '?' + '_' + Date.now(), true);
    x.onload = function () {
      if (x.status >= 200 && x.status < 300) {
        try {
          cb(null, JSON.parse(x.responseText));
        } catch (e) {
          cb(e);
        }
      } else {
        cb(new Error('HTTP ' + x.status));
      }
    };
    x.onerror = function () {
      cb(new Error('network'));
    };
    x.send();
  }

  function loadScript(src, v, cb) {
    var s = document.createElement('script');
    s.type = 'text/javascript';
    s.src = withV(src, v);
    s.onload = function () {
      if (cb) cb(null);
    };
    s.onerror = function () {
      if (cb) cb(new Error('load ' + src));
    };
    var head = document.head || document.getElementsByTagName('head')[0];
    head.appendChild(s);
  }

  function loadScriptsSequential(urls, v, i, done) {
    if (i >= urls.length) {
      done(null);
      return;
    }
    loadScript(urls[i], v, function (err) {
      if (err) {
        done(err);
        return;
      }
      loadScriptsSequential(urls, v, i + 1, done);
    });
  }

  function ensureCss(linkId, href, v, cb) {
    var targetHref = withV(href, v);
    var el = document.getElementById(linkId);
    if (!el) {
      el = document.createElement('link');
      el.id = linkId;
      el.rel = 'stylesheet';
      el.type = 'text/css';
      var head = document.head || document.getElementsByTagName('head')[0];
      head.appendChild(el);
    }
    if (el.getAttribute('data-loaded-href') === targetHref) {
      if (cb) cb(null);
      return;
    }
    var finished = false;
    function done(err) {
      if (finished) return;
      finished = true;
      el.onload = null;
      el.onerror = null;
      if (cb) cb(err || null);
    }
    el.onload = function () {
      el.setAttribute('data-loaded-href', targetHref);
      done(null);
    };
    el.onerror = function () {
      done(new Error('load css ' + href));
    };
    el.href = targetHref;
  }

  /**
   * 页面配置：head 与 body 脚本按顺序加载（串行，保证依赖顺序）。
   */
  var PROFILES = {
    index: {
      css: 'style/index.css',
      cssId: 'app-css-index',
      head: [
        'js/i18n.js',
        'js/encoding.js',
        'js/rawinflate.js',
        'bld/native.js',
        'config/default.js',
        'config/runtests.js',
        'config/build.js',
        'config/urlparams.js',
        'libs/compiled-method-cache.js',
        'bld/j2me.js',
        'bld/main-all.js',
        'js/jszip.min.js',
        'keyboard-layouts.js'
      ],
      body: ['gamelist.js', 'js/savemanager-index-ui.js', 'index.js']
    },
    indexbatch: {
      css: 'style/index.css',
      cssId: 'app-css-index',
      head: [
        'js/i18n.js',
        'js/encoding.js',
        'js/rawinflate.js',
        'bld/native.js',
        'config/default.js',
        'config/runtests.js',
        'config/build.js',
        'config/urlparams.js',
        'libs/compiled-method-cache.js',
        'bld/j2me.js',
        'bld/main-all.js',
        'js/jszip.min.js',
        'keyboard-layouts.js',
        'js/zipfile.js',
        'js/FileSaver.js',
        'js/savemanager.js'
      ],
      body: ['js/savemanager-batch-ui.js', 'index.js']
    },
    main: {
      css: 'style/main.css',
      cssId: 'app-css-main',
      head: [
        'js/i18n.js',
        'js/rawinflate.js',
        'js/encoding.js',
        'js/PicoAudio.js',
        'js/webaudio-tinysynth.min.js',
        'js/BenzAMRRecorder.min.js',
        'js/midiplayer.js',
        'js/adlmidi-player.js',
        'bld/native.js',
        'config/default.js',
        'config/runtests.js',
        'config/build.js',
        'config/urlparams.js',
        'libs/compiled-method-cache.js',
        'bld/j2me.js',
        'bld/main-all.js',
        'js/emulator-speed.js',
        'js/device-profile.js',
        'keyboard-layouts.js',
        'keymap.js',
        'js/player-controls.js'
      ],
      body: []
    }
  };

  global.__BUILD_VERSION__ = '';

  /**
   * @param {string} profileName - 'index' | 'indexbatch' | 'main'
   * @param {function(Error|null)=} onReady - CSS + 全部脚本加载完成后回调
   */
  global.loadVersionedPage = function (profileName, onReady) {
    var prof = PROFILES[profileName];
    if (!prof) {
      if (onReady) onReady(new Error('unknown profile: ' + profileName));
      return;
    }
    fetchVersionJson(function (err, data) {
      var v = '1';
      if (!err && data && data.version != null) {
        v = String(data.version);
      }
      global.__BUILD_VERSION__ = v;
      try {
        console.log('[build] version=' + v);
      } catch (eLog) {}

      ensureCss(prof.cssId || 'app-css', prof.css, v, function (cssErr) {
        if (cssErr) {
          if (onReady) onReady(cssErr);
          return;
        }
        loadScriptsSequential(prof.head, v, 0, function (err2) {
          if (err2) {
            if (onReady) onReady(err2);
            return;
          }
          var body = prof.body || [];
          if (body.length === 0) {
            if (onReady) onReady(null);
            return;
          }
          loadScriptsSequential(body, v, 0, onReady);
        });
      });
    });
  };
})(typeof window !== 'undefined' ? window : this);
