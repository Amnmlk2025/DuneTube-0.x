export const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000";
export async function getHealth(): Promise<{status:string}> {
  const res = await fetch(`${API_BASE}/api/healthz`);
  if (!res.ok) throw new Error(`Health check failed: ${res.status}`);
  return res.json();
}
