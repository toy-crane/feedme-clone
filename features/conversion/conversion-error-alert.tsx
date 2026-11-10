import { CircleAlertIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import type { ConversionError } from "./types";

type ServerError = Exclude<ConversionError, { kind: "invalid-url" }>;

function describe(error: ServerError) {
  if (error.kind === "empty-content") {
    return {
      title: "본문을 찾지 못했습니다",
      description:
        "이 페이지에서 읽을 만한 본문을 추출하지 못했습니다. 자바스크립트로만 내용을 그리는 페이지는 변환되지 않을 수 있습니다.",
    };
  }
  const reason = error.status
    ? `${error.host}이(가) 요청을 거절했습니다(HTTP ${error.status}). 로그인이 필요하거나 자동 접근을 차단하는 사이트일 수 있습니다.`
    : `${error.host}에 접속하지 못했습니다. 사이트가 열려 있는지 확인해 주세요.`;
  return { title: "페이지를 가져오지 못했습니다", description: `${reason} 주소를 확인한 뒤 다시 시도해 주세요.` };
}

export function ConversionErrorAlert({ error }: { error: ServerError }) {
  const { title, description } = describe(error);
  return (
    <Alert variant="destructive">
      <CircleAlertIcon />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="text-muted-foreground">{description}</AlertDescription>
    </Alert>
  );
}
