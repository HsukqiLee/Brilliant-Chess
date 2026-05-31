const DEFAULT_DEV_API_BASE = "http://localhost:9080/api";

export function getApiBaseUrl() {
  const configured = process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/$/, "");
  if (configured) {
    return configured;
  }

  if (process.env.NODE_ENV !== "production") {
    return DEFAULT_DEV_API_BASE;
  }

  return "";
}

export function apiUrl(path: string) {
  const baseUrl = getApiBaseUrl();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  if (!baseUrl) {
    return normalizedPath;
  }
  return `${baseUrl}${normalizedPath}`;
}

export function apiWebSocketUrl(path: string) {
  const url = apiUrl(path);
  if (url.startsWith("http://")) {
    return url.replace(/^http:/, "ws:");
  }
  if (url.startsWith("https://")) {
    return url.replace(/^https:/, "wss:");
  }
  return url;
}
