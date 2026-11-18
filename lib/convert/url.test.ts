import { expect, test } from "vitest";

import { parseConvertUrl } from "./url";

test.each(["ftp://example.com", "hello", "", "javascript:alert(1)"])(
  "http/https가 아닌 입력 %j는 형식 오류다",
  (input) => {
    expect(parseConvertUrl(input)).toEqual({ ok: false, reason: "invalid" });
  }
);

test.each([
  "http://localhost:3000",
  "http://foo.localhost",
  "http://127.0.0.1",
  "http://127.1.2.3/x",
  "http://10.0.0.5",
  "http://172.16.0.1",
  "http://172.31.255.255",
  "http://192.168.0.1",
  "http://169.254.169.254/latest",
  "http://0.0.0.0",
  "http://[::1]",
  "http://[fc00::1]",
  "http://[fd12:3456::1]",
  "http://[fe80::1]",
  "http://[::ffff:127.0.0.1]",
])("직접 적은 내부 주소 %s는 허용되지 않는 주소다", (input) => {
  expect(parseConvertUrl(input)).toEqual({ ok: false, reason: "blocked" });
});

test.each([
  "https://stephango.com/saw",
  "http://example.com/",
  "http://172.32.0.1",
  "http://8.8.8.8",
  "http://[2606:4700::1111]",
])("공개 주소 %s는 통과한다", (input) => {
  const result = parseConvertUrl(input);
  expect(result.ok).toBe(true);
});

test("앞뒤 공백은 무시한다", () => {
  const result = parseConvertUrl("  https://example.com/a  ");
  expect(result).toMatchObject({ ok: true });
  if (result.ok) expect(result.url.href).toBe("https://example.com/a");
});
