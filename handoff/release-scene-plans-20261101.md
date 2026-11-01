# 发布记录｜scene-plans-20261101

用户于2026年11月1日明确要求“发布到git”。本记录接续此前仅本地审阅的版本；历史验证文档中的“未发布”描述其当时状态，不再作为当前授权边界。

- 仓库：[KarenLin9901/ai-image-hall-frontend-prototype](https://github.com/KarenLin9901/ai-image-hall-frontend-prototype)。
- 页面：[手机图解版](https://karenlin9901.github.io/ai-image-hall-frontend-prototype/?version=scene-plans-20261101#/)。
- 发布方式：既有GitHub Pages，`main`分支的`/docs`；不改变域名或托管设置。
- **发布状态：源码与生产产物已推送，GitHub Pages部署成功，公开页面与资源验证通过。** 类型检查、16项内容测试、正式构建通过。
- 源码／静态产物发布提交：[4eabe9c](https://github.com/KarenLin9901/ai-image-hall-frontend-prototype/commit/4eabe9c84a1776e3b1134dfddc9ebbab565d0032)。[Pages部署任务](https://github.com/KarenLin9901/ai-image-hall-frontend-prototype/actions/runs/41320496071)结论为`success`，Pages build为`built`，对应同一提交。
- 本记录为部署后的验证补充，后续文档提交不改变本次`docs/`产物；固定版本标签为`prototype-20261101-scene-plans`。
- 正式HTML、JS、CSS与上一轮受测构建逐字节一致，见[构建核对](evidence/release-scene-plans-20261101/tested-build-match.json)。原始参考海报保存在本机忽略目录，不纳入源码或公开静态资源。

## 交付范围

1. B端产品介绍和四个主入口： 首页、应用方案、能力体验、合作咨询。
2. AI影像馆两种体验玩法；高定产品、样品状态、按需求报价和咨询。
3. 八份具体场景策划；手机图解、选项反馈、对应图片与按需展开。
4. 源码、生产构建、前后端说明、业务与接口缺口、可在仓库访问的精选验证证据。

先读[开发交接入口](README.md)与[10 手机图解与完整策划](10-mobile-scene-plans-20261101.md)。本地回归范围见[验证回执](verification-scene-plans-20261101.md)，包括112项布局、63个选项、32个锚点和咨询／方案库往返。未执行完整`npm test`浏览器套件，不将语法检查或历史通过数作为本次全套结果。

## 线上核验

- HTML、JS、CSS及页面引用图片20条公开HTTP请求均为200，逐字节匹配本地`docs/`。[公开资源记录](evidence/release-scene-plans-20261101/public-assets.json)。
- 390px手机视口访问八案，标题、选择反馈及布局正常；首次加载读取时部分图片尚在下载，随后复验八页首图均已加载且无横向溢出。[页面记录](evidence/release-scene-plans-20261101/public-browser-checks.json)、[图片复验](evidence/release-scene-plans-20261101/public-image-checks.json)。
- 方案库8项、高定筛选4项；城市方案进入咨询带来源并可返回；高定显示“按需求报价”；模板切换自定义出现行为编辑区；首页深浅色切换正常。
- 浏览器捕获warning/error为0。[控制台记录](evidence/release-scene-plans-20261101/public-console.json)。
- 公开手机首页：[深色](evidence/release-scene-plans-20261101/public-home-dark-390.png)、[亮色](evidence/release-scene-plans-20261101/public-home-light-390.png)。

这是部署后关键路径检查，不是重新声称运行全套自动化测试。线上资源与已回归构建相同，真实服务与真机验收仍遵循下方边界。

## 能力与验收边界

发布的是可浏览、可操作的前端原型。真实上传、生成、成果领取、账户、支付与正式咨询接收未接入；高定无已确认固定价格，退休专属体验仍未开放。真机、具体WebView及用户最终验收仍独立待完成。Git推送、Pages部署成功与真实业务服务接入是不同状态。
