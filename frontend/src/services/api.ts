const API_BASE_URL = (import.meta as any).env.VITE_API_BASE_URL || "http://localhost:8000";

export async function fetchChimneyServices() {
  const response = await fetch(`${API_BASE_URL}/api/services`);
  if (!response.ok) {
    throw new Error("Failed to fetch services from the backend");
  }
  return response.json();
}