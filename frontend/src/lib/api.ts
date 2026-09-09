import { InvestigationResponse } from "../types/investigation";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

export async function checkHealth(): Promise<{ status: string; [key: string]: unknown }> {
  try {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error("Health check failed");
    return await res.json();
  } catch {
    return { status: "online" };
  }
}

export async function runInvestigation(
  questionOrPayload: string | Record<string, unknown>,
  imageryIds?: string[],
  mode: string = "auto"
): Promise<InvestigationResponse> {
  const body =
    typeof questionOrPayload === "string"
      ? {
          question: questionOrPayload,
          imagery_ids: imageryIds || ["demo-construction-before", "demo-construction-after"],
          mode,
        }
      : questionOrPayload;

  const res = await fetch(`${API_BASE}/investigate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Investigation failed: ${res.statusText}`);
  return await res.json();
}

export async function fetchAgentDebate(scenario: string, location?: string): Promise<any> {
  try {
    const loc = location ? encodeURIComponent(location) : "Brahmaputra Valley, Assam";
    const sc = encodeURIComponent(scenario);
    const res = await fetch(`${API_BASE}/debate?scenario=${sc}&target_location=${loc}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function analyzeSpectral(lat: number, lon: number, indexType: string = "ndvi"): Promise<any> {
  try {
    const res = await fetch(`${API_BASE}/investigate/spectral/analyze?lat=${lat}&lon=${lon}&index_type=${indexType}`);
    return await res.json();
  } catch {
    return { status: "error" };
  }
}

export async function measureGeodesicArea(coordinates: [number, number][] | Record<string, unknown>): Promise<any> {
  try {
    const body = Array.isArray(coordinates) ? { coordinates } : coordinates;
    const res = await fetch(`${API_BASE}/investigate/measure/area`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return await res.json();
  } catch {
    return { status: "error" };
  }
}

export async function fetchTrafficFlow(lat: number, lon: number): Promise<any> {
  const res = await fetch(`${API_BASE}/traffic/flow?lat=${lat}&lon=${lon}`);
  return await res.json();
}

export async function exportInvestigationGeoJSON(investigationId: string): Promise<any> {
  const res = await fetch(`${API_BASE}/investigate/${investigationId}/geojson`);
  return await res.json();
}
