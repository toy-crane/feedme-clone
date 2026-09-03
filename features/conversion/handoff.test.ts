import { describe, expect, it } from "vitest"

import { composeHandoff, sourceLabels, toFileName } from "./handoff"
import type { ConversionSuccess } from "./types"

const base: ConversionSuccess = {
  kind: "converted",
  url: "https://react.dev/learn/thinking-in-react",
  title: "Thinking in React",
  author: "",
  site: "React",
  domain: "react.dev",
  published: "",
  wordCount: 2837,
  html: "<p>본문</p>",
  markdown: "본문",
}

describe("composeHandoff", () => {
  it("프롬프트를 고르면 본문 앞에 붙인다", () => {
    expect(composeHandoff("본문", "요약해줘")).toBe("요약해줘\n\n본문")
  })

  it("프롬프트를 고르지 않으면 본문만 넘긴다", () => {
    expect(composeHandoff("본문", "")).toBe("본문")
    expect(composeHandoff("본문", "   ")).toBe("본문")
  })
})

describe("toFileName", () => {
  it("제목으로 파일 이름을 만든다", () => {
    expect(toFileName("Thinking in React")).toBe("Thinking in React.md")
  })

  it("파일 이름에 쓸 수 없는 문자를 바꾼다", () => {
    expect(toFileName('a/b:c*d?e"f<g>h|i')).toBe("a-b-c-d-e-f-g-h-i.md")
  })

  it("제목이 비어 있으면 기본 이름을 쓴다", () => {
    expect(toFileName("   ")).toBe("document.md")
  })
})

describe("sourceLabels", () => {
  it("사이트명이 도메인에 담겨 있으면 도메인만 보여준다", () => {
    expect(sourceLabels(base)).toEqual(["react.dev"])
  })

  it("저자와 발행일이 있으면 함께 보여준다", () => {
    const labels = sourceLabels({
      ...base,
      author: "Dan Abramov",
      site: "overreacted",
      domain: "overreacted.io",
      published: "2019-03-09",
    })
    expect(labels).toEqual(["Dan Abramov", "overreacted.io", "2019-03-09"])
  })

  it("사이트명이 도메인과 다르면 둘 다 보여준다", () => {
    const labels = sourceLabels({ ...base, site: "React 공식 문서" })
    expect(labels).toEqual(["React 공식 문서", "react.dev"])
  })
})
