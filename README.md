# fengling-box 枫铃工具箱

多功能命令行工具箱，命令统一用 `flb` 调用。

## 安装

```bash
npm install -g fengling-box
```

## 更新

```bash
npm update -g fengling-box
```

如果 `npm update` 没生效，可以强制重装最新版：

```bash
npm install -g fengling-box@latest
```

查看当前版本：

```bash
flb --version
```

## 功能模块

### 🔍 搜索 (search / s)

用户**显式选择**搜索源，不自动路由。

```bash
flb search <engine> <query>

# 示例
flb search baidu "OpenCode Go教程"
flb search github "fengling-box"
flb search bilibili "Flux.2 Klein"
flb search arxiv "speculative decoding" --limit 5
flb search weibo hot
flb search moegirl "德国骨科"
flb search reddit "opencode" --limit 3
flb search hackernews "openai"

# 导出结果到文件（支持.json/.md/.txt）
flb search arxiv "speculative decoding" --out result.md
flb search github "vue" --out result.json

# 多引擎并行搜索
flb search all "AI大模型" -e baidu,bing,github,reddit
flb search all "枫铃" -e baidu,bing --limit 5

# 查看/清空搜索历史
flb search history
flb search history clear

# 列出所有可用搜索源
flb search engines
flb search engines --detail
```

**可用搜索源（42个）：**

| 类别 | 搜索源 |
|------|--------|
| 通用 | baidu, bing, duckduckgo, brave*, yandex, google*, searx |
| AI聚合 | anysearch, tavily*, exa* |
| 中文 | weibo, zhihu, bilibili, douyin, toutiao |
| 新闻 | xinhua, cctv, thepaper, kr36, huxiu, ithome, cls |
| 技术 | github, npm, pypi, stackoverflow, crates, gopkg |
| 论坛 | reddit, hackernews |
| 学术 | arxiv, wikipedia, semanticscholar, googlescholar |
| 计算 | wolfram* |
| 电商 | taobao, jd, pdd |
| 娱乐 | douban, imdb |
| 百科 | baidubaike, moegirl |

`*` 需要配置 API Key

### 🔑 需要API Key的搜索源

以下搜索源标注了 `*`，需要单独配置API Key才能使用：

**brave**（Brave Search）
- 免费额度：2000次/月
- 申请地址：https://api.search.brave.com/
- 配置命令：`flb config set brave.key <your-key>`

**google**（Google自定义搜索）
- 免费额度：100次/天
- 需要 **两个** 参数：API Key 和 CX（搜索引擎ID）
- API Key 申请：https://developers.google.com/custom-search/v1/overview
- CX 申请：https://programmablesearchengine.google.com/
- 配置命令：
  ```bash
  flb config set google.key <your-key>
  flb config set google.cx <your-cx>
  ```

**tavily**（Tavily AI搜索）
- 免费额度：1000次/月
- 申请地址：https://tavily.com/
- 配置命令：`flb config set tavily.key <your-key>`

**exa**（Exa语义搜索）
- 免费额度：1000次/月起
- 申请地址：https://exa.ai/
- 配置命令：`flb config set exa.key <your-key>`

**wolfram**（Wolfram Alpha计算搜索）
- 免费额度：2000次/月
- 申请地址：https://developer.wolframalpha.com/
- 配置命令：`flb config set wolfram.appid <your-appid>`

### 🔧 可选配置的搜索源

以下搜索源无需Key也能用，但可以选择自定义配置：

**searx**（开源元搜索）
- 默认使用公共实例 `https://searx.tiekoetter.com`
- 可自定义实例：`flb config set searx.url https://your-instance.com`
- 公共实例列表：https://searx.space/

**github**（GitHub搜索）
- 无Key可用（有限速，60次/小时）
- 配置Token可提高限额到5000次/小时：`flb config set github.token <your-token>`
- Token申请：https://github.com/settings/tokens

### 📌 anysearch（AI聚合搜索）

anysearch 已内置在 flb 中，无需额外安装任何依赖，直接可用。

### 📁 文件 (file)

```bash
flb file rename ./photos --prefix "trip_" --start 1
flb file rename ./docs --lower --dry-run
flb file list ./folder --ext jpg,png --size
flb file copy ./src ./dst --ext pdf
```

