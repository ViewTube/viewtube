import sanitizeHtml from 'sanitize-html';

export const sanitizeHtmlString = (html: string) => {
  return sanitizeHtml(html);
};
