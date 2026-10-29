# 01｜产品结构与路由

基线：2026-10-29 精简首页版。本文描述当前源码实际行为；未接入能力和已知问题有明确标记。开发总入口见[DEVELOPER_HANDOFF.md](../DEVELOPER_HANDOFF.md)，交互细节见[02｜前端行为](02-frontend-behavior.md)。

## 产品角色与当前能力

| 产品 | 项目发起／采购方 | 个人或观看者角色 | 当前原型可做 | 当前不能做 |
|---|---|---|---|---|
| AI影像馆（`hall`） | 品牌、企业、活动主办方、学校与相关机构 | 以单人主角参与共同主题 | 看产品与四类方案、预览九主题选项、可选本机照片、复制文字配置与合作需求 | 上传照片、生成/领取真实影片、支付/订单 |
| 高定AI影像（`bespoke`） | 企业、机构、文化/文旅或关怀项目委托方 | 提供或确认人物/家庭等故事资料，观看成片 | 看四类完整创作方案、整理并复制合作需求 | 自助选择模板生成、线上委托受理、真实制作或订单服务 |

影像馆以个人AI短视频为核心，其他成果按项目需求约定；高定以专属故事影片及约定版本为核心。页面中的“制作/交付”是产品方案表达，不表示当前浏览器已接通该服务。`cases`、`publishedWorks`当前均为空；九主题是本地配置记录，不能等同于九个已上线生成模板。

## 页面树与当前入口

所有业务路由均在URL的`#`之后；下表省略站点基础路径。主导航固定为“首页、案例分享、商务合作、我”。产品、场景、样片与主题设置均高亮“首页”；不另外增加一级导航。

| 路由 | 页面与主要内容 | 当前主要下一步／返回 |
|---|---|---|
| `#/` | 短品牌开场＋两个整图产品入口；不再展示首页精选场景、成果区和长合作引导 | 整卡进入`#/hall`或`#/bespoke` |
| `#/hall`、`#/bespoke` | 同一连续长页：产品简介、特点优势、场景启发、立即体验 | 四锚点跳读；场景卡进入完整方案；合作入口保留产品来源 |
| `#/category/:id` | 八类中的一个代表产品完整方案 | 查看样片、整理合作需求；仅brand/event/campus另有代表主题设置预览；返回所属产品场景段落 |
| `#/samples/hall` | 模板样片区，目前“样片制作中” | 查看场景、整理合作需求；默认收起的“主题配置预览”可展开 |
| `#/samples/hall?preview=themes` | 展开九主题设置目录，提供全部/分类筛选 | 点击主题直达对应设置；页面返回影像馆的体验段落 |
| `#/samples/bespoke` | 高定样片区，目前“样片制作中”，没有自助设置库 | 查看场景或整理需求；返回高定产品体验段落 |
| `#/samples/:business?category=:id` | 保留所属业务的有效分类标题与样片范围 | 样片→需求来源及返回保留category；主题库分类串用问题见R01 |
| `#/experience/:category/:themeId` | 单人主题三步配置 | 可选本机照片、确认、复制；真实生成按钮禁用；顶部页面返回固定为九主题库，来源问题见R06 |
| `#/cooperate`及其查询参数 | 合作需求表单、只读摘要、复制/手动复制 | 不发送；按来源返回产品/方案/样片/主题设置 |
| `#/works` | “主题灵感”自然比例瀑布流；“真实作品”当前为空 | 筛选、每次加载6项、查看大图；灵感明确非生成成片/客户案例 |
| `#/mine` | 访客及账户未开放状态 | 查看两产品；“我的作品/生成记录”未开放 |

产品内锚点ID为`${business}-overview`、`${business}-benefits`、`${business}-scenes`、`${business}-try`，显示标签依次为“产品简介、特点优势、场景启发、立即体验”。它们是同页定位，不是四个路由。

旧查询参数仍兼容：`?section=introduction`定位简介入口（缺省亦为introduction），`?section=applications`定位场景，`?section=experience`定位体验。已保存的该产品/section滚动位置优先于首次锚点定位。点击四锚点不会把URL改成新的页面。

