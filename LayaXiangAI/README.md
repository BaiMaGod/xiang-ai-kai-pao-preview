# 《向AI开炮》LayaAir V0.2 技术验证

这是与 Three.js 正式原型隔离的 LayaAir 3.4 技术验证分支。

当前验证目标：

- 官方 LayaAir CLI 3.4.0 可在 GitHub Actions 无 IDE 构建 Web。
- 使用 `CompilerSettings.json -> mainScript`，从 `src/Entry.ts` 纯代码启动，不依赖场景拖拽。
- 键盘 / 触屏拖动移动。
- 自动索敌 + 射钉枪弹丸。
- 敌人追踪、碰撞、HP、击杀、经验与自动强化。
- 2:00 AI 正式分析（`?fast=1` 测试模式缩短到 1.2 秒）。
- AI 分析后强制生成盾卫机器人并产生 BLOCK。
- 人类应急协议三选一：穿甲钉 / 反弹弹头 / EMP 钉。
- CI 使用 Chromium 自动验证移动、自动射击、AI 反制与应急协议。

## 本地运行

安装 LayaAir CLI 3.4.0 后：

```bash
layaair build web -p LayaXiangAI
layaair run -p LayaXiangAI
```

用于快速验证 AI 反制，可在 Web URL 后追加：

```
?fast=1
```

> 本分支是技术验证，不替换当前 Three.js 主线。迁移结论以可玩性、自动化可测性、微信小游戏适配成本和 AI 持续开发效率为准。
