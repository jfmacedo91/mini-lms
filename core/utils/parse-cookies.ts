export function parseCookies(cookieHeader: string | undefined) {
  const cookies:Record<string, string | undefined> = {};
  if(!cookieHeader) return cookies;

  const cookiePairs = cookieHeader.split(";");
  for(const segment of cookiePairs) {
    const pair = segment.trim();
    if(!pair) continue;
    const index = pair.indexOf("=");
    const key = index === -1 ? pair : pair.slice(0, index).trim();
    if(!key) continue;
    const value = index === -1 ? "" : pair.slice(index + 1).trim();
    cookies[key] = value;
  }

  return cookies;
};