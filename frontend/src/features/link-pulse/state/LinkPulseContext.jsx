import { createContext, useCallback, useEffect, useState } from "react";
import { useAuth } from "../../auth/hook/useAuth.js";
import { linkPulseApi } from "../service/linkPulse.api.js";

const LinkPulseContext = createContext(null);

function LinkPulseProvider({ children }) {
  const { token } = useAuth();
  const [workspaces, setWorkspaces] = useState([]);
  const [workspaceId, setWorkspaceId] = useState("");
  const [links, setLinks] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    if (!workspaceId) return;
    setLoading(true);
    setError("");
    try {
      const [linksResponse, campaignsResponse] = await Promise.all([
        linkPulseApi.links(token, workspaceId),
        linkPulseApi.campaigns(token, workspaceId),
      ]);
      setLinks(linksResponse.data.links);
      setCampaigns(campaignsResponse.data.campaigns);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, [token, workspaceId]);

  useEffect(() => {
    let active = true;
    linkPulseApi
      .workspaces(token)
      .then((response) => {
        if (!active) return;
        const nextWorkspaces = response.data.workspaces;
        setWorkspaces(nextWorkspaces);
        setWorkspaceId((currentId) =>
          nextWorkspaces.some((workspace) => workspace.id === currentId)
            ? currentId
            : (nextWorkspaces[0]?.id ?? ""),
        );
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [token]);

  useEffect(() => {
    if (workspaceId) void refresh();
  }, [refresh, workspaceId]);

  const createLink = async (details) => {
    setError("");
    try {
      const response = await linkPulseApi.createLink(token, {
        ...details,
        workspaceId,
      });
      await refresh();
      return response.data.link;
    } catch (requestError) {
      setError(requestError.message);
      throw requestError;
    }
  };

  const createWorkspace = async (name) => {
    setError("");
    try {
      const response = await linkPulseApi.createWorkspace(token, name);
      const workspace = response.data.workspace;
      setWorkspaces((currentWorkspaces) => [workspace, ...currentWorkspaces]);
      setWorkspaceId(workspace.id);
      return workspace;
    } catch (requestError) {
      setError(requestError.message);
      throw requestError;
    }
  };

  const createCampaign = async (name) => {
    setError("");
    try {
      const response = await linkPulseApi.createCampaign(token, {
        name,
        workspaceId,
      });
      await refresh();
      return response.data.campaign;
    } catch (requestError) {
      setError(requestError.message);
      throw requestError;
    }
  };

  const importLinks = async (file) => {
    setError("");
    try {
      const response = await linkPulseApi.importLinks(token, workspaceId, file);
      await refresh();
      return response.data.results;
    } catch (requestError) {
      setError(requestError.message);
      throw requestError;
    }
  };

  const updateLink = async (id, details) => {
    setError("");
    try {
      await linkPulseApi.updateLink(token, id, details);
      await refresh();
    } catch (requestError) {
      setError(requestError.message);
      throw requestError;
    }
  };

  const loadAnalytics = useCallback(
    (kind, id, period) =>
      kind === "campaign"
        ? linkPulseApi.campaignAnalytics(token, id, period)
        : linkPulseApi.linkAnalytics(token, id, period),
    [token],
  );

  const loadQrCode = useCallback(
    (id) => linkPulseApi.linkQrCode(token, id),
    [token],
  );

  return (
    <LinkPulseContext.Provider
      value={{
        workspaces,
        workspaceId,
        setWorkspaceId,
        links,
        campaigns,
        loading,
        error,
        setError,
        refresh,
        createWorkspace,
        createLink,
        importLinks,
        createCampaign,
        updateLink,
        loadAnalytics,
        loadQrCode,
      }}
    >
      {children}
    </LinkPulseContext.Provider>
  );
}

export { LinkPulseContext, LinkPulseProvider };
