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

"use strict";!function(){var i={};for(var n in location.search.substring(1).split("&").forEach(function(n){n=n.split("=").map(function(i){return i.replace(/\+/g," ")}).map(decodeURIComponent),i[n[0]]=n[1]}),i.args=(i.args||"").split(","),"midletClassName"in i&&(i.midletClassName=i.midletClassName.replace(/\//g,"."),config._midletClassNameFromURL=!0),i)config[n]=i[n];null!=config.runtimeCompilation&&""!==config.runtimeCompilation||(config.runtimeCompilation="1")}();