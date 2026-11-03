# 01｜产品结构与路由

当前改版：`clear-flow-20261103`。本页按当前源码记录页面与路由；提交、构建、部署及线上核验状态以[本轮发布回执](release-clear-flow-20261103.md)为准。新结构见[11 清晰主线与统一体验](11-clear-flow-20261103.md)。[10](10-mobile-scene-plans-20261101.md)保留八案策划依据，但其页内交互选项与旧页面结构已被本轮覆盖；[08](08-b2b-product-structure-20261101.md)保留B端产品定义，[07](07-product-experience-local-20261030.md)提供两玩法功能基线。

## 产品分工与主要路径

| 产品 | 使用关系 | 当前前端范围 | 待接入能力 |
|---|---|---|---|
| AI影像馆 | 品牌、企业、学校等项目方发起主题互动，个人参与 | 方案展示，模板／自定义设定演示，本机照片预览、确认与复制 | 真实上传、生成、领取、费用及任务服务 |
| 高定AI影像 | 委托方提出需求，由团队沟通后策划、制作与交付 | 创作方向、产品说明、按需报价说明、需求整理与复制 | 正式咨询承接、具体项目报价及制作服务 |

网站以B端介绍与合作为主，主线是“选需求 → 看方案 → 整理需求”，体验演示是可选支线。高定不进入自助生成。当前前端不模拟影片生成或需求受理成功；正式作品须同时满足已发布和明确授权，方案配图不能充当已交付案例。

所有业务路由位于URL的`#`之后。主导航为**首页／应用方案／体验演示／合作需求**。`/hall`、`/bespoke`产品说明归应用方案高亮；`/mine`保留直链，不进入主导航。

## 当前页面与返回

| 路由 | 页面职责与主要动作 | 返回规则 |
|---|---|---|
| `#/` | 首屏“做一场影像互动”直达`/works?product=hall`；“定制一部影片”直达`/works?product=bespoke` | 一级入口，无额外返回首页行 |
| `#/works` | 八份方案总览，按活动互动／影片定制筛选 | 一级入口，无额外返回首页行 |
| `#/works?product=hall` | 活动互动方案；可进入通用体验、产品说明或整理需求 | 列表直接合作使用`source=solutions` |
| `#/works?product=bespoke` | 影片定制方案；可查看产品说明或整理需求 | 列表直接合作使用`source=solutions` |
| `#/category/:id?from=solutions&filter=hall\|bespoke\|all` | 大图、简明玩法、成果与完整策划展开区；整理同类需求，AI馆方案另有通用体验入口 | “返回方案列表”，保留合法产品筛选 |
| `#/category/:id` | 同一方案详情，兼容旧产品页来源 | 返回对应产品页的应用方案段，并恢复已有阅读位置 |
| `#/hall`、`#/bespoke` | 补充产品说明、少量代表方案、项目资料及合作入口；高定保留按需报价说明 | 分别“返回活动方案”／“返回定制方案”，到对应筛选列表 |
| `#/experience-center?mode=template` | 模板身份、场景与行为固定；选内容 → 照片（选填） → 查看设定 | 有合法`returnTo`时返回来源；无来源时“查看活动方案”到`/works?product=hall` |
| `#/experience-center?mode=custom` | 自定义身份、场景与行为；后三步规则与模板一致，两模式草稿独立 | 模式切换保留合法来源，最终页合作后可回原模式及内存步骤 |
| `#/cooperate` | 方向与需求描述在前；单位、时间、规模、联系人及联系方式按需展开；整理并复制摘要 | 全局入口无额外返回首页行；不会发送需求 |
| `#/cooperate`＋来源参数 | 自动带入合法业务／方案方向；最终结果仍为本机需求摘要 | 返回列表、方案详情、体验演示或兼容来源，详见下表 |

方案列表的滚动位置按完整route保存在根组件内存中，刷新清空。当前没有正式作品，正常入口不展示空的正式作品选项卡；兼容`/works?view=published`仍显示明确的待上架状态及方案入口。来源参数只存浏览上下文，不存联系方式、照片或用户输入。

## 方案展示与产品说明

八份方案均为只读介绍，不再提供“选一选”或独立配置操作。默认展示大图、简明玩法、适用对象和成果价值；详细亮点、内容方向、原策划选项的意义、实施步骤、范围及准备资料保留在“查看完整策划”中。实际设定统一在体验中心完成，通用演示不冒充某活动的已实现配置。

