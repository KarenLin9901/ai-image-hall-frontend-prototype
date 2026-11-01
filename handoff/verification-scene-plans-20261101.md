# 本地验证回执｜scene-plans-20261101

> 以下保留当轮本地验证的时间截面；后续发布状态见[发布记录](release-scene-plans-20261101.md)。精选证据已纳入仓库，完整构建与原始日志仅保留本机。

日期：2026-11-01。分支`codex/product-experience-local-20261030`，沿用基线`6c8a606`。**本地实现与下列已执行工程验证完成，用户验收待确认。** 本轮未提交、推送或发布；真实服务、真机与最终用户验收不在本机检查结论内。

## 本次交付

- 活动、退休、毕业、人物、家庭、企业、城市7案完整化：各自有明确玩法／创作方式、选项意义、个人所得、B端价值与图文对应。
- 手机默认以关系图、短句、可选项和双端成果为主。完整策划中仍保留目标、人群、亮点、固定与个人部分、四段结构、五步流程；范围和准备资料按需展开。
- 品牌页同步减量，成长选择对应职业／家庭／协作配图，保留深圳场景2–3项约束与可展开的个性表达。
- 七案每案3组单选仅解释方案，品牌图解也不创建生成任务；两款产品业务区别、旧主题ID及返回来源约定保留。

完整使用说明见[10](10-mobile-scene-plans-20261101.md)。七案的生成参数、正式交付规格、金额及真实渠道不能从页面选择直接推定。

## 实际执行结果

| 项目 | 结果 | 范围及证据 |
|---|---|---|
| TypeScript strict | 通过 | [日志](evidence/scene-plans-20261101/logs/typecheck.log) |
| 内容／纯逻辑守卫 | 16/16通过 | [日志](evidence/scene-plans-20261101/logs/content.log) |
| 隔离构建与postbuild | 通过 | 最终目录`build-final`；[构建日志](evidence/scene-plans-20261101/logs/build.log) |
| 页面布局矩阵 | 112/112通过 | 14路由×320/390/430/1440宽×深浅色；路由匹配、无横向溢出、首屏无破图；[原始记录](evidence/scene-plans-20261101/evidence/layout-matrix.json) |
| 七案选择反馈 | 21组、63选项通过 | 每组单选，各选项含义与结果不同；[原始记录](evidence/scene-plans-20261101/evidence/option-checks.json) |
| 页内导航与完整内容展开 | 32锚点通过；7案390浅色全展开无溢出 | [原始记录](evidence/scene-plans-20261101/evidence/anchors-folds.json) |
| 品牌完整展开 | 8/8组合无溢出 | 四宽×深浅色，全部details打开；[修复后记录](evidence/scene-plans-20261101/evidence/brand-fold-fixed.json) |
| 品牌选择与个性表达 | 通过 | 3成长主题对应3图；场景不足提示、最多3项禁用；个性表达可收展；[记录](evidence/scene-plans-20261101/evidence/brand-interactions.json) |
| 方案咨询往返 | 8案通过 | 来源方案保持；[记录](evidence/scene-plans-20261101/evidence/consult-roundtrips.json) |
| 方案库往返 | 8案通过 | 返回保留产品筛选及4张卡片；[记录](evidence/scene-plans-20261101/evidence/gallery-roundtrips.json) |
| 体验支线来源 | 通过 | 活动方案→通用体验→切换自定义／模板→返回活动方案；[记录](evidence/scene-plans-20261101/evidence/experience-branch.json) |
| 最窄屏完整展开与键盘 | 8案通过 | 320px深色，用Enter展开全部details，无横向溢出；[记录](evidence/scene-plans-20261101/evidence/narrow-expanded-keyboard.json) |
| 中文标题断行补充检查 | 28/28通过 | 成果标题按完整短句换行，7案×四宽复测无溢出，390px阅读量不变；[记录](evidence/scene-plans-20261101/evidence/title-wrap-checks.json) |

14条矩阵路由为首页、AI影像馆、高定、方案库、模板体验、合作咨询及8个分类方案页。布局检查仅说明列出的浏览器视口状态，不表示所有长页图片均逐张播放检查，也不等于实体手机、微信WebView、软键盘或读屏全覆盖。

