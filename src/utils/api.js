const normalizeApiUrl = (value) => value.replace(/\/+$/, "");

const ensureApiPath = (value) => {
  const normalized = normalizeApiUrl(value);
  return normalized.endsWith("/api") ? normalized : `${normalized}/api`;
};

export const getApiCandidates = () => {
  const candidates = [];
  const configuredUrl = import.meta.env.VITE_API_URL?.trim();

  if (configuredUrl) {
    candidates.push(ensureApiPath(configuredUrl));
  }

  if (import.meta.env.DEV) {
    candidates.push("http://localhost:4001/api");
  }

  candidates.push("https://well-body-api.onrender.com/api");

  if (typeof window !== "undefined") {
    candidates.push(`${window.location.origin}/api`);
  }

  return [...new Set(candidates.filter(Boolean))];
};

export const resolveApiUrl = () => {
  const configuredUrl = import.meta.env.VITE_API_URL?.trim();

  if (configuredUrl) {
    return ensureApiPath(configuredUrl);
  }

  if (import.meta.env.DEV) {
    return "http://localhost:4001/api";
  }

  if (typeof window !== "undefined") {
    return `${window.location.origin}/api`;
  }

  return "/api";
};

export const getErrorMessage = async (response, fallbackMessage) => {
  try {
    const contentType = response.headers.get("content-type") || "";
    const text = await response.text();

    if (!text) return `${fallbackMessage} (HTTP ${response.status})`;
    if (contentType.includes("text/html")) {
      return `${fallbackMessage} (HTTP ${response.status})`;
    }

    try {
      const parsed = JSON.parse(text);
      if (parsed?.message) {
        return `${parsed.message} (HTTP ${response.status})`;
      }
    } catch {
      return `${text} (HTTP ${response.status})`;
    }

    return `${fallbackMessage} (HTTP ${response.status})`;
  } catch {
    return fallbackMessage;
  }
};
