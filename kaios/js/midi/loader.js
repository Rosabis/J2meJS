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

/*
	----------------------------------------------------------
	MIDI.Plugin : 0.3.4 : 2015-03-26
	----------------------------------------------------------
	https://github.com/mudcube/MIDI.js
	----------------------------------------------------------
	Inspired by javax.sound.midi (albeit a super simple version): 
		http://docs.oracle.com/javase/6/docs/api/javax/sound/midi/package-summary.html
	----------------------------------------------------------
	Technologies
	----------------------------------------------------------
		Web MIDI API - no native support yet (jazzplugin)
		Web Audio API - firefox 25+, chrome 10+, safari 6+, opera 15+
		HTML5 Audio Tag - ie 9+, firefox 3.5+, chrome 4+, safari 4+, opera 9.5+, ios 4+, android 2.3+
	----------------------------------------------------------
*/

if (typeof MIDI === 'undefined') MIDI = {};

MIDI.Soundfont = MIDI.Soundfont || {};
MIDI.Player = MIDI.Player || {};

(function(root) { 'use strict';

	root.DEBUG = true;
	root.USE_XHR = true;
	root.soundfontUrl = './soundfont/';

	/*
		MIDI.loadPlugin({
			onsuccess: function() { },
			onprogress: function(state, percent) { },
			targetFormat: 'mp3', // optionally can force to use MP3 (for instance on mobile networks)
			instrument: 'acoustic_grand_piano', // or 1 (default)
			instruments: [ 'acoustic_grand_piano', 'acoustic_guitar_nylon' ] // or multiple instruments
		});
	*/

	root.loadPlugin = function(opts) {
		if (typeof opts === 'function') {
			opts = {onsuccess: opts};
		}

		root.soundfontUrl = opts.soundfontUrl || root.soundfontUrl;

		/// Detect the best type of audio to use
		root.audioDetect(function(supports) {
			var hash = window.location.hash;
			var api = '';

			/// use the most appropriate plugin if not specified
			if (supports[opts.api]) {
				api = opts.api;
			} else if (supports[hash.substr(1)]) {
				api = hash.substr(1);
			} else if (supports.webmidi) {
				api = 'webmidi';
			} else if (window.AudioContext) { // Chrome
				api = 'webaudio';
			} else if (window.Audio) { // Firefox
				api = 'audiotag';
			}

			if (connect[api]) {
				/// use audio/ogg when supported
				if (opts.targetFormat) {
					var audioFormat = opts.targetFormat;
				} else { // use best quality
					var audioFormat = supports['audio/ogg'] ? 'ogg' : 'mp3';
				}

				/// load the specified plugin
				root.__api = api;
				root.__audioFormat = audioFormat;
				root.supports = supports;
				root.loadResource(opts);
			}
		});
	};

	/*
		root.loadResource({
			onsuccess: function() { },
			onprogress: function(state, percent) { },
			instrument: 'banjo'
		})
	*/

	root.loadResource = function(opts) {
		var instruments = opts.instruments || opts.instrument || 'acoustic_grand_piano';
		///
		if (typeof instruments !== 'object') {
			if (instruments || instruments === 0) {
				instruments = [instruments];
			} else {
				instruments = [];
			}
		}
		/// convert numeric ids into strings
		for (var i = 0; i < instruments.length; i ++) {
			var instrument = instruments[i];
			if (instrument === +instrument) { // is numeric
				if (root.GM.byId[instrument]) {
					instruments[i] = root.GM.byId[instrument].id;
				}
			}
		}
		///
		opts.format = root.__audioFormat;
		opts.instruments = instruments;
		///
		connect[root.__api](opts);
	};

	var connect = {
		webmidi: function(opts) {
			// cant wait for this to be standardized!
			root.WebMIDI.connect(opts);
		},
		audiotag: function(opts) {
			// works ok, kinda like a drunken tuna fish, across the board
			// http://caniuse.com/audio
			requestQueue(opts, 'AudioTag');
		},
		webaudio: function(opts) {
			// works awesome! safari, chrome and firefox support
			// http://caniuse.com/web-audio
			requestQueue(opts, 'WebAudio');
		}
	};

	var requestQueue = function(opts, context) {
		var audioFormat = opts.format;
		var instruments = opts.instruments;
		var onprogress = opts.onprogress;
		var onerror = opts.onerror;
		///
		var length = instruments.length;
		var pending = length;
		var waitForEnd = function() {
			if (!--pending) {
				onprogress && onprogress('load', 1.0);
				root[context].connect(opts);
			}
		};
		///
		for (var i = 0; i < length; i ++) {
			var instrumentId = instruments[i];
			if (MIDI.Soundfont[instrumentId]) { // already loaded
				waitForEnd();
			} else { // needs to be requested
				sendRequest(instruments[i], audioFormat, function(evt, progress) {
					var fileProgress = progress / length;
					var queueProgress = (length - pending) / length;
					onprogress && onprogress('load', fileProgress + queueProgress, instrumentId);
				}, function() {
					waitForEnd();
				}, onerror);
			}
		};
	};

	var sendRequest = function(instrumentId, audioFormat, onprogress, onsuccess, onerror) {
		var soundfontPath = root.soundfontUrl + instrumentId + '-' + audioFormat + '.js';
		if (root.USE_XHR) {
			root.util.request({
				url: soundfontPath,
				format: 'text',
				onerror: onerror,
				onprogress: onprogress,
				onsuccess: function(event, responseText) {
					var script = document.createElement('script');
					script.language = 'javascript';
					script.type = 'text/javascript';
					script.text = responseText;
					document.body.appendChild(script);
					///
					onsuccess();
				}
			});
		} else {
			dom.loadScript.add({
				url: soundfontPath,
				verify: 'MIDI.Soundfont["' + instrumentId + '"]',
				onerror: onerror,
				onsuccess: function() {
					onsuccess();
				}
			});
		}
	};

	root.setDefaultPlugin = function(midi) {
		for (var key in midi) {
			root[key] = midi[key];
		}
	};

})(MIDI);