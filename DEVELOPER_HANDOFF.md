# 咣当 AI影像｜现行开发交接入口

开发基线：`20261029-light-dark`，当前精简首页原型。**完整入口：[handoff/README.md](handoff/README.md)**。

- 前端先读[页面/路由](handoff/01-product-and-routes.md)和[交互/状态](handoff/02-frontend-behavior.md)，按现有源码还原页面，优先处理已知P1。
- 后端先读[接入与待补契约](handoff/03-backend-integration.md)，明确真实服务范围、数据与参数映射；不能把本地ID、中文选项或Object URL当成服务协议。
- 联调前按[验收与问题](handoff/04-acceptance-and-issues.md)建立用例；代码检查、在线预览与真实业务验收分开。
- 素材、构建及本版验证见[交付说明](handoff/05-assets-and-delivery.md)和[验证回执](handoff/verification-light-dark-20261029.md)。

当前入口为`main.tsx → app/Guangdang.tsx`；新展示在`MobileEditorial.tsx`，方案内容在`mobile-editorial-data.ts`，稳定业务与九主题在`guangdang-data.ts`，守卫在`guangdang-guards.ts`。`mobile-editorial.css`之后加载`ui-polish.css`、`color-themes.css`，原有配置/作品/表单样式仍需保留。

前端可开始实现；后端可开始契约设计。真实接口尚未提供，当前不能直接完成生成或正式咨询联调。业务与接口缺口以[DEVELOPMENT_DECISIONS.md](DEVELOPMENT_DECISIONS.md)为准；已知2P1/4P2以[UX_REVIEW_20261029.md](UX_REVIEW_20261029.md)为准，仍未修复，不写成已通过。

```sh
npm ci
npm run dev -- --host 127.0.0.1 --port 5173 --strictPort
npm run typecheck
npm test
```

`npm test`会生产构建并重写`docs/`，然后跑原六套浏览器、内容/守卫和新增主题检查。当前测试使用macOS Chrome路径，其他系统需按脚本调整。原型通过GitHub Pages的`main:/docs`提供在线预览；`docs/`为产物，研发修改源码后构建，不手改压缩JS/CSS。

照片选填且只在本机Object URL预览；有照片需同意、替换重新同意、坏图拒绝、异步取消和URL回收保持。仅当前一个主题草稿及按上下文分隔的合作需求保存在内存；刷新清空，不写持久存储。摘要尚未发送。样片和真实案例为空，不用配图冒充成片。

原型中真实生成、账户、支付、订单和正式咨询均未接入。退休纪念没有对应配置，高定为企业/机构委托，不是个人自助生成。旧默认主题和标准数字详情继续兼容，完整映射见01。

旧交接在[handoff-history/DEVELOPER_HANDOFF_before_20261027.md](handoff-history/DEVELOPER_HANDOFF_before_20261027.md)。旧管理员、旧记忆生成或玻璃原型规则不自动成为本期需求。当前文档和现行源码为开发依据；历史说明只供追溯。

深浅色状态、切换保留规则、已处理的4项UI问题及152项主题检查见[06外观与UI](handoff/06-color-themes.md)。
