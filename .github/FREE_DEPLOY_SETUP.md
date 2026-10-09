# 《向AI开炮》免费 GitHub Pages 构建与 Chromium 验收

## 目标

- 正式源码保持在 **私有** `BaiMaGod/xiang-ai-kai-pao`，分支 `laya-v0.2-tech-validation`。
- 公开 `BaiMaGod/xiang-ai-kai-pao-preview` 使用标准 `ubuntu-latest` 免费 Runner 构建、执行浏览器验收、再直接部署到 GitHub Pages。
- 保持原地址：<https://baimagod.github.io/xiang-ai-kai-pao-preview/laya-v0.2/>。
- 只把 `LayaXiangAI/release/web` 中的 **编译产物** 放入公开仓库 `laya-v0.2/`，不会上传 TypeScript 源码或测试源文件。
- 原来公开库根目录的 Three.js 旧入口不变。本流程只更新 `laya-v0.2/`。

## 一次性授权（**由仓库管理员本人操作**）

1. 在 GitHub 个人设置 [Fine-grained personal access tokens](https://github.com/settings/personal-access-tokens/new) 创建新的 fine-grained PAT。
   - Resource owner：**BaiMaGod**
   - Repository access：**Only select repositories** → **xiang-ai-kai-pao**（仅私有正式仓库，不选全部仓库）。
   - Repository permissions：**Contents → Read-only**；Metadata 保持自动 Read。
   - 过期时间：建议 30~90 天；过期后需要更新秘钥。
   - 此 PAT **绝对不要**提交到仓库文件，也不要发到聊天、截图或公开 issue。
2. 打开 **公开预览仓库** → [Settings / Actions secrets](https://github.com/BaiMaGod/xiang-ai-kai-pao-preview/settings/secrets/actions) → **New repository secret**，名称必须为：
   ```
   PREVIEW_SOURCE_READ_TOKEN
   ```
   Value 粘贴刚生成的 PAT 并保存。此令牌只有私有源码读取权限，不具有写入权限。
3. 打开 [公开预览仓库 Actions 设置](https://github.com/BaiMaGod/xiang-ai-kai-pao-preview/settings/actions)，页面下方 `Workflow permissions` 应允许 `Read and write permissions`，使内置短期 `GITHUB_TOKEN` 能提交 **仅编译产物** 到公开预览仓库。若账户策略限制此设置，流水线会在 push 阶段提示 403，需要在 GitHub UI 调整；不应给上述私有源码 PAT 添加写权限。
4. 打开 [Free LayaAir build 工作流](https://github.com/BaiMaGod/xiang-ai-kai-pao-preview/actions/workflows/free-laya-preview.yml) → **Run workflow**（主分支 `main`，第一次可勾选 force）；观察构建、Chromium QA、Pages 部署和线上实测各阶段。

## 部署触发方式（不轮询正式源码）

- **已关闭每小时定时检查**：`free-laya-preview.yml` 不含 `schedule` 或 `push`，只有管理员通过 `workflow_dispatch` 手动发起私有源码读取、完整构建、Chromium 回归和 Pages 直接部署。
- **预览库提交即自动部署**：`pages.yml` 监听公开预览仓库 `main` 的每次 `push`，例如向 `laya-v0.2/` 提交新的静态构建文件，即触发 Pages 发布及线上 Chromium 冒烟测试。
- 已成功构建的私有源码产物由 `free-laya-preview.yml` 使用默认 `GITHUB_TOKEN` 推送到预览库，因此该工作流会**自行部署和执行线上测试**；不会依赖另一条 `push` 工作流二次触发。
- 只修改正式私有仓库而不提交预览产物、也不手动运行 `free-laya-preview.yml`，**不会自动更新预览页面**。
- 新代码测试失败时不会更新公开发布文件；即使远端发布成功但 CDN 检查失败，线上烟雾测试也会标红并保留截图，供定位。
- Chromium 主回归用 `npm run test:browser`；桌面、竖屏触控、升级三选一、Boss 与死亡重开完整逻辑在真正打包的 `release/web` 上运行。
- 构建 QA 截图附件：`laya-browser-qa`；线上截图附件：`laya-live-public-screenshots`，默认保留 7 天，以减少 Actions 存储用量。
- 使用的是 **公开仓库标准 GitHub-hosted Runner**，免费执行时间；Actions artifact 存储仍受 GitHub 账户的免费额度约束。

## 为什么新工作流自己负责 Pages 部署？

GitHub 官方规则：由工作流的 `GITHUB_TOKEN` 推送产生的 `push` 不会再启动新的工作流（也不会自行触发另一次 Pages build）。因此 `free-laya-preview.yml` 在测试通过后，**同一流水线**里执行 `upload-pages-artifact` → `deploy-pages` → Live Chromium 验收。

原仓库 `.github/workflows/pages.yml` 仍可处理管理员直接提交的静态文件或手动重部署；不会被本流程的自动机器人提交意外二次触发。

## 正式私有库旧 CI 注意事项

`BaiMaGod/xiang-ai-kai-pao` 的 `laya-v0.2-tech-validation` 目前原有 `.github/workflows/laya-v0.2-validation.yml` 仍监听 push。它运行在 **私有仓库**，可能继续遭遇 Actions 计费限制和失败。请在私有仓库 [Actions](https://github.com/BaiMaGod/xiang-ai-kai-pao/actions) 找到 `LayaAir gameplay validation` → 右上角 `...` → **Disable workflow**，或者将原工作流触发器改为仅 `workflow_dispatch`，以免重复运行付费 CI。这不影响新的公开仓库免费构建；不要禁用整个公开预览库的 Actions。

## 故障排查

| 现象 | 检查 |
| --- | --- |
| 前置检查成功，其余三个 job 全部 skipped | 缺少 `PREVIEW_SOURCE_READ_TOKEN`；尚未读取源码，也未部署新版本 |
| Private checkout 返回 Repository not found / 404 | PAT 过期、未选择正确私有仓库或 Contents 没有 Read |
| `LayaAir CLI` 安装/构建失败 | 查构建日志；确保 CLI 版本 3.4.0，不能把代码测试失败当成成功 |
| 规则测试或 Chromium 测试红色 | 生成的版本不能进入公开预览，检查 `laya-browser-qa` 附件 |
| 推送到预览库时 403 | 检查预览仓库 Workflow permissions 是否允许读写；不需要扩大私有源 PAT 权限 |
| `deploy-pages` 报权限或环境保护错误 | 检查公开仓库 Pages source 为 GitHub Actions，环境 `github-pages` 设置 |
| Pages 部署完成却显示旧版 | 看 `laya-v0.2/version.txt` 的 `source_commit`、JS/CSS SHA 缓存版本，检查线上 Chromium 报告 |
| 浏览器脚本提示 `quality.css` 缺失 | 私有源码最新编译资产不全；会自动阻止发布 |

## 安全规则

本项目公开仓库仅保留可运行编译产物；不在公开仓库的 artifact、代码和 job log 里打印 PAT、私有源码、`.env`、`.git` 等。私有源码构建仅允许管理员手动触发，不在公开仓库的 push 或定时事件中使用私有仓库凭据，不向匿名 PR 注入任何私有源码密钥。公开静态站点部署由预览仓库 main push 自动触发。

由管理员直接控制的 `main` workflow 文件、依赖包和 Node scripts 仍需审查：**公开构建 Runner 的日志对所有人可见，私有源码在构建进程中存在，不应误认为公开 Runner 等同于完全隔离的私有基础设施。**
