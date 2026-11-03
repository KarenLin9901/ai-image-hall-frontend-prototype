# 咣当 AI影像｜前后端开发交接入口

当前改版：`clear-flow-20261103`。用户已授权同步当前代码到原仓库；GitHub Pages沿用`main`分支的`/docs`。提交、构建、部署与线上核验状态以[本轮发布回执](release-clear-flow-20261103.md)为准，不以版本查询参数或历史回执代替验证。

**面向B端介绍产品与应用方案，体验演示用于说明参与能力。** 首页首屏分为“做一场影像互动”和“定制一部影片”，直接进入对应方案列表。主导航为首页／应用方案／体验演示／合作需求，主线为“选需求 → 看方案 → 整理需求”。AI影像馆保留模板／自定义演示，高定由团队承接创作、按需求报价。

- [11 清晰主线与统一体验](11-clear-flow-20261103.md)：当前结构优先，含双业务入口、只读方案、兼容与来源返回。
- [01 页面与路由](01-product-and-routes.md)：现行路由、参数白名单、返回目标及九主题兼容契约。
- [本轮发布回执](release-clear-flow-20261103.md)：实际提交、构建与验证状态。
- [10 完整场景策划与手机图解](10-mobile-scene-plans-20261101.md)：八案策划依据；旧页内“选一选”与配置交互由11覆盖。
- [08 B端产品结构](08-b2b-product-structure-20261101.md)：产品分工基线；[07 两种玩法](07-product-experience-local-20261030.md)：体验功能基线。
- [02 前端交互与状态](02-frontend-behavior.md) · [03 后端接入边界](03-backend-integration.md) · [业务与接口缺口](../DEVELOPMENT_DECISIONS.md)：延续适用的功能边界，旧页面结构以01和11覆盖。
- [04 验收与问题](04-acceptance-and-issues.md) · [05 素材与交付](05-assets-and-delivery.md) · [06 深浅色与UI](06-color-themes.md)：历史依据及未完成服务；当前默认明亮风格与布局以源码和11为准。

## 当前开发重点

1. 首屏两业务直接进入对应方案列表，产品说明作为补充入口。
2. 八方案以大图、玩法与成果说明为主，完整策划按需展开；不再提供方案配置，不推广旧九主题和空样品页。
3. 实际设定只在模板／自定义体验中心完成，三步骤始终可见，照片选填、生成未开放。
4. 返回保留合法来源：列表合作回列表，方案合作回方案详情，体验合作回原模式与内存步骤。查询编码不得提前解码。
5. 工程自检、线上部署、真实服务、真机和用户验收分别记录；未执行项目不计为通过。

## 本地启动与验证

```sh
npm ci
npm run dev -- --host 127.0.0.1 --port 4198 --strictPort
npm run typecheck
npm run test:content
```

服务启动后，本地入口为`http://127.0.0.1:4198/ai-image-hall-frontend-prototype/?version=clear-flow-20261103#/`，当前截图与走查资料位于`outputs/clear-flow-20261103/`。`npm run build`生成`docs/`；执行与发布结果见本轮回执。

旧版完整浏览器套件尚未整体迁移，不将其历史通过记录沿用为本轮结果。真实上传、生成、领取、账户、支付、订单、正式样品和咨询接收仍未接入；需求当前只在本机整理和复制。

## 历史参考

[scene-plans发布回执](release-scene-plans-20261101.md)、[scene-plans验证回执](verification-scene-plans-20261101.md)、[09 官网式交互](09-apple-story-and-interactions-20261101.md)、[官网式回执](verification-apple-story-20261101.md)、[B端回执](verification-b2b-20261101.md)和[10月30日回执](verification-local-20261030.md)仅记录各自版本，当前页面结构与来源规则以01、11和源码为准。