| 产品 | 分类 | 方案 |
|---|---|---|
| AI影像馆 | `brand` | 我为品牌代言／与深圳 共成长（工行方案示例） |
| AI影像馆 | `event` | 我的活动高光时刻 |
| AI影像馆 | `team` | 退休员工纪念；专属体验设置尚未开放 |
| AI影像馆 | `campus` | 我的毕业纪念影像 |
| 高定AI影像 | `person` | 一位人物的职业故事 |
| 高定AI影像 | `family` | 一段跨代的家庭记忆 |
| 高定AI影像 | `enterprise` | 企业周年记忆影片 |
| 高定AI影像 | `city` | 一条街区的城市记忆；概念图不充当史料 |

产品说明页仅选取少量代表方案，全部内容由方案列表承担。常驻章节导航已移除，旧section查询仍可定位：`introduction`为介绍、`applications`为方案、`benefits`为体验能力／高定样品或其兼容锚点、`pricing`为高定报价、`experience`为结尾合作段。带`restore=1`的返回优先读取已保存位置；没有记录时按段落定位。没有正式样品时不推广空样品页，高定旧`benefits`锚点仍保留在创作方向附近。

## 体验与合作的来源参数

参数属于前端浏览上下文，不是后端提交协议。业务字段只接纳`hall`／`bespoke`；跨业务分类和主题不能混入当前业务。兼容的`source`包括`product`、`application`、`theme`、`samples`、`chooser`，新增`solutions`与`experience`；未知或无效来源按现有规则降级。

| 来源示例 | 上下文 | 返回 |
|---|---|---|
| `/cooperate?product=hall&source=solutions` | 活动方案列表，没有指定单案 | `/works?product=hall`，“返回活动方案” |
| `/cooperate?product=bespoke&source=solutions` | 定制方案列表，没有指定单案 | `/works?product=bespoke`，“返回定制方案” |
| `/cooperate?product=hall&source=application&direction=brand&origin=solutions&filter=hall` | 指定方案，摘要可保留参考方案名称 | `/category/brand?from=solutions&filter=hall`，“返回方案详情” |
| `/cooperate?product=hall&source=experience&experienceReturn=…` | 体验最终页；可携带与体验来源相符的`direction` | 经规范化的原体验地址，“返回体验演示” |
| `/cooperate?product=hall&source=product&section=benefits` | 旧产品说明段落 | 对应产品／section及已保存位置 |
| `/cooperate?product=hall&source=theme&direction=brand&theme=brand-1` | 兼容旧主题及当前内存已选文字 | 对应旧主题配置 |
| `/cooperate?product=bespoke&source=samples&direction=enterprise` | 兼容样片来源 | 对应业务样片页及分类 |
| `/cooperate?product=hall&source=chooser` | 兼容旧选择器链接，当前主流程不再展示重复选择卡 | `/cooperate`，“返回合作需求” |

`source=solutions`必须有显式合法`product`才启用。`source=experience`只用于`product=hall`且`experienceReturn`合法的请求：路径必须为`/experience-center`，模式仅`template`／`custom`，嵌套`returnTo`再次通过白名单，再由`experiencePathFor`重建。`experienceReturn`用`URLSearchParams`编码，不拼入照片、配置文字或联系方式。体验来源方案与`direction`不一致时，不引用该方案。原模式、步骤、照片及草稿保存在根内存中，返回恢复这些内存状态；URL本身不保存它们，刷新后清空。

体验`returnTo`仅保留以下目标：

- `/hall`及合法产品section；恢复参数由规范化函数生成。
- `/works`，仅保留`product=hall`筛选。
- `/category/brand|event|team|campus`，仅保留`from=solutions`及`filter=hall`；全部方案来源无需额外筛选参数。

模式切换不继承上一次浏览的方案；全局体验入口无来源时到活动方案列表。兼容`source=brand`返回品牌方案详情。详情来源的体验按钮显示“返回方案详情”，列表来源显示“返回活动方案”或“返回方案列表”。体验过程只保留返回／查看活动方案入口，“整理合作需求”在最终设定页出现。

`safeRoute`仅解码路径；查询串会校验畸形编码，但保持原编码，避免嵌套地址被提前解码。体验路由按第一个`?`拆分，保证“方案 → 体验 → 合作需求 → 体验 → 方案”的筛选上下文不被截断。

## 兼容入口

`/samples/hall`、`/samples/bespoke`及分类参数仍可访问，无正式视频时显示“正式样片待上架”。`/samples/hall?preview=themes`不再展开旧九主题库；样片页与方案页均不推广旧配置入口。旧`/experience/:category/:themeId`、`/theme/:category/:index`继续兼容，原照片授权、换主题确认与配置复制逻辑保留。

