export type Article = {
  /** 사용자가 변환을 요청한 원본 URL */
  url: string;
  title: string;
  /** 페이지가 저자를 밝히지 않으면 빈 문자열 */
  author: string;
  site: string;
  wordCount: number;
  markdown: string;
};

export type ConversionError =
  | { kind: "invalid-url" }
  | { kind: "fetch-failed"; host: string; status?: number }
  | { kind: "empty-content" };

export type ConversionResult =
  | { ok: true; article: Article }
  | { ok: false; error: ConversionError };
