import { asset } from './guangdang-data';

// Frontend planning records only. These IDs are not generation template IDs.
export type ExperienceMode = 'template' | 'custom';
export type ExperienceTemplate = {
  id: string;
  title: string;
  image: string;
  identity: string;
  scene: string;
  action: string;
  description: string;
};

export const experienceTemplates: readonly ExperienceTemplate[] = [
  {
    id: 'city-walk',
    title: '城市里的主角',
    image: asset('images/themes-v3/shenzhen-arrival-1920.webp'),
    identity: '城市探索者',
    scene: '城市天际线',
    action: '走上观景步道，在城市灯光前停下，望向远方。',
    description: '把与城市相遇的这一刻，留进自己的影像。',
  },
  {
    id: 'brand-star',
    title: '我的品牌推荐',
    image: asset('images/editorial-20261029/brand-story-1920.webp'),
    identity: '品牌体验官',
    scene: '品牌展示空间',
    action: '拿起展示产品，面向镜头呈现自己的推荐。',
    description: '在共同的品牌主题里，拥有自己的主角时刻。',
  },
  {
    id: 'campus-memory',
    title: '我的毕业纪念',
    image: asset('images/themes-v3/campus-memory-1920.webp'),
    identity: '毕业生',
    scene: '校园街角',
    action: '带上毕业纪念册，走过熟悉的校园街角，回望青春。',
    description: '从熟悉的校园一角，留下属于自己的纪念。',
  },
];

export const experienceIdentities = [
  { id: 'explorer', label: '城市探索者', description: '发现眼前的风景' },
  { id: 'creator', label: '生活记录者', description: '留住自己的这一刻' },
  { id: 'graduate', label: '校园主角', description: '表达青春与纪念' },
] as const;

export const experienceScenes = [
  { id: 'city', label: '城市天际线', image: experienceTemplates[0].image },
  { id: 'brand', label: '品牌展示空间', image: experienceTemplates[1].image },
  { id: 'campus', label: '校园街角', image: experienceTemplates[2].image },
] as const;

export const experienceActionSuggestions = [
  { label: '随意走走', text: '在这里慢慢走，发现沿途的生活细节。' },
  { label: '记录这一刻', text: '面向镜头留下这一刻，再转身望向周围的风景。' },
  { label: '向镜头打招呼', text: '走向镜头，挥手打招呼，再停下微笑。' },
] as const;
