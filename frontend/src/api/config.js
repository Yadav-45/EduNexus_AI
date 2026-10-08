export const DEFAULT_PRODUCTION_API_URL =
  "https://edunexus-ai-backend-xtct.onrender.com";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  (typeof window !== "undefined" &&
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1")
    ? "http://127.0.0.1:8000"
    : DEFAULT_PRODUCTION_API_URL);

export function getAuthToken() {
  if (typeof window === "undefined") {
    return "";
  }

  return (
    localStorage.getItem("access_token") ||
    localStorage.getItem("edunexus_token") ||
    localStorage.getItem("token") ||
    sessionStorage.getItem("access_token") ||
    sessionStorage.getItem("token") ||
    ""
  );
}
