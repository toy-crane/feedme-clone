import { convertPage } from "@/lib/convert/convert-page";
import { parseConvertUrl } from "@/lib/convert/url";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    url?: unknown;
  } | null;
  const parsed = parseConvertUrl(typeof body?.url === "string" ? body.url : "");
  if (!parsed.ok) {
    return Response.json({ error: parsed.reason }, { status: 400 });
  }

  const result = await convertPage(parsed.url);
  if (!result.ok) {
    return Response.json(result.error === "http-status"
      ? { error: result.error, status: result.status }
      : { error: result.error }, { status: 422 });
  }
  return Response.json({
    title: result.title,
    author: result.author,
    markdown: result.markdown,
    sourceUrl: parsed.url.href,
  });
}
