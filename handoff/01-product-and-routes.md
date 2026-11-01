# 01｜产品结构与路由

2026-11-01发布版本：`scene-plans-20261101`。用户已授权发布到原仓库，提交与线上验证见[发布回执](release-scene-plans-20261101.md)。本页是现行页面与路由契约；八案内容和手机图解阅读以[10](10-mobile-scene-plans-20261101.md)优先，[09](09-apple-story-and-interactions-20261101.md)保留来源与返回规则，[08](08-b2b-product-structure-20261101.md)保留B端产品定义，[07](07-product-experience-local-20261030.md)保留体验功能基线。

## 产品分工

| 产品 | 面向的使用关系 | 本地展示/交互范围 | 待接入能力 |
|---|---|---|---|
| AI影像馆 | 品牌、企业、学校等组织方采购/发起主题互动，个人参与；网站主要帮助项目方了解能力 | 模板与自定义两玩法、素材本机预览、确认/复制，产品及场景方案展示 | 真实上传、生成、领取、费用及任务服务 |
| 高定AI影像 | 委托方整理需求，由团队沟通后组织策划、制作与交付；面向用途与项目范围介绍 | 产品/样品状态、价格说明、创作方向、咨询需求整理/复制 | 具体项目报价、正式联系方式、需求受理/跟进及制作服务 |

网站主要向B端解释产品、应用与合作方式，C端能力体验是可选演示分支。影像馆目标仍是在H5内完成实际体验，高定采用团队承接创作；当前前端停在本机设定与复制，不模拟真实影片或成功受理。两产品正式样品/真实作品/真实案例仍需已发布且明确授权的素材，工行方案示例不计入真实案例集合。

## 页面树与主要动作

所有业务路由位于URL的`#`之后；主导航统一为**首页、应用方案、能力体验、合作咨询**。产品内容归首页、方案索引/详情归应用方案、体验配置归能力体验、需求表单归合作咨询。`#/mine`保留直链，但退出主导航。

| 路由 | 页面职责 | 当前下一步／返回 |
|---|---|---|
| `#/` | B端产品定义＋两个产品图文入口，保持精简 | 了解AI影像馆或高定AI影像 |
| `#/hall` | 产品定义、客户/参与关系、应用方案、两种玩法及成果 | 查看方案或项目咨询；能力体验为可选演示入口 |
| `#/bespoke` | 产品介绍、样品、价格与范围、合作流程、咨询 | 首屏咨询定制→高定创作咨询；没有自助生成 |
| `#/bespoke?section=pricing` | 定位高定价格段，当前按需求报价、无统一固定金额 | 进入询价需求；返回时保留价格阅读上下文 |
| `#/experience-center?mode=template` | 整套身份/场景/行为固定的前端设定预览 | 选设定→素材→确认/复制；全局入口返回影像馆，具体来源按合法returnTo返回 |
| `#/experience-center?mode=custom` | 选择身份/场景，选择或编辑行为 | 素材→确认/复制，可返回修改；两模式内存草稿分开 |
| `#/category/:id` | 八份应用方案：项目目标、参与选项及意义、成果与B/C价值 | 咨询同类项目；次级能力演示/样品证据，旧配置保留兼容 |
| `#/samples/hall` | 样片状态与原有配置预览辅助库 | 可进入新体验；无真实视频时显示制作中 |
| `#/samples/hall?preview=themes` | 展开原有九主题全库，可筛选 | 原有主题配置；全库和分类各自记忆 |
| `#/samples/:business?category=:id` | 有效分类样品与相应旧配置 | 按业务＋分类隔离位置/展开/筛选；退休不展示职场配置，并提供全库入口 |
| `#/samples/bespoke` | 高定样品状态，无自助配置库 | 查看创作方向或进入咨询 |
| `#/experience/:category/:themeId` | 原有九主题三组单选配置 | 素材→确认/复制；页面返回合法来源方案/样片页，独立直链回全库 |
| `#/cooperate`及来源参数 | 合作需求／高定创作咨询，摘要与复制 | 不发送，按合法来源返回产品、方案、样片或原主题配置 |
| `#/works` | 八份应用方案索引，按两产品区分；真实作品为二级证据 | 卡片进入对应 `#/category/:id`；不把参考图称为已落地案例 |
| `#/mine` | 旧访客/账户页兼容，退出主导航 | 返回产品了解；账户、作品/生成记录未接入 |

`#/works?product=hall|bespoke`控制产品筛选。当前没有正式作品，正常入口不展示空的正式作品选项卡；历史`view=published`直达仍显示明确空态及返回方案入口。索引卡片进入 `#/category/:id?from=solutions&filter=hall|bespoke|all`；咨询使用 `origin=solutions` 及合法filter保留来源，返回方案后可回同筛选索引。参数只表示浏览上下文，不含用户输入。方案索引滚动按完整route保存在根内存，刷新清空。

## 产品锚点与完整方案

AI页内导航为产品定义`overview`、应用方案`scenes`、体验能力`benefits`、项目合作`try`；高定为产品介绍`overview`、创作与样品`benefits`、价格说明`pricing`、咨询定制`try`。保留旧锚点和section查询的兼容语义，具体节点为 `${business}-${id}`；本轮定位/高亮自检见最新回执。10月30日“开始体验优先”的主动作已被覆盖。

`?section=introduction`定位介绍；`applications`定位场景；`experience`定位体验或咨询；新增高定`pricing`定位价格。显式段落跳转优先定位目标；仅带`restore=1`的返回动作读取已保存产品位置，无记录再按段落定位。AI产品首屏“查看应用方案”与页内导航均到本页`scenes`，完整方案库仍从全局进入。样品与体验独立，高定主动作不再叫“立即体验”。

