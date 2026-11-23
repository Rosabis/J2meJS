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

function _typeof(o){return _typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(o){return typeof o}:function(o){return o&&"function"==typeof Symbol&&o.constructor===Symbol&&o!==Symbol.prototype?"symbol":typeof o},_typeof(o)}"undefined"==typeof MIDI&&(MIDI={}),MIDI.Soundfont=MIDI.Soundfont||{},MIDI.Player=MIDI.Player||{},function(o){"use strict";o.DEBUG=!0,o.USE_XHR=!0,o.soundfontUrl="./soundfont/",o.loadPlugin=function(n){"function"==typeof n&&(n={onsuccess:n}),o.soundfontUrl=n.soundfontUrl||o.soundfontUrl,o.audioDetect(function(r){var e=window.location.hash,u="";if(r[n.api]?u=n.api:r[e.substr(1)]?u=e.substr(1):r.webmidi?u="webmidi":window.AudioContext?u="webaudio":window.Audio&&(u="audiotag"),t[u]){if(n.targetFormat)var i=n.targetFormat;else i=r["audio/ogg"]?"ogg":"mp3";o.__api=u,o.__audioFormat=i,o.supports=r,o.loadResource(n)}})},o.loadResource=function(n){var r=n.instruments||n.instrument||"acoustic_grand_piano";"object"!==_typeof(r)&&(r=r||0===r?[r]:[]);for(var e=0;e<r.length;e++){var u=r[e];u===+u&&o.GM.byId[u]&&(r[e]=o.GM.byId[u].id)}n.format=o.__audioFormat,n.instruments=r,t[o.__api](n)};var t={webmidi:function(t){o.WebMIDI.connect(t)},audiotag:function(o){n(o,"AudioTag")},webaudio:function(o){n(o,"WebAudio")}},n=function(t,n){for(var e=t.format,u=t.instruments,i=t.onprogress,a=t.onerror,f=u.length,c=f,d=function(){--c||(i&&i("load",1),o[n].connect(t))},s=0;s<f;s++){var l=u[s];MIDI.Soundfont[l]?d():r(u[s],e,function(o,t){i&&i("load",t/f+(f-c)/f,l)},function(){d()},a)}},r=function(t,n,r,e,u){var i=o.soundfontUrl+t+"-"+n+".js";o.USE_XHR?o.util.request({url:i,format:"text",onerror:u,onprogress:r,onsuccess:function(o,t){var n=document.createElement("script");n.language="javascript",n.type="text/javascript",n.text=t,document.body.appendChild(n),e()}}):dom.loadScript.add({url:i,verify:'MIDI.Soundfont["'+t+'"]',onerror:u,onsuccess:function(){e()}})};o.setDefaultPlugin=function(t){for(var n in t)o[n]=t[n]}}(MIDI);