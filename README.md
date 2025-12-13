# Neo4j Cypher Quest (GitHub Pages 버전)

한국어 UI로 즐길 수 있는 Neo4j Cypher 학습 게임입니다. GitHub Pages에서 정적 호스팅을 하고, Cloudflare Worker가 AuraDB와 통신합니다. 상단 진단 패널을 활용하면 헬스 체크, RETURN 1, 시드 삽입을 즉시 확인해 CORS/네트워크 문제를 추적할 수 있습니다.

## 빠른 시작 (로컬 미리보기)

1. 저장소 클론 후 의존성 없이 바로 정적 파일을 엽니다.
2. 로컬 서버 실행 (선택):
   ```bash
   npx http-server .
   # 또는 Python
   python -m http.server 8000
   ```
3. 브라우저에서 `http://localhost:8080` 또는 `http://localhost:8000`을 열고, 상단의 진단 패널에서 헬스체크/RETURN 1/Seed 버튼을 눌러 연결을 점검합니다.

## GitHub Pages 배포

1. `Settings > Pages`에서 소스 브랜치를 `main` 및 `/ (root)`로 설정합니다.
2. `index.html`과 `src/` 폴더가 자동으로 제공됩니다.
3. 배포 도메인을 Cloudflare Worker CORS 허용 목록(ALLOWED_ORIGINS)과 일치시킵니다.

## Cloudflare Worker 배포 (AuraDB 연결)

1. `worker/wrangler.toml`에 이름과 날짜를 원하는 값으로 업데이트합니다.
2. 환경 변수 설정:
   ```bash
   wrangler secrets put NEO4J_URI
   wrangler secrets put NEO4J_USER
   wrangler secrets put NEO4J_PASSWORD
   wrangler kv:namespace create neo4j-cypher-quests # (필요 시)
   ```
   - ALLOWED_ORIGINS 환경 변수로 GitHub Pages 도메인(또는 `*`)을 지정하세요.
3. 배포:
   ```bash
   cd worker
   wrangler deploy
   ```
4. Worker 엔드포인트 예시는 다음과 같습니다.
   - `https://<worker>.workers.dev/health`
   - `/run` (POST, 읽기 전용, LIMIT 강제)
   - `/submit` (POST, 읽기 전용, LIMIT 강제)
   - `/seed` (POST, 샘플 데이터 삽입)
   - `/reset` (POST, 필요 시 전체 데이터 초기화)

## 환경 변수

| 이름 | 설명 |
| --- | --- |
| `NEO4J_URI` | AuraDB Bolt URI (예: `neo4j+s://...`) |
| `NEO4J_USER` | AuraDB 사용자명 |
| `NEO4J_PASSWORD` | AuraDB 비밀번호 |
| `ALLOWED_ORIGINS` | CORS 허용 Origin. GitHub Pages 도메인을 입력하면 브라우저 CORS 오류를 방지할 수 있습니다. |

## 게임 화면 구성

- **연결 진단 패널**: /health, RETURN 1, Seed 버튼과 로그, 체크리스트로 네트워크/CORS 문제를 즉시 확인합니다.
- **퀘스트 패널**: 12개 이상의 챕터별 스토리/목표/제약/힌트/허용 연산을 제공합니다.
- **Cypher 입력/채점**: 작성한 쿼리를 실행하거나 제출하여 채점을 받고, 잘못된 경우 세 가지 유형의 피드백(실행 오류, 제약 위반, 결과 불일치)을 확인합니다.

## 실패 시 진단 절차

1. **헬스체크 실패**: Worker가 동작하는지, 환경 변수가 올바른지 확인합니다.
2. **RETURN 1 실패**: AuraDB 연결 또는 CORS 설정 문제일 수 있습니다. Worker 로그와 ALLOWED_ORIGINS 값을 점검하세요.
3. **Seed 실패**: AuraDB 권한(WRITE) 또는 연결 문제를 확인하세요. READ 전용 엔드포인트에서는 쓰기 쿼리가 차단됩니다.
4. 브라우저 개발자도구 네트워크 탭에서 4xx/5xx 응답과 CORS 헤더를 확인한 뒤, 같은 URL을 진단 패널로 다시 호출해 상태를 비교합니다.

## 코드 구조

- `index.html`: 한국어 UI, 진단 패널, 퀘스트/채점 화면
- `src/config.js`: API_BASE 및 /run, /submit, /seed, /health 엔드포인트 정의, 공통 apiFetch 래퍼
- `src/diagnostics.js`: 진단 패널 로직, 자동 체크리스트 업데이트
- `src/quests.js`: 12개 퀘스트 데이터(스토리, 목표, 제약, 힌트, validator, allowedOps)
- `src/checker.js`: 실행/제출 공통 처리, 제약 확인 및 3종 오답 피드백
- `src/app.js`: UI 바인딩, 퀘스트 전환, 결과 렌더링
- `src/storage.js`: 로컬 진행도 저장
- `worker/worker.js`: Cloudflare Worker, AuraDB 연결, CORS/OPTIONS 처리, READ/WRITE 제한, LIMIT 강제, 위험 쿼리 차단, 시드 삽입
- `worker/wrangler.toml`: Worker 설정 템플릿

## 테스트

- 정적 페이지는 브라우저에서 직접 열어 확인합니다.
- Worker는 배포 후 `curl -X GET https://<worker>.workers.dev/health` 로 헬스를 확인하세요.
