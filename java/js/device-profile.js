/* LCDUI font sizes + vendor key codes. Keep ES5 for KaiOS/older Firefox.
 *
 * Fonts: URL fontSmall / fontMedium / fontLarge (px, 1–128). Default 18/22/26.
 * Keys: URL keyLayout=nokia|siemens|motorola. Internal keypad still emits
 * Nokia codes; convert once in MIDP.sendKeyPress/Release.
 */
(function (global) {
  'use strict';

  var SIZE_SMALL = 8;
  var SIZE_LARGE = 16;
  var MIN_FONT = 1;
  var MAX_FONT = 128;
  var DEFAULT_SMALL = 18;
  var DEFAULT_MEDIUM = 22;
  var DEFAULT_LARGE = 26;

  var GA_UP = 1;
  var GA_LEFT = 2;
  var GA_RIGHT = 5;
  var GA_DOWN = 6;
  var GA_FIRE = 8;
  var GA_GAME_A = 9;
  var GA_GAME_B = 10;
  var GA_GAME_C = 11;
  var GA_GAME_D = 12;

  var NOKIA_UP = -1;
  var NOKIA_DOWN = -2;
  var NOKIA_LEFT = -3;
  var NOKIA_RIGHT = -4;
  var NOKIA_FIRE = -5;
  var NOKIA_SOFT_LEFT = -6;
  var NOKIA_SOFT_RIGHT = -7;

  var LAYOUTS = {
    nokia: {
      convert: {},
      keyCode: {},
      gameAction: {},
      names: {}
    },
    siemens: {
      convert: {},
      keyCode: {},
      gameAction: {},
      names: {}
    },
    motorola: {
      convert: {},
      keyCode: {},
      gameAction: {},
      names: {}
    }
  };

  function putConv(layout, from, to) {
    LAYOUTS[layout].convert[String(from)] = to;
  }
  function putKey(layout, gameAction, keyCode, gameActionOut, name) {
    LAYOUTS[layout].keyCode[String(gameAction)] = keyCode;
    if (gameActionOut != null) LAYOUTS[layout].gameAction[String(keyCode)] = gameActionOut;
    if (name) LAYOUTS[layout].names[String(keyCode)] = name;
  }

  putKey('nokia', GA_UP, NOKIA_UP, GA_UP, 'UP');
  putKey('nokia', GA_DOWN, NOKIA_DOWN, GA_DOWN, 'DOWN');
  putKey('nokia', GA_LEFT, NOKIA_LEFT, GA_LEFT, 'LEFT');
  putKey('nokia', GA_RIGHT, NOKIA_RIGHT, GA_RIGHT, 'RIGHT');
  putKey('nokia', GA_FIRE, NOKIA_FIRE, GA_FIRE, 'SELECT');
  putKey('nokia', GA_GAME_A, 55, GA_GAME_A, '7');
  putKey('nokia', GA_GAME_B, 57, GA_GAME_B, '9');
  putKey('nokia', GA_GAME_C, 42, GA_GAME_C, '*');
  putKey('nokia', GA_GAME_D, 35, GA_GAME_D, '#');
  LAYOUTS.nokia.names[String(NOKIA_SOFT_LEFT)] = 'SOFT1';
  LAYOUTS.nokia.names[String(NOKIA_SOFT_RIGHT)] = 'SOFT2';
  LAYOUTS.nokia.names['-8'] = 'CLEAR';
  LAYOUTS.nokia.names['-11'] = 'END';
  /* Historical extras: some MIDlets treated Nokia soft-left as GAME_C. */
  LAYOUTS.nokia.gameAction[String(NOKIA_SOFT_LEFT)] = GA_GAME_C;
  LAYOUTS.nokia.gameAction[String(NOKIA_SOFT_RIGHT)] = 0;
  LAYOUTS.nokia.gameAction['-21'] = GA_FIRE;
  LAYOUTS.nokia.gameAction['-22'] = GA_GAME_C;

  putConv('siemens', NOKIA_UP, -59);
  putConv('siemens', NOKIA_DOWN, -60);
  putConv('siemens', NOKIA_LEFT, -61);
  putConv('siemens', NOKIA_RIGHT, -62);
  putConv('siemens', NOKIA_SOFT_LEFT, -1);
  putConv('siemens', NOKIA_SOFT_RIGHT, -4);
  putKey('siemens', GA_UP, -59, GA_UP, 'UP');
  putKey('siemens', GA_DOWN, -60, GA_DOWN, 'DOWN');
  putKey('siemens', GA_LEFT, -61, GA_LEFT, 'LEFT');
  putKey('siemens', GA_RIGHT, -62, GA_RIGHT, 'RIGHT');
  putKey('siemens', GA_FIRE, NOKIA_FIRE, GA_FIRE, 'SELECT');
  putKey('siemens', GA_GAME_A, 55, GA_GAME_A, '7');
  putKey('siemens', GA_GAME_B, 57, GA_GAME_B, '9');
  putKey('siemens', GA_GAME_C, 42, GA_GAME_C, '*');
  putKey('siemens', GA_GAME_D, 35, GA_GAME_D, '#');
  LAYOUTS.siemens.gameAction['-1'] = 0;
  LAYOUTS.siemens.gameAction['-4'] = 0;
  LAYOUTS.siemens.names['-1'] = 'SOFT1';
  LAYOUTS.siemens.names['-4'] = 'SOFT2';

  putConv('motorola', NOKIA_DOWN, -6);
  putConv('motorola', NOKIA_LEFT, -2);
  putConv('motorola', NOKIA_RIGHT, -5);
  putConv('motorola', NOKIA_FIRE, -20);
  putConv('motorola', NOKIA_SOFT_LEFT, -21);
  putConv('motorola', NOKIA_SOFT_RIGHT, -22);
  putKey('motorola', GA_UP, -1, GA_UP, 'UP');
  putKey('motorola', GA_DOWN, -6, GA_DOWN, 'DOWN');
  putKey('motorola', GA_LEFT, -2, GA_LEFT, 'LEFT');
  putKey('motorola', GA_RIGHT, -5, GA_RIGHT, 'RIGHT');
  putKey('motorola', GA_FIRE, -20, GA_FIRE, 'SELECT');
  putKey('motorola', GA_GAME_A, 55, GA_GAME_A, '7');
  putKey('motorola', GA_GAME_B, 57, GA_GAME_B, '9');
  putKey('motorola', GA_GAME_C, 42, GA_GAME_C, '*');
  putKey('motorola', GA_GAME_D, 35, GA_GAME_D, '#');
  LAYOUTS.motorola.gameAction['-21'] = 0;
  LAYOUTS.motorola.gameAction['-22'] = 0;
  LAYOUTS.motorola.names['-21'] = 'SOFT1';
  LAYOUTS.motorola.names['-22'] = 'SOFT2';

  var NUM_GAME = {
    '50': GA_UP,
    '52': GA_LEFT,
    '53': GA_FIRE,
    '54': GA_RIGHT,
    '56': GA_DOWN,
    '55': GA_GAME_A,
    '57': GA_GAME_B,
    '42': GA_GAME_C,
    '35': GA_GAME_D
  };
  var PHYS_GAME = {
    '119': GA_UP,
    '97': GA_LEFT,
    '100': GA_RIGHT,
    '115': GA_DOWN,
    '32': GA_FIRE,
    '38': GA_UP,
    '37': GA_LEFT,
    '39': GA_RIGHT,
    '40': GA_DOWN,
    '13': GA_FIRE,
    '113': GA_GAME_A,
    '101': GA_GAME_B,
    '122': GA_GAME_C,
    '99': GA_GAME_D,
    '81': GA_FIRE,
    '69': GA_GAME_C
  };

  var fontSmall = DEFAULT_SMALL;
  var fontMedium = DEFAULT_MEDIUM;
  var fontLarge = DEFAULT_LARGE;
  var layout = 'nokia';
  var hooksInstalled = false;

  function clampFont(value, fallback) {
    var n = parseInt(value, 10);
    if (!(n > 0) || n !== n) n = fallback;
    if (n < MIN_FONT) n = MIN_FONT;
    if (n > MAX_FONT) n = MAX_FONT;
    return n | 0;
  }

  function parseLayout(raw) {
    var text = String(raw || '').toLowerCase().replace(/^\s+|\s+$/g, '');
    if (text === 'siemens' || text === 'sie') return 'siemens';
    if (text === 'motorola' || text === 'moto') return 'motorola';
    return 'nokia';
  }

  function currentLayout() {
    return LAYOUTS[layout] || LAYOUTS.nokia;
  }

  function getFontPixelSize(sizeFlag) {
    if (sizeFlag & SIZE_SMALL) return fontSmall;
    if (sizeFlag & SIZE_LARGE) return fontLarge;
    return fontMedium;
  }

  function convertKeyCode(keyCode) {
    var table = currentLayout().convert;
    var mapped = table[String(keyCode)];
    return mapped == null ? keyCode : mapped;
  }

  function getKeyCode(gameAction) {
    var mapped = currentLayout().keyCode[String(gameAction)];
    return mapped == null ? 0 : mapped;
  }

  function getGameAction(keyCode) {
    var table = currentLayout().gameAction;
    if (table[String(keyCode)] != null) return table[String(keyCode)];
    if (NUM_GAME[String(keyCode)] != null) return NUM_GAME[String(keyCode)];
    if (PHYS_GAME[String(keyCode)] != null) return PHYS_GAME[String(keyCode)];
    return 0;
  }

  function getKeyName(keyCode) {
    var named = currentLayout().names[String(keyCode)];
    if (named) return named;
    if (keyCode >= 32 && keyCode <= 126) return String.fromCharCode(keyCode);
    return String(keyCode);
  }

  function applyFontPixels(addr, sizeFlag) {
    var px = getFontPixelSize(sizeFlag);
    var handleFn = (typeof getHandle === 'function') ? getHandle : (global.J2ME && J2ME.getHandle);
    var self = handleFn ? handleFn(addr) : null;
    var mul = (typeof FONT_HEIGHT_MULTIPLIER === 'number') ? FONT_HEIGHT_MULTIPLIER : 1.3;
    if (self) {
      self.baseline = px | 0;
      self.height = (px * mul) | 0;
    }
    var map = (typeof NativeMap !== 'undefined') ? NativeMap : (global.J2ME && J2ME.NativeMap);
    var ctx = map && map.get ? map.get(addr) : null;
    if (ctx) {
      if (typeof ctx.font === 'string' && ctx.font) {
        ctx.font = ctx.font.replace(/\d+(\.\d+)?px/, (px | 0) + 'px');
      }
      ctx.fontSize = px | 0;
    }
  }

  function wrapNative(name, wrapper) {
    if (typeof Native === 'undefined' || typeof Native[name] !== 'function') return false;
    Native[name] = wrapper(Native[name]);
    return true;
  }

  function wrapMidpKeys() {
    if (!global.MIDP) return false;
    if (MIDP.sendKeyPress && MIDP.sendKeyPress._j2meProfileWrapped) return true;
    var origPress = MIDP.sendKeyPress;
    var origRelease = MIDP.sendKeyRelease;
    if (typeof origPress === 'function') {
      MIDP.sendKeyPress = function (keyCode) {
        return origPress.call(this, convertKeyCode(keyCode));
      };
      MIDP.sendKeyPress._j2meProfileWrapped = true;
    }
    if (typeof origRelease === 'function') {
      MIDP.sendKeyRelease = function (keyCode) {
        return origRelease.call(this, convertKeyCode(keyCode));
      };
      MIDP.sendKeyRelease._j2meProfileWrapped = true;
    }
    return true;
  }

  function installHooks() {
    if (hooksInstalled) return true;
    wrapNative('javax/microedition/lcdui/Font.init.(III)V', function (original) {
      return function (addr, face, style, size) {
        original.call(this, addr, face, style, size);
        applyFontPixels(addr, size);
      };
    });
    wrapNative('javax/microedition/lcdui/KeyConverter.getKeyCode.(I)I', function () {
      return function (addr, key) {
        return getKeyCode(key);
      };
    });
    wrapNative('javax/microedition/lcdui/KeyConverter.getGameAction.(I)I', function () {
      return function (addr, keyCode) {
        return getGameAction(keyCode);
      };
    });
    wrapNative('javax/microedition/lcdui/KeyConverter.getKeyName.(I)Ljava/lang/String;', function () {
      return function (addr, keyCode) {
        return J2ME.newString(getKeyName(keyCode));
      };
    });
    wrapMidpKeys();
    if (typeof CompiledMethodCache !== "undefined" &&
        typeof CompiledMethodCache.installJitGuards === "function") {
      CompiledMethodCache.installJitGuards();
    }
    hooksInstalled = true;
    return true;
  }

  function initFromConfig() {
    var cfg = global.config || {};
    fontSmall = clampFont(cfg.fontSmall, DEFAULT_SMALL);
    fontMedium = clampFont(cfg.fontMedium, DEFAULT_MEDIUM);
    fontLarge = clampFont(cfg.fontLarge, DEFAULT_LARGE);
    if ((cfg.fontSmall == null || cfg.fontSmall === '') &&
        (cfg.fontMedium == null || cfg.fontMedium === '') &&
        cfg.fontSize) {
      fontMedium = clampFont(cfg.fontSize, fontMedium);
      fontSmall = clampFont((fontMedium / 1.25) | 0, DEFAULT_SMALL);
      fontLarge = clampFont((fontMedium * 1.25) | 0, DEFAULT_LARGE);
    }
    layout = parseLayout(cfg.keyLayout);
    if (global.config) {
      config.fontSmall = String(fontSmall);
      config.fontMedium = String(fontMedium);
      config.fontLarge = String(fontLarge);
      config.keyLayout = layout;
    }
  }

  initFromConfig();

  global.J2MEDeviceProfile = {
    MIN_FONT: MIN_FONT,
    MAX_FONT: MAX_FONT,
    DEFAULT_SMALL: DEFAULT_SMALL,
    DEFAULT_MEDIUM: DEFAULT_MEDIUM,
    DEFAULT_LARGE: DEFAULT_LARGE,
    parseLayout: parseLayout,
    clampFont: clampFont,
    getFontPixelSize: getFontPixelSize,
    convertKeyCode: convertKeyCode,
    getKeyCode: getKeyCode,
    getGameAction: getGameAction,
    getKeyName: getKeyName,
    getLayout: function () { return layout; },
    getFonts: function () {
      return { small: fontSmall, medium: fontMedium, large: fontLarge };
    },
    installHooks: installHooks
  };

  installHooks();
})(typeof window !== 'undefined' ? window : this);
