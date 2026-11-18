export type ConvertErrorCode =
  | "invalid"
  | "blocked"
  | "unreachable"
  | "http-status"
  | "not-html"
  | "empty";

export type ConvertErrorInfo = {
  title: string;
  description: string;
  /** 입력칸 아래 필드 오류로 보여 줄지, 결과 영역의 알림으로 보여 줄지 */
  placement: "field" | "alert";
};

export function describeError(
  code: ConvertErrorCode,
  status?: number
): ConvertErrorInfo {
  switch (code) {
    case "invalid":
      return {
        placement: "field",
        title: "주소 형식이 올바르지 않아요",
        description: "http:// 또는 https://로 시작하는 웹 페이지 주소를 넣어 주세요.",
      };
    case "blocked":
      return {
        placement: "alert",
        title: "가져올 수 없는 주소예요",
        description:
          "localhost나 사설망 IP 주소는 변환하지 않아요. 인터넷에 공개된 페이지 주소를 넣어 주세요.",
      };
    case "unreachable":
      return {
        placement: "alert",
        title: "페이지에 접속하지 못했어요",
        description:
          "주소가 맞는지 확인해 주세요. 사이트가 응답하지 않거나 시간이 너무 오래 걸렸을 수 있어요.",
      };
    case "http-status":
      return {
        placement: "alert",
        title: "페이지를 가져오지 못했어요",
        description:
          status === 403
            ? "사이트가 접근을 막았어요(403). 이 사이트는 자동으로 가져온 요청을 받지 않아요. 다른 주소로 다시 시도해 주세요."
            : `사이트가 오류를 돌려줬어요${status ? `(${status})` : ""}. 주소를 확인하고 다시 시도해 주세요.`,
      };
    case "not-html":
      return {
        placement: "alert",
        title: "본문을 찾지 못했어요",
        description:
          "이 주소는 웹 페이지가 아니에요(PDF 등). 글이 있는 웹 페이지 주소를 넣어 주세요.",
      };
    case "empty":
      return {
        placement: "alert",
        title: "본문을 찾지 못했어요",
        description:
          "페이지에서 읽을 수 있는 글을 찾지 못했어요. 로그인이 필요하거나 자바스크립트로만 그려지는 페이지일 수 있어요.",
      };
  }
}
