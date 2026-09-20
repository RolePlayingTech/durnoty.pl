import { z } from 'zod';

const schema = z.object({
  SITE_URL: z
    .string()
    .url()
    .default('https://durnoty.pl')
    .refine((value) => {
      const url = new URL(value);
      return (
        ['http:', 'https:'].includes(url.protocol) &&
        !url.username &&
        !url.password &&
        url.pathname === '/'
      );
    }, 'SITE_URL must be an HTTP(S) origin without credentials or a path'),
  DATABASE_PATH: z.string().min(1).default('./data/durnoty.sqlite'),
  MUMRO_CMS_SECRET: z.string().optional(),
  MUMRO_SITE_ID: z
    .string()
    .regex(/^$|^[1-9][0-9]*$/)
    .optional(),
});

/** Validate on server use; the build needs no production credentials. */
export function environment() {
  const parsed = schema.safeParse(process.env);
  if (!parsed.success)
    throw new Error(
      'Invalid server configuration. Check environment variable names and formats.',
    );
  if (
    process.env.NODE_ENV === 'production' &&
    (!parsed.data.MUMRO_CMS_SECRET || parsed.data.MUMRO_CMS_SECRET.length < 32)
  ) {
    throw new Error(
      'Production requires a CMS secret with at least 32 characters.',
    );
  }
  return parsed.data;
}
