import type { CSSProperties } from 'react';
import type { TopicColor } from '../logic/topics';

/** Sets the --topic CSS variable so `bg-(--topic)` uses the topic's colour. */
export function topicStyle(color: TopicColor): CSSProperties {
  return { '--topic': `var(--color-${color})` } as CSSProperties;
}
