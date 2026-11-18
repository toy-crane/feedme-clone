# LLM으로 넘기기

## Decisions

- ChatGPT·Claude로 열기는 내보낼 내용을 클립보드에 복사한 뒤 새 탭에서 `https://chatgpt.com/` 또는 `https://claude.ai/new`를 여는 방식으로 합니다. 사용자가 붙여넣도록 안내를 함께 보여 줍니다.
- 링크(URL 파라미터)에는 본문도 프롬프트도 싣지 않습니다.
- 사용자가 쓴 프롬프트는 LLM으로 열기에만 붙입니다. 복사하기와 `.md` 다운로드에는 붙이지 않습니다.

## Why

ChatGPT·Claude 웹의 `?q=` 프롬프트 채우기는 공식 문서가 없습니다. ChatGPT는 약 2,000자 한도라는 비공식 보고가 있고, Claude 웹 `?q=`는 2025년 10월 이후 동작하지 않는다는 보고가 있습니다. 변환된 본문은 쉽게 수만 자가 되므로(확인한 velog 글 약 26,000자) 길이와 상관없이 동작하는 방식을 사용자가 골랐습니다.

근거: [Simon Willison 블로그](https://simonwillison.net/b/8625), [Claude 지원 문서: 링크로 Claude 데스크톱 열기](https://support.claude.com/en/articles/14729294-open-claude-desktop-with-a-link)(데스크톱 딥링크 `q`가 약 14,000자에서 잘림), [OpenAI 커뮤니티: Query parameters in chatgpt](https://community.openai.com/t/query-parameters-in-chatgpt/1027747)

## Reconsider when

- OpenAI나 Anthropic이 웹 프롬프트 채우기 파라미터와 길이 한도를 공식 문서로 내놓을 때

## Still-rejected alternatives

- `?q=` 파라미터로 본문이나 프롬프트를 채워 여는 방식 — 위의 길이 한도와 동작 불확실성 때문입니다.
- ChatGPT·Claude에 본문을 자동 입력하거나 자동 전송하는 방식 — 공식 수단이 없고 사용자가 정한 방식이 아닙니다.
