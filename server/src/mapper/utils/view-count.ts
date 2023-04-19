export const parseViewCount = (viewCount: string) => {
  let views = viewCount;
  if (views.includes('K')) {
    views = views.replace('K', '000');
  } else if (views.includes('M')) {
    views = views.replace('M', '000000');
  } else if (views.includes('B')) {
    views = views.replace('B', '000000000');
  }

  views = views.replace('views', '').replace(',', '').trim();
  return parseInt(views);
};
