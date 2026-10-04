import type { TopicId } from './types';

export type TopicColor = 'grass' | 'tomato' | 'sky' | 'grape' | 'tangerine' | 'bubble';

export interface TopicInfo {
  id: TopicId;
  title: string;
  subtitle: string;
  /** Small equation shown on the topic card. */
  badge: string;
  emoji: string;
  color: TopicColor;
  /** Nice first example for the learn screen. */
  example: [number, number];
  /** Bridging-ten topics are practised in small steps. */
  stepped: boolean;
}

export const TOPICS: readonly TopicInfo[] = [
  {
    id: 'compare',
    title: 'Isompi vai pienempi?',
    subtitle: 'Krokotiili syö aina isomman!',
    badge: '3 < 7',
    emoji: '🐊',
    color: 'grass',
    example: [3, 7],
    stepped: false,
  },
  {
    id: 'add10',
    title: 'Plussalasku',
    subtitle: 'Yhteenlaskua kymppiin asti.',
    badge: '4 + 3',
    emoji: '➕',
    color: 'tomato',
    example: [4, 3],
    stepped: false,
  },
  {
    id: 'sub10',
    title: 'Miinuslasku',
    subtitle: 'Vähennyslaskua kymppiin asti.',
    badge: '8 − 3',
    emoji: '➖',
    color: 'sky',
    example: [8, 3],
    stepped: false,
  },
  {
    id: 'pairs10',
    title: 'Kymppikaverit',
    subtitle: 'Mitkä luvut tekevät yhdessä kympin?',
    badge: '7 + 3 = 10',
    emoji: '🤝',
    color: 'grape',
    example: [7, 3],
    stepped: false,
  },
  {
    id: 'bridgeAdd',
    title: 'Yli kympin plussalla',
    subtitle: 'Täytä ensin kymppi!',
    badge: '8 + 5',
    emoji: '🚀',
    color: 'tangerine',
    example: [8, 5],
    stepped: true,
  },
  {
    id: 'bridgeSub',
    title: 'Yli kympin miinuksella',
    subtitle: 'Mene ensin tasan kymppiin!',
    badge: '13 − 5',
    emoji: '🪂',
    color: 'bubble',
    example: [13, 5],
    stepped: true,
  },
];

export function topicInfo(id: TopicId): TopicInfo {
  const info = TOPICS.find((t) => t.id === id);
  if (!info) throw new Error(`Unknown topic ${id}`);
  return info;
}

export function isTopicId(value: string): value is TopicId {
  return TOPICS.some((t) => t.id === value);
}
