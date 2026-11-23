# 添加界面语言

内置 `zh-CN` 与 `en`。增加新语言不必改 JS：

1. 复制 `en.json` 为 `xx.json`（`xx` 为语言代码，如 `ja`、`zh-TW`）。
2. 翻译 JSON 里的字符串；**不要改键名**。
3. 在 `manifest.json` 的 `languages` 数组追加一项：

```json
{ "code": "ja", "name": "日本語", "file": "ja.json" }
```

刷新页面后，设置里的「界面语言」会出现新选项。

也可在设置页用「导入语言包」加载同样格式的 JSON（会存到本机，不写仓库）：

```json
{
  "code": "ja",
  "name": "日本語",
  "strings": {
    "nav.games": "ゲーム"
  }
}
```

未翻译的键会回退到英语，再回退到简体中文。
