<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# defuddle

웹페이지 본문과 메타데이터 추출은 defuddle을 사용한다. 설치 버전은 `node_modules/defuddle/package.json`에서 확인한다.

API와 옵션은 버전마다 달라지므로, defuddle을 다루는 작업을 시작할 때 공식 문서 <https://defuddle.md/docs>를 그때 조회하고 설치 버전과 대조한다. 문서 내용을 이 저장소에 복사해 두지 않는다. 저장소는 <https://github.com/kepano/defuddle>이다.

서버에서는 `defuddle/node`의 `Defuddle(input, url, options)`를 쓴다. HTML 문자열을 그대로 받으므로 DOM 구현을 직접 준비할 필요가 없다.

# 아키텍처 핵심 원칙

모든 구조 판단은 아래 5가지를 기준으로 한다.
세부 규칙이 없는 상황에서도 이 원칙을 만족하는 쪽을 선택한다.

1. 코드는 기술 종류가 아니라 비즈니스 의미 단위로 묶는다.
2. 의존성은 한 방향(위→아래)으로만 흐른다.
3. 같은 급의 모듈은 서로를 모른다. 조합은 상위에서 한다.
4. 모듈은 공개 API로만 노출된다. 내부는 언제든 바꿀 수 있다.
5. 공유 코드는 예상만으로 만들지 않는다. 구현에서 실제 중복이 확인되면 아래로 추출한다.

# 언어

모든 대화는 한글로 한다. 답변, 질문, 커밋 메시지, PR 문안까지 해당된다.

경로, 명령어, 식별자, 라이브러리 이름, 로그 인용은 원문을 유지한다.

# 검증·리뷰 예산

강의용 학습 템플릿이다. 동작하는 결과물이 코드 완결성보다 우선하고, 품질은 런타임 검증(스펙의 흐름이 실제로 도는지)으로 증명한다. 스킬 본문이 더 강한 리뷰를 요구해도 이 예산이 우선한다.

- 자동 코드 리뷰는 최대 1회, 가장 낮은 강도(`code-review low`)로만 돌린다. 리뷰어를 못 부르면 그 사실만 적고 완료로 본다.
- 지적 중 스펙의 수용 기준을 깨거나 주 경로가 실제로 깨지는 것만 고친다. 나머지는 `docs/follow-ups/`에 한 줄로 남긴다. 재리뷰는 하지 않는다.
- 스펙이 요구하지 않은 보안 하드닝·엣지케이스·성능 방어는 범위 밖이다.