## 九主题稳定ID与旧链接

ID和所属分类不可因排序、文案或换图而重新生成。每个配置由三组单选组成，每组当前有三项；具体选项全文以[`configurationOptions`](../app/guangdang-data.ts)为准。

| categoryId | themeId | 当前标题 | 三组选项标题 | 旧数字详情 |
|---|---|---|---|---|
| brand | `shenzhen-belike` | 我的深圳生活 belike | 工作地点／白天的我／夜晚的我 | 无对应数字详情 |
| brand | `brand-0` | 来了就是深圳人 | 城市片场／你的身份／影像风格 | `#/theme/brand/0` |
| brand | `brand-1` | 我为品牌代言 | 代言场景／主角身份／表达风格 | `#/theme/brand/1` |
| event | `event-0` | 我的活动高光时刻 | 活动类型／我的高光／活动氛围 | `#/theme/event/0` |
| event | `event-1` | 专属节日影像 | 节日主题／祝福对象／影像风格 | `#/theme/event/1` |
| team | `team-0` | 我的职场成长影像 | 成长节点／职业领域／人物气质 | `#/theme/team/0` |
| team | `team-1` | 我们团队的专属记忆 | 我参与的时刻／我心中的团队／影像风格 | `#/theme/team/1` |
| campus | `campus-0` | 我的毕业纪念影像 | 毕业阶段／青春场景／纪念气质 | `#/theme/campus/0` |
| campus | `campus-1` | 我们的校园记忆 | 我的校园故事／纪念主题／影像风格 | `#/theme/campus/1` |

旧分类配置`#/experience/:category`的默认值：brand→`shenzhen-belike`，event→`event-0`，team→`team-0`，campus→`campus-0`。注意：**brand默认配置、brand代表方案与`theme/brand/0`分别是三个不同入口**，不可混用。

精确旧别名`#/scenes/hall`、`#/scenes/bespoke`由`safeRoute`归一到对应产品。旧`#/theme/:category/:index`继续渲染原主题详情，不用新的代表方案覆盖其原题名；只接受已有主题对应的标准非负整数索引。未知主题、跨分类主题、多余路径段、非标准索引（如`01`/`1.0`）或畸形编码显示可返回首页的恢复页。

## 实现入口与验证边界

| 文件 | 职责 |
|---|---|
| [`app/Guangdang.tsx`](../app/Guangdang.tsx) | 主导航、路由、来源校验、内存、需求摘要、兼容页面与页头返回 |
| [`app/MobileEditorial.tsx`](../app/MobileEditorial.tsx) | 首屏双业务选择、产品说明与方案组件分发 |
| [`app/SolutionGallery.tsx`](../app/SolutionGallery.tsx) | 业务筛选、方案列表、滚动恢复及列表合作入口 |
| [`app/BrandScenario.tsx`](../app/BrandScenario.tsx)、[`app/ScenarioPlan.tsx`](../app/ScenarioPlan.tsx) | 八方案只读详情与完整策划展开区 |
| [`app/ExperienceCenter.tsx`](../app/ExperienceCenter.tsx) | 模板／自定义三步演示、照片授权、复制、最终页合作 |
| [`app/experience-navigation.ts`](../app/experience-navigation.ts) | 模式入口、来源白名单和体验返回规范化 |
| [`app/guangdang-guards.ts`](../app/guangdang-guards.ts) | 路径解码、查询编码校验、已发布且明确授权的展示条件 |
| [`app/mobile-editorial-data.ts`](../app/mobile-editorial-data.ts)、[`app/scenario-plans.ts`](../app/scenario-plans.ts)及分类数据 | 方案事实、详细策划、配图与旧配置关联 |
| [`app/soft-ui.css`](../app/soft-ui.css)、[`app/soft-scenarios.css`](../app/soft-scenarios.css) | 当前明亮圆润风格、移动布局与方案大图；实际加载顺序见[`main.tsx`](../main.tsx) |

验证范围、构建产物、部署与用户验收分别记录于[本轮发布回执](release-clear-flow-20261103.md)，旧回执不作为本轮通过证据。真实上传、生成、领取、账户、支付和正式咨询接收尚未接入；业务缺口见[`DEVELOPMENT_DECISIONS.md`](../DEVELOPMENT_DECISIONS.md)。未被当前入口加载的历史组件不构成本版实现要求。
