export const parseRedirectUrl = (redirectUrl: string) => {
  if (!redirectUrl) return null;
  try {
    const url = new URL(redirectUrl);
    const parsedUrl = url.searchParams.get('q');
    return parsedUrl;
  } catch {
    return null;
  }
};
