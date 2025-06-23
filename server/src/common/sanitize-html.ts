import sanitizeHtml from 'sanitize-html';

export const sanitizeHtmlString = (html: string): string => {
  if (!html) {
    return '';
  }
  return sanitizeHtml(html);
};
