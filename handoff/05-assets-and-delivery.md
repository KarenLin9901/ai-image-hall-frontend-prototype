# 05｜素材、源码与交付说明

2026-11-01发布版本：`scene-plans-20261101`。用户已授权发布到原仓库，提交与线上验证见[发布回执](release-scene-plans-20261101.md)。八案内容和手机阅读以[10](10-mobile-scene-plans-20261101.md)优先，[09](09-apple-story-and-interactions-20261101.md)保留来源和返回规则。本地验证见[本轮回执](verification-scene-plans-20261101.md)，历史回执不代替本版结果。

## 源码地图

| 文件/目录 | 职责 |
|---|---|
| `main.tsx` | 当前入口与样式加载顺序 |
| `app/Guangdang.tsx` | 路由、主题设置、照片解码/授权、内存草稿、需求摘要、返回/复制、播放器与空态 |
| `app/MobileEditorial.tsx` | B端首页、差异化双产品、样品/价格，以及品牌/七案组件分发 |
| `app/BrandScenario.tsx` | 品牌手机图解、独立选择约束、对应换图、内容导航及折叠详情 |
| `app/ScenarioPlan.tsx` | 其余七案图解、3组单选反馈、双端成果与按需展开 |
| `app/scenario-plan-types.ts` / `app/scenario-plans.ts` | 七案说明数据结构与统一入口，不是生成API模型 |
| `app/scenario-hall-plans.ts` / `app/scenario-bespoke-plans.ts` | 七案具体策划、选项意义/结果、范围与配图映射 |
| `app/SolutionGallery.tsx` | 八方案索引、产品筛选、正式作品二级证据与阅读位置 |
| `app/ExperienceCenter.tsx` / `app/experience-center-data.ts` | 两种玩法、前端设定、模式草稿、素材与确认/复制 |
| `app/bespoke-pricing.ts` | 高定价格展示配置，当前按需求报价、无统一固定金额 |
| `app/mobile-editorial-data.ts` | 产品简介/优势、八案基础标题、品牌内容、规划状态与旧主题关联 |
| `app/guangdang-data.ts` | 业务/分类、九主题、配置选项、作品与案例类型及本地空数据 |
| `app/guangdang-guards.ts` | URL恢复及发布+明确授权的展示守卫 |
| `app/mobile-editorial.css` | 图文页面及精简首页 |
| `app/ui-polish.css` / `app/color-themes.css` | 共用UI修订及亮色配色 |
| `app/product-experience.css` / `app/experience-center.css` / `app/consultation-pages.css` | 在color-themes之后加载，提供双产品、新体验和高定咨询基础 |
| `app/b2b-refinement.css` | 上一轮四导航、方案索引/品牌专页和深浅色基础 |
| `app/apple-editorial.css` | 官网式留白、分段图文、少量卡片及配置控件基础 |
| `app/scenario-plans.css` / `app/brand-mobile-story.css` | 依次在apple-editorial后加载的最终方案样式：手机图解、选择反馈、短句层级与渐进展开 |
| `app/experience-navigation.ts` | 体验来源白名单、入口和两玩法切换地址 |
| `public/images/` | 可被网页加载的本地图片；不要改文件名却不更新引用 |
| `tests/` | 内容测试及相关浏览器断言已同步本轮；实际执行结果另记，不读取历史outputs作为运行依赖 |
| `docs/` | Vite生产产物，GitHub Pages发布目录，不直接手改 |
| `handoff/` | 当前开发交接文档与精选证据 |

其余旧样式为当前配置、作品、表单和动效提供兼容层，不应整目录删除。历史`app/AiImageHall.tsx`、旧玻璃/光场组件不由当前入口加载，不是新增研发需求。

## 图片与概念图

[ASSET_SOURCES_20261029.json](../ASSET_SOURCES_20261029.json)保留六张新概念图的提示词、处理方式和SHA256，网页文件在`public/images/editorial-20261029/`。800与1920宽WebP共12张；原生生成尺寸1536×1024，1920版为等比重采样，不代表原生1920细节。

