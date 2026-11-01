# 咣当 AI影像｜现行开发交接入口

发布版本：`scene-plans-20261101`。**完整入口：[handoff/README.md](handoff/README.md)**。用户已授权发布到原仓库；[线上原型](https://karenlin9901.github.io/ai-image-hall-frontend-prototype/?version=scene-plans-20261101#/)，提交与线上验证见[发布回执](handoff/release-scene-plans-20261101.md)。本地实现与本轮已执行工程验证完成，用户验收待确认；本地结果见[本轮回执](handoff/verification-scene-plans-20261101.md)。

先读[10 完整场景策划与手机图解](handoff/10-mobile-scene-plans-20261101.md)，本轮八案内容、默认图解与折叠阅读以10优先；[09](handoff/09-apple-story-and-interactions-20261101.md)保留来源、返回与原图规则；[08 B端产品结构](handoff/08-b2b-product-structure-20261101.md)保留产品定义基线，再按[01页面/路由](handoff/01-product-and-routes.md)、[02交互/状态](handoff/02-frontend-behavior.md)和[03接入边界](handoff/03-backend-integration.md)开展开发。[07双产品与两种玩法](handoff/07-product-experience-local-20261030.md)保留为体验功能基线；旧导航与C端优先口径由08覆盖，原图展示及返回/锚点约定再由09更新。[10月30日验证回执](handoff/verification-local-20261030.md)是历史证据，不代替本轮检查。

**网站以B端产品介绍和项目合作为主，C端体验用于展示能力。** 主导航为首页、应用方案、能力体验、合作咨询；`#/works`为八份应用方案索引，真实作品降为二级证据；`#/mine`退出主导航并兼容旧URL。方案页解释项目目标、参与选择、成果及B/C价值，带来源进入咨询，体验是可选的能力演示分支。

其余7案统一为完整策划：活动、退休、毕业展示个人参与；人物、家庭、企业、城市展示团队委托创作。每案说明具体选项、用户所得和B端价值；手机默认图解与短句，完整亮点、结构和流程按需展开。三个选择组只更新本地说明，不绑定API或写入体验草稿。

“我为品牌代言”采用工行“与深圳 共成长”方案示例。用户确认它是方案示例，不是已交付案例。原海报仅作内容来源，网页使用HTML、独立深圳配图和可点选的方案配置图解，没有海报或原图链接；图解只更新本地说明，不写入体验草稿。方案中的成长主题、深圳场景、多项个性设置、30秒成果和下载分享属于该方案设计，不等于现有通用体验或旧 brand-1 配置已具备完整生成能力。

体验中心保留模板/自定义直接切换：模板整套设定固定，自定义可选身份/场景并编辑行为。各模式内存草稿独立，照片选填且仅本机预览，确认后可复制，生成禁用。旧九主题稳定ID、URL和换主题保护保留。高定以产品、样品、按需求报价和咨询为主，团队接需求后创作；正式联系方式、受理与回执未提供，表单只整理/复制需求。

入口为 `main.tsx → app/Guangdang.tsx`；体验实现为 `ExperienceCenter.tsx`；产品展示与方案渲染见 `MobileEditorial.tsx` 及本轮新增组件。样式的实际加载顺序以 `main.tsx` 为准，深浅色和体验组件状态不应因视觉改版重置。

```sh
npm ci
npm run dev -- --host 127.0.0.1 --port 5173 --strictPort
npm run typecheck
npm run test:content
```

本地审阅地址：`http://127.0.0.1:4197/ai-image-hall-frontend-prototype/?version=scene-plans-20261101#/works`。本轮输出目录 `outputs/scene-plans-20261101/`，受测构建为`build-final`，本轮工程回归已完成；资源与console证据收尾见本轮回执。结果记录在本轮回执，上一轮[官网式回执](handoff/verification-apple-story-20261101.md)仅作历史依据；相关浏览器断言已同步本轮图解、折叠与导航，实际执行范围另见回执。`npm run build`生成本次发布的`docs/`，`npm test`会重建并执行浏览器套件，不能把语法检查或历史通过数当作本轮整套执行结果。

业务和接口缺口见[B01–B13](DEVELOPMENT_DECISIONS.md)。不得把展示ID、中文项、Object URL或本机复制当作服务协议或成功受理。真实联调、真机与用户验收另行记录。

历史交接见[handoff-history](handoff-history/DEVELOPER_HANDOFF_before_20261027.md)及各文档历史段；旧管理员、旧一屏限制、旧收费流程或旧主导航不自动成为本期要求。
