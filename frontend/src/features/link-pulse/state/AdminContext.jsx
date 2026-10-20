import { createContext, useCallback, useEffect, useState } from "react";
import { useAuth } from "../../auth/hook/useAuth.js";
import { adminApi } from "../service/admin.api.js";

const AdminContext = createContext(null);

function AdminProvider({ children }) {
  const { token } = useAuth();
  const [overview, setOverview] = useState(null);
  const [recentLinks, setRecentLinks] = useState([]);
  const [users, setUsers] = useState([]);
  const [workspaces, setWorkspaces] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [blockedDomains, setBlockedDomains] = useState([]);
  const [links, setLinks] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [linksLoading, setLinksLoading] = useState(false);
  const [error, setError] = useState("");

  const loadLinks = useCallback(
    async (filters = {}) => {
      setLinksLoading(true);
      try {
        const response = await adminApi.links(token, filters);
        setLinks(response.data.links);
        setPagination(response.data.pagination);
        setError("");
      } catch (requestError) {
        setError(requestError.message);
      } finally {
        setLinksLoading(false);
      }
    },
    [token],
  );

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    const results = await Promise.allSettled([
      adminApi.analytics(token),
      adminApi.users(token),
      adminApi.workspaces(token),
      adminApi.campaigns(token),
      adminApi.blockedDomains(token),
      adminApi.links(token),
    ]);
    const failed = results.find((result) => result.status === "rejected");
    if (failed) setError(failed.reason.message);
    if (results[0].status === "fulfilled") {
      setOverview(results[0].value.data.overview);
      setRecentLinks(results[0].value.data.recentLinks);
    }
    if (results[1].status === "fulfilled")
      setUsers(results[1].value.data.users);
    if (results[2].status === "fulfilled")
      setWorkspaces(results[2].value.data.workspaces);
    if (results[3].status === "fulfilled")
      setCampaigns(results[3].value.data.campaigns);
    if (results[4].status === "fulfilled")
      setBlockedDomains(results[4].value.data.blockedDomains);
    if (results[5].status === "fulfilled") {
      setLinks(results[5].value.data.links);
      setPagination(results[5].value.data.pagination);
    }
    setLoading(false);
  }, [token]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const updateLinkStatus = async (id, status) => {
    setError("");
    try {
      await adminApi.updateLinkStatus(token, id, status);
      await Promise.all([refresh(), loadLinks({ page: pagination.page })]);
    } catch (requestError) {
      setError(requestError.message);
      throw requestError;
    }
  };

  const addBlockedDomain = async (domain) => {
    setError("");
    try {
      await adminApi.addBlockedDomain(token, domain);
      const response = await adminApi.blockedDomains(token);
      setBlockedDomains(response.data.blockedDomains);
      setOverview(
        (current) =>
          current && {
            ...current,
            totalBlockedDomains: response.data.pagination.total,
          },
      );
    } catch (requestError) {
      setError(requestError.message);
      throw requestError;
    }
  };

  const removeBlockedDomain = async (id) => {
    setError("");
    try {
      await adminApi.removeBlockedDomain(token, id);
      const response = await adminApi.blockedDomains(token);
      setBlockedDomains(response.data.blockedDomains);
      setOverview(
        (current) =>
          current && {
            ...current,
            totalBlockedDomains: response.data.pagination.total,
          },
      );
    } catch (requestError) {
      setError(requestError.message);
      throw requestError;
    }
  };

  return (
    <AdminContext.Provider
      value={{
        overview,
        recentLinks,
        users,
        workspaces,
        campaigns,
        blockedDomains,
        links,
        pagination,
        loading,
        linksLoading,
        error,
        setError,
        refresh,
        loadLinks,
        updateLinkStatus,
        addBlockedDomain,
        removeBlockedDomain,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export { AdminContext, AdminProvider };
