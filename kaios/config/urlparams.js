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

/* -*- Mode: Java; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */

'use strict';

/**
 * The URL query parameters.  One or more of the following:
 *
 *    args (gets split from comma-separated list to Array)
 *    gamepad
 *    icc_mcc
 *    icc_mnc
 *    icc_msisdn
 *    jad
 *    jars
 *    logConsole
 *    logLevel
 *    main
 *    midletClassName
 *    network_mcc
 *    network_mnc
 *    platform
 *    autosize
 *    fontSize
 *    language
 *    forceRuntimeCompilation
 *    deferStartup - Number of milliseconds to wait after loading JS sources and before starting the VM.
 *
 * Keep this list up-to-date!
 */

(function() {
  var params = {};

  location.search.substring(1).split("&").forEach(function (param) {
    param = param.split("=").map(function(v) {
      return v.replace(/\+/g, " ");
    }).map(decodeURIComponent);
    params[param[0]] = param[1];
  });

  params.args = (params.args || "").split(",");

  if ("midletClassName" in params) {
    params.midletClassName = params.midletClassName.replace(/\//g, '.');
  }

  for (var name in params) {
    config[name] = params[name];
  }
})();
