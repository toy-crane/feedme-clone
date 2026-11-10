/** http(s)로 시작하고 호스트가 있는 웹 페이지 주소만 받는다. */
export function parseWebUrl(input: string): URL | null {
  const trimmed = input.trim();
  if (!/^https?:\/\//i.test(trimmed)) return null;
  try {
    const url = new URL(trimmed);
    return url.hostname ? url : null;
  } catch {
    return null;
  }
}
