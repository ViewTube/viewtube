export const parseAccessibilityDuration = (accessibilityText: string) => {
  const accessibilityDuration = accessibilityText.match(
    /^.*-\s((?:\d{1,2}\sminutes?)?(?:,\s)?(?:\d{1,2}\sseconds?)?)\s-\splay\svideo$/i
  );

  if (!accessibilityDuration) {
    return 0;
  }

  const durationText = accessibilityDuration[1];

  const minutes = durationText.match(/(\d{1,2})\sminutes?/i)?.[1];
  const seconds = durationText.match(/(\d{1,2})\sseconds?/i)?.[1];

  const duration = (minutes ? parseInt(minutes) * 60 : 0) + (seconds ? parseInt(seconds) : 0);

  return duration;
};
