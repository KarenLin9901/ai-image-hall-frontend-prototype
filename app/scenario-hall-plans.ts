import { asset, reference } from './guangdang-data';
import type { ScenarioDetail } from './scenario-plan-types';

const editorial = (name: string) => asset(`images/editorial-20261029/${name}-1920.webp`);
const themeImage = (name: string) => asset(`images/themes-v3/${name}-1920.webp`);

// These are proposal illustrations. They neither enable a campaign nor map to generation APIs.
export const hallScenarioPlans: Record<'event' | 'team' | 'campus', ScenarioDetail> = {
  event: {
    id: 'event',
    business: 'hall',
    lead: '参加一场活动，带走属于自己的高光。',
    organizer: '品牌市场部、展会主办方、城市节庆运营团队。',
    participants: '到场客户、展会观众与节庆参与者，个人成为影像主角。',
    setting: '签到后或体验区设置活动入口，也可延续到活动后的纪念领取。',
    objective: '将统一活动主题，转成每位参与者可以留存的个人短片。',
    highlights: [
      { title: '活动有共同主题', description: '标识、主视觉和主题片尾由主办方统一确定。' },
      { title: '高光由个人选择', description: '登场、互动或留念，对应不同的主角行为。' },
      { title: '参与后有纪念', description: '个人短片承接活动记忆，分享由本人决定。' },
    ],
    mechanic: {
      title: '同一场活动，三种高光表达。',
      description: '主办方准备主题模板；用户选择自己的高光与氛围，再用个人照片成为画面主角。',
      fixed: ['活动名称与品牌视觉', '允许出现的场景与行为', '统一片尾和领取说明'],
      personal: ['最想留下的参与时刻', '主角照片与表达氛围', '是否留存或自愿分享'],
    },
    narrative: [
      { title: '我来到这里', description: '用活动名称与场景交代这次相遇。' },
      { title: '这一刻属于我', description: '按所选高光，呈现登场、互动或留念。' },
      { title: '与主题同框', description: '把主角与活动视觉连接起来。' },
      { title: '把记忆带走', description: '以统一活动片尾收束个人纪念。' },
    ],
    choices: [
      {
        id: 'event-kind', title: '活动类型', meaning: '实际项目会固定活动主题；这里用三种场合说明如何适配。',
        options: [
          { id: 'launch', label: '品牌发布会', meaning: '围绕新品亮相或品牌发布，统一舞台与品牌视觉。', result: '在品牌发布空间呈现个人高光，片尾呼应本次发布主题。' },
          { id: 'exhibition', label: '行业展会', meaning: '围绕展区参观与体验，让个人影像关联展会记忆。', result: '以主题展区为背景，留下个人参与这次展会的纪念。' },
          { id: 'celebration', label: '城市庆典', meaning: '使用经确认的城市和节庆元素，表达共同的节日氛围。', result: '让个人主角进入城市庆典主题，保留活动名称与祝福。' },
        ],
      },
      {
        id: 'highlight', title: '我的高光', meaning: '决定主角在画面里做什么，不把主题演绎当作现场录像。',
        options: [
          { id: 'entrance', label: '精彩登场', meaning: '强调走入主题空间、亮相与面向镜头的主角感。', result: '短片以个人登场为高光，适合留下一次醒目的活动亮相。' },
          { id: 'interaction', label: '现场互动', meaning: '强调与活动装置、展品或主题元素发生互动。', result: '短片围绕参与动作展开，呈现“我也加入了这场活动”。' },
          { id: 'souvenir', label: '定格留念', meaning: '弱化动作，把个人形象与本次活动主题共同留下。', result: '以个人纪念画面收束，突出活动名称和这一次相遇。' },
        ],
      },
      {
        id: 'mood', title: '活动氛围', meaning: '影响节奏与视觉气质，不能改变已确认的品牌表达。',
        options: [
          { id: 'energetic', label: '热烈动感', meaning: '让动作、灯光与剪辑节奏更有活力，适合庆祝表达。', result: '个人高光呈现活力感，活动主题以鲜明节奏贯穿。' },
          { id: 'refined', label: '精致时尚', meaning: '让人物和空间更简洁克制，突出形象与主题质感。', result: '个人形象与品牌空间成为视觉重点，形成简洁的纪念短片。' },
          { id: 'warm', label: '温暖纪念', meaning: '放缓表达节奏，让重逢、感谢和留念成为观看重点。', result: '以温暖情绪保留这次参与，适合活动后的个人回看。' },
        ],
      },
    ],
    journey: [
      { title: '进入活动入口', description: '从签到引导或体验区进入，先看主题和成果说明。' },
      { title: '选择我的高光', description: '选择活动开放的行为和氛围，查看设定含义。' },
      { title: '准备个人照片', description: '提交符合要求的单人照片，确认使用范围。' },
      { title: '形成主题短片', description: '接入正式服务后，按活动模板生成并检查成果。' },
      { title: '领取个人纪念', description: '按活动约定领取与保存，公开分享由本人选择。' },
    ],
    outputs: [
      { recipient: '给参与者', title: '一条有自己出场的活动纪念短片', items: ['以本人为主角的高光片段', '活动主题与个人表达同框', '按约定方式领取和留存'], value: '从“参加过”变成“有自己的纪念”，回看时仍能认出是哪次活动。' },
      { recipient: '给主办方', title: '一套可组织现场参与的影像互动方案', items: ['统一主题和开放选项', '活动入口与现场引导设计', '约定规格的个人成果'], value: '在签到、展区或节庆现场安排明确的互动内容，并让活动主题随个人纪念延续。' },
    ],
    scope: {
      core: '以活动主题模板、个人参与路径及个人短片为方案核心。',
      optional: ['活动大屏展示版', '经授权的精选片段合集', '活动后延续领取安排'],
      pending: ['参与规模与现场网络条件', '生成时间、次数及异常处理', '影片规格、领取渠道与报价', '大屏展示和二次使用的授权范围'],
    },
    preparation: ['活动名称、举办场合与参与对象', '可使用的标识、主视觉与场景素材', '体验区位置、引导人员与预计参与规模', '期望成果、领取安排及素材授权说明'],
    visuals: {
      hero: { src: reference(5), alt: '活动舞台灯光与观众剪影', caption: '活动场合参考：共同现场，个人参与。' },
      detail: { src: reference(2), alt: '观众在展览空间体验互动装置', caption: '参与方式参考：从展区互动进入个人表达。' },
      outcome: { src: themeImage('festival'), alt: '节庆主题中，一位主角在狮头旁参与制作的概念画面', caption: '城市庆典方向的画面概念；不是本活动已生成的成片。' },
    },
  },
  team: {
    id: 'team',
    business: 'hall',
    lead: '把岗位岁月，留给每一位值得感谢的人。',
    organizer: '企业人力资源部、工会及退休员工关怀团队。',
    participants: '退休员工本人确认经历与心意，单位协助整理资料。',
    setting: '退休欢送会、集体荣休仪式，或一对一员工纪念交付。',
    objective: '让单位的致谢落到一个人的经历，并连接他的新生活期待。',
    highlights: [
      { title: '每个人有具体经历', description: '岗位、贡献和回忆由本人及单位确认。' },
      { title: '感谢有明确对象', description: '向伙伴致谢、致敬岁月或寄语后来者。' },
      { title: '纪念也面向未来', description: '以旅行、热爱或家庭愿望作结。' },
    ],
    mechanic: {
      title: '单位定主题，本人选记忆与心意。',
      description: '先整理确认过的岗位资料，再由本人选择记忆、致谢与未来方向。退休主题目前仅为方案示意。',
      fixed: ['单位荣休主题与称谓', '已经核实的岗位经历', '纪念片头、致谢与使用规则'],
      personal: ['最想保留的岗位记忆', '最想表达的一份心意', '希望呈现的新生活方向'],
    },
    narrative: [
      { title: '从这个岗位开始', description: '以已确认的入职与岗位信息交代起点。' },
      { title: '把岁月落到细节', description: '用一件工作、一段协作或一次贡献展开。' },
      { title: '说出这份感谢', description: '连接本人心意与单位的致谢表达。' },
      { title: '走向新的生活', description: '以本人选择的未来愿景收束。' },
    ],
    choices: [
      {
        id: 'memory', title: '岗位记忆', meaning: '选一个重点展开，经历和贡献须有本人或单位确认。',
        options: [
          { id: 'beginning', label: '初入岗位', meaning: '从刚进入岗位的经历切入，表达一路走来的变化。', result: '从职业起点串起岗位岁月，让观众理解这段投入从何开始。' },
          { id: 'collaboration', label: '并肩协作', meaning: '用共同完成的工作，表达与伙伴之间的联系。', result: '以一次真实协作为记忆重点，留下人与团队的相互支持。' },
          { id: 'contribution', label: '重要贡献', meaning: '围绕经核实的工作成果，具体说明曾付出的努力。', result: '以一件重要工作呈现个人贡献，避免只罗列称号与年限。' },
        ],
      },
      {
        id: 'gratitude', title: '纪念心意', meaning: '决定这段纪念最想对谁说、想留下怎样的话。',
        options: [
          { id: 'partners', label: '感谢伙伴', meaning: '将表达指向一起工作的人，保留共同经历与谢意。', result: '在岗位回忆之后向伙伴致谢，突出彼此陪伴的意义。' },
          { id: 'years', label: '致敬岁月', meaning: '把情绪放在多年投入与坚持，形成庄重的纪念。', result: '用工作细节回应岗位岁月，让长期付出得到具体表达。' },
          { id: 'successors', label: '寄语后来者', meaning: '选择愿意留下的一条经验或心愿，传递给后来者。', result: '以本人确认的寄语连接下一代员工，让经验继续被看见。' },
        ],
      },
      {
        id: 'future', title: '退休愿景', meaning: '这是面向未来的心愿表达，不将想象画面称为真实经历。',
        options: [
          { id: 'travel', label: '旅行生活', meaning: '以想去的地方或悠闲旅行为愿景，表达新的生活节奏。', result: '以旅行期待结束岗位故事，让纪念带着向前看的心情。' },
          { id: 'passion', label: '兴趣热爱', meaning: '以本人想投入的爱好，呈现工作之外的个人面貌。', result: '从岗位中的专注转向新的热爱，留下继续探索的期待。' },
          { id: 'family', label: '家庭陪伴', meaning: '以陪伴家人的愿望作结，表达对日常生活的珍惜。', result: '以更多陪伴与相聚的期待收束，让影片回到个人生活。' },
        ],
      },
    ],
    journey: [
      { title: '单位准备资料', description: '整理岗位经历、近照、旧照与致谢主题。' },
      { title: '本人确认内容', description: '核对姓名、称谓与事实，确认素材使用范围。' },
      { title: '选择纪念表达', description: '选择岗位记忆、心意与退休愿景，补充必要说明。' },
      { title: '制作并确认纪念', description: '按项目确认的制作方式形成影像，再核对人物与文字。' },
      { title: '在约定场合交付', description: '供本人留存；如需仪式播放，另行确认公开范围。' },
    ],
    outputs: [
      { recipient: '给退休员工', title: '一条讲述自己岗位岁月的纪念短片', items: ['经确认的个人岗位记忆', '自己的致谢或寄语表达', '连接新生活的愿景结尾'], value: '能在影片里找到自己的具体经历，让这份纪念不止是一句统一祝福。' },
      { recipient: '给企业与工会', title: '一套有个人内容的荣休纪念方案', items: ['统一荣休主题与资料要求', '逐人确认的纪念内容', '按约定使用的纪念影片'], value: '为荣休仪式提供具体的致谢内容，让员工关怀落实到本人可留存的成果。' },
    ],
    scope: {
      core: '以个人岗位纪念短片为核心；退休主题配置尚未开放。',
      optional: ['荣休仪式播放版本', '单位致谢或同事寄语段落', '经授权的集体纪念编排'],
      pending: ['退休主题是否纳入本期及实现方式', '本人、单位的事实确认与审片责任', '资料数量、影片规格、周期与报价', '本人留存和单位播放的使用边界'],
    },
    preparation: ['经确认的姓名、岗位、任职经历与称谓', '可用近照、旧照片及具体工作故事', '本人愿意表达的感谢与新生活心愿', '荣休时间、播放对象及素材授权范围'],
    visuals: {
      hero: { src: editorial('retirement-story'), alt: '一位年长工匠在熟悉的工作台前回望的概念画面', caption: '退休纪念概念：从熟悉的岗位，走向新的生活。' },
      detail: { src: asset('images/guangdang-v2/craft-1920.webp'), alt: '双手塑造陶土的工作细节', caption: '岗位记忆参考：以一件具体工作表达长期投入。' },
      outcome: { src: reference(6), alt: '团队成员将手叠在一起表达支持', caption: '致谢关系参考：个人纪念连接并肩工作的伙伴；非成片。' },
    },
  },
  campus: {
    id: 'campus',
    business: 'hall',
    lead: '同一个毕业季，每个人留下一段自己的青春。',
    organizer: '学校、院系、教育机构与结业社群运营方。',
    participants: '毕业生或结业成员，以本人为主角选择纪念表达。',
    setting: '毕业典礼前后、校园纪念专区，或结业活动的线上入口。',
    objective: '在共同的届别主题下，保留个人最想记住的场景与心情。',
    highlights: [
      { title: '共同的届别标识', description: '学校、届别和纪念主题形成统一表达。' },
      { title: '自己的青春场景', description: '礼堂、草坪或走廊，选择记忆发生的地方。' },
      { title: '能带走的个人纪念', description: '本人出现在主题短片中，留下独立的毕业表达。' },
    ],
    mechanic: {
      title: '学校定共同主题，个人选青春表达。',
      description: '使用经确认的校园与届别视觉，结合个人照片、场景偏好和纪念气质形成专属设定。',
      fixed: ['学校或社群名称与届别', '允许使用的校园场景', '统一纪念片头与结尾'],
      personal: ['最想留下的青春空间', '影片的情绪与纪念气质', '本人形象和个人表达'],
    },
    narrative: [
      { title: '我们从这里出发', description: '用学校与届别信息交代共同记忆。' },
      { title: '我记得的地方', description: '在所选校园场景中呈现个人主角。' },
      { title: '这一段青春', description: '按所选气质表达热血、怀念或期待。' },
      { title: '带着记忆向前', description: '以统一毕业主题留下个人纪念。' },
    ],
    choices: [
      {
        id: 'stage', title: '毕业阶段', meaning: '决定人物与纪念语境；正式项目按实际参与对象开放。',
        options: [
          { id: 'university', label: '大学毕业', meaning: '围绕大学生活与人生新阶段，组织成年毕业生的纪念。', result: '以学校与届别串联个人画面，表达走向新生活的毕业心情。' },
          { id: 'high-school', label: '高中毕业', meaning: '围绕同窗与成长表达纪念，参与规则需考虑未成年人。', result: '以校园成长为主线留下毕业纪念，素材与公开使用另行确认。' },
          { id: 'community', label: '社群结业', meaning: '把共同学习或训练的完成，转成结业成员的个人纪念。', result: '以课程或社群主题替代学校届别，留下这段共同学习的记忆。' },
        ],
      },
      {
        id: 'place', title: '青春场景', meaning: '选择个人画面的主要空间，使用本项目确认的场景素材。',
        options: [
          { id: 'hall', label: '毕业礼堂', meaning: '突出完成学业或课程的仪式感，让个人与毕业主题同框。', result: '个人主角进入礼堂主题画面，留下正式而鲜明的毕业纪念。' },
          { id: 'lawn', label: '校园草坪', meaning: '用开放自然的空间表达青春感，强调轻松与对未来的期待。', result: '个人画面以草坪与校园环境展开，形成轻松的毕业表达。' },
          { id: 'corridor', label: '教室走廊', meaning: '从日常经过的学习空间切入，让纪念贴近熟悉的生活。', result: '以教室与走廊承接个人记忆，突出普通日常也值得留念。' },
        ],
      },
      {
        id: 'tone', title: '纪念气质', meaning: '影响影片的节奏和情绪，不改变学校与届别事实。',
        options: [
          { id: 'spirited', label: '青春热血', meaning: '强调启程与向前，让纪念更有行动感和未来期待。', result: '以明快表达突出青春力量，形成面向下一阶段的个人短片。' },
          { id: 'nostalgic', label: '温暖怀旧', meaning: '把节奏放缓，关注熟悉空间与相处时光带来的情感。', result: '让校园细节承载怀念，形成适合日后回看的个人纪念。' },
          { id: 'fresh', label: '清新文艺', meaning: '以自然、简洁的画面气质，保留轻盈而安静的青春表达。', result: '让人物与校园环境从容出现，留下清爽的个人毕业影像。' },
        ],
      },
    ],
    journey: [
      { title: '进入毕业主题', description: '从学校或社群入口进入，确认届别与参与说明。' },
      { title: '选择青春设定', description: '选择开放的毕业阶段、校园场景和纪念气质。' },
      { title: '准备本人照片', description: '确认单人照片与使用范围，按参与规则提供素材。' },
      { title: '形成个人纪念', description: '正式服务按主题制作，个人短片保留共同届别信息。' },
      { title: '领取并选择分享', description: '本人留存；学校展示或集体合集另行确认授权。' },
    ],
    outputs: [
      { recipient: '给毕业生与结业成员', title: '一条带有自己和届别记忆的纪念短片', items: ['本人出场的青春片段', '所选校园场景与纪念气质', '共同届别下的个人成果'], value: '在同一届的集体记忆中保留个人偏好，不把每个人都变成相同的纪念模板。' },
      { recipient: '给学校与组织方', title: '一套统一主题的毕业影像参与方案', items: ['学校或社群的共同主题', '场景选项与参与引导', '约定规格的个人纪念成果'], value: '为毕业活动提供可组织的参与项目，让学校主题和学生的个人记忆一起留下。' },
    ],
    scope: {
      core: '以共同毕业主题下的个人纪念短片为核心，不用单人照片复原真实全班。',
      optional: ['毕业典礼播放版', '经授权的个人片段合集', '适配校友纪念的约定版本'],
      pending: ['参与年级、年龄与素材使用规则', '校园标识、场景与届别信息核实', '参与规模、生成与领取安排', '时长、画幅、交付范围与报价'],
    },
    preparation: ['学校或社群名称、届别与参与对象', '经确认可使用的校园场景及纪念主题', '照片要求、参与规模与活动时间', '本人留存、集体播放及分享的使用范围'],
    visuals: {
      hero: { src: reference(7), alt: '毕业生在典礼上抛起学位帽', caption: '毕业活动参考：共同的仪式，个人的纪念。' },
      detail: { src: themeImage('campus-memory'), alt: '学生拿着书本在校园建筑前同行', caption: '青春场景参考：熟悉的校园日常成为个人表达的背景。' },
      outcome: { src: reference(7), alt: '毕业典礼上的人群与抛起的学位帽', caption: '集体纪念的使用场合参考；不是个人成片或真实全班合成。' },
    },
  },
};
