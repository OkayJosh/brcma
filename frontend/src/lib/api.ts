const BASE = import.meta.env.VITE_API_URL || "https://brcma.dependly.app/brcma";

export async function runBrcma(payload: any) {
  const r = await fetch(`${BASE}/api/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!r.ok) {
    const msg = await r.text();
    throw new Error(msg || `HTTP {r.status}`);
  }
  return r.json();
}
