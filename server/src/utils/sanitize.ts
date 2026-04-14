import sanitizeHtml from 'sanitize-html';

export const sanitize = (dirty: string): string => {
  return sanitizeHtml(dirty, {
    allowedTags: [],
    allowedAttributes: {},
    disallowedTagsMode: 'recursiveEscape',
  });
};

export const sanitizeMessage = (content: string): string => {
  // Strip all HTML, trim whitespace, limit length
  const cleaned = sanitize(content).trim();
  return cleaned.substring(0, 5000); // Max 5000 chars per message
};
