# 05｜素材、源码与交付说明

版本：`20261029-light-dark`。在线原型与仓库使用同一生产构建。发布与真实业务验收是两件事；当前未接入的能力与已知问题继续按交接入口和验收清单执行。

## 源码地图

| 文件/目录 | 职责 |
|---|---|
| `main.tsx` | 当前入口与样式加载顺序 |
| `app/Guangdang.tsx` | 路由、主题设置、照片解码/授权、内存草稿、需求摘要、返回/复制、播放器与空态 |
| `app/MobileEditorial.tsx` | 精简首页、双产品图文、八份完整方案 |
| `app/mobile-editorial-data.ts` | 简介、三组优势、八份方案的选项/含义/流程/成果/双方价值 |
| `app/guangdang-data.ts` | 业务/分类、九主题、配置选项、作品与案例类型及本地空数据 |
| `app/guangdang-guards.ts` | URL恢复及发布+明确授权的展示守卫 |
| `app/mobile-editorial.css` | 图文页面及精简首页 |
| `app/ui-polish.css` / `app/color-themes.css` | 后加载的共用UI修订及亮色配色 |
| `public/images/` | 可被网页加载的本地图片；不要改文件名却不更新引用 |
| `tests/` | 当前可运行回归；不读取本机历史outputs作为测试依赖 |
| `docs/` | Vite生产产物，GitHub Pages发布目录，不直接手改 |
| `handoff/` | 当前开发交接文档与精选证据 |

其余旧样式为当前配置、作品、表单和动效提供兼容层，不应整目录删除。历史`app/AiImageHall.tsx`、旧玻璃/光场组件不由当前入口加载，不是新增研发需求。

## 图片与概念图

[ASSET_SOURCES_20261029.json](../ASSET_SOURCES_20261029.json)保留六张新概念图的提示词、处理方式和SHA256，网页文件在`public/images/editorial-20261029/`。800与1920宽WebP共12张；原生生成尺寸1536×1024，1920版为等比重采样，不代表原生1920细节。

| 图名 | 用途 |
|---|---|
| home-hero | 早一阶段首页概念，精简首页当前不引用；保留来源与文件 |
| brand-story | 影像馆、品牌代言场景 |
| bespoke-story | 高定创作与资料转影片概念 |
| retirement-story | 退休岗位记忆与新生活 |
| enterprise-story | 企业共同历程的概念表达 |
| city-story | 城市街区记忆概念，不是东门史料或事实重现证据 |

现有活动、校园、人物、家庭等场景参考继续引用`public/images/guangdang-v2/`；历史来源记录保留在根目录`ASSET_SOURCES_20261017.json`、`ASSET_SOURCES_20261018.json`、`ASSET_SOURCES_20261021.json`。素材与生成图不表示真实客户案例；不可据此创建假播放器或补造历史年代、客户身份及服务承诺。

生成原图与全量本机日志保留在本机`outputs/`（Git忽略），本仓库不依赖它们才能启动；仓库内保留网页素材、完整提示词/校验值及精选截图。开发若需要重新裁切、放大或重新生成，应先核对来源表和对应页面，不把原图状态写成已授权客户媒体。

## 生产构建与发布

```sh
npm ci
npm run typecheck
npm run build
npm exec vite preview -- --host 127.0.0.1 --port 4193 --strictPort
```

基础路径固定为`/ai-image-hall-frontend-prototype/`。`scripts/postbuild.mjs`生成404与保留路径的静态入口；仅重写根相对图片/媒体路径，保留已带基础路径的分享封面绝对地址，避免重复前缀。GitHub Pages沿用`main`分支`/docs`；推送本身不代表Pages已成功，需核对构建状态、在线HTML引用的JS/CSS及实际页面。

线上地址：[20261029开发交接版](https://karenlin9901.github.io/ai-image-hall-frontend-prototype/?version=20261029-light-dark#/)；版本参数用于识别分享，页面不携带照片、Blob URL、文字草稿或联系方式。

## 精选证据与验证

- [390宽精简首页](evidence/home-390.png)
- [R01分类筛选串用](evidence/r01-samples-filter.png)
- [R02影像馆待开放目的页](evidence/r02-hall-pending.png)
- [R02高定待开放目的页](evidence/r02-bespoke-pending.png)

本次生产构建复测与交接链接核验记录见[深浅色版验证回执](verification-light-dark-20261029.md)。已知缺陷不因打包、推送或上线预览而自动关闭；真机软键盘、iOS/Android具体WebView与真实接口链路仍需单独验收。
