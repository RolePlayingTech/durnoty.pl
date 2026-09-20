import { z } from 'zod';

export const categories = [
  'historia',
  'natura',
  'internet',
  'kosmos',
  'laboratorium',
] as const;
export const categoryNames: Record<(typeof categories)[number], string> = {
  historia: 'Historia',
  natura: 'Natura robi swoje',
  internet: 'Internet',
  kosmos: 'Kosmos',
  laboratorium: 'Laboratorium',
};
export function safeImageUrl(value: string): boolean {
  if (/^\/art\/[a-z0-9/_\-.]+$/i.test(value)) return true;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password;
  } catch {
    return false;
  }
}
export const metadataSchema = z.object({
  category: z.enum(categories).default('internet'),
  absurdity: z.number().int().min(0).max(100).default(65),
  importance: z.number().int().min(0).max(100).default(20),
  kind: z.enum(['fact', 'satire', 'experiment']).default('fact'),
  author: z.string().trim().min(1).max(100).default('Redakcja Durnot'),
  sources: z
    .array(
      z.object({
        title: z.string().max(200),
        url: z
          .string()
          .url()
          .refine((v) => /^https?:\/\//.test(v)),
      }),
    )
    .max(20)
    .default([]),
  widget: z.enum(['quiz', 'potato', 'excuse']).optional(),
});
export const cmsSchema = z.object({
  article: z
    .object({
      id: z.number().int().positive(),
      external_id: z.string().max(128).nullable().optional(),
      title: z.string().trim().min(1).max(180),
      slug: z
        .string()
        .trim()
        .min(1)
        .max(180)
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
      excerpt: z.string().max(1000).nullable().optional(),
      content_html: z.string().max(200_000),
      status: z.enum(['draft', 'publish', 'future']),
      scheduled_at: z.string().datetime({ offset: true }).nullable().optional(),
      featured_image: z
        .object({
          url: z.string().refine(safeImageUrl),
          alt: z.string().max(500).nullable().optional(),
          caption: z.string().max(1000).nullable().optional(),
        })
        .nullable()
        .optional(),
      metadata: metadataSchema.default({}),
    })
    .superRefine((article, ctx) => {
      if (article.status === 'future' && !article.scheduled_at)
        ctx.addIssue({
          code: 'custom',
          path: ['scheduled_at'],
          message: 'Future articles require scheduled_at',
        });
    }),
  site: z.object({
    id: z.number().int().positive(),
    domain: z.string().max(255),
    site_url: z.string().url(),
    name: z.string().max(120).optional(),
  }),
});
export type Metadata = z.infer<typeof metadataSchema>;
export type CmsPayload = z.infer<typeof cmsSchema>;
export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content_html: string;
  image: string;
  image_alt: string;
  image_caption: string;
  metadata: Metadata;
  status: 'draft' | 'publish' | 'future';
  published_at: string;
  updated_at: string;
}
