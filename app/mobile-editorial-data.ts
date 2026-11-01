import { asset, reference, configurationOptions } from './guangdang-data';

type EditorialChoice = { title: string; items: string[]; meaning: string };
type EditorialValue = { title: string; description: string };

export type EditorialPlan = {
  categoryId: string;
  business: 'hall' | 'bespoke';
  title: string;
  kicker: string;
  summary: string;
  audience: string;
  image: string;
  imageLabel: string;
  imageFormat?: 'portrait';
  themeId?: string;
  planned?: boolean;
  choices: EditorialChoice[];
  journey: EditorialValue[];
  outcome: { title: string; description: string; extras: string };
  participantValue: EditorialValue;
  projectValue: EditorialValue;
  preparation: string[];
};

const editorialImage = (name: string) => asset(`images/editorial-20261029/${name}-1920.webp`);
const configuredChoices = (themeId: string, meanings: string[]): EditorialChoice[] =>
  configurationOptions[themeId].map((group, index) => ({
    title: group.title,
    items: [...group.items],
    meaning: meanings[index],
  }));

export const editorialIntroductions: Record<
  'hall' | 'bespoke',
  { title: string; description: string; image: string; imageLabel: string; steps: string[] }
> = {
  hall: {
    title: '把品牌主题，变成人人可参与的影像活动。',
    description: '面向品牌、企业与活动主办方的 AI 影像互动产品。项目方确定活动主题与表达边界，参与者选择内容、提交个人素材，形成与品牌有关的专属影像。',
    image: editorialImage('brand-story'),
    imageLabel: '概念示意',
    steps: ['项目方确定主题', '参与者选择内容', '专属影像成果'],
  },
  bespoke: {
    title: '围绕一项需求，由团队完成专属创作。',
    description: '面向企业、机构及有专属创作需求的委托方。先收集资料、沟通用途与预算，再由团队完成策划、制作、审片与交付。',
    image: editorialImage('bespoke-story'),
    imageLabel: '概念示意',
    steps: ['梳理真实资料', '确认故事与影像', '完成专属影片'],
  },
};

export const editorialBenefits: Record<
  'hall' | 'bespoke',
  { title: string; description: string; image: string; imageLabel: string; imageFormat?: 'portrait' }[]
> = {
  hall: [
    {
      title: '让用户成为主题主角',
      description: '在统一主题中保留个人选择，让品牌表达与每个人的角色、偏好和纪念心意结合。',
      image: editorialImage('brand-story'),
      imageLabel: '概念示意',
    },
    {
      title: '清楚的选择，连贯的参与',
      description: '将素材要求、内容选项和成果说明组织成清楚的步骤，让参与者知道每一步的意义。',
      image: reference(5),
      imageLabel: '场景参考',
      imageFormat: 'portrait',
    },
    {
      title: '一个主题，延展不同节点',
      description: '围绕发布、关怀和集体纪念，规划系列内容，让共同视觉延续到不同的活动时刻。',
      image: reference(7),
      imageLabel: '场景参考',
    },
  ],
  bespoke: [
    {
      title: '从资料中找到故事',
      description: '将照片、文字和口述线索梳理为故事脉络，为零散的资料找到共同的表达重点。',
      image: editorialImage('bespoke-story'),
      imageLabel: '概念示意',
    },
    {
      title: '为故事设计影像表达',
      description: '围绕人物与内容选择场景、镜头和影像气质，通过样段与阶段确认推进创作。',
      image: reference(8),
      imageLabel: '场景参考',
    },
    {
      title: '让成片服务于约定用途',
      description: '依据活动播放、展陈或传播需要，确定影片表达与交付版本，让内容适合观看场景。',
      image: editorialImage('enterprise-story'),
      imageLabel: '概念示意',
    },
  ],
};

// These choices explain the campaign proposal. They are not generation template IDs.
export const brandCampaignOptions = {
  growth: [
    { id: 'career', label: '职场成长', meaning: '从初入职场到职业发展，让努力与期待成为个人故事的主线。', outcome: '围绕职业成长，串联在深圳的生活起点、奋斗与未来期待。' },
    { id: 'family', label: '家庭相伴', meaning: '从成家到共同生活，把家人的陪伴与幸福时刻放在故事中心。', outcome: '围绕家庭陪伴，连接城市生活、共同成长与更好的未来。' },
    { id: 'venture', label: '创业逐梦', meaning: '从创业出发到事业发展，表达个人追梦与城市机遇的连接。', outcome: '围绕创业逐梦，呈现个人投入、城市机遇与继续向前的期待。' },
  ],
  scenes: [
    { id: 'bay', label: '深圳湾' },
    { id: 'futian', label: '福田 CBD' },
    { id: 'qianhai', label: '前海' },
    { id: 'branch', label: '工行网点' },
    { id: 'life', label: '城市生活' },
  ],
  clothing: ['职场', '休闲', '运动'],
  styles: ['温暖', '时尚', '活力'],
};

