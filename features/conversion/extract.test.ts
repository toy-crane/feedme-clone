import { describe, expect, it } from "vitest"

import { parseTargetUrl } from "./extract"

describe("parseTargetUrl", () => {
  it("http와 https 주소를 받아들인다", () => {
    expect(parseTargetUrl("https://react.dev/learn")?.href).toBe("https://react.dev/learn")
    expect(parseTargetUrl("  http://example.com  ")?.href).toBe("http://example.com/")
  })

  it("주소 형식이 아니면 거절한다", () => {
    expect(parseTargetUrl("react.dev 문서")).toBeNull()
    expect(parseTargetUrl("")).toBeNull()
    expect(parseTargetUrl("   ")).toBeNull()
  })

  it("http가 아닌 스킴은 거절한다", () => {
    expect(parseTargetUrl("javascript:alert(1)")).toBeNull()
    expect(parseTargetUrl("file:///etc/passwd")).toBeNull()
  })
})
