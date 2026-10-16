export type Business = 'hall' | 'bespoke';
export type Media = { type:'image'|'video'; src:string; poster?:string; width:number; height:number; alt:string };
export type CaseRecord = { id:string; title:string; categoryId:string; themeId:string; background:string; objective:string; media:Media[]; status:'draft'|'published' };
export type ThemeRecord = { id:string; categoryId:string; title:string; caseIds:string[]; templateId?:string; status:'example'|'published' };
export type PublishedWork = { id:string; title:string; categoryId:string; business:Business; themeId?:string; caseId?:string; templateId?:string; media:Media; source:string; displayAuthorized:boolean; status:'draft'|'published'; sort:number; publishedAt:string };
export type Category = { id: string; business: Business; title: string; short: string; intro: string; audience: string; image: number; themes: string[]; };
export const asset = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`;
export const reference = (id: number) => asset(`images/guangdang/ref-${id}.png`);
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
export const themes:ThemeRecord[] = categories.flatMap(c=>c.themes.map((title,i)=>({id:`${c.id}-${i}`,categoryId:c.id,title,caseIds:[],status:'example'})));
export const cases:CaseRecord[]=[];
export const publishedWorks:PublishedWork[]=[];
export const businessName = (b: Business) => b === 'hall' ? 'AI影像馆' : '高定AI影像';
// These are explicitly illustrative layout entries, never published customer works.
export const illustrativeWorks = categories.map((c,i) => ({ id:`layout-${c.id}`,categoryId:c.id,title:c.business==='hall'?c.themes[0]:c.title,business:c.business,image:c.image,ratio:[.78,1.1,.9,1.2,.76,1.1,.88,.8][i] }));
export const templateEntries = [{ id:'shenzhen-belike',name:'我的深圳生活 belike',status:'coming-soon' as const,url:null,categoryId:'brand',description:'现有体验产品接入位。正式入口与身份衔接确认后开放。' }];
export const exampleOptions = [
 {title:'工作地点',items:['福田CBD','蛇口园区','东门商圈']},
 {title:'白天的我',items:['科技研发','职场法务','创意设计']},
 {title:'夜晚的我',items:['调酒师','驻唱歌手','运动爱好者']},
];