每份完整方案包含适用对象、选项及意义、过程、成果、双方价值、用途及准备资料。默认使用三节点示意、短句和选择反馈，完整策划与交付明细按需展开。七案各有3组单选，用于说明选择的含义与成果；品牌保持独立规则：成长主题单选、深圳场景2–3项、个性设置随选择更新摘要。此图解仅本地说明，不生成、不上传，也不改写体验中心草稿。八份应用方案用于B端理解项目；两玩法体验用于通用能力演示；原九主题为兼容配置，三者层级不同。工行例的多场景等选项不因此成为新体验或旧配置的已实现字段。

| 产品 | 分类 | 代表方案 | 保留的原有配置预览 |
|---|---|---|---|
| AI馆 | `brand` | 我为品牌代言／与深圳 共成长（工行方案示例） | `brand-1`作为旧通用配置保留，不冒充工行完整活动 |
| AI馆 | `event` | 我的活动高光时刻 | `event-0` |
| AI馆 | `team` | 退休员工纪念 | 无；退休专属体验仍未开放；页内方案选项仅说明，不以`team-0`冒充 |
| AI馆 | `campus` | 我的毕业纪念影像 | `campus-0` |
| 高定 | `person` | 一位人物的职业故事 | 无自助设置 |
| 高定 | `family` | 一段跨代的家庭记忆 | 无自助设置 |
| 高定 | `enterprise` | 企业周年记忆影片 | 无自助设置 |
| 高定 | `city` | 一条街区的城市记忆 | 无自助设置；概念图不充当史料 |

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

## 合作来源参数

参数均属于当前前端路由上下文，不是后端提交协议。`source`取`product`、`application`、`theme`、`samples`、`chooser`；其他值降级为合法的产品来源。跨产品分类/主题不直接混入当前业务。

| 来源示例 | 当前信息 | 页面返回 |
|---|---|---|
| `#/cooperate?product=hall&source=product&section=introduction` | 影像馆及当前产品来源 | 对应产品/section及保存的滚动位置 |
| `#/cooperate?product=hall&source=application&direction=brand` | 品牌方向及“我为品牌代言／与深圳 共成长”方案示例来源 | `#/category/brand`；摘要包含参考方案而不声称已落地 |
| `#/cooperate?product=hall&source=theme&direction=brand&theme=brand-1` | 主题、分类及当前内存中已选文字 | 对应主题设置 |
| `#/cooperate?product=bespoke&source=samples&direction=enterprise` | 高定样片来源及企业方向 | 对应业务样片页和category |
| `#/cooperate?product=hall&source=chooser` | 从全局合作选择器选择产品 | 返回`#/cooperate`选择器 |
| `#/cooperate` | 选择AI影像馆或高定，再进入相应需求整理 | 首页 |

体验来源由当前URL的合法`returnTo`决定，不继承上一次浏览的方案；全局能力体验不带来源。`experiencePathFor`集中生成两玩法地址并保留合法来源，白名单、历史`source=brand`兼容和咨询/返回规则见[09第6节](09-apple-story-and-interactions-20261101.md#6-本轮交互检查发现与修复目标)。样品页带有效同产品分类时返回分类方案，其他情况回产品顶部。

## 开发代码入口

| 文件 | 当前职责 |
|---|---|
| [`main.tsx`](../main.tsx) | 加载Guangdang与样式；本轮新增样式的实际覆盖顺序以入口为准 |
| [`app/Guangdang.tsx`](../app/Guangdang.tsx) | 路由、内存、照片、守卫、样片、方案索引入口、需求、弹窗和全局导航 |
| [`app/MobileEditorial.tsx`](../app/MobileEditorial.tsx) | 精简首页、两产品页，以及品牌/七案组件分发 |
| [`app/mobile-editorial-data.ts`](../app/mobile-editorial-data.ts) | 产品与方案标题、基础说明、品牌数据及旧主题关联 |
| [`app/BrandScenario.tsx`](../app/BrandScenario.tsx) | 品牌手机图解、独立选择约束、主题换图与折叠详情 |
| [`app/ScenarioPlan.tsx`](../app/ScenarioPlan.tsx) | 其余七案图解、3组单选反馈、双端成果与按需展开 |
| [`app/scenario-plans.ts`](../app/scenario-plans.ts)及两类数据文件 | 汇总活动/退休/毕业与人物/家庭/企业/城市的具体策划、选项意义及配图 |
| [`app/experience-navigation.ts`](../app/experience-navigation.ts) | 体验入口、returnTo白名单及两玩法切换来源 |
| [`app/SolutionGallery.tsx`](../app/SolutionGallery.tsx) | 八方案/正式作品分区、产品筛选与索引滚动恢复 |
| [`app/guangdang-data.ts`](../app/guangdang-data.ts) | 业务、分类、九主题、旧alias数据、展示媒体结构 |
| [`app/guangdang-guards.ts`](../app/guangdang-guards.ts) | URL解码恢复、已发布且明确授权的展示条件 |

现行场景内容与手机阅读以[10](10-mobile-scene-plans-20261101.md)为准，来源和返回规则继续按[09](09-apple-story-and-interactions-20261101.md)；[07](07-product-experience-local-20261030.md)提供两玩法的技术基线。[R01–R10审查](../UX_REVIEW_20261029.md)为历史问题台账，本轮自检状态见[最新回执](verification-scene-plans-20261101.md)，未记录项不视作通过；业务与接口缺口见[B01–B13](../DEVELOPMENT_DECISIONS.md)。旧 `AiImageHall.tsx` 及未被当前入口加载的历史组件，不构成本版实现要求。
