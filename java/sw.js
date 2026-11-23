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

var CACHE_NAME="j2me-v5-micro3d",SHELL_FILES=["./","./index.html","./indexbatch.html","./style/index.css","./index.js","./gamelist.js","./manifest.json"];self.addEventListener("install",function(t){t.waitUntil(caches.open(CACHE_NAME).then(function(t){return t.addAll(SHELL_FILES)})),self.skipWaiting()}),self.addEventListener("activate",function(t){t.waitUntil(caches.keys().then(function(t){return Promise.all(t.filter(function(t){return t!==CACHE_NAME}).map(function(t){return caches.delete(t)}))})),self.clients.claim()}),self.addEventListener("fetch",function(t){var e=t.request.url;"GET"===t.request.method&&(e.startsWith("http://")||e.startsWith("https://"))&&t.respondWith(fetch(t.request).then(function(e){if(e&&200===e.status&&"basic"===e.type){var n=e.clone();caches.open(CACHE_NAME).then(function(e){e.put(t.request,n)})}return e}).catch(function(){return caches.match(t.request)}))});