### 🖼 图片 (image)

```bash
flb image compress ./photos --quality 80 --out ./compressed
flb image convert ./image.png --to webp
flb image resize ./photo.jpg --width 800
flb image watermark ./photo.jpg --text "枫铃" --position bottom-right
flb image info ./photo.jpg
```

### 📊 数据 (data)

```bash
flb data csv ./data.csv --info
flb data csv ./data.csv --col 1,2,3 --out result.csv
flb data excel ./data.xlsx --sheet Sheet1 --out result.csv
flb data text ./file.txt --trim --dedup --empty --out result.txt
flb data json ./data.json --pretty --query "data[0].name"
```

### ✅ 信源核实 (verify / v)

```bash
flb verify https://www.xinhuanet.com/xxx
flb verify https://a.com https://b.com --detail
flb v https://toutiao.com/xxx
```

### 🌐 URL打开 (open)

用默认浏览器打开链接：

```bash
flb open https://github.com/BeiMu-new/fengling-box
flb open https://www.npmjs.com/package/fengling-box
```

### 🔤 翻译 (translate / tr)

免费翻译（Google翻译，失败时自动降级到MyMemory）：

```bash
flb translate "hello world"                  # 默认译为中文
flb translate "你好世界" --to en             # 译为英文
flb translate "こんにちは" --to zh           # 日译中
flb tr "hello" --to ja                       # 简写命令
```

支持的语言代码：`zh` `en` `ja` `ko` `fr` `de` `es` `ru` `ar` 等标准ISO代码。

### ⚙️ 配置 (config)

```bash
flb config set tavily.key tvly-xxxxx
flb config set exa.key 4b425c7f-xxxx
flb config set github.token ghp_xxxxx
flb config set brave.key BSAxxxxx
flb config set google.key AIzaSyxxxxx
flb config set google.cx 012345678xxx
flb config set wolfram.appid XXXXX-XXXXXXXXXX
flb config set searx.url https://your-instance.com
flb config list
flb config get tavily.key
flb config delete tavily.key
```

## 参数说明

| 参数 | 说明 |
|------|------|
| `--limit <n>` | 返回结果数量，默认10 |
| `--format text\|json\|table` | 输出格式，默认text |
| `--type <type>` | 搜索类型（部分源支持，如bilibili的video/upuser） |
| `--out <file>` | 导出结果到文件（.json/.md/.txt自动识别） |
| `-e, --engines <list>` | 多引擎并行搜索（逗号分隔） |
| `--dry-run` | 预览模式，不实际执行 |

## 更新日志

**v1.0.5**
- 🎯 **anysearch 内置** — 不再需要额外安装 `@konbakuyomu/smart-search`，装 flb 直接用
- 新增命令：`flb tokens <文本>` — 统计中英文 token 数
- 新增命令：`flb cost <tokens>` — Token 用量分布（缓存命中/未命中/输出）
- 新增命令：`flb serve [port]` — 当前目录启动 HTTP 文件服务器
- 新增命令：`flb qr <文字>` — 终端生成二维码
- 新增命令：`flb commit` — AI 生成 Git commit message（框架）
- 新增命令：`flb ascii <图片>` — 图片转 ASCII 字符画
- anysearch 引擎改为直接调用 API，不再依赖外部命令
- **README更新：** 移除"依赖 smart-search 的搜索源"过时章节

**v1.0.6**
- 修复README更新日志未同步到npm的问题

**v1.0.4**
- 新增 4 个搜索源：reddit, hackernews, crates, gopkg
- 新增功能：搜索结果导出（--out）
- 新增功能：多引擎并行搜索（-e engine1,engine2）
- 新增功能：搜索历史（flb search history）
- 新增独立命令：`flb open <url>` 打开URL
- 新增独立命令：`flb translate <text>` 免费翻译
- 搜索源总数从38增至42

**v1.0.3**
- 详细补充需要API Key的搜索源申请方式
- README增加更新命令说明

**v1.0.2**
- 修正README中搜索源总数

**v1.0.1**
- 新增 searx（开源元搜索）
- 新增 wolfram（计算型搜索）
- moegirl 从学术类移到百科类

**v1.0.0**
- 首次发布，含36个搜索源、文件/图片/数据处理、信源核实等功能

## License

MIT
