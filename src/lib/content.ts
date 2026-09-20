import sanitizeHtml from 'sanitize-html';

/** The server owns the HTML allowlist. No scripts, embeds, styles or event handlers. */
export function cleanHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [
      'p',
      'br',
      'h2',
      'h3',
      'h4',
      'ul',
      'ol',
      'li',
      'blockquote',
      'strong',
      'em',
      'a',
      'figure',
      'figcaption',
      'img',
      'hr',
      'code',
      'pre',
      'table',
      'thead',
      'tbody',
      'tr',
      'th',
      'td',
    ],
    allowedAttributes: {
      a: ['href', 'title', 'rel'],
      img: ['src', 'alt', 'width', 'height', 'loading'],
    },
    allowedSchemes: ['https', 'http'],
    allowedSchemesByTag: { img: ['https'] },
    allowProtocolRelative: false,
    transformTags: {
      a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer' }),
      img: sanitizeHtml.simpleTransform('img', { loading: 'lazy' }),
    },
  });
}
export function xmlEscape(value: string): string {
  return value.replace(
    /[<>&"']/g,
    (c) =>
      ({
        '<': '&lt;',
        '>': '&gt;',
        '&': '&amp;',
        '"': '&quot;',
        "'": '&apos;',
      })[c]!,
  );
}
export function readingMinutes(html: string): number {
  return Math.max(
    1,
    Math.ceil(html.replace(/<[^>]*>/g, ' ').split(/\s+/).length / 200),
  );
}
export function absoluteUrl(path: string): string {
  return new URL(path, process.env.SITE_URL || 'https://durnoty.pl').href;
}
export function articleUrl(slug: string): string {
  return `/artykul/${slug}`;
}
