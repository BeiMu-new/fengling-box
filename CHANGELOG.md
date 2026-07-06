# 更新日志 / Changelog

## v1.0.7（2026-07-06）
- 移除 README 中「依赖 smart-search 的搜索源」过时章节
- 更新 `daily_news_workflow.md`：注明 anysearch 已内置在 flb 中
- 更新 `MEMORY.md`：去掉了 smart-search 安装记录
- 更新日志补充 v1.0.6 / v1.0.7 条目

## v1.0.6（2026-07-06）
- 修复 v1.0.5 发布后 README 更新日志未同步到 npm 的问题
- 版本号因 v1.0.5 已 unpublish 而顺延

## v1.0.5（2026-07-06）
- 🎯 **anysearch 内置** — 不再需要额外安装 `@konbakuyomu/smart-search`，装 flb 直接用
- 新增命令：`flb tokens <文本>` — 统计中英文 token 数
- 新增命令：`flb cost <tokens>` — Token 用量分布（缓存命中/未命中/输出）
- 新增命令：`flb serve [port]` — 当前目录启动 HTTP 文件服务器
- 新增命令：`flb qr <文字>` — 终端生成二维码
- 新增命令：`flb commit` — AI 生成 Git commit message（框架）
- 新增命令：`flb ascii <图片>` — 图片转 ASCII 字符画
- anysearch 引擎改为直接调用 API，不再依赖外部命令
- ⚠️ 已 unpublish，功能由 v1.0.6 / v1.0.7 接替

## v1.0.4（2026-07-05）
- 新增 4 个搜索源：reddit, hackernews, crates, gopkg
- 新增功能：搜索结果导出（--out）
- 新增功能：多引擎并行搜索（-e engine1,engine2）
- 新增功能：搜索历史（flb search history）
- 新增独立命令：`flb open <url>` 打开URL
- 新增独立命令：`flb translate <text>` 免费翻译
- 搜索源总数从38增至42

## v1.0.3（2026-07-04）
- 详细补充需要API Key的搜索源申请方式
- README增加更新命令说明

## v1.0.2（2026-07-04）
- 修正README中搜索源总数

## v1.0.1（2026-07-04）
- 新增 searx（开源元搜索）
- 新增 wolfram（计算型搜索）
- moegirl 从学术类移到百科类

## v1.0.0（2026-07-04）
- 首次发布，含36个搜索源、文件/图片/数据处理、信源核实等功能
