export type Business = 'hall' | 'bespoke';
export type Media = { type:'image'|'video'; src:string; poster?:string; width:number; height:number; alt:string };
export type CaseRecord = { id:string; title:string; categoryId:string; themeId:string; background:string; objective:string; media:Media[]; status:'draft'|'published' };
export type ThemeRecord = { id:string; categoryId:string; title:string; image:string; caseIds:string[]; templateId?:string; status:'example'|'published' };
export type PublishedWork = { id:string; title:string; categoryId:string; business:Business; themeId?:string; caseId?:string; templateId?:string; media:Media; source:string; displayAuthorized:boolean; status:'draft'|'published'; sort:number; publishedAt:string };
export type Category = { id: string; business: Business; title: string; short: string; intro: string; audience: string; image: number; themes: string[]; };
export const asset = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`;
const visualNames:Record<number,string>={2:'hero-interactive',3:'hero-bespoke',4:'brand',5:'event',6:'team',7:'campus',8:'person',9:'family',10:'enterprise',11:'city'};
export const reference = (id: number) => asset(`images/guangdang-v2/${visualNames[id]}-1920.webp`);
export const historicalPhotos = [
 {id:'dongmen-pillars',title:'东门街区标识',description:'三根东门标识石柱与街边建筑。'},
 {id:'dongmen-bell',title:'东门街头钟景',description:'街头钟景与周边店铺、行人。'},
 {id:'dongmen-panorama',title:'东门街区全景',description:'从高处看到的街区屋顶、楼宇与人流。'},
 {id:'dongmen-arch',title:'老东门步行街牌坊',description:'牌坊、街道车辆与行人。'},
 {id:'dongmen-street',title:'东门步行街人流',description:'店铺之间往来的人群与街道。'},
].map(photo=>({...photo,src:asset(`images/dongmen-history/${photo.id}-1920.webp`)}));
export type Highlight = {title:string;description:string};
export const highlights:Record<string,Highlight[]>={
 brand:[{title:'品牌故事，人人参与',description:'将品牌主张、城市主题与个人表达结合，让用户成为传播内容的一部分。'},{title:'主题表达更聚焦',description:'围绕一次传播目标组织模板、画面与内容选择，让体验始终服务于主题。'},{title:'适配多种传播场景',description:'可围绕产品推广、城市宣传与重大主题，策划相应的互动内容。'},{title:'直接选择主题',description:'选好主题后直接配置单人角色与内容设定，真实品牌素材可另行整理定制需求。'}],
 event:[{title:'让参与有画面',description:'围绕发布会、展会、节庆等活动，设计与现场主题呼应的个人影像体验。'},{title:'把高光时刻带走',description:'让活动记忆延伸为一份属于参与者自己的影像表达。'},{title:'玩法围绕活动定制',description:'根据活动主题、参与对象与展示场景，规划相应模板和内容选项。'},{title:'体验路径清楚',description:'选择活动主题后直接进入配置，以个人视角整理活动与节日设定。'}],
 team:[{title:'让每一位员工被看见',description:'从个人经历、职业身份与团队生活出发，呈现员工与企业共同成长的故事。'},{title:'文化落在具体故事里',description:'以迎新、周年纪念、团队活动等内容，表达企业文化与价值认同。'},{title:'共同记忆，也有个人表达',description:'在统一活动主题下，保留个人选择与专属影像的表达空间。'},{title:'覆盖重要团队时刻',description:'围绕入职、成长、庆祝与纪念等节点，持续规划适合团队的影像内容。'}],
 campus:[{title:'把青春留在画面里',description:'以毕业季、校庆与校园活动为主题，从个人视角表达校园记忆。'},{title:'共同主题，专属记忆',description:'让集体纪念拥有一致的视觉方向，也容纳每个人的表达。'},{title:'适合校园与社群',description:'围绕班级、学校与兴趣社群，组织相应的主题内容与参与方式。'},{title:'让纪念有情感',description:'从个人经历与情谊主题出发，让校园影像表达纪念心意。'}],
 person:[{title:'以人物为叙事中心',description:'关注一个人的经历、选择与热爱，找到值得被讲述的故事线。'},{title:'真实资料成为创作起点',description:'结合访谈、照片、文字与已有视频，梳理人物经历与表达重点。'},{title:'为故事选择影像语言',description:'根据人物气质与创作目标，讨论合适的画面、节奏和声音表达。'},{title:'专属策划贯穿创作',description:'从需求沟通到方案、制作与交付，围绕同一表达目标推进。'}],
 family:[{title:'从家庭关系出发',description:'把亲情、陪伴与共同经历放在故事中心，记录家人之间的连接。'},{title:'让旧照片重新被讲述',description:'将家庭照片、口述回忆与文字资料整理为可以延续的影像线索。'},{title:'连接不同代际的记忆',description:'围绕成长、团聚与重要人生节点，让家人共同参与故事整理。'},{title:'为珍贵时刻专属创作',description:'依据家庭资料与纪念需求，沟通适合的内容形式与交付方式。'}],
 enterprise:[{title:'从历程中找到故事',description:'梳理发展节点、重要项目与关键选择，让企业历史形成清晰叙事。'},{title:'用人物表达企业精神',description:'通过创始人、员工与团队的真实经历，呈现企业的价值理念。'},{title:'整合多种历史资料',description:'将照片、影像、文字与口述资料组织为统一的创作依据。'},{title:'围绕使用场景策划',description:'根据品牌传播、企业纪念或内部文化需求，确定内容侧重与呈现方式。'}],
 city:[{title:'以城市记忆为线索',description:'从街区、人物与生活细节切入，讲述城市与时代的变化。'},{title:'让史料成为叙事依据',description:'在资料核实与使用范围明确的基础上，组织历史影像与文化内容。'},{title:'连接过去与今天',description:'通过新旧场景与具体故事，让城市发展变得可感知、可理解。'},{title:'为地方文化寻找表达',description:'围绕文化传承、城市主题与历史叙事，策划相应的影像语言。'}],
};
export const categories: Category[] = [
  { id:'brand',business:'hall',title:'品牌推广与主题传播',short:'品牌传播',intro:'让品牌主张与城市主题，成为每个人可以参与的影像。',audience:'企业、品牌、城市及相关机构',image:4,themes:['来了就是深圳人','我为品牌代言'] },
  { id:'event',business:'hall',title:'活动互动与用户体验',short:'活动互动',intro:'把现场的参与感，变成可以带走的专属记忆。',audience:'活动主办方、品牌营销部门、展会及会务机构',image:5,themes:['我的活动高光时刻','专属节日影像'] },
  { id:'team',business:'hall',title:'企业文化与员工关怀',short:'员工关怀',intro:'记录每一份投入，也看见团队里的每一个人。',audience:'企业人力资源部门、工会、品牌文化部门',image:6,themes:['我的职场成长影像','我们团队的专属记忆'] },
  { id:'campus',business:'hall',title:'校园与社群纪念',short:'校园纪念',intro:'让一起走过的日子，有值得珍藏的影像。',audience:'学校、教育机构、社群及相关组织',image:7,themes:['我的毕业纪念影像','我们的校园记忆'] },
  { id:'person',business:'bespoke',title:'人物故事',short:'人物故事',intro:'那些经历、选择与热爱，值得被认真讲述。',audience:'希望记录个人经历、成长历程与人物精神的个人或机构',image:8,themes:[] },
  { id:'family',business:'bespoke',title:'家庭记忆',short:'家庭记忆',intro:'把家人之间的爱，与共同走过的时间留在影像里。',audience:'希望记录亲情、成长与重要人生回忆的家庭',image:9,themes:[] },
  { id:'enterprise',business:'bespoke',title:'企业故事',short:'企业故事',intro:'从一个起点到一段历程，讲述企业自己的故事。',audience:'希望呈现发展历程、品牌精神与项目成果的企业',image:10,themes:[] },
  { id:'city',business:'bespoke',title:'城市与历史',short:'城市与历史',intro:'让城市的记忆，在今天继续被看见。',audience:'关注城市记忆、地方文化、历史叙事与文化传承的机构',image:11,themes:[] },
];
export const categoryById = new Map(categories.map(c => [c.id,c]));
export const themeImages:Record<string,string>={
 'brand-0':asset('images/themes-v3/shenzhen-arrival-1920.webp'),
 'brand-1':asset('images/themes-v3/brand-star-1920.webp'),
 'event-0':reference(5),
 'event-1':asset('images/themes-v3/festival-1920.webp'),
 'team-0':asset('images/guangdang-v2/craft-1920.webp'),
 'team-1':reference(6),
 'campus-0':reference(7),
 'campus-1':asset('images/themes-v3/campus-memory-1920.webp'),
};
export const themes:ThemeRecord[] = categories.flatMap(c=>c.themes.map((title,i)=>({id:`${c.id}-${i}`,categoryId:c.id,title,image:themeImages[`${c.id}-${i}`],caseIds:[],status:'example'})));
export const cases:CaseRecord[]=[];
export const publishedWorks:PublishedWork[]=[];
export const businessName = (b: Business) => b === 'hall' ? 'AI影像馆' : '高定AI影像';
export const businessProfiles:Record<Business,{positioning:string;advantages:string[];highlights:Highlight[]}>={
 hall:{
  positioning:'选择单人主题，自行配置属于你的影像内容。',
  advantages:['以自己为主角参与故事','按主题选择内容设定','从模板开始，降低参与门槛'],
  highlights:[
   {title:'以自己为主角参与故事',description:'从单人视角进入城市、活动、职场与校园主题，选择角色和内容设定，整理属于自己的影像想法。'},
   {title:'围绕不同场景组织参与',description:'围绕品牌推广、节庆活动、员工关怀与校园纪念，规划相应的主题内容，让参与方式呼应活动目的。'},
   {title:'从主题开始，选择更清楚',description:'先选感兴趣的主题，再按提示配置场景、身份与风格，把影像想法拆成清楚的选项，降低内容选择门槛。'},
   {title:'共同主题，保留个人表达',description:'在统一主题下保留个人选择空间，用自己的身份、偏好和纪念心意，表达与城市、团队或校园的连接。'},
  ],
 },
 bespoke:{
  positioning:'围绕真实人物与故事，整理需求并规划专属AI影像。',
  advantages:['围绕真实故事专属策划','整合照片、影像与口述资料','用画面与声音表达情感'],
  highlights:[
   {title:'真实故事，专属表达',description:'从人物经历、家庭关系、企业历程与城市记忆出发，梳理故事重点，讨论适合这段经历的叙事方向。'},
   {title:'把零散资料整理成故事线',description:'结合照片、已有影像、文字与口述回忆，梳理时间、人物和重要节点，为后续策划建立清晰的资料线索。'},
   {title:'为故事选择画面与声音',description:'围绕故事气质与表达重点，沟通画面、节奏、配音及声音氛围，让影像形式服务于人物和情感。'},
   {title:'围绕纪念与传播需求策划',description:'依据个人纪念、家庭留存、企业传播或城市文化需求，沟通内容侧重、使用场景与合适的呈现形式。'},
  ],
 },
};
export const productPresentations:Record<Business,{headline:string;definition:string;description:string;features:Highlight[];roles:Highlight[];workflow:Highlight[];preparation:string[];scopeNote:string;extension:string}>={
 hall:{
  headline:'让更多人参与品牌传播。',
  definition:'为品牌与机构活动策划的模板化AI影像互动服务。',
  description:'围绕品牌传播、活动互动与组织纪念，为品牌方、政企单位和活动主办方策划主题模板与参与入口。采购方确定主题、品牌呈现和参与规则，参与者通过个人素材与内容选择体验专属影像，让活动内容与个人表达结合。',
  features:[
   {title:'主题与影像模板',description:'围绕传播目标设计故事主题、画面风格与品牌呈现，并确定参与者可以选择的场景、角色和内容组合。'},
   {title:'活动入口与页面',description:'根据活动载体策划小程序或H5入口，组织主题展示、素材要求与参与步骤，让页面服务于活动的参与方式。'},
   {title:'生成与活动配置',description:'按项目确定生成额度、开放时间、素材类型与内容选项，并约定活动支持范围，形成对应的服务配置。'},
   {title:'影像成果与数据',description:'约定参与者的影像成果及使用方式，整理基础活动数据；生成数量、数据口径与成果范围在项目方案中确认。'},
  ],
  roles:[
   {title:'采购方',description:'品牌方、政企单位或活动主办方提出传播目标，确认活动主题、品牌素材、参与规则与服务范围。'},
   {title:'参与者',description:'按活动要求提供个人素材与授权，在开放的内容选项中完成选择，参与主题影像体验。'},
  ],
  workflow:[
   {title:'明确活动目标',description:'确认传播主题、参与对象、活动场景与影像的使用方式。'},
   {title:'确认主题方案',description:'围绕主题设计模板、品牌呈现与内容组合，确认参与方式。'},
   {title:'配置活动入口',description:'确认素材要求、开放选项和服务规模，再配置页面与入口。'},
   {title:'活动支持与成果',description:'按约定提供生成与活动支持，整理影像成果及基础活动数据。'},
  ],
  preparation:['活动目标、举办时间与参与对象','品牌标识、主题内容与已有传播素材','预计参与规模、活动载体与影像使用要求'],
  scopeNote:'模板数量、生成额度、开放时间、活动支持和数据范围，按项目方案确认。',
  extension:'从一个活动主题延展到系列互动内容，让品牌传播、组织文化与集体纪念拥有持续的参与方式。',
 },
 bespoke:{
  headline:'让真实故事，成为专属影片。',
  definition:'为企业与机构提供从故事策划到成片的专属AI影像创作。',
  description:'面向企业、机构与文旅项目，围绕人物经历、家庭记忆、企业历程和城市故事提供专属影像创作。以照片、档案和口述资料为起点，完成故事策划、影像设计与后期成片，按阶段确认创作方向，服务纪念、品牌传播和文化表达。',
  features:[
   {title:'故事策划',description:'梳理人物经历、历史资料与传播目标，组织故事结构、人物关系和关键事件，形成供双方确认的剧本。'},
   {title:'影像设计',description:'依据剧本设计人物形象、年代场景、镜头与声音，结合样段确认影像风格，为后续制作建立共同依据。'},
   {title:'制作与后期',description:'按确认的剧本与资产开展AI影像制作，完成剪辑、调色、配音与声音整合，并结合阶段审片调整。'},
   {title:'完整成片',description:'按约定交付完整影片及相应的画幅、版本、字幕与封面；源文件、其他资产和修改范围依项目约定。'},
  ],
  roles:[
   {title:'委托方',description:'企业、机构或项目负责人确定影片用途、表达重点与交付要求，并参与剧本、样段和成片确认。'},
   {title:'故事素材',description:'人物经历、照片、已有影像、档案与口述资料构成创作起点；由委托方与相关人员核实内容和使用范围。'},
  ],
  workflow:[
   {title:'资料与故事策划',description:'梳理人物、事件和资料，确认影片用途与故事结构。'},
   {title:'设计与样段确认',description:'围绕剧本设计角色、场景与声音，确认影像风格和样段。'},
   {title:'制作与阶段审片',description:'按确认的剧本和资产推进制作，结合阶段审片集中反馈。'},
   {title:'后期与成片交付',description:'完成剪辑、声音与字幕整合，按约定版本交付完整影片。'},
  ],
  preparation:['影片用途、表达重点与希望讲述的故事','照片、档案、已有影像或可访谈的人物线索','期望片长、播放场景、交付版本与素材使用范围'],
  scopeNote:'片长、画幅、版本、修改及素材使用范围按项目确认；源文件与其他资产依合同约定。',
  extension:'从一段人物经历到一个时代的记忆，围绕纪念、传播与文化表达，拓展不同题材、叙事与影像形式。',
 },
};
export type BusinessApplication={categoryId:string;title:string;audience:string;scenes:string[];value:string;extension:string};
export const businessApplications:Record<Business,BusinessApplication[]>={
 hall:[
  {
   categoryId:'brand',title:'品牌推广与主题传播',audience:'企业、品牌、城市及相关机构',
   scenes:['品牌主张','城市主题','产品推广','重大主题宣传'],
   value:'让品牌主张与城市主题，成为参与者自己的影像表达。',
   extension:'围绕品牌发布、产品推荐与城市传播，延展系列主题与互动内容。',
  },
  {
   categoryId:'event',title:'活动互动与用户体验',audience:'活动主办方、品牌营销部门、展会与会务机构',
   scenes:['发布会','展会','节庆','客户答谢','线上线下互动'],
   value:'把现场参与感转化为可以带走、分享的专属影像，让活动记忆继续延伸。',
   extension:'连接活动前的主题预热、现场互动与活动后的纪念传播，延展完整活动体验。',
  },
  {
   categoryId:'team',title:'企业文化与员工关怀',audience:'企业人力资源部门、工会、品牌文化部门',
   scenes:['员工活动','入职迎新','周年纪念','团队文化','员工关怀'],
   value:'把共同主题与个人经历结合，让每一位员工成为企业故事的一部分。',
   extension:'从迎新、成长到退休纪念，形成贯穿员工重要节点的影像内容。',
  },
  {
   categoryId:'campus',title:'校园与社群纪念',audience:'学校、教育机构、社群及相关组织',
   scenes:['毕业季','校庆','校园活动','社群纪念','集体主题活动'],
   value:'让同一段集体记忆，拥有每个人值得珍藏的专属表达。',
   extension:'围绕院系、届别与社群主题，延展校园系列与年度纪念内容。',
  },
 ],
 bespoke:[
  {
   categoryId:'person',title:'人物故事',audience:'企业品牌、文化与人力资源团队，人物所属机构',
   scenes:['个人经历','人物专访','成长历程','榜样人物','创业者故事'],
   value:'用经历、选择、精神与情感，呈现人物的独特故事。',
   extension:'可延展为人物志、人生阶段纪念片与职业故事，记录一个人的不同人生篇章。',
  },
  {
   categoryId:'family',title:'家庭记忆',audience:'工会、员工关怀团队、家庭服务机构及家庭委托方',
   scenes:['家庭故事','亲情纪念','成长记录','重要人生回忆'],
   value:'以真实家庭关系为主线，串联家人之间的情感与共同经历。',
   extension:'从一张老照片、一段口述回忆出发，延展长辈回忆录、家庭纪念片与跨代故事。',
  },
  {
   categoryId:'enterprise',title:'企业故事',audience:'企业、品牌与相关组织',
   scenes:['企业发展历程','品牌精神','创始人故事','员工故事','重大项目纪实'],
   value:'以发展历程、关键人物和重要项目，呈现企业的价值理念与成果。',
   extension:'从创业往事延展到品牌表达、周年纪念与团队人物系列，连接企业的过去与未来。',
  },
  {
   categoryId:'city',title:'城市与历史',audience:'城市机构、文旅单位与地方文化组织',
   scenes:['城市记忆','地方文化','历史叙事','文化传承','城市发展'],
   value:'通过故事、史料与影像，呈现城市和时代的变化。',
   extension:'以街区、人物与历史事件为线索，延展城市记忆片、地方文化与历史文旅内容。',
  },
 ],
};
export type ShowcaseSlide={id:string;title:string;image:string;to:string;action:string;media?:Media;pending?:boolean};
export function getShowcaseSlides(business:Business):ShowcaseSlide[]{
 if(business==='hall')return themeConfigurations.map(theme=>({id:theme.id,title:theme.title,image:theme.image,to:experiencePath(theme.categoryId,theme.id),action:'立即体验'}));
 const ready=publishedWorks.filter(w=>w.business==='bespoke'&&w.displayAuthorized&&w.status==='published'&&w.media.type==='video');
 if(ready.length)return ready.map(w=>({id:w.id,title:w.title,image:w.media.poster||reference(categoryById.get(w.categoryId)?.image||8),to:`/category/${w.categoryId}`,action:'观看样品',media:w.media}));
 return categories.filter(c=>c.business==='bespoke').map(c=>({id:`pending-${c.id}`,title:c.title,image:reference(c.image),to:`/category/${c.id}`,action:'了解创作',pending:true}));
}
// These are explicitly illustrative layout entries, never published customer works.
export const illustrativeWorks = categories.map(c => ({ id:`layout-${c.id}`,categoryId:c.id,title:c.business==='hall'?c.themes[0]:c.title,business:c.business,image:c.business==='hall'?themeImages[`${c.id}-0`]:reference(c.image) }));
export const templateEntries = [{ id:'shenzhen-belike',name:'我的深圳生活 belike',status:'coming-soon' as const,url:null,categoryId:'brand',description:'真实生成尚未开放。' }];
export type OptionGroup={title:string;items:string[]};
export const exampleOptions:OptionGroup[] = [
 {title:'工作地点',items:['福田CBD','蛇口园区','东门商圈']},
 {title:'白天的我',items:['科技研发','职场法务','创意设计']},
 {title:'夜晚的我',items:['调酒师','驻唱歌手','运动爱好者']},
];
export const configurationOptions:Record<string,OptionGroup[]>={
 'shenzhen-belike':exampleOptions,
 'brand-0':[
  {title:'城市片场',items:['深圳湾','福田CBD','东门街区']},
  {title:'你的身份',items:['新深圳人','追梦青年','城市探索者']},
  {title:'影像风格',items:['都市电影','轻快纪实','未来科技']},
 ],
 'brand-1':[
  {title:'代言场景',items:['品牌发布','产品推广','城市推荐']},
  {title:'主角身份',items:['品牌主理人','体验推荐官','员工代言人']},
  {title:'表达风格',items:['专业自信','年轻活力','时尚电影']},
 ],
 'event-0':[
  {title:'活动类型',items:['品牌发布会','行业展会','城市庆典']},
  {title:'我的高光',items:['精彩登场','现场互动','定格留念']},
  {title:'活动氛围',items:['热烈动感','精致时尚','温暖纪念']},
 ],
 'event-1':[
  {title:'节日主题',items:['新春祝福','中秋团圆','生日纪念']},
  {title:'祝福对象',items:['送给自己','家人朋友','团队伙伴']},
  {title:'影像风格',items:['国潮喜庆','温暖治愈','梦幻派对']},
 ],
 'team-0':[
  {title:'成长节点',items:['入职启程','技能进阶','周年纪念']},
  {title:'职业领域',items:['科技研发','创意设计','服务运营']},
  {title:'人物气质',items:['专业自信','活力进取','温暖真实']},
 ],
 'team-1':[
  {title:'我参与的时刻',items:['项目完成','周年庆祝','团建出游']},
  {title:'我心中的团队',items:['默契协作','创新突破','温暖陪伴']},
  {title:'影像风格',items:['热血电影','轻快纪实','温暖纪念']},
 ],
 'campus-0':[
  {title:'毕业阶段',items:['大学毕业','高中毕业','社群结业']},
  {title:'青春场景',items:['毕业礼堂','校园草坪','教室走廊']},
  {title:'纪念气质',items:['青春热血','温暖怀旧','清新文艺']},
 ],
 'campus-1':[
  {title:'我的校园故事',items:['课堂日常','社团活动','校园漫游']},
  {title:'纪念主题',items:['同窗情谊','师恩难忘','社群归属']},
  {title:'影像风格',items:['清新纪实','青春电影','温暖手账']},
 ],
};
const configurationMaterialHints:Record<string,string>={
 'shenzhen-belike':'以你为单人主角，城市与职业为主题设定。',
 'brand-0':'以你为单人主角，选择自己的深圳城市印象。',
 'brand-1':'以你为单人代言主角；真实品牌内容与素材可整理高定需求。',
 'event-0':'以你为单人主角，活动场景为主题设定。',
 'event-1':'以你为单人祝福主角，选择想要表达的节日心意。',
 'team-0':'以你为单人主角，选择个人职业成长主题。',
 'team-1':'以你为单人主角，团队记忆为主题背景；真实多人故事可整理高定需求。',
 'campus-0':'以你为单人主角，选择个人毕业纪念主题。',
 'campus-1':'以你为单人主角，校园情谊为主题背景；真实多人故事可整理高定需求。',
};
export type ThemeConfiguration={id:string;categoryId:string;title:string;image:string;options:OptionGroup[];participation:'单人主角';materialHint:string};
export const themeConfigurations:ThemeConfiguration[]=[
 {id:'shenzhen-belike',categoryId:'brand',title:'我的深圳生活 belike',image:reference(4),options:exampleOptions,participation:'单人主角',materialHint:configurationMaterialHints['shenzhen-belike']},
 ...themes.map(theme=>({id:theme.id,categoryId:theme.categoryId,title:theme.title,image:theme.image,options:configurationOptions[theme.id],participation:'单人主角' as const,materialHint:configurationMaterialHints[theme.id]})),
];
const defaultConfigurationIds:Record<string,string>={brand:'shenzhen-belike',event:'event-0',team:'team-0',campus:'campus-0'};
export const getThemeConfiguration=(categoryId:string,themeId?:string)=>themeConfigurations.find(theme=>theme.categoryId===categoryId&&theme.id===(themeId||defaultConfigurationIds[categoryId]));
export const experiencePath=(categoryId:string,themeId?:string)=>{
 const theme=getThemeConfiguration(categoryId,themeId);
 return theme?`/experience/${theme.categoryId}/${theme.id}`:'/hall';
};
