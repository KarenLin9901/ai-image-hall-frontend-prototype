# 咣当 AI影像｜前后端开发交接入口

发布版本：`scene-plans-20261101`。用户已授权发布到原仓库，GitHub Pages沿用`main`分支的`/docs`；[线上入口](https://karenlin9901.github.io/ai-image-hall-frontend-prototype/?version=scene-plans-20261101#/)，提交与线上验证见[发布回执](release-scene-plans-20261101.md)。本地实现与本轮已执行工程验证完成，用户验收待确认；旧回执不转为本轮结果。

**面向B端介绍产品与应用方案，附带C端能力体验。** 首页、应用方案、能力体验、合作咨询四入口继续保留；AI影像馆组织主题互动，高定由团队承接委托创作。

- [10 完整场景策划与手机图解](10-mobile-scene-plans-20261101.md)：本轮优先，含八案玩法、双方所得、配图、渐进展开和数据边界。
- [本轮验证回执](verification-scene-plans-20261101.md)：已记录本轮实际工程检查；资源与console证据收尾见回执，未填项目不视作通过。
- [09 官网式UI与使用交互](09-apple-story-and-interactions-20261101.md)：保留来源、返回与原图规则；默认阅读密度由10覆盖。
- [08 B端产品结构](08-b2b-product-structure-20261101.md)：产品定义、客户与页面职责基线。
- [01 页面与路由](01-product-and-routes.md) · [02 前端交互与状态](02-frontend-behavior.md)
- [03 后端接入边界](03-backend-integration.md) · [业务与接口缺口](../DEVELOPMENT_DECISIONS.md)
- [04 验收与问题](04-acceptance-and-issues.md) · [05 素材与交付](05-assets-and-delivery.md) · [06 深浅色与UI](06-color-themes.md)
- [07 双产品与两种玩法](07-product-experience-local-20261030.md)：体验功能基线，旧页面结构由后续版本覆盖。
- [上一轮官网式回执](verification-apple-story-20261101.md) · [更早B端回执](verification-b2b-20261101.md) · [10月30日回执](verification-local-20261030.md)：仅作历史证据。

## 开发顺序

1. 先读10，按八案分别理解玩法、用户所得与B端用途；不能只替换通用文案的场景名称。
2. 保留默认图解与短句，将完整亮点、结构、流程、范围和准备资料放在可展开内容中。
3. 方案选择仅说明`meaning/result`，不绑定生成接口，也不自动写入体验草稿或咨询参数。
4. 沿用09的合法来源、返回、显式段落与恢复规则，以及旧九主题、两玩法和照片保护。
5. 对最终构建重新执行类型、内容、交互、移动布局与兼容检查；真实服务、真机、用户验收单列。

## 本地启动与验证

```sh
npm ci
npm run dev -- --host 127.0.0.1 --port 5173 --strictPort
npm run typecheck
npm run test:content
```

本轮本地预览：`http://127.0.0.1:4197/ai-image-hall-frontend-prototype/?version=scene-plans-20261101#/works`；输出目录`outputs/scene-plans-20261101/`。受测构建为`build-final`；本地资源一致性和console已记录在本地回执，公开部署另见发布回执，不能用版本参数替代资源检查。

本次生产构建使用`npm run build`生成`docs/`；`npm test`会再重建并执行多套浏览器／内容测试，实际执行记录以回执为准。真实上传、生成、领取、账户、支付、订单、正式样品和咨询接收未接入；高定按需求报价。旧回执和历史段继续保留，完成状态由本轮回执记录。
