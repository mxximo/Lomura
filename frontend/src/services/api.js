const base = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
async function request(path, options = {}) {
  const response = await fetch(`${base}/api${path}`, {
    ...options,
    signal: AbortSignal.timeout(30000),
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });
  if (!response.ok) {
    const error = new Error(`API ${response.status}`);
    error.status = response.status;
    throw error;
  }
  return response.json();
}
const resources = new Map();
export function loadResource(name) {
  if (!resources.has(name))
    resources.set(
      name,
      request(`/${name}`).catch((error) => {
        resources.delete(name);
        throw error;
      }),
    );
  return resources.get(name);
}
export const loadContent = () =>
  loadResource("modules").then((modules) => ({ modules }));
export const submitQuiz = (answers) =>
  request("/quiz/submit", {
    method: "POST",
    body: JSON.stringify({ answers }),
  });
export const completeQuiz = (answers, submission_id, language) =>
  request("/quiz/complete", {
    method: "POST",
    body: JSON.stringify({ answers, submission_id, language }),
  });
export const sendSurvey = (payload) =>
  request("/surveys", { method: "POST", body: JSON.stringify(payload) });
export const adminRequest = (path, options = {}) =>
  request(`/admin${path}`, { ...options, credentials: "include" });
export async function exportResponses(
  query,
  resource = "export",
  filename = "bienestar-respuestas.csv",
) {
  const response = await fetch(`${base}/api/admin/${resource}?${query}`, {
    credentials: "include",
    signal: AbortSignal.timeout(60000),
  });
  if (!response.ok) {
    const error = new Error(`API ${response.status}`);
    error.status = response.status;
    throw error;
  }
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
