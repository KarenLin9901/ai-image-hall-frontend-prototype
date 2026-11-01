# 本地验证回执｜apple-story-20261101

> 以下保留当轮本地验证的时间截面；后续发布状态见[发布记录](release-scene-plans-20261101.md)。精选证据已纳入仓库，完整构建与原始日志仅保留本机。

日期：2026-11-01。分支 `codex/product-experience-local-20261030`，原基线 `6c8a606`，本轮工作仍在本地未提交的工作区。未 commit、push 或发布；`docs/` 未被本轮隔离构建改写。用户审阅待确认。

## 本次实际完成

- 将工行参考图提炼为网页中的完整活动策划：目标与人群、四亮点、四段故事、成长/场景/个性选择、五步参与、双端成果与价值、合作准备。原图不再作为网站正文或方案封面，也没有查看原图链接。
- 配置图解演示单选成长主题、2–3个场景、服装/风格/个人心声及对应摘要；它不创建生成任务，也不修改体验中心草稿。
- 采用用户确认的苹果官网式图文叙事、留白与少量卡片，保留原色系、深浅模式；移动首页文字列覆盖旧60%宽度，恢复可读排版。
- I01–I06返回/来源/价格锚点/引用一致性/产品主动作已修正。额外修正无来源直达咨询返回产品顶部。
- 两种体验模式、旧九主题及原服务边界保持；空正式作品Tab从正常方案入口移除，旧直达链接仍展示真实空态。

产品说明和使用路径：[09](09-apple-story-and-interactions-20261101.md)。视觉排版参考：[Apple官网](https://www.apple.com/iphone/)，未采用它的商业内容。

## 实际执行的验证

| 检查 | 本轮结果 | 范围 |
|---|---|---|
| TypeScript strict | 通过 | 当前入口及依赖 |
| 内容与纯逻辑测试 | 12/12 | 九主题ID、八方案、来源白名单、模式切换、方案和服务边界 |
| 浏览器交互断言 | 38/38 | 场景选择约束、双端摘要、返回与来源、价格定位、咨询改方向、两玩法草稿、照片授权、复制及刷新清空 |
| 页面布局矩阵 | 128/128 | 16页面×320/390/430/1440宽×深浅色；无水平溢出、已观测图片失败、正文/表单出界及海报引用 |
| 兼容与恢复页面 | 19/19 | 9个稳定主题体验、8个数字详情、未知及畸形地址 |
| 浏览器console | 0条warn/error | 本轮受测Tab记录 |
| 本地资源一致性 | 通过 | HTML、JS、CSS、favicon逐字节对比受测构建；82张图片HEAD均200 |
| 截图人工检查 | 已执行 | 手机首页深浅色、产品首屏、品牌方案与选项、桌面品牌页 |

浏览器动作使用CUA执行；未执行旧Playwright完整套件或`npm test`，不把脚本语法检查计为浏览器通过。矩阵检查的是浏览器视口，不等于iPhone/Android真机、微信WebView、软键盘或读屏全覆盖。照片测试使用项目Logo作为无个人信息的本机文件夹具。

早期测试发现首页文案被旧60%宽度规则压窄，已修复并重新构建；最终受测为`build-final-v2`。交互探针遇到路由渲染/平滑滚动尚未完成时，使用目标就绪及暂停动效后重新核实，没有将中间状态算成通过。

## 证据与本地服务

- [浏览器断言原始记录](evidence/apple-story-20261101/browser-regression.json)
- [服务与资源核实](evidence/apple-story-20261101/service-verification.json)
- [内容测试日志](evidence/apple-story-20261101/logs/content.txt)
- [类型检查日志](evidence/apple-story-20261101/logs/typecheck.txt)
- [最终构建日志](evidence/apple-story-20261101/logs/build-v2.txt)
- [深色手机首页](evidence/apple-story-20261101/evidence/home-dark-390.png) · [亮色手机首页](evidence/apple-story-20261101/evidence/home-light-390.png)
- [品牌方案首屏](evidence/apple-story-20261101/evidence/campaign-light-390.png) · [配置图解](evidence/apple-story-20261101/evidence/campaign-options-light-390.png) · [成果价值](evidence/apple-story-20261101/evidence/campaign-value-light-390.png)

本地地址：http://127.0.0.1:4197/ai-image-hall-frontend-prototype/?version=apple-story-20261101#/

静态服务：`outputs/apple-story-20261101/site-final/ai-image-hall-frontend-prototype` 指向 `build-final-v2`。服务只监听127.0.0.1；此链接供当前电脑预览，手机实机和外部访问需另行配置。

| 资源 | SHA256 |
|---|---|
| `index.html` | `7d0884538615c8a831bfcbf58677608aac81bd4b0cdcb8c2c8fe1ca506c18c01` |
| `favicon.png` | `afd059de0861cb2928e295aefaa29d4dd721eed1eb580593aa0a5c60fac64efc` |
| `assets/index-BmhCTYWJ.js` | `4738f9991e910774ee93db949c8ea6dd476817fa68338cf498e5fa51989a3739` |
| `assets/index-BqnR3kkL.css` | `9cc912607d79a0e9aaf60690bf42c9ac43857fabe20a97f9f4ae4ec2400ea5a4` |

## 单独保留的缺口

- 业务：每项目的品牌材料授权、允许的用户选项、交付时长/画幅/修改版本、规模、时间及报价；工行内容目前仍是方案示例。
- 接口：真实素材上传、审核、生成任务状态/取消/重试、结果领取/下载分享，以及正式咨询接收渠道。
- 验收：实体手机、微信等具体容器、真实接口联调，以及用户对策划内容和UI的最终确认。

高定统一显示“按需求报价”；本机需求摘要尚未发送。配置图解、测试通过和本地预览均不代表上述服务已接通。
