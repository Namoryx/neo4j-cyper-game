export const API_BASE = window.API_BASE || 'https://your-worker.example.workers.dev';
export const RUN_URL = `${API_BASE}/run`;
export const SUBMIT_URL = `${API_BASE}/submit`;
export const SEED_URL = `${API_BASE}/seed`;
export const HEALTH_URL = `${API_BASE}/health`;

export async function apiFetch(url, options = {}) {
  const merged = {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  };

  try {
    const response = await fetch(url, merged);
    const text = await response.text();
    let data;
    try {
      data = text ? JSON.parse(text) : {};
    } catch (err) {
      throw new Error(`URL ${url} 응답을 JSON으로 파싱하지 못했습니다: ${err.message}\n응답 본문: ${text}`);
    }

    if (!response.ok) {
      const corsHint = '브라우저에서 CORS 차단이 발생했을 수 있습니다. GitHub Pages 도메인이 worker의 CORS 허용 목록에 포함되었는지 확인하세요.';
      throw new Error(`URL ${url} 요청 실패: HTTP ${response.status}. 메시지: ${data.error || response.statusText}. ${corsHint}`);
    }

    return data;
  } catch (error) {
    const corsHint = 'CORS 또는 네트워크 문제가 의심됩니다. 브라우저 콘솔 네트워크 탭과 worker CORS 설정을 확인하세요.';
    throw new Error(`URL ${url} 호출 중 오류: ${error.message}. ${corsHint}`);
  }
}
