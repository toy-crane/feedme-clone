# .md 다운로드 직후 Blob URL을 바로 해제함

- **증상 후보**: `features/export/export-actions.tsx`의 `handleDownload`가 `anchor.click()` 직후 `URL.revokeObjectURL`을 호출한다. 다운로드를 비동기로 시작하는 브라우저(Safari, Firefox)에서 긴 본문의 파일이 비거나 실패할 수 있다는 코드 리뷰 지적이다.
- **근거**: 리뷰어 추정이다. Chromium(Browser pane)에서는 문제를 재현하지 못했고, 다른 브라우저에서는 확인하지 않았다.
- **의심 원인**: 해제 시점이 다운로드 시작보다 빠르다.
- **시도한 것**: 없음.
- **다음 단계**: Safari·Firefox에서 6만 자 넘는 글로 다운로드를 확인한다. 재현되면 `setTimeout`으로 해제를 미룬다.
