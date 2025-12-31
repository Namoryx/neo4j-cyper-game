# 정적 배포 메모

이 프로젝트를 GitHub Pages 등 정적 호스팅에 올릴 때 발생했던 문제와 해결 방법을 정리합니다. 잊지 않고 동일한 방식으로 배포해주세요.

## 증상
- GitHub Pages에서 `https://<도메인>/src/main.jsx` 요청이 404로 실패하면서 `Failed to load module script` 오류가 콘솔에 표시됨.
- 자산 경로에 저장소명이 누락돼 JS/CSS를 불러오지 못하는 사례가 있음.

## 해결 원리
- Vite `base` 값을 저장소명으로 설정해 Pages 경로(`/username/repo-name/`)를 기준으로 자산 경로를 생성함.
- `index.html`은 **로컬 개발 시**에만 `/src/main.jsx`를 동적으로 삽입하고, 그 외 환경에서는 바로 빌드 산출물(`assets/app.js`, `assets/app.css`)을 불러온다. 이로써 외부 호스팅에서 `main.jsx`가 404로 떨어지는 문제를 사전에 차단한다.

## 배포 체크리스트
1. `vite.config.js`의 `base` 값이 저장소명(`/neo4j-cyper-game/`)으로 설정되어 있는지 확인합니다. GitHub Actions 환경 변수 `GITHUB_REPOSITORY`가 있다면 자동으로 맞춰집니다.
2. `npm run build`를 실행하면 `docs/`에 최신 번들이 생성됩니다. Pages 소스를 `docs/`로 지정하세요.
3. 배포 후 콘솔에 `main.jsx` 404가 보이면, Pages가 `docs/`를 바라보고 있는지와 `index.html`에 남아 있는 구버전 리다이렉트 스크립트가 없는지 확인합니다.
