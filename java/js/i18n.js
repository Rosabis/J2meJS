/* UI i18n. ES5 for KaiOS/older Firefox.
 *
 * Preference: localStorage j2me.uiLanguage = auto | zh-CN | en | custom-code
 * Extra languages: lang/manifest.json + lang/{code}.json
 * Custom packs: localStorage j2me.i18n.customPacks
 */
(function (global) {
  'use strict';

  var PREF_KEY = 'j2me.uiLanguage';
  var PACKS_KEY = 'j2me.i18n.customPacks';
  var DEFAULT_CODE = 'zh-CN';
  var listeners = [];

  var ZH = {
    'page.title': 'j2me在线模拟器',
    'page.titleBatch': 'j2me在线模拟器 - 批量安装版本',
    'page.aboutTitle': '关于 · 紫星与这件小事',
    'page.keyboardTitle': '键盘设置',
    'page.loading': '页面加载中',
    'nav.games': '游戏',
    'nav.settings': '设置',
    'nav.home': '回到主页',
    'nav.about': '关于作者',
    'title.games': '游戏列表',
    'title.settings': '设置',
    'title.batch': '批量安装版',
    'search.placeholder': '搜索游戏',
    'section.game': '游戏',
    'section.global': '全局设置',
    'section.localJar': '本地 JAR',
    'pref.keyboardLayout': '键盘布局',
    'pref.gameBg': '游戏背景',
    'pref.config': '配置管理',
    'pref.canvasSize': '显示尺寸',
    'pref.resize': '缩放',
    'pref.midi': '音乐播放器',
    'pref.rotation': '屏幕旋转',
    'pref.vibrate': '按键震动',
    'pref.jit': 'JIT 加速',
    'pref.maxFps': '最大帧率',
    'pref.speed': '运行倍速',
    'pref.keyLayout': '按键键值',
    'pref.fontSize': 'LCDUI 字号',
    'pref.uiLanguage': '界面语言',
    'btn.exportConfig': '导出配置',
    'btn.importConfig': '导入配置',
    'btn.importLang': '导入语言包',
    'btn.clearJit': '清理 JIT 缓存',
    'btn.chooseJar': '选择本地jar',
    'btn.runJar': '运行本地jar',
    'btn.deleteJar': '删除缓存安装包',
    'btn.clearData': '清除jar数据',
    'btn.batchVersion': '批量安装版本',
    'btn.updateLog': '更新日志',
    'btn.run': '运行',
    'btn.perGame': '独立设置',
    'btn.clearSave': '清除数据',
    'btn.delete': '删除',
    'btn.cancel': '取消',
    'btn.save': '保存',
    'btn.resetGame': '恢复游戏默认',
    'btn.clearAllJars': '清空本地jar',
    'btn.exportSaves': '导出所有存档',
    'btn.importSaves': '导入存档ZIP',
    'btn.exportSave': '导出存档',
    'btn.importSave': '导入存档',
    'section.saves': '存档管理',
    'jar.none': '无项目',
    'detail.empty': '点击左侧游戏查看详情',
    'fab.install': '安装游戏',
    'font.small': '小',
    'font.medium': '中',
    'font.large': '大',
    'font.global': '全局',
    'font.smallTitle': '小号像素',
    'font.mediumTitle': '中号像素',
    'font.largeTitle': '大号像素',
    'custom.width': '宽',
    'custom.height': '高',
    'color.none': '无',
    'color.purple': '紫色',
    'color.orange': '橙色',
    'color.red': '红色',
    'color.green': '绿色',
    'value.follow': '游戏默认/全局',
    'value.unlimited': '无限制',
    'value.custom': '自定义',
    'value.resizeAuto': '自动缩放',
    'value.on': '开启',
    'value.offCompat': '关闭（兼容）',
    'value.off': '关闭',
    'value.low': '低',
    'value.medium': '中',
    'value.high': '高',
    'value.noRotate': '不旋转',
    'value.rotateLeft': '左转',
    'value.rotateRight': '右转',
    'value.nokia': '诺基亚',
    'value.siemens': 'Siemens',
    'value.motorola': '摩托罗拉',
    'value.audioTag': 'Audio 标签',
    'setting.canvasSize': '显示尺寸',
    'setting.resize': '缩放',
    'setting.midi': '音乐播放器',
    'setting.rotation': '屏幕旋转',
    'setting.vibrate': '按键震动',
    'setting.jit': 'JIT 加速',
    'setting.maxFps': '最大帧率',
    'setting.speed': '运行倍速',
    'setting.keyLayout': '按键键值',
    'setting.uiLanguage': '界面语言',
    'lang.auto': '跟随系统',
    'layout.square': '方形全键盘',
    'layout.full': '全键盘',
    'layout.cncompat': '国产兼容键盘',
    'layout.classic': '经典键盘',
    'layout.simple': '简化键盘',
    'layout.arcadeMini': '街机极简',
    'layout.arcade4': '街机4键',
    'layout.none': '无按键',
    'layout.unset': '未设置',
    'player.back': '返回程序库',
    'player.speed': '运行倍速',
    'player.rotateLeft': '向左旋转',
    'player.rotateRight': '向右旋转',
    'player.hideKeypad': '隐藏虚拟键盘',
    'player.showKeypad': '显示虚拟键盘',
    'player.enterFs': '进入全屏',
    'player.exitFs': '退出全屏',
    'player.bar': '模拟器控制栏',
    'player.keypad': '虚拟键盘',
    'player.midlets': '应用列表',
    'msg.uploadFirst': '请先上传jar!',
    'msg.pickJar': '请选择jar名称!',
    'msg.nothingToDelete': '没有要删除的jar!',
    'msg.confirmDelete': '确定删除 {name} ？',
    'msg.deleteOk': '{name}删除成功！',
    'msg.deleteFail': '{error}删除失败！',
    'msg.nothingToClear': '没有要清空的jar!',
    'msg.confirmClearAll': '确定要清空所有本地jar文件吗？此操作不可恢复！',
    'msg.clearedAll': '所有本地jar文件已清空！',
    'msg.clearAllFail': '清空失败：{error}',
    'msg.pickJarOrUpload': '请先上传或选择 jar!',
    'msg.pickJarName': '请选择 jar 名称!',
    'msg.confirmClearData': '确定清除「{name}」的本地运行数据？\n\n将仅删除该 JAR 对应的 RMS 存档、手机/存储卡/私有目录等（与其它已安装游戏隔离）。JAR 安装包会保留。\n\n提示：若你曾在旧版本模拟器中玩过该游戏，早期存放在「共享路径」下的存档不会随此项删除；可在游戏内仍能看到旧档时再选择「导出/导入存档」做备份。',
    'msg.confirmClearDataShort': '确定清除「{name}」的本地运行数据？\nJAR 安装包会保留。',
    'msg.clearDataOk': '「{name}」的数据已清除（JAR 已保留）。',
    'msg.clearDataOkShort': '「{name}」的数据已清除。',
    'msg.clearDataFail': '清除失败：{error}',
    'msg.fsNotReady': '文件系统未初始化',
    'msg.clearFnMissing': 'clearUserMidletDataForJar 不可用',
    'msg.noStorageKey': '无法从文件名生成存储键',
    'msg.jarOnly': '只能上传jar格式!',
    'msg.installOk': '{name}安装成功！',
    'msg.installFail': '{error}安装失败！',
    'msg.installDone': '安装完成，成功 {ok}个，失败 {fail}个',
    'msg.missingManifest': '非 MIDlet / 缺少入口',
    'msg.confirmJit': '确定清理全部 JIT 编译缓存？\n下次运行游戏会重新编译热点方法。',
    'msg.jitCleared': 'JIT 缓存已清理。',
    'msg.jitFail': '清理失败：{error}',
    'msg.jitBlocked': '数据库正被占用，请关闭正在运行的游戏页后再试',
    'msg.unknownError': '未知错误',
    'msg.importOk': '配置导入成功！',
    'msg.importFail': '配置导入失败，请检查文件格式。',
    'msg.langImportOk': '语言包已导入。',
    'msg.langImportFail': '语言包导入失败，请检查 JSON 是否包含 code 与 strings。',
    'msg.perGameSuffix': '{name} - 独立设置',
    'msg.loadJarFail': '无法加载本地 JAR「{name}」。请在本页重新上传安装，或确认文件名与列表一致（含空格/中文时需与上传时完全一致）。',
    'msg.notMidlet': '「{name}」不是可用的 J2ME MIDlet（MANIFEST.MF 缺少 MIDlet-1 入口类）。\n\n请确认上传的是手机 MIDlet 的 .jar/.jad，而不是普通 Java/桌面程序。',
    'msg.confirmBack': '是否返回？',
    'save.exporting': '正在导出所有存档...',
    'save.exportOk': '存档导出成功!',
    'save.exportFail': '存档导出失败，请检查是否有存档数据!',
    'save.notReady': '存档管理器未初始化!',
    'save.notLoaded': '存档管理器未加载，请刷新页面重试',
    'save.importNotReady': '导入功能未就绪',
    'save.confirmImport': '导入存档将覆盖当前所有存档数据，确定要继续吗?\n\n建议在导入前先导出当前存档作为备份!',
    'save.confirmImportTitle': '导入存档',
    'save.confirmImportBody': '导入存档将覆盖当前所有存档数据，确定要继续吗？',
    'save.importing': '正在导入存档...',
    'save.importOk': '存档导入成功!页面将重新加载...',
    'save.importFail': '存档导入失败!请检查ZIP文件格式是否正确。',
    'save.exportingBatch': '正在导出存档...',
    'about.back': '返回',
    'about.title': '关于作者',
    'about.epigraph': '有些欢喜藏在按键声里；多年后再点开，仿佛与年少的自己，隔着屏幕轻轻击掌。',
    'about.lead': '紫星 · J2ME 在线模拟器',
    'about.p1': '在浏览器里，让那些以为留在过去的老游戏，还能再被打开一遍——不必翻箱倒柜找旧手机，也不必向谁解释，你为何还记得那个名字。兼容与体验仍在打磨；若有卡顿或闪退，欢迎留言，我们还在路上。',
    'about.p2': '两人小团队维护，无资本加持，只靠一点情怀，和「还想把它做好」的执念。若你在此打发过片刻无聊，或找回过通关的得意，于我而言，都已足够。',
    'about.tip': '域名与服务器都是实实在在的成本。若你愿意用一杯奶茶的心意，托住这份还在更新的坚持，可以扫下方赞赏码；随心即可，不必勉强。',
    'about.tipNote': '心意已到，也祝你今日愉快。',
    'about.qrAlt': '赞赏收款码',
    'kb.title': '键盘设置',
    'kb.defaultSection': '默认键盘',
    'kb.defaultLabel': '新游戏默认键盘',
    'kb.presets': '系统预设',
    'kb.mine': '我的键盘',
    'kb.empty': '暂无自定义键盘',
    'kb.new': '新建键盘',
    'kb.editLayout': '编辑布局',
    'kb.apply': '应用',
    'kb.cancel': '取消',
    'kb.hint': '拖动按钮调整位置 · 点击选中后可调整大小',
    'kb.size': '大小',
    'kb.preset': '预设',
    'kb.add': '添加',
    'kb.reset': '重置',
    'kb.pickPreset': '选择预设',
    'kb.addKey': '添加按键',
    'kb.close': '关闭',
    'kb.preview': '预览',
    'kb.edit': '编辑',
    'kb.useLayout': '使用此布局',
    'kb.pickDefault': '选择默认键盘',
    'kb.keyCount': '{n} 个按键',
    'kb.namePrompt': '请输入键盘名称：',
    'kb.nameDefault': '我的键盘',
    'kb.customSuffix': '{name} (自定义)',
    'kb.cat.direction': '方向键',
    'kb.cat.joystick': '摇杆',
    'kb.cat.softkey': '软键',
    'kb.cat.numkey': '数字键'
  };

  var EN = {
    'page.title': 'J2ME Online Emulator',
    'page.titleBatch': 'J2ME Online Emulator — Batch install',
    'page.aboutTitle': 'About · Zixing',
    'page.keyboardTitle': 'Keyboard settings',
    'page.loading': 'Loading',
    'nav.games': 'Games',
    'nav.settings': 'Settings',
    'nav.home': 'Home',
    'nav.about': 'About',
    'title.games': 'Games',
    'title.settings': 'Settings',
    'title.batch': 'Batch install',
    'search.placeholder': 'Search games',
    'section.game': 'Game',
    'section.global': 'Global',
    'section.localJar': 'Local JAR',
    'pref.keyboardLayout': 'Keyboard layout',
    'pref.gameBg': 'Game background',
    'pref.config': 'Configuration',
    'pref.canvasSize': 'Canvas size',
    'pref.resize': 'Scale',
    'pref.midi': 'Music player',
    'pref.rotation': 'Rotation',
    'pref.vibrate': 'Key vibration',
    'pref.jit': 'JIT',
    'pref.maxFps': 'Max FPS',
    'pref.speed': 'Speed',
    'pref.keyLayout': 'Key codes',
    'pref.fontSize': 'LCDUI font size',
    'pref.uiLanguage': 'Language',
    'btn.exportConfig': 'Export',
    'btn.importConfig': 'Import',
    'btn.importLang': 'Import language pack',
    'btn.clearJit': 'Clear JIT cache',
    'btn.chooseJar': 'Choose local JAR',
    'btn.runJar': 'Run local JAR',
    'btn.deleteJar': 'Delete cached JAR',
    'btn.clearData': 'Clear JAR data',
    'btn.batchVersion': 'Batch install',
    'btn.updateLog': 'Changelog',
    'btn.run': 'Run',
    'btn.perGame': 'Per-game settings',
    'btn.clearSave': 'Clear data',
    'btn.delete': 'Delete',
    'btn.cancel': 'Cancel',
    'btn.save': 'Save',
    'btn.resetGame': 'Reset to game default',
    'btn.clearAllJars': 'Clear all local JARs',
    'btn.exportSaves': 'Export all saves',
    'btn.importSaves': 'Import save ZIP',
    'btn.exportSave': 'Export saves',
    'btn.importSave': 'Import saves',
    'section.saves': 'Saves',
    'jar.none': 'None',
    'detail.empty': 'Select a game to see details',
    'fab.install': 'Install game',
    'font.small': 'S',
    'font.medium': 'M',
    'font.large': 'L',
    'font.global': 'Global',
    'font.smallTitle': 'Small font (px)',
    'font.mediumTitle': 'Medium font (px)',
    'font.largeTitle': 'Large font (px)',
    'custom.width': 'W',
    'custom.height': 'H',
    'color.none': 'None',
    'color.purple': 'Purple',
    'color.orange': 'Orange',
    'color.red': 'Red',
    'color.green': 'Green',
    'value.follow': 'Game default / global',
    'value.unlimited': 'Unlimited',
    'value.custom': 'Custom',
    'value.resizeAuto': 'Auto',
    'value.on': 'On',
    'value.offCompat': 'Off (compat)',
    'value.off': 'Off',
    'value.low': 'Low',
    'value.medium': 'Medium',
    'value.high': 'High',
    'value.noRotate': 'None',
    'value.rotateLeft': 'Left',
    'value.rotateRight': 'Right',
    'value.nokia': 'Nokia',
    'value.siemens': 'Siemens',
    'value.motorola': 'Motorola',
    'value.audioTag': 'Audio tag',
    'setting.canvasSize': 'Canvas size',
    'setting.resize': 'Scale',
    'setting.midi': 'Music player',
    'setting.rotation': 'Rotation',
    'setting.vibrate': 'Key vibration',
    'setting.jit': 'JIT',
    'setting.maxFps': 'Max FPS',
    'setting.speed': 'Speed',
    'setting.keyLayout': 'Key codes',
    'setting.uiLanguage': 'Language',
    'lang.auto': 'System default',
    'layout.square': 'Square keypad',
    'layout.full': 'Full keypad',
    'layout.cncompat': 'China-compat keypad',
    'layout.classic': 'Classic keypad',
    'layout.simple': 'Simple keypad',
    'layout.arcadeMini': 'Arcade mini',
    'layout.arcade4': 'Arcade 4-key',
    'layout.none': 'No keypad',
    'layout.unset': 'Not set',
    'player.back': 'Back to library',
    'player.speed': 'Emulation speed',
    'player.rotateLeft': 'Rotate left',
    'player.rotateRight': 'Rotate right',
    'player.hideKeypad': 'Hide virtual keypad',
    'player.showKeypad': 'Show virtual keypad',
    'player.enterFs': 'Enter fullscreen',
    'player.exitFs': 'Exit fullscreen',
    'player.bar': 'Emulator controls',
    'player.keypad': 'Virtual keypad',
    'player.midlets': 'MIDlet list',
    'msg.uploadFirst': 'Please upload a JAR first.',
    'msg.pickJar': 'Please select a JAR.',
    'msg.nothingToDelete': 'No JAR to delete.',
    'msg.confirmDelete': 'Delete {name}?',
    'msg.deleteOk': '{name} deleted.',
    'msg.deleteFail': 'Failed to delete {error}.',
    'msg.nothingToClear': 'No JAR to clear.',
    'msg.confirmClearAll': 'Delete all local JARs? This cannot be undone.',
    'msg.clearedAll': 'All local JARs removed.',
    'msg.clearAllFail': 'Failed to clear: {error}',
    'msg.pickJarOrUpload': 'Please upload or select a JAR.',
    'msg.pickJarName': 'Please select a JAR name.',
    'msg.confirmClearData': 'Clear local data for “{name}”?\n\nOnly RMS saves and this JAR’s phone/SD/private files will be removed. The JAR itself is kept.\n\nNote: saves from older emulator versions in the shared path are not deleted. Export a backup if you still see old saves in-game.',
    'msg.confirmClearDataShort': 'Clear local data for “{name}”?\nThe JAR will be kept.',
    'msg.clearDataOk': 'Data for “{name}” was cleared (JAR kept).',
    'msg.clearDataOkShort': 'Data for “{name}” was cleared.',
    'msg.clearDataFail': 'Failed to clear: {error}',
    'msg.fsNotReady': 'File system is not ready.',
    'msg.clearFnMissing': 'clearUserMidletDataForJar is unavailable.',
    'msg.noStorageKey': 'Could not build a storage key from the file name.',
    'msg.jarOnly': 'Only .jar files can be uploaded.',
    'msg.installOk': '{name} installed.',
    'msg.installFail': 'Failed to install {error}.',
    'msg.installDone': 'Install finished: {ok} succeeded, {fail} failed.',
    'msg.missingManifest': 'Not a MIDlet / missing entry',
    'msg.confirmJit': 'Clear all JIT caches?\nGames will recompile hot methods next run.',
    'msg.jitCleared': 'JIT cache cleared.',
    'msg.jitFail': 'Failed to clear: {error}',
    'msg.jitBlocked': 'The database is in use. Close running game tabs and try again.',
    'msg.unknownError': 'Unknown error',
    'msg.importOk': 'Configuration imported.',
    'msg.importFail': 'Import failed. Check the file format.',
    'msg.langImportOk': 'Language pack imported.',
    'msg.langImportFail': 'Import failed. JSON needs “code” and “strings”.',
    'msg.perGameSuffix': '{name} — per-game settings',
    'msg.loadJarFail': 'Could not load local JAR “{name}”. Re-upload it on this page, or make sure the file name matches exactly (including spaces and non-English characters).',
    'msg.notMidlet': '“{name}” is not a usable J2ME MIDlet (MANIFEST.MF has no MIDlet-1 entry).\n\nUpload a phone MIDlet .jar/.jad, not a desktop Java program.',
    'msg.confirmBack': 'Go back?',
    'save.exporting': 'Exporting all saves…',
    'save.exportOk': 'Saves exported.',
    'save.exportFail': 'Export failed. Check that save data exists.',
    'save.notReady': 'Save manager is not ready.',
    'save.notLoaded': 'Save manager failed to load. Refresh and try again.',
    'save.importNotReady': 'Import is not ready.',
    'save.confirmImport': 'Importing saves will overwrite all current save data. Continue?\n\nExport a backup first.',
    'save.confirmImportTitle': 'Import saves',
    'save.confirmImportBody': 'Importing saves will overwrite all current save data. Continue?',
    'save.importing': 'Importing saves…',
    'save.importOk': 'Saves imported. Reloading…',
    'save.importFail': 'Import failed. Check the ZIP file.',
    'save.exportingBatch': 'Exporting saves…',
    'about.back': 'Back',
    'about.title': 'About',
    'about.epigraph': 'Some joy lives in the click of keys. Opening these games years later feels like a high-five with your younger self, through the screen.',
    'about.lead': 'Zixing · J2ME in the browser',
    'about.p1': 'Bring back the games you thought were stuck on old phones — no rummaging, no explaining why you still remember the name. Compatibility is still being polished; if something stutters or crashes, tell us. We are still on the road.',
    'about.p2': 'A two-person team, no backers, just the wish to keep doing this well. If this filled a quiet minute, or brought back a clear, that is already enough.',
    'about.tip': 'The domain and servers cost real money. If a cup of milk tea’s worth of support helps keep this updated, the QR code is below. Only if you want to.',
    'about.tipNote': 'Thank you — enjoy your day.',
    'about.qrAlt': 'Tip QR code',
    'kb.title': 'Keyboard settings',
    'kb.defaultSection': 'Default keyboard',
    'kb.defaultLabel': 'Default for new games',
    'kb.presets': 'Presets',
    'kb.mine': 'My keyboards',
    'kb.empty': 'No custom keyboards yet',
    'kb.new': 'New keyboard',
    'kb.editLayout': 'Edit layout',
    'kb.apply': 'Apply',
    'kb.cancel': 'Cancel',
    'kb.hint': 'Drag to move · tap to resize',
    'kb.size': 'Size',
    'kb.preset': 'Preset',
    'kb.add': 'Add',
    'kb.reset': 'Reset',
    'kb.pickPreset': 'Choose preset',
    'kb.addKey': 'Add key',
    'kb.close': 'Close',
    'kb.preview': 'Preview',
    'kb.edit': 'Edit',
    'kb.useLayout': 'Use this layout',
    'kb.pickDefault': 'Default keyboard',
    'kb.keyCount': '{n} keys',
    'kb.namePrompt': 'Keyboard name:',
    'kb.nameDefault': 'My keyboard',
    'kb.customSuffix': '{name} (custom)',
    'kb.cat.direction': 'D-pad',
    'kb.cat.joystick': 'Stick',
    'kb.cat.softkey': 'Soft keys',
    'kb.cat.numkey': 'Number keys'
  };

  var BUILTIN = { 'zh-CN': ZH, en: EN };
  var BUILTIN_META = [
    { code: 'zh-CN', name: '简体中文', builtin: true },
    { code: 'en', name: 'English', builtin: true }
  ];

  var catalogs = { 'zh-CN': ZH, en: EN };
  var extraMeta = [];
  var pref = 'auto';
  var resolved = DEFAULT_CODE;
  var LAYOUT_KEYS = {
    '方形全键盘': 'layout.square',
    '全键盘': 'layout.full',
    '国产兼容键盘': 'layout.cncompat',
    '经典键盘': 'layout.classic',
    '简化键盘': 'layout.simple',
    '街机极简': 'layout.arcadeMini',
    '街机4键': 'layout.arcade4',
    '无按键': 'layout.none'
  };

  function safeGet(key) {
    try { return global.localStorage.getItem(key); } catch (e) { return null; }
  }
  function safeSet(key, value) {
    try { global.localStorage.setItem(key, value); } catch (e) {}
  }
  function readPacks() {
    try { return JSON.parse(safeGet(PACKS_KEY) || '{}') || {}; } catch (e) { return {}; }
  }
  function writePacks(packs) {
    safeSet(PACKS_KEY, JSON.stringify(packs));
  }

  function listMeta() {
    var out = BUILTIN_META.slice();
    var i, packs, code;
    for (i = 0; i < extraMeta.length; i++) {
      if (!findMeta(out, extraMeta[i].code)) out.push(extraMeta[i]);
    }
    packs = readPacks();
    for (code in packs) {
      if (!Object.prototype.hasOwnProperty.call(packs, code)) continue;
      if (!findMeta(out, code)) {
        out.push({ code: code, name: packs[code].name || code, custom: true });
      }
    }
    return out;
  }

  function findMeta(list, code) {
    var i;
    for (i = 0; i < list.length; i++) {
      if (list[i].code === code) return list[i];
    }
    return null;
  }

  function listCodes() {
    var meta = listMeta();
    var codes = [];
    var i;
    for (i = 0; i < meta.length; i++) codes.push(meta[i].code);
    return codes;
  }

  function deviceLang() {
    var langs = [];
    var nav = global.navigator || {};
    var i, raw, lower, shortName, codes, j;
    if (nav.languages && nav.languages.length) {
      for (i = 0; i < nav.languages.length; i++) langs.push(nav.languages[i]);
    } else {
      langs.push(nav.language || nav.userLanguage || nav.browserLanguage || '');
    }
    codes = listCodes();
    for (i = 0; i < langs.length; i++) {
      raw = String(langs[i] || '').replace(/_/g, '-');
      lower = raw.toLowerCase();
      if (!lower) continue;
      for (j = 0; j < codes.length; j++) {
        if (codes[j].toLowerCase() === lower) return codes[j];
      }
      shortName = lower.split('-')[0];
      if (shortName === 'zh') return 'zh-CN';
      for (j = 0; j < codes.length; j++) {
        if (codes[j].toLowerCase().split('-')[0] === shortName) return codes[j];
      }
    }
    return DEFAULT_CODE;
  }

  function readPref() {
    var stored = safeGet(PREF_KEY);
    if (stored) return stored;
    try {
      var my = JSON.parse(safeGet('my') || '{}');
      if (my && my.uiLanguage) return my.uiLanguage;
    } catch (e) {}
    return 'auto';
  }

  function catalogFor(code) {
    var packs, merged, key;
    if (catalogs[code]) return catalogs[code];
    packs = readPacks();
    if (packs[code] && packs[code].strings) {
      merged = {};
      for (key in EN) {
        if (Object.prototype.hasOwnProperty.call(EN, key)) merged[key] = EN[key];
      }
      for (key in packs[code].strings) {
        if (Object.prototype.hasOwnProperty.call(packs[code].strings, key)) {
          merged[key] = packs[code].strings[key];
        }
      }
      catalogs[code] = merged;
      return merged;
    }
    return null;
  }

  function resolve() {
    pref = readPref() || 'auto';
    if (pref === 'auto' || pref === '') resolved = deviceLang();
    else resolved = pref;
    var known = !!catalogFor(resolved) || !!BUILTIN[resolved] || !!findMeta(listMeta(), resolved);
    if (!known) resolved = DEFAULT_CODE;
    return resolved;
  }

  function format(str, vars) {
    if (!vars) return str;
    return String(str).replace(/\{(\w+)\}/g, function (_, k) {
      return vars[k] == null ? '' : String(vars[k]);
    });
  }

  function t(key, vars) {
    var cat = catalogFor(resolved) || ZH;
    var str = (cat && cat[key]) || EN[key] || ZH[key] || key;
    return format(str, vars);
  }

  function layoutName(name) {
    var key = LAYOUT_KEYS[name];
    return key ? t(key) : (name || t('layout.unset'));
  }

  function htmlLang() {
    if (resolved === 'zh-CN') return 'zh-CN';
    if (resolved.indexOf('zh') === 0) return resolved;
    return resolved;
  }

  function setAttr(el, name, key) {
    if (!el || !key) return;
    el.setAttribute(name, t(key));
  }

  function applyNode(el) {
    var key = el.getAttribute('data-i18n');
    var suffix = el.getAttribute('data-i18n-suffix');
    var suffixKey = el.getAttribute('data-i18n-suffix-key');
    var text;
    if (key) {
      text = t(key);
      if (suffixKey) text += ': ' + t(suffixKey);
      else if (suffix != null && suffix !== '') text += ': ' + suffix;
      el.textContent = text;
    }
    setAttr(el, 'title', el.getAttribute('data-i18n-title'));
    setAttr(el, 'placeholder', el.getAttribute('data-i18n-placeholder'));
    setAttr(el, 'aria-label', el.getAttribute('data-i18n-aria'));
    setAttr(el, 'alt', el.getAttribute('data-i18n-alt'));
  }

  function fillLanguageSelect(sel) {
    var meta, i, opt, current, label;
    if (!sel) return;
    current = pref || 'auto';
    sel.innerHTML = '';
    opt = document.createElement('option');
    opt.value = 'auto';
    opt.setAttribute('data-i18n', 'setting.uiLanguage');
    opt.setAttribute('data-i18n-suffix-key', 'lang.auto');
    opt.textContent = t('setting.uiLanguage') + ': ' + t('lang.auto');
    sel.appendChild(opt);
    meta = listMeta();
    for (i = 0; i < meta.length; i++) {
      opt = document.createElement('option');
      opt.value = meta[i].code;
      label = meta[i].name || meta[i].code;
      opt.textContent = t('setting.uiLanguage') + ': ' + label;
      sel.appendChild(opt);
    }
    sel.value = current;
    if (sel.selectedIndex < 0) sel.value = 'auto';
  }

  function apply(root) {
    var nodes, i, el;
    root = root || document;
    if (!root.querySelectorAll) return;
    resolve();
    fillLanguageSelect(document.getElementById('uiLanguage'));
    nodes = root.querySelectorAll('[data-i18n], [data-i18n-title], [data-i18n-placeholder], [data-i18n-aria], [data-i18n-alt]');
    for (i = 0; i < nodes.length; i++) applyNode(nodes[i]);
    el = document.documentElement;
    if (el) el.lang = htmlLang();
    if (document.body) {
      if (document.body.classList.contains('about-page')) document.title = t('page.aboutTitle');
      else if (document.getElementById('player-back')) { /* keep MIDlet title */ }
      else if (document.getElementById('listView') && document.getElementById('editorView')) document.title = t('page.keyboardTitle');
      else if (document.getElementById('gameListDiv')) document.title = window.isbatch ? t('page.titleBatch') : t('page.title');
    }
  }

  function emit() {
    var i;
    for (i = 0; i < listeners.length; i++) {
      try { listeners[i](resolved, pref); } catch (e) {}
    }
    try {
      if (typeof CustomEvent === 'function') {
        global.dispatchEvent(new CustomEvent('j2me-i18n-change', { detail: { lang: resolved, pref: pref } }));
      }
    } catch (e2) {}
  }

  function setPreference(next, skipApply) {
    pref = next || 'auto';
    safeSet(PREF_KEY, pref);
    try {
      var my = JSON.parse(safeGet('my') || '{}');
      my.uiLanguage = pref;
      safeSet('my', JSON.stringify(my));
    } catch (e) {}
    resolve();
    ensureCatalog(resolved, function () {
      if (!skipApply) apply(document);
      emit();
    });
  }

  function fetchJson(url, cb) {
    var x = new XMLHttpRequest();
    x.open('GET', url, true);
    x.onload = function () {
      if (x.status >= 200 && x.status < 300) {
        try { cb(null, JSON.parse(x.responseText)); } catch (e) { cb(e); }
      } else cb(new Error('HTTP ' + x.status));
    };
    x.onerror = function () { cb(new Error('network')); };
    x.send();
  }

  function ensureCatalog(code, cb) {
    var file, i, meta;
    if (catalogFor(code) || BUILTIN[code]) {
      if (cb) cb();
      return;
    }
    meta = extraMeta;
    file = code + '.json';
    for (i = 0; i < meta.length; i++) {
      if (meta[i].code === code && meta[i].file) file = meta[i].file;
    }
    fetchJson('lang/' + file, function (err, data) {
      var strings = data;
      if (!err && data && data.strings) strings = data.strings;
      if (!err && strings && typeof strings === 'object') {
        catalogs[code] = strings;
      }
      if (cb) cb();
    });
  }

  function loadManifest(done) {
    fetchJson('lang/manifest.json', function (err, data) {
      var list, i, item;
      if (!err && data && data.languages) {
        list = data.languages;
        extraMeta = [];
        for (i = 0; i < list.length; i++) {
          item = list[i];
          if (!item || !item.code || item.builtin) continue;
          extraMeta.push({
            code: item.code,
            name: item.name || item.code,
            file: item.file || (item.code + '.json')
          });
        }
      }
      resolve();
      ensureCatalog(resolved, function () {
        apply(document);
        emit();
        if (done) done();
      });
    });
  }

  function importPack(obj) {
    var code, packs;
    if (!obj || !obj.code || !obj.strings || typeof obj.strings !== 'object') return false;
    code = String(obj.code);
    packs = readPacks();
    packs[code] = { name: obj.name || code, strings: obj.strings };
    writePacks(packs);
    delete catalogs[code];
    return true;
  }

  function onChange(fn) {
    if (typeof fn === 'function') listeners.push(fn);
  }

  pref = readPref();
  resolve();

  global.I18n = {
    t: t,
    apply: apply,
    layoutName: layoutName,
    BUILTIN: BUILTIN,
    getPref: function () { return pref; },
    getLang: function () { return resolved; },
    getHtmlLang: htmlLang,
    setPreference: setPreference,
    listLanguages: listMeta,
    importPack: importPack,
    onChange: onChange,
    fillLanguageSelect: fillLanguageSelect,
    LAYOUT_KEYS: LAYOUT_KEYS
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      apply(document);
      loadManifest();
    });
  } else {
    apply(document);
    loadManifest();
  }
})(typeof window !== 'undefined' ? window : this);
