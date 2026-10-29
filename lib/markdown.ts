import { marked } from "marked";
import sanitizeHtml from "sanitize-html";

marked.setOptions({ gfm: true, breaks: false });

/** Renders extracted article markdown to sanitized HTML safe to inject into the page. */
export async function markdownToSafeHtml(markdown: string): Promise<string> {
  const rawHtml = await marked.parse(markdown);
  return sanitizeHtml(rawHtml, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img", "h1", "h2", "del"]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      img: ["src", "alt", "title"],
      a: ["href", "name", "title"],
      code: ["class", "data-lang"],
      pre: ["class", "data-lang"],
      "*": ["id"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", {
        rel: "noopener noreferrer",
        target: "_blank",
      }),
    },
  });
}

/** Slugifies a page title into a safe filename for the .md download. */
export function titleToFilename(title: string): string {
  const base = title.trim().replace(/\s+/g, "-").replace(/[\\/:*?"<>|]/g, "");
  return `${base || "markdown"}.md`;
}