浏览器检查使用CUA完成。未执行完整`npm test`或Playwright浏览器套件；相关脚本仅做`node --check`语法检查，不能把语法检查写成整套浏览器测试通过。

本轮检查发现品牌个性表达展开后，隐藏legend的样式优先级造成横向溢出；已修复，并在最终四宽×深浅色、全部展开状态重新验证通过。早期中间构建的观测不能代替最终受测构建。

## 手机默认阅读量变化

比较同一手机口径、默认折叠状态：七案页面高度约减少28%–35%，品牌页约减少49%；默认可见文字品牌约减少60%，其余约减少16%–22%。完整内容仍保留在展开区，因此这不是删除策划内容的比例，也不是阅读效率或用户满意度指标。

| 页面 | 高度px（旧→新） | 高度减少 | 默认可见字数（旧→新） | 字数减少 |
|---|---:|---:|---:|---:|
| 品牌成长 | 6941 → 3575 | 48.5% | 1675 → 676 | 59.6% |
| 活动高光 | 5594 → 3636 | 35.0% | 1005 → 781 | 22.3% |
| 退休纪念 | 5085 → 3625 | 28.7% | 977 → 801 | 18.0% |
| 毕业纪念 | 5172 → 3719 | 28.1% | 993 → 820 | 17.4% |
| 人物故事 | 5085 → 3569 | 29.8% | 984 → 782 | 20.5% |
| 家庭记忆 | 5085 → 3619 | 28.8% | 983 → 808 | 17.8% |
| 企业故事 | 5085 → 3619 | 28.8% | 1001 → 809 | 19.2% |
| 城市记忆 | 5085 → 3619 | 28.8% | 987 → 824 | 16.5% |

来源：[旧默认指标](evidence/scene-plans-20261101/before/mobile-metrics.json)与[最终默认指标](evidence/scene-plans-20261101/evidence/mobile-default-metrics-final.json)。最终八页默认均无横向溢出、无展开的details。

## 本地预览与证据收尾

本地地址：http://127.0.0.1:4197/ai-image-hall-frontend-prototype/?version=scene-plans-20261101#/works

受测构建：`outputs/scene-plans-20261101/build-final`。当前4197本地服务PID记录为`16238`，仅供本机预览；PID与查询参数本身均不是资源一致性证明。

- [活动方案手机图解截图](evidence/scene-plans-20261101/evidence/event-diagram-light-390.png)
- [品牌手机图解截图](evidence/scene-plans-20261101/evidence/brand-diagram-dark-390.png)
- [人物方案手机成果截图](evidence/scene-plans-20261101/evidence/person-outcome-dark-390.png)
- [家庭方案桌面选择截图](evidence/scene-plans-20261101/evidence/family-choice-dark-1440.png)
- 最终HTML、JS、CSS及页面引用图片共20条HTTP请求均为200，响应与构建文件逐字节一致；23个图片位置均有替代文字。[资源核对](evidence/scene-plans-20261101/evidence/http-assets.json)。这证明本地资源可用，不等于真实成片已交付。
- 本轮浏览器捕获的warning/error为0。[控制台记录](evidence/scene-plans-20261101/evidence/console.json)。

证据收尾完成。用户审阅、真机测试与真实服务联调继续单列。112项矩阵后仅增加成果标题的完整短句换行，已另做28项对应宽度回归并刷新最终构建资源核对。

## 保留的业务与接口缺口

- 每项目确认参与对象、开放选项、素材与品牌授权、规模、时间、交付时长／画幅／版本及报价；不承诺活动传播或转化成绩。
- 高定继续“按需求报价”，由团队完成资料核实、方案确认、制作与审片。退休主题仍为规划，不用旧职场模板冒充。
- 真实素材上传、审核、生成状态、取消／重试、成果领取／下载分享和正式咨询接收仍待接入。当前咨询摘要尚未发送，照片与选择仅在本机处理。
- 真机、具体移动容器和最终用户验收未完成；本轮本地自检不代替这些事项。
