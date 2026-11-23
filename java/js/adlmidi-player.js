(function (global) {
  var BUFFER_FRAMES = 4096;
  var scriptBase = (document.currentScript && document.currentScript.src) ? document.currentScript.src.replace(/[^\/]+$/, '') : './js/';
  var corePromise = {};

  function resolveUrl(path) {
    return new URL(path, scriptBase).href;
  }

  function loadCore(profile) {
    profile = profile || 'light';
    if (!corePromise[profile]) {
      corePromise[profile] = import(resolveUrl('libadlmidi/src/core.js')).then(function (mod) {
        return mod.AdlMidiCore.create({ corePath: resolveUrl('libadlmidi/dist/libadlmidi.' + profile + '.core.js') });
      });
    }
    return corePromise[profile];
  }

  function AdlMidiPlayer(profile) {
    this.profile = profile || 'light';
    this.core = null;
    this.ctx = null;
    this.node = null;
    this.gain = null;
    this.ready = false;
    this.playing = false;
    this.paused = false;
    this.pendingData = null;
    this.volume = 1;
    // JSR-135 默认 loopCount=1（只播一遍）；-1 才是无限循环
    this.loopCount = 1;
    this.remainingLoops = 1;
    this.rtMode = false;
    this.pendingEvents = [];
    this.initPromise = null;
    /** @type {null|function():void} 自然播完且不再循环时回调（供 MMAPI END_OF_MEDIA） */
    this.onEnded = null;
    this._endNotified = false;
  }

  AdlMidiPlayer.prototype._ensureContext = function () {
    if (!this.ctx || this.ctx.state === 'closed') {
      this.ctx = new (global.AudioContext || global.webkitAudioContext)();
      this.gain = this.ctx.createGain();
      this.gain.gain.value = this.volume;
      this.gain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(function () {});
    }
  };

  AdlMidiPlayer.prototype._ensureNode = function () {
    this._ensureContext();
    if (this.node) {
      return;
    }
    this.node = this.ctx.createScriptProcessor(BUFFER_FRAMES, 0, 2);
    this.node.onaudioprocess = this._processAudio.bind(this);
    this.node.connect(this.gain);
  };

  AdlMidiPlayer.prototype._processAudio = function (event) {
    var left = event.outputBuffer.getChannelData(0);
    var right = event.outputBuffer.getChannelData(1);
    if (this.ctx && this.ctx.state === 'suspended' && this.ctx.resume) {
      this.ctx.resume().catch(function () {});
    }
    if (!this.playing || this.paused || !this.core) {
      left.fill(0);
      right.fill(0);
      return;
    }
    if (!this.rtMode && this.core.atEnd) {
      if (!this._handleSongEnd()) {
        left.fill(0);
        right.fill(0);
        return;
      }
    }
    var samples = this.rtMode ? this.core.generate(left.length) : this.core.play(left.length);
    var frames = Math.min(left.length, samples.length >> 1);
    for (var i = 0, j = 0; i < frames; i++, j += 2) {
      left[i] = samples[j];
      right[i] = samples[j + 1];
    }
    for (var k = frames; k < left.length; k++) {
      left[k] = 0;
      right[k] = 0;
    }
  };

  AdlMidiPlayer.prototype._handleSongEnd = function () {
    // loopCount=-1：无限循环；>0：remainingLoops 表示还剩几次完整播放（含当前这次已结束的）
    if (this.loopCount < 0) {
      this.core.rewind();
      return true;
    }
    // 本次播放结束：先减 1；若仍 >0 则重绕继续
    if (this.remainingLoops > 1) {
      this.remainingLoops--;
      this.core.rewind();
      return true;
    }
    this.remainingLoops = 0;
    this.playing = false;
    if (!this._endNotified && typeof this.onEnded === 'function') {
      this._endNotified = true;
      try {
        this.onEnded();
      } catch (e) {
      }
    }
    return false;
  };

  AdlMidiPlayer.prototype.init = function () {
    if (this.ready) {
      return Promise.resolve(this);
    }
    if (this.initPromise) {
      return this.initPromise;
    }
    this._ensureContext();
    this.initPromise = loadCore(this.profile).then(function (core) {
      this.core = core;
      this.core.init(this.ctx.sampleRate);
      this.core.setBank(58);
      this.core.setLoopEnabled(false);
      this.ready = true;
      this.initPromise = null;
      if (this.pendingData) {
        this.loadMIDI(this.pendingData);
      }
      this._flushPendingEvents();
      return this;
    }.bind(this)).catch(function (err) {
      this.initPromise = null;
      throw err;
    }.bind(this));
    return this.initPromise;
  };

  AdlMidiPlayer.prototype.loadMIDI = function (data) {
    this.pendingData = data;
    if (!this.ready || !this.core) {
      return;
    }
    this.stop();
    this.rtMode = false;
    this.core.loadMidi(data);
    this.core.setLoopEnabled(false);
    this.remainingLoops = this.loopCount;
    this._endNotified = false;
  };

  AdlMidiPlayer.prototype.play = function () {
    this.init().then(function () {
      this._ensureNode();
      if (!this.pendingData && !this.rtMode) {
        return;
      }
      if (!this.playing) {
        this.remainingLoops = this.loopCount < 0 ? -1 : this.loopCount;
        this._endNotified = false;
      }
      this.playing = true;
      this.paused = false;
    }.bind(this)).catch(function (err) {
      console.warn('ADLMIDI init failed:', err && err.message ? err.message : err);
    });
  };

  AdlMidiPlayer.prototype.pause = function () {
    this.paused = true;
  };

  AdlMidiPlayer.prototype.stop = function () {
    this.playing = false;
    this.paused = false;
    if (this.core) {
      try {
        this.core.rewind();
      } catch (e) {
      }
    }
  };

  AdlMidiPlayer.prototype.resume = function () {
    this.play();
  };

  AdlMidiPlayer.prototype.setVolume = function (level) {
    this.volume = level / 100;
    if (this.gain) {
      this.gain.gain.value = this.volume;
    }
  };

  AdlMidiPlayer.prototype.getVolume = function () {
    return this.volume * 100;
  };

  AdlMidiPlayer.prototype.getCurrentTime = function () {
    if (this.core) {
      try {
        return this.core.position;
      } catch (e) {
      }
    }
    return 0;
  };

  AdlMidiPlayer.prototype.setCurrentTime = function (seconds) {
    if (this.core) {
      try {
        this.core.seek(seconds);
      } catch (e) {
      }
    }
  };

  AdlMidiPlayer.prototype.getDuration = function () {
    if (this.core) {
      try {
        return this.core.duration;
      } catch (e) {
      }
    }
    return 0;
  };

  AdlMidiPlayer.prototype.setLoopCount = function (count) {
    // 0 非法（JSR-135）；此处钳制为至少 1，-1 保留为无限
    if (count === 0 || count < -1) {
      count = 1;
    }
    this.loopCount = count;
    this.remainingLoops = count;
  };

  AdlMidiPlayer.prototype._withCore = function (fn) {
    this.init().then(function () {
      try {
        fn(this.core);
      } catch (e) {
      }
    }.bind(this)).catch(function () {});
  };

  AdlMidiPlayer.prototype._flushPendingEvents = function () {
    if (!this.pendingEvents.length || !this.core) {
      return;
    }
    while (this.pendingEvents.length) {
      var ev = this.pendingEvents.shift();
      try {
        ev.fn();
      } catch (e) {
      }
    }
  };

  AdlMidiPlayer.prototype._enqueueOrRun = function (fn) {
    if (this.ready && this.core) {
      fn();
      return;
    }
    this.pendingEvents.push({ fn: fn });
    this.init().catch(function () {});
  };

  AdlMidiPlayer.prototype.noteOn = function (channel, note, velocity) {
    this.rtMode = true;
    this.playing = true;
    this.paused = false;
    this._ensureNode();
    this._enqueueOrRun(function () {
      this.core.noteOn(channel, note, velocity);
    }.bind(this));
  };

  AdlMidiPlayer.prototype.noteOff = function (channel, note) {
    this._enqueueOrRun(function () {
      this.core.noteOff(channel, note);
    }.bind(this));
  };

  AdlMidiPlayer.prototype.controllerChange = function (channel, controller, value) {
    this._enqueueOrRun(function () {
      this.core.controllerChange(channel, controller, value);
    }.bind(this));
  };

  AdlMidiPlayer.prototype.programChange = function (channel, program) {
    this._enqueueOrRun(function () {
      this.core.programChange(channel, program);
    }.bind(this));
  };

  AdlMidiPlayer.prototype.pitchBend = function (channel, value) {
    this._enqueueOrRun(function () {
      this.core.pitchBend(channel, value);
    }.bind(this));
  };

  AdlMidiPlayer.prototype.noteAfterTouch = function (channel, note, pressure) {
    this._enqueueOrRun(function () {
      this.core.noteAfterTouch(channel, note, pressure);
    }.bind(this));
  };

  AdlMidiPlayer.prototype.channelAfterTouch = function (channel, pressure) {
    this._enqueueOrRun(function () {
      this.core.channelAfterTouch(channel, pressure);
    }.bind(this));
  };

  global.AdlMidiPlayer = AdlMidiPlayer;
})(typeof window !== 'undefined' ? window : this);