export const editorialPlans: Record<string, EditorialPlan> = {
  brand: {
    categoryId: 'brand',
    business: 'hall',
    title: '我为品牌代言 · 与深圳 共成长',
    kicker: '品牌客户活动 · 方案示例',
    summary: '以工行深圳分行品牌客户活动为例，把“与深圳共成长”的品牌主题，转化为每位参与者的个人成长短片。',
    audience: '适合银行、品牌与机构的客户活动、开放日及社群运营；参与者是活动客户与城市生活者。',
    image: reference(4),
    imageLabel: '场景参考',
    choices: [
      { title: '成长主题 · 选 1 项', items: brandCampaignOptions.growth.map(item => item.label), meaning: '决定片中的成长主线：职业发展、家庭生活或创业梦想。' },
      { title: '深圳场景 · 选 2–3 项', items: brandCampaignOptions.scenes.map(item => item.label), meaning: '决定个人故事发生在哪些城市空间，将生活记忆与深圳、品牌连接起来。' },
      { title: '个性表达 · 按需设置', items: ['服装风格', '视频风格', '个性化文案'], meaning: '调整主角形象、影片情绪和个人心声；可选范围由活动方提前配置与确认。' },
    ],
    journey: [
      { title: '扫码进入', description: '从活动现场、展板或工作人员引导进入活动 H5，先了解主题与素材说明。' },
      { title: '准备个人照片', description: '选择或拍摄一张个人照片，并确认照片使用授权。' },
      { title: '选择主题与配置', description: '选择一条成长主线、2–3 个深圳场景，再按需设置服装、风格与文案。' },
      { title: '形成专属影像', description: '按活动模板与个人设定，形成以本人为主角的主题短片。' },
      { title: '保存与自愿分享', description: '参与者保存纪念，按自己的意愿分享；公开展示与使用另行确认授权。' },
    ],
    outcome: {
      title: '一张照片，一条约 30 秒的个人成长短片',
      description: '这是本方案的成果目标：以参与者为主角，连接个人成长、深圳场景与品牌陪伴，并保留统一活动主题。',
      extras: '画幅、封面、品牌元素、领取方式及其他交付版本在项目中确认；当前页面不生成工行专属影片。',
    },
    participantValue: { title: '把自己的成长，留成一份纪念', description: '用自己选择的生活主线与城市场景表达“我与深圳”的关系，得到有个人内容、值得留存的影像。' },
    projectValue: { title: '让品牌理念变成一次参与', description: '用客户的个人成长故事承载品牌陪伴，服务活动互动与自愿分享。这是活动价值设计，不承诺传播量或业务转化。' },
    preparation: ['活动主题、目标客户、参与场景与预计规模', '经确认可使用的品牌标识、网点及城市视觉素材', '模板与配置范围、照片授权说明及内容审核安排', '影片规格、领取方式、项目周期与报价范围'],
  },
  event: {
    categoryId: 'event',
    business: 'hall',
    title: '我的活动高光时刻',
    kicker: '活动互动与用户体验',
    summary: '把发布会、展会或节庆的共同主题，转成参与者可以带走的个人影像纪念。',
    audience: '活动主办方、品牌与会务机构发起，现场或线上参与者体验。',
    image: reference(5),
    imageLabel: '场景参考',
    imageFormat: 'portrait',
    themeId: 'event-0',
    choices: configuredChoices('event-0', [
      '确定活动情境和共同视觉，让个人影像与本次活动产生联系。',
      '选择最想表达的参与时刻，让影像围绕自己的高光展开。',
      '确定影片的节奏与情绪方向，让活动表达与纪念心意保持一致。',
    ]),
    journey: [
      { title: '了解活动主题', description: '从活动入口了解主题和参与要求，找到属于自己的影像体验。' },
      { title: '选出我的高光', description: '选择活动类型、高光时刻与氛围，整理个人想要表达的内容。' },
      { title: '留下专属纪念', description: '以个人活动短片形成纪念；展示、领取与版本按项目安排。' },
    ],
    outcome: {
      title: '把活动记忆，留进个人短片',
      description: '以个人活动主题短视频为核心，让现场主题与参与者自己的表达共同出现。',
      extras: '现场播放或其他纪念版本按需约定，制作时间与领取方式在项目中确认。',
    },
    participantValue: { title: '有参与，也有自己的记忆', description: '将与活动有关的角色和高光留在影像中，获得可以珍藏的个人纪念。' },
    projectValue: { title: '让活动内容延续下去', description: '用可参与的内容增强活动体验，让主题延展到参与之后的纪念使用。' },
    preparation: ['活动主题、举办时间与现场或线上载体', '活动视觉、参与对象及动线安排', '服务规模、成果展示及使用要求'],
  },
  team: {
    categoryId: 'team',
    business: 'hall',
    title: '退休员工纪念',
    kicker: '企业文化与员工关怀',
    summary: '围绕岗位岁月、致谢与新生活，为退休员工策划有个人内容的纪念影像。',
    audience: '企业、工会与员工关怀团队发起，退休员工参与内容确认。',
    image: editorialImage('retirement-story'),
    imageLabel: '概念示意',
    planned: true,
    choices: [
      { title: '岗位记忆', items: ['初入岗位', '并肩协作', '重要贡献'], meaning: '选择最想表达的经历主题，具体人物与事实由本人或单位确认。' },
      { title: '纪念心意', items: ['感谢伙伴', '致敬岁月', '寄语后来者'], meaning: '确定影片最重要的情感方向，让致谢表达与个人心意相呼应。' },
      { title: '退休愿景', items: ['旅行生活', '兴趣热爱', '家庭陪伴'], meaning: '选择面向新生活的结尾方向，让岗位记忆自然连接到未来。' },
    ],
    journey: [
      { title: '确认纪念资料', description: '单位与本人整理岗位经历及可用照片，确认主题与素材使用范围。' },
      { title: '选择个人表达', description: '围绕岗位记忆、纪念心意与退休愿景，梳理这段影像的内容重点。' },
      { title: '形成纪念成果', description: '结合资料制作并确认个人纪念影像，按约定用于留存或纪念活动。' },
    ],
    outcome: {
      title: '一份属于自己的岗位纪念',
      description: '以个人退休纪念短片为核心，连接值得保留的经历、感谢与未来心愿。',
      extras: '单位播放或其他纪念版本按需约定；退休主题配置属于策划建议，当前未开放。',
    },
    participantValue: { title: '让投入被认真看见', description: '以自己的经历与心意留下纪念，让感谢和面向新生活的期待拥有画面。' },
    projectValue: { title: '把员工关怀落到具体内容', description: '通过有个人内容的纪念表达，服务退休活动、组织文化与工会关怀。' },
    preparation: ['经确认的姓名、岗位、工龄与纪念内容', '可使用的近照、旧照片及相关资料', '单位标识、致谢方向和播放用途'],
  },
  campus: {
    categoryId: 'campus',
    business: 'hall',
    title: '我的毕业纪念影像',
    kicker: '校园与社群纪念',
    summary: '让同一届的共同记忆，拥有每个人不同的场景选择与青春表达。',
    audience: '学校、教育机构与社群发起，毕业生或结业成员参与。',
    image: reference(7),
    imageLabel: '场景参考',
    themeId: 'campus-0',
    choices: configuredChoices('campus-0', [
      '确定影像所处的学习与成长阶段，让主题与参与对象相匹配。',
      '选择最能承载记忆的空间，让个人表达落在具体的校园画面中。',
      '确定影片的情绪与影像气质，表达自己想留下的青春心意。',
    ]),
    journey: [
      { title: '进入毕业主题', description: '了解学校或社群的共同主题，确认个人参与所需的素材与说明。' },
      { title: '选择青春设定', description: '选择毕业阶段、记忆空间与纪念气质，整理自己的毕业表达。' },
      { title: '留下个人影像', description: '以个人毕业短片呈现纪念；集体展示与使用范围按项目确认。' },
    ],
    outcome: {
      title: '共同的毕业季，专属的青春表达',
      description: '以个人毕业纪念短片为核心，在共同的校园背景中保留每个人的身份与偏好。',
      extras: '其他纪念画面或播放版本按需约定，不以单人照片复原真实全班人物。',
    },
    participantValue: { title: '在共同记忆里留下自己', description: '通过个人选择表达与校园、同窗和成长的连接，获得属于自己的青春纪念。' },
    projectValue: { title: '让集体纪念容纳个人表达', description: '以统一主题组织毕业活动，将学校或社群的共同视觉与个人心意结合。' },
    preparation: ['学校或社群、届别与共同毕业主题', '可使用的标识、校园地点与视觉素材', '参与规模、纪念用途与影像使用范围'],
  },
  person: {
    categoryId: 'person',
    business: 'bespoke',
    title: '一位人物的职业故事',
    kicker: '人物故事',
    summary: '从真实经历与关键选择中找到主线，让人物的精神、热爱与贡献被具体看见。',
    audience: '人物所属机构、企业品牌及文化团队委托，相关人物参与资料与内容确认。',
    image: reference(8),
    imageLabel: '场景参考',
    choices: [
      { title: '故事重点', items: ['成长经历', '职业选择', '重要贡献'], meaning: '确定影片最重要的内容，找到值得展开的人物经历与关键选择。' },
      { title: '叙事线索', items: ['人物讲述', '同伴见证', '经历时间线'], meaning: '确定资料如何组织，让观众以合适的视角理解这位人物。' },
      { title: '使用场景', items: ['活动播放', '机构传播', '纪念留存'], meaning: '明确影片面向谁观看，进而确认表达、交付版本与使用范围。' },
    ],
    journey: [
      { title: '访谈与资料梳理', description: '结合访谈、照片和已有影像核实关键经历，确定人物故事主线。' },
      { title: '确认故事与样段', description: '围绕主线确认剧本、人物与场景表达，通过样段建立创作共识。' },
      { title: '制作与成片交付', description: '按确认方向完成影像与后期，结合阶段审片交付约定版本。' },
    ],
    outcome: {
      title: '让一段经历成为完整影片',
      description: '以专属人物故事影片为核心，用具体的经历和情感呈现人物自己的精神。',
      extras: '短版、字幕及播放版本按项目确认；这是委托创作方向，不是自助生成模板。',
    },
    participantValue: { title: '经历被理解，也被留存', description: '人物的经历与选择得到连贯表达，观众通过具体故事认识其精神和热爱。' },
    projectValue: { title: '用人物讲述机构的价值', description: '形成可用于约定场景的人物内容，服务机构表达、员工文化或相关主题传播。' },
    preparation: ['影片用途、故事重点与可访谈人物', '可使用的照片、已有影像与经历资料', '期望片长、播放场景和素材使用范围'],
  },
  family: {
    categoryId: 'family',
    business: 'bespoke',
    title: '一段跨代的家庭记忆',
    kicker: '家庭记忆',
    summary: '以老照片、家书和口述为线索，将不同代际的经历组织成可以共同观看的记忆。',
    audience: '家庭服务机构、工会或员工关怀项目委托，家人与项目方共同确认资料。',
    image: reference(9),
    imageLabel: '场景参考',
    choices: [
      { title: '纪念主题', items: ['长辈经历', '家庭成长', '重要团聚'], meaning: '明确这段记忆为什么值得被讲述，让资料围绕同一个情感重点展开。' },
      { title: '资料线索', items: ['老照片', '家书文字', '口述回忆'], meaning: '确定影片可以依据什么内容创作，并核实人物关系与关键时间。' },
      { title: '使用需求', items: ['关怀活动', '纪念播放', '家庭留存'], meaning: '确定成果如何被观看，明确项目需要的呈现方式与使用范围。' },
    ],
    journey: [
      { title: '整理家庭资料', description: '梳理照片、文字与口述，核实人物关系、关键时间和资料使用范围。' },
      { title: '组织记忆主线', description: '从共同经历中确定故事重点，通过剧本与样段讨论影像表达。' },
      { title: '完成纪念影片', description: '按确认方向制作并审片，让家庭记忆以约定的影片版本留下。' },
    ],
    outcome: {
      title: '让零散记忆成为共同的故事',
      description: '以家庭记忆影片为核心，把照片与口述连接成可以延续的情感表达。',
      extras: '纪念画面与交付版本按需求约定；真实照片、概念重现与成片示意分开说明。',
    },
    participantValue: { title: '让不同代际重新相遇', description: '家人在共同观看中理解彼此的经历，让珍贵资料拥有可以继续传递的表达。' },
    projectValue: { title: '为关怀留下有温度的内容', description: '为员工关怀或家庭服务项目组织具体纪念内容，成果使用按约定与授权执行。' },
    preparation: ['纪念需求、家人关系与故事线索', '可使用的老照片、文字和口述资料', '观看对象、交付形式与素材使用范围'],
  },
  enterprise: {
    categoryId: 'enterprise',
    business: 'bespoke',
    title: '企业周年记忆影片',
    kicker: '企业故事',
    summary: '从创业历程、关键人物与重要项目中找到主线，让企业发展的共同记忆形成完整故事。',
    audience: '企业、品牌及相关组织委托，档案与人物资料由项目方核实。',
    image: editorialImage('enterprise-story'),
    imageLabel: '概念示意',
    choices: [
      { title: '叙事重点', items: ['创业历程', '关键人物', '重要项目'], meaning: '确定影片主线，让重要的人和事件成为叙事重点，不平均堆放所有资料。' },
      { title: '播放与使用', items: ['周年活动', '内部文化', '品牌传播'], meaning: '明确观众与观看场景，让内容表达和成果使用保持一致。' },
      { title: '交付安排', items: ['主片', '短版', '其他约定版本'], meaning: '根据用途确认需要的版本与范围，不默认全部形式都包含在项目中。' },
    ],
    journey: [
      { title: '梳理企业记忆', description: '整理档案、照片与人物访谈，核实发展节点及希望表达的重点。' },
      { title: '确认叙事与影像', description: '围绕发展主线确认剧本、品牌呈现与样段，统一内容和视觉方向。' },
      { title: '制作并审片交付', description: '完成AI影像与后期制作，经阶段审片交付适合约定用途的版本。' },
    ],
    outcome: {
      title: '一部承载共同历程的企业影片',
      description: '以企业故事主片为核心，将重要人物与事件组织为面向约定观众的完整叙事。',
      extras: '短版或其他活动、传播版本按项目约定，不将场景参考图视为企业历史档案。',
    },
    participantValue: { title: '从人和事件理解共同历程', description: '员工与观众通过具体的经历理解企业发展，让共同记忆拥有可观看的内容。' },
    projectValue: { title: '为周年与传播建立故事依据', description: '形成服务周年活动、组织文化或品牌叙事的影片，交付与使用范围按项目确认。' },
    preparation: ['周年目标、企业发展节点与叙事重点', '可使用的企业档案、照片与人物访谈', '播放场景、版本需求和素材使用范围'],
  },
  city: {
    categoryId: 'city',
    business: 'bespoke',
    title: '一条街区的城市记忆',
    kicker: '城市与历史',
    summary: '从一条街区、一个地标或一段生活切入，让有依据的城市记忆与今天的观看者相遇。',
    audience: '城市、文化及文旅机构委托，资料与重现范围在项目中核实。',
    image: editorialImage('city-story'),
    imageLabel: '概念示意',
    choices: [
      { title: '叙事对象', items: ['一条街区', '一个地标', '一段生活'], meaning: '明确讲述范围，让城市故事落在具体空间、人物与生活细节中。' },
      { title: '表达方向', items: ['历史空间重现', '今昔对照', '人物带路'], meaning: '确定史料与影像如何结合，重现内容需要有可核实的资料依据。' },
      { title: '使用场景', items: ['展陈', '文旅传播', '公共文化内容'], meaning: '明确成果面向谁、在哪里观看，确定影片表达与约定版本。' },
    ],
    journey: [
      { title: '核实史料与空间', description: '梳理街区照片、地方资料与口述，核对年代、地点和可使用范围。' },
      { title: '确认故事与重现', description: '以具体人物或空间建立主线，确认剧本、历史重现范围与样段。' },
      { title: '制作与事实核对', description: '完成影像与后期，区分史料和重现内容，经审片交付约定版本。' },
    ],
    outcome: {
      title: '让城市记忆拥有今天的表达',
      description: '以城市记忆影片为核心，将经核实的资料转化为面向公众的文化叙事。',
      extras: '展陈或传播版本按需求约定；现代照片不充当历史证据，AI重现就近标识。',
    },
    participantValue: { title: '从具体故事重新认识城市', description: '通过人物、街区与生活变化理解城市记忆，建立文化认同与情感连接。' },
    projectValue: { title: '让核实后的资料被看见', description: '把城市资料组织成适用于展陈或传播的影像内容，服务约定的公共文化用途。' },
    preparation: ['叙事对象、影片用途与表达重点', '可核实的照片、地方档案和口述线索', '史料、重现内容及成果的使用范围'],
  },
};