| 图名 | 用途 |
|---|---|
| home-hero | 早一阶段首页概念，精简首页当前不引用；保留来源与文件 |
| brand-story | AI影像馆及通用体验概念；工行专页使用独立深圳场景参考图 |
| bespoke-story | 高定创作与资料转影片概念 |
| retirement-story | 退休岗位记忆与新生活 |
| enterprise-story | 企业共同历程的概念表达 |
| city-story | 城市街区记忆概念，不是东门史料或事实重现证据 |

### 工行方案内容来源与当前网页配图

- 用户原文件：`b2e0abbba0d089c30dfc4a1e3d7d9525.jpg`。
- 保留的源资料副本：`outputs/source-reference/icbc-shenzhen-plan-20261101.jpg`，仅在本机保全，Git忽略。原海报不进入`public/`、生产`docs/`或本次公开仓库，不提供网页原图链接。
- 两文件SHA256一致：`ded0f915e63e46b9956a44c2a188a59f2213e50cb2043d4fa4e6497df495dcc0`，复制未改图像内容。
- 用户已确认用于“我为品牌代言”的**方案示例**，不是已交付客户案例。图中文字、选项、流程和价值提炼为手机可读HTML及本地配置图解；原海报不嵌入网站，不将图中缩略视频或二维码做成伪播放/真实活动入口。
- 当前`editorialPlans.brand.image`为`reference(4)`，对应`public/images/guangdang-v2/brand-1920.webp`独立深圳场景图，标注“场景参考”；方案卡片和专页均不再用原海报。
- 图像不进入 `cases`/`publishedWorks`，不据此新增传播数据或上线声明；正式项目素材与发布仍按B03/B13确认。

现有活动、校园、人物、家庭等场景参考继续引用`public/images/guangdang-v2/`；历史来源记录保留在根目录`ASSET_SOURCES_20261017.json`、`ASSET_SOURCES_20261018.json`、`ASSET_SOURCES_20261021.json`。素材与生成图不表示真实客户案例；不可据此创建假播放器或补造历史年代、客户身份及服务承诺。

生成原图与全量本机日志保留在本机`outputs/`（Git忽略），本仓库不依赖它们才能启动；仓库内保留网页素材、完整提示词/校验值及精选截图。开发若需要重新裁切、放大或重新生成，应先核对来源表和对应页面，不把原图状态写成已授权客户媒体。

## 生产构建与发布边界

用户已授权发布当前`scene-plans-20261101`。GitHub Pages沿用`main`分支的`/docs`，基础路径固定为`/ai-image-hall-frontend-prototype/`。

```sh
npm ci
npm run typecheck
npm run test:content
npm run build
```

`npm run build`由Vite生成`docs/`并执行`postbuild`；不直接手工修改构建文件。`scripts/postbuild.mjs`生成404与保留路径静态入口，仅重写根相对图片/媒体路径，保留已带基础路径的地址，避免重复前缀。发布前核对生成的HTML/JS/CSS与受测构建，再提交源码、交接及生产产物。

本轮本地受测目录为`outputs/scene-plans-20261101/build-final`。选取的验证JSON、日志与截图已归入`handoff/evidence/`，随开发交接一起提交；生成原图、源海报、完整临时输出和本机日志仍保留在忽略目录中。

[线上原型](https://karenlin9901.github.io/ai-image-hall-frontend-prototype/?version=scene-plans-20261101#/)的提交、Pages任务、资源一致性及在线页面检查见[发布回执](release-scene-plans-20261101.md)。推送本身不代表Pages部署成功，查询参数也不能证明受测代码已上线。版本链接不携带照片、Blob URL、文字草稿或联系方式；真实业务服务仍未接入。

## 证据与验证（下列截图为历史）

- [390宽精简首页](evidence/home-390.png)
- [旧版R01分类筛选串用证据](evidence/r01-samples-filter.png)
- [旧版R02影像馆目的页证据](evidence/r02-hall-pending.png)
- [旧版R02高定目的页证据](evidence/r02-bespoke-pending.png)

本轮最终构建与验证见[2026-11-01回执](verification-scene-plans-20261101.md)，未填项目不视作通过；[10月30日回执](verification-local-20261030.md)及[深浅色回执](verification-light-dark-20261029.md)只保留历史结果。已知缺陷不因打包、推送或上线预览而自动关闭；真机软键盘、iOS/Android具体WebView与真实接口链路仍需单独验收。
