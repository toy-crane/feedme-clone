# LLM으로 열기: navigator.clipboard가 없는 환경에서 안내 없이 실패

- 증상: HTTPS가 아닌 주소(예: `http://LAN-IP:3000`)에서 `ChatGPT로 열기`/`Claude로 열기`를 누르면 `navigator.clipboard`가 `undefined`라 `openInLlm`이 TypeError를 던지고, 토스트도 새 탭도 나타나지 않는다. (`components/converter/result-card.tsx`)
- 근거: code-review low 지적. 스펙 "남은 위험"(클립보드는 HTTPS/localhost에서만 동작)과 같은 범위이며 수용 기준은 localhost에서 통과했다.
- 추정 원인: `copy()`와 달리 `openInLlm`의 `writeText` 호출이 try/catch로 감싸져 있지 않다.
- 시도한 것: 없음(예산상 기록만).
- 다음 단계: `writeText` 호출을 try/catch로 감싸 실패 토스트를 보여 주고, 새 탭은 그대로 연다.