**当前R02尚未调整**：两产品“立即体验”主按钮都进入样片区，样片未上架；不能把该按钮写成“已进入真实生成”。影像馆现有配置藏在样片页的折叠库中，高定没有该库。

## 八个完整方案及可执行设置

每份方案的内容顺序：对象 → 三组选项与含义 → 三步过程 → 成果 → 参与者/观看者与项目方价值 → 适用用途 → 准备资料 → 行动入口。方案页选项是说明标签，不是可选表单，不能把其静态标签点击当作实际配置。

| 产品 | categoryId／分类 | 代表方案标题 | 当前可预览的代表设置 |
|---|---|---|---|
| 影像馆 | `brand`／品牌推广与主题传播 | 我为品牌代言 | `#/experience/brand/brand-1` |
| 影像馆 | `event`／活动互动与用户体验 | 我的活动高光时刻 | `#/experience/event/event-0` |
| 影像馆 | `team`／企业文化与员工关怀 | 退休员工纪念 | **没有**；`planned=true`，选项为方案示意，体验设置未开放 |
| 影像馆 | `campus`／校园与社群纪念 | 我的毕业纪念影像 | `#/experience/campus/campus-0` |
| 高定 | `person`／人物故事 | 一位人物的职业故事 | 无自助设置；选择是委托方的创作沟通要点 |
| 高定 | `family`／家庭记忆 | 一段跨代的家庭记忆 | 同上 |
| 高定 | `enterprise`／企业故事 | 企业周年记忆影片 | 同上 |
| 高定 | `city`／城市与历史 | 一条街区的城市记忆 | 同上 |

退休纪念和既有`team-0`/`team-1`职场设置不是同一个产品；不能以职场设置链接冒充退休配置。城市概念图不作真实历史证据，AI重现和史料应分别标识。

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

参数均属于当前前端路由上下文，不是后端提交协议。`source`取`product`、`application`、`theme`、`samples`；其他值降级为合法的产品来源。跨产品分类/主题不直接混入当前业务。

| 来源示例 | 当前信息 | 页面返回 |
|---|---|---|
| `#/cooperate?product=hall&source=product&section=introduction` | 影像馆及当前产品来源 | 对应产品/section及保存的滚动位置 |
| `#/cooperate?product=hall&source=application&direction=brand` | 分类方向 | `#/category/brand`；具体方案名未进入摘要，见R05 |
| `#/cooperate?product=hall&source=theme&direction=brand&theme=brand-1` | 主题、分类及当前内存中已选文字 | 对应主题设置 |
| `#/cooperate?product=bespoke&source=samples&direction=enterprise` | 高定样片来源及企业方向 | 对应业务样片页和category |
| `#/cooperate` | 通用需求方向，可选八类或“尚未确定” | 首页 |

## 开发代码入口

| 文件 | 当前职责 |
|---|---|
| [`main.tsx`](../main.tsx) | 加载Guangdang与样式；依次加载`mobile-editorial.css`、`ui-polish.css`、`color-themes.css` |
| [`app/Guangdang.tsx`](../app/Guangdang.tsx) | 路由、内存、照片、守卫、样片、图库、需求、弹窗和导航 |
| [`app/MobileEditorial.tsx`](../app/MobileEditorial.tsx) | 精简首页、两产品页、八方案的图文渲染 |
| [`app/mobile-editorial-data.ts`](../app/mobile-editorial-data.ts) | 新图文简介/优势/方案，复用稳定分类与部分配置选项 |
| [`app/guangdang-data.ts`](../app/guangdang-data.ts) | 业务、分类、九主题、旧alias数据、展示媒体结构 |
| [`app/guangdang-guards.ts`](../app/guangdang-guards.ts) | URL解码恢复、已发布且明确授权的展示条件 |

UI/UX已知问题以[R01–R10审查](../UX_REVIEW_20261029.md)为准，业务与接口缺口以[B01–B11](../DEVELOPMENT_DECISIONS.md)为准。旧`AiImageHall.tsx`及未被当前入口加载的历史组件，不构成本版实现要求。
