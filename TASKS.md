# 实时任务清单（按优先级）

说明：下面的条目将随着我逐步完成而更新。当前先把“CPL（centipawn loss）”计划的步骤列出并完成第一步（草案/文档）。其他计划会按优先级顺序依次展开。

## 总览任务

- [x] 盘点并列出当前分析相关文件
- [x] 生成 `ANALYSIS_CURRENT_IMPLEMENTATION.md`
- [x] 生成 `ANALYSIS_ISSUES.md`
- [x] 生成各计划文档（Centipawn / Variation / Opening / Multi-Engine / Export）
- [x] 实现：Centipawn Loss（CPL）
- [x] 实现：Variation Explorer（变例树）
- [x] 实现：Opening Explorer（开局探索器）
- [x] 实现：Multi-Engine 比较
- [x] 实现：导出/分享 功能
- [x] 实现：错题复盘与战术主题分析 (Retry Mistakes & Tactical Themes)


## 细化：实现 Centipawn Loss 的步骤

1. [x] 草拟实现计划文档（`PLAN_centipawn_loss.md`）
2. [x] 在 `src/engine/stockfish.ts` 中标准化并提取 `cp` 值为数值字段（添加 `centipawn` 到 move 结构）
3. [x] 修改 `parseMove()` / `parsePosition()` 使返回 move 包含 `centipawn` 字段
4. [x] 在 `parsePGN()` 中确保 `moves` 数组包含每手的 `centipawn`
5. [x] 在 `src/components/menu/analysis/summary/playersAccuracy.tsx` 中新增 `computeAverageCPL(moves)` 并显示结果
6. [x] 测试与验证：用示例 PGN 验证显示正确并记录 edge cases（mate、缺失 info）
7. [x] 更新 README / 文档说明数据字段变更


(CPL 实现与验证已完成。)


## 细化：实现 Variation Explorer 的步骤

1. [x] 在 Moves 面板加入变例入口与列表视图（Variation Explorer）
2. [x] 支持多变例保存与载入（以快照方式管理）
3. [x] 扩展图表：主线 + 变例并列显示
4. [x] 扩展候选走子列表以并列显示
5. [x] 持久化变例（localStorage 或导出）


## 细化：实现 Opening Explorer 的步骤

1. [x] 接入 Lichess Opening Explorer API
2. [x] 在 Moves 面板显示统计与常见走法
3. [x] 增加数据库来源与筛选选项（如不同速度/评级）
