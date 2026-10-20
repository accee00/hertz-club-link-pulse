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

const linkPulseApi = {
  workspaces: (token) => request("/workspaces", token),
  links: (token, workspaceId) =>
    request(`/links?workspaceId=${encodeURIComponent(workspaceId)}`, token),
  campaigns: (token, workspaceId) =>
    request(`/campaigns?workspaceId=${encodeURIComponent(workspaceId)}`, token),
  createLink: (token, details) =>
    request("/links", token, {
      method: "POST",
      body: JSON.stringify(details),
    }),
  updateLink: (token, id, details) =>
    request(`/links/${encodeURIComponent(id)}`, token, {
      method: "PATCH",
      body: JSON.stringify(details),
    }),
  createCampaign: (token, details) =>
    request("/campaigns", token, {
      method: "POST",
      body: JSON.stringify(details),
    }),
  linkAnalytics: (token, id, period) =>
    request(
      `/links/${encodeURIComponent(id)}/analytics?period=${period}`,
      token,
    ),
  campaignAnalytics: (token, id, period) =>
    request(
      `/campaigns/${encodeURIComponent(id)}/analytics?period=${period}`,
      token,
    ),
  linkQrCode: (token, id) =>
    request(`/links/${encodeURIComponent(id)}/qr`, token),
};

export { linkPulseApi };
