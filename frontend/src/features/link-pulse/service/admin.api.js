const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1";

const request = async (path, token, options = {}) => {
  const headers = new Headers(options.headers);
  headers.set("Authorization", `Bearer ${token}`);
  if (options.body) headers.set("Content-Type", "application/json");

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      payload?.message || "The request failed. Please try again.",
    );
  }

  return payload;
};

const adminApi = {
  analytics: (token) => request("/admin/analytics", token),
  users: (token) => request("/admin/users", token),
  workspaces: (token) => request("/admin/workspaces", token),
  createWorkspace: (token, details) =>
    request("/admin/workspaces", token, {
      method: "POST",
      body: JSON.stringify(details),
    }),
  campaigns: (token) => request("/admin/campaigns", token),
  links: (token, { page = 1, limit = 25, search = "", status = "" } = {}) => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    if (search.trim()) params.set("search", search.trim());
    if (status) params.set("status", status);
    return request(`/admin/links?${params}`, token);
  },
  updateLinkStatus: (token, id, status) =>
    request(`/admin/links/${encodeURIComponent(id)}/status`, token, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
  blockedDomains: (token) => request("/admin/blocked-domains?limit=100", token),
  addBlockedDomain: (token, domain) =>
    request("/admin/blocked-domains", token, {
      method: "POST",
      body: JSON.stringify({ domain }),
    }),
  removeBlockedDomain: (token, id) =>
    request(`/admin/blocked-domains/${encodeURIComponent(id)}`, token, {
      method: "DELETE",
    }),
};

export { adminApi };
