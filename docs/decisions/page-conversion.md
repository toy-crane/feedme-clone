# 페이지 가져오기와 Markdown 변환

## Decisions

- 대상 페이지는 브라우저가 아니라 서버가 가져옵니다.
- 본문 추출과 Markdown 변환은 `defuddle` 라이브러리로 합니다. Node에서는 `defuddle/node`에 DOM 구현(`linkedom`)을 함께 씁니다.
- `defuddle`에 넘기기 전에 응답 상태와 content-type을 먼저 확인하고, 추출 결과가 비어 있으면 오류로 다룹니다.
- `http`, `https` URL만 받습니다. localhost와 사설·링크로컬 IP를 직접 적은 URL(IPv4 `127.0.0.0/8`, `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `169.254.0.0/16`, `0.0.0.0`, IPv6 `::1`, `fc00::/7`, `fe80::/10`)은 가져오지 않습니다.

## Boundaries

- 도메인이 사설 IP로 풀리는 경우(DNS rebinding 등)까지 막지는 않습니다. 사용자가 정한 범위는 주소를 직접 적은 경우까지입니다.
- 서버는 받은 HTML만 다룹니다. 로그인이 필요하거나 JavaScript로만 본문을 그리는 페이지는 추출 대상이 아닙니다.
- 자동 접속을 막는 사이트(예: `news.hada.io`의 403)는 우회하지 않고 오류로 보여 줍니다.

## Why

브라우저에서 다른 도메인 페이지를 직접 받으면 CORS에 막힙니다. 서버가 사용자 대신 임의 URL을 가져오므로, 내부 주소를 막지 않으면 배포한 서버의 내부망에 닿을 수 있습니다.

`defuddle` 사용은 사용자가 정한 필수 조건입니다.

## Reconsider when

- `defuddle`이 오류 응답이나 빈 문서를 예외 없이 빈 결과로 돌려주도록 바뀌면 사전 확인을 줄일 수 있습니다.

## Still-rejected alternatives

- `defuddle.md` 호스팅 API — 사용자가 라이브러리 사용을 필수로 정했습니다.
- 헤드리스 브라우저로 JavaScript 렌더링 페이지까지 추출 — 학습용 템플릿 범위를 넘습니다.

## Evidence worth preserving

`defuddle` 0.19.6 + `linkedom`, Node 26.5.0에서 확인했습니다. 대상이 403/404 오류 본문이나 빈 문서를 돌려주면 `Cannot destructure property 'firstElementChild'` 예외를 던지고, PDF 같은 비HTML 응답은 예외 없이 빈 결과가 나옵니다.
