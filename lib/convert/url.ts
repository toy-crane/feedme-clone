export type ParsedConvertUrl =
  | { ok: true; url: URL }
  | { ok: false; reason: "invalid" | "blocked" };

/** 변환을 요청한 URL이 http/https인지, 내부 주소를 직접 가리키지 않는지 판단한다. */
export function parseConvertUrl(input: string): ParsedConvertUrl {
  let url: URL;
  try {
    url = new URL(input.trim());
  } catch {
    return { ok: false, reason: "invalid" };
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return { ok: false, reason: "invalid" };
  }
  if (isBlockedHost(url.hostname)) return { ok: false, reason: "blocked" };
  return { ok: true, url };
}

function isBlockedHost(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (host === "localhost" || host.endsWith(".localhost")) return true;
  if (host.includes(":")) return isBlockedIpv6(host);
  return isBlockedIpv4(host);
}

function isBlockedIpv4(host: string): boolean {
  const match = host.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
  if (!match) return false;
  const [a, b] = [Number(match[1]), Number(match[2])];
  return (
    a === 127 ||
    a === 10 ||
    a === 0 ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 169 && b === 254)
  );
}

function isBlockedIpv6(host: string): boolean {
  if (host === "::1" || host === "::") return true;
  // IPv4-mapped 주소(::ffff:7f00:1)는 안에 든 IPv4로 판단한다.
  const mapped = host.match(/^::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/);
  if (mapped) {
    const hi = parseInt(mapped[1], 16);
    const lo = parseInt(mapped[2], 16);
    return isBlockedIpv4(`${hi >> 8}.${hi & 255}.${lo >> 8}.${lo & 255}`);
  }
  const first = host.split(":")[0];
  if (first === "") return false;
  const head = parseInt(first, 16);
  // fc00::/7 (고유 로컬), fe80::/10 (링크 로컬)
  return (head & 0xfe00) === 0xfc00 || (head & 0xffc0) === 0xfe80;
}
