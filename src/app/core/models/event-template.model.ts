export interface EventTemplateBlock {
  type: string;
  data: Record<string, unknown>;
}

export interface EventTemplateContent {
  time: number;
  blocks: EventTemplateBlock[];
  version: string;
}

export interface EventTemplateSnapshot {
  title: string;
  content: EventTemplateContent;
}

export type EventTemplateSource = 'system' | 'user';

export interface EventTemplate extends EventTemplateSnapshot {
  id: string;
  name: string;
  description: string;
  icon: string;
  source: EventTemplateSource;
  createdAt?: string;
}

export interface CreateUserEventTemplateDto {
  name: string;
  description?: string;
  title: string;
  content: EventTemplateContent;
}

export function createTemplateContent(blocks: EventTemplateBlock[]): EventTemplateContent {
  return {
    time: Date.now(),
    blocks,
    version: '2.31.0',
  };
}

export function cloneTemplateContent(content: EventTemplateContent): EventTemplateContent {
  return JSON.parse(JSON.stringify(content)) as EventTemplateContent;
}

export function cloneTemplateSnapshot(snapshot: EventTemplateSnapshot): EventTemplateSnapshot {
  return {
    title: snapshot.title,
    content: cloneTemplateContent(snapshot.content),
  };
}

export function hasTemplateContent(content: EventTemplateContent | null | undefined): boolean {
  if (!content?.blocks?.length) {
    return false;
  }

  return content.blocks.some((block) => {
    const rawValues = Object.values(block.data ?? {});
    const flatValue = rawValues
      .flatMap((value) => (Array.isArray(value) ? value : [value]))
      .join(' ')
      .replace(/<[^>]+>/g, '')
      .trim();

    return flatValue.length > 0;
  });
}
