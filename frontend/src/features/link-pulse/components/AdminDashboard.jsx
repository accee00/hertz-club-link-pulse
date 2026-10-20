import { useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Ban,
  BarChart3,
  Building2,
  ChevronLeft,
  ChevronRight,
  FolderKanban,
  Globe2,
  Link2,
  LogOut,
  Search,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useAuth } from "../../auth/hook/useAuth.js";
import { useAdmin } from "../hook/useAdmin.js";
import { AdminProvider } from "../state/AdminContext.jsx";

const sections = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "links", label: "All links", icon: Link2 },
  { id: "users", label: "Users", icon: Users },
  { id: "workspaces", label: "Workspaces", icon: Building2 },
  { id: "campaigns", label: "Campaigns", icon: FolderKanban },
  { id: "blocklist", label: "Domain blocklist", icon: ShieldCheck },
];

const number = (value) => (value || 0).toLocaleString();
const date = (value) => (value ? new Date(value).toLocaleDateString() : "—");

function AdminDashboard() {
  const { user, logout } = useAuth();
  const {
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
    createWorkspace,
    addBlockedDomain,
    removeBlockedDomain,
  } = useAdmin();
  const [section, setSection] = useState("overview");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [domain, setDomain] = useState("");
  const [domainSubmitting, setDomainSubmitting] = useState(false);
  const [busyLink, setBusyLink] = useState(null);
  const [workspaceName, setWorkspaceName] = useState("");
  const [workspaceOwnerId, setWorkspaceOwnerId] = useState("");
  const [workspaceSubmitting, setWorkspaceSubmitting] = useState(false);
  const activeSection = sections.find((item) => item.id === section);

  const searchLinks = (event) => {
    event.preventDefault();
    void loadLinks({ search, status, page: 1 });
  };

  const changeSection = (next) => {
    setSection(next);
    if (next === "links") void loadLinks({ search, status, page: 1 });
  };

  const submitDomain = async (event) => {
    event.preventDefault();
    setDomainSubmitting(true);
    try {
      await addBlockedDomain(domain.trim());
      setDomain("");
    } catch {
      // The admin provider exposes the API error in the dashboard alert.
    } finally {
      setDomainSubmitting(false);
    }
  };

  const toggleLink = async (link) => {
    setBusyLink(link.id);
    try {
      await updateLinkStatus(
        link.id,
        link.status === "active" ? "disabled" : "active",
        { search, status, page: pagination.page },
      );
    } catch {
      // The admin provider exposes the API error in the dashboard alert.
    } finally {
      setBusyLink(null);
    }
  };

  const submitWorkspace = async (event) => {
    event.preventDefault();
    setWorkspaceSubmitting(true);
    try {
      await createWorkspace({
        name: workspaceName.trim(),
        ownerId: workspaceOwnerId,
      });
      setWorkspaceName("");
      setWorkspaceOwnerId("");
    } catch {
      // The admin provider exposes the API error in the dashboard alert.
    } finally {
      setWorkspaceSubmitting(false);
    }
  };

  return (
    <div className="[display:flex] [min-height:100vh] [background:#f7f8f5] [--admin-accent:#9a7448] [--admin-dark:#60482f]">
      <aside className="[position:fixed] [z-index:5] [inset:0_auto_0_0] [display:flex] [width:248px] [flex-direction:column] [padding:26px_17px_16px] [border-right:1px_solid_#e8ebe5] [background:#fff] max-[850px]:[width:205px] max-[850px]:[padding-right:12px] max-[850px]:[padding-left:12px] max-[600px]:[display:none]">
        <a className="[display:flex] [align-items:center] [gap:11px] [padding:2px_9px_29px] [color:#23332d] [font-size:14px] [font-weight:800] [letter-spacing:1.1px] [text-decoration:none] [font-family:'Manrope',_sans-serif] [padding-bottom:20px]" href="/dashboard">
          <span className="[color:var(--pulse-green)] [display:grid] [width:36px] [height:36px] [place-items:center] [border-radius:11px] [background:var(--pulse-green)] [color:var(--pulse-lime)] [background:#685039] [color:#f0d6a4]">
            <Activity size={20} />
          </span>
          <span className="[color:var(--pulse-green)]">
            LINK<span className="[color:var(--pulse-green)]">PULSE</span>
          </span>
        </a>
        <div className="select-none [display:flex] [align-items:center] [gap:8px] [margin:0_4px_22px] [padding:11px_10px] [border:1px_solid_#eee6dc] [border-radius:5px] [background:#faf7f1] [color:#826744] [font-size:9px] [font-weight:800] [letter-spacing:1px]">
          <ShieldCheck size={14} /> ADMIN CONSOLE
        </div>
        <span className="[color:#9ba49f] [font-size:9px] [font-weight:800] [letter-spacing:1.35px] [padding:0_12px_10px]">PLATFORM</span>
        <nav className="[display:grid] [gap:4px]" aria-label="Admin navigation">
          {sections.map(({ id, label, icon: Icon }) => (
            <button
              aria-current={section === id ? "page" : undefined}
              className={`[display:flex] [min-height:43px] [align-items:center] [gap:12px] [padding:0_12px] [border:0] [border-radius:5px] [background:transparent] [color:#69756f] [cursor:pointer] [text-align:left] [font-size:13px] [font-weight:600] [transition:color_.16s,_background_.16s] [&:hover]:[background:#f5f7f3] [&:hover]:[color:var(--pulse-green)] ${
                section === id
                  ? "[background:#f5f0e8] [color:#644e35] [&>svg]:[color:#987247] [&:hover]:[background:#f5f0e8] [&:hover]:[color:#644e35] [&:hover>svg]:[color:#987247]"
                  : ""
              }`}
              key={id}
              onClick={() => changeSection(id)}
              type="button"
            >
              <Icon size={17} />
              <span>{label}</span>
              {id === "blocklist" && overview?.totalBlockedDomains > 0 && (
                <span className="[display:grid] [min-width:20px] [height:20px] [place-items:center] [margin-left:auto] [border-radius:10px] [background:#f3eee6] [color:#876d4c] [font-size:9px]">
                  {overview.totalBlockedDomains}
                </span>
              )}
            </button>
          ))}
        </nav>
        <div className="[margin-top:auto]">
          <div className="[padding:15px_13px] [border:1px_solid_#eee9e0] [border-radius:6px] [background:linear-gradient(145deg,_#fcfaf6,_#f7f4ed)]">
            <span className="[display:grid] [width:30px] [height:30px] [place-items:center] [border-radius:7px] [background:#eee7d9] [color:#866b44]">
              <ShieldCheck size={17} />
            </span>
            <strong className="[display:block] [margin-top:11px] [color:#504435] [font-size:12px] [font-family:'Manrope',_sans-serif]">Platform safety</strong>
            <p className="[margin:5px_0_0] [color:#91897c] [font-size:10px] [line-height:1.55]">
              Review suspicious links and manage blocked domains from one place.
            </p>
          </div>
          <div className="[display:flex] [align-items:center] [gap:9px] [margin-top:15px] [padding:14px_1px_0] [border-top:1px_solid_#eff1ed]">
            <span className="[display:grid] [width:34px] [height:34px] [flex:0_0_34px] [place-items:center] [border-radius:50%] [background:#e7eee0] [color:var(--pulse-green)] [font-size:13px] [font-weight:800] [background:#f0e8dc] [color:#80603a]">
              {user.name.slice(0, 1).toUpperCase()}
            </span>
            <span className="[display:grid] [min-width:0] [gap:3px] [flex:1]">
              <strong className="[overflow:hidden] [color:#33413a] [text-overflow:ellipsis] [white-space:nowrap] [font-size:11px]">{user.name}</strong>
              <span className="[overflow:hidden] [color:#8a948e] [text-overflow:ellipsis] [white-space:nowrap] [font-size:10px]">Platform administrator</span>
            </span>
            <button
              aria-label="Sign out"
              className="[display:inline-grid] [width:38px] [height:38px] [place-items:center] [border:0] [border-radius:50%] [background:transparent] [color:#687570] [cursor:pointer] [&:hover]:[background:#edf0eb] [&:hover]:[color:var(--green-dark)] [width:33px] [height:33px]"
              onClick={logout}
              title="Sign out"
              type="button"
            >
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </aside>
      <main className="[width:calc(100%_-_248px)] [min-height:100vh] [margin-left:248px] max-[850px]:[width:calc(100%_-_205px)] max-[850px]:[margin-left:205px] max-[600px]:[width:100%] max-[600px]:[margin-left:0]">
        <header className="[position:sticky] [z-index:4] [top:0] [display:flex] [height:64px] [align-items:center] [justify-content:space-between] [padding:0_clamp(24px,4.2vw,64px)] [border-bottom:1px_solid_#e9ece7] [background:rgba(255,255,255,.94)] [backdrop-filter:blur(12px)] max-[600px]:[height:56px] max-[600px]:[padding:0_16px]">
          <div className="[display:none] [align-items:center] [gap:7px] [color:var(--pulse-green)] [font-size:12px] [font-weight:800] [letter-spacing:.5px] max-[600px]:[display:inline-flex]">
            <Activity size={18} /> LINK PULSE <span className="max-[600px]:[padding:3px_5px] max-[600px]:[border-radius:3px] max-[600px]:[background:#f5f0e8] max-[600px]:[color:#8a704e] max-[600px]:[font-size:8px]">ADMIN</span>
          </div>
          <div className="[display:flex] [align-items:center] [gap:10px] [color:#99a19c] [font-size:11px] max-[600px]:[display:none]">
            <span>Platform</span>
            <span>/</span>
            <strong className="[color:#3a4841] [font-weight:700]">{activeSection?.label}</strong>
          </div>
          <span className="[display:inline-flex] [align-items:center] [gap:6px] [color:#92764e] [font-size:9px] [font-weight:800] [letter-spacing:.8px] max-[600px]:[display:none]">
            <ShieldCheck size={14} /> ADMIN ACCESS
          </span>
        </header>
        <nav
          aria-label="Mobile admin navigation"
          className="[display:none] max-[600px]:[display:flex] [gap:5px] [overflow-x:auto] [padding:8px_16px] [border-bottom:1px_solid_#e9ece7] [background:#fff]"
        >
          {sections.map(({ id, label, icon: Icon }) => (
            <button
              aria-current={section === id ? "page" : undefined}
              className={`[display:inline-flex] [min-height:34px] [align-items:center] [gap:6px] [padding:0_10px] [border:1px_solid_#e5e9e3] [border-radius:5px] [background:#fff] [color:#69756f] [white-space:nowrap] [font-size:10px] ${
                section === id
                  ? "[border-color:#e5d8c3] [background:#f5f0e8] [color:#644e35]"
                  : ""
              }`}
              key={id}
              onClick={() => changeSection(id)}
              type="button"
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </nav>
        <div className="[width:min(100%,1440px)] [min-height:calc(100vh_-_64px)] [margin:0_auto] [padding:0_clamp(24px,4.2vw,64px)] max-[850px]:[padding-right:22px] max-[850px]:[padding-left:22px] max-[600px]:[padding:0_16px]">
          {error && (
            <div className="[display:flex] [align-items:center] [justify-content:space-between] [gap:14px] [margin-top:17px] [padding:12px_14px] [border:1px_solid_#efd2ca] [border-radius:5px] [background:#fff4f0] [color:#8b4033] [font-size:12px]" role="alert">
              <span>{error}</span>
              <button className="[padding:5px_8px] [border:0] [background:transparent] [color:#874333] [cursor:pointer] [font-size:11px] [font-weight:700] [text-decoration:underline]"
                onClick={() => {
                  setError("");
                  void refresh();
                }}
                type="button"
              >
                Refresh data
              </button>
            </div>
          )}
          {section === "overview" && (
            <section className="[padding:29px_0_35px] max-[600px]:[padding-top:22px]">
              <div className="[display:flex] [align-items:end] [justify-content:space-between] [gap:20px] [margin:2px_0_23px] max-[600px]:[align-items:start] max-[600px]:[flex-direction:column] max-[600px]:[gap:12px]">
                <div>
                  <p className="[margin:0_0_13px] [color:var(--green)] [font-size:10px] [font-weight:700] [letter-spacing:1.8px] [&:last-child]:[margin:8px_0_0] [&:last-child]:[color:#818c84] [&:last-child]:[font-size:12px] [margin:0_0_8px] [color:#8c704c] [font-size:9px]">PLATFORM HEALTH</p>
                  <h1 className="[margin:0] [color:#2d3832] [font-size:clamp(26px,2.5vw,35px)] [font-weight:650] [letter-spacing:-.5px] [font-family:'Manrope',sans-serif] max-[600px]:[font-size:27px]">Admin overview.</h1>
                  <p className="[&:last-child]:[margin:8px_0_0] [&:last-child]:[color:#818c84] [&:last-child]:[font-size:12px]">Monitor Link Pulse activity, accounts, and link safety.</p>
                </div>
                <span className="[color:#95a099] [font-size:9px] [font-weight:800] [letter-spacing:1px] [display:inline-flex] [align-items:center] [gap:7px] [color:#75827a] max-[600px]:[font-size:8px]">
                  <i className="[width:6px] [height:6px] [border-radius:50%] [background:#6bac64] [box-shadow:0_0_0_3px_#e9f2e5]" /> LIVE PLATFORM DATA
                </span>
              </div>
              <div className="[display:grid] [grid-template-columns:repeat(4,minmax(0,1fr))] [gap:11px] [margin-bottom:18px] max-[1100px]:[grid-template-columns:repeat(2,minmax(0,1fr))] max-[600px]:[gap:8px]">
                {[
                  ["TOTAL USERS", overview?.totalUsers, Users],
                  ["WORKSPACES", overview?.totalWorkspaces, Building2],
                  ["TOTAL LINKS", overview?.totalLinks, Link2],
                  ["LIFETIME CLICKS", overview?.totalClicksLifetime, BarChart3],
                  ["ACTIVE LINKS", overview?.activeLinks, Activity],
                  ["DISABLED LINKS", overview?.disabledLinks, Ban],
                  ["CAMPAIGNS", overview?.totalCampaigns, FolderKanban],
                  [
                    "BLOCKED DOMAINS",
                    overview?.totalBlockedDomains,
                    ShieldCheck,
                  ],
                ].map(([label, value, Icon]) => (
                  <article className="[position:relative] [display:grid] [min-height:108px] [align-content:start] [gap:8px] [padding:15px] [border:1px_solid_#e8ebe5] [border-radius:5px] [background:#fff] max-[600px]:[min-height:100px] max-[600px]:[padding:12px]" key={label}>
                    <span className="[position:absolute] [top:12px] [right:13px] [display:grid] [width:28px] [height:28px] [place-items:center] [border-radius:7px] [background:#f5f1e9] [color:#92764f]">
                      <Icon size={17} />
                    </span>
                    <span className="[color:#96a099] [font-size:9px] [font-weight:800] [letter-spacing:1.1px] max-[600px]:[font-size:8px]">{label}</span>
                    <strong className="[margin-top:2px] [color:#303d35] [font-size:24px] [font-family:'Manrope',sans-serif] max-[600px]:[font-size:22px]">
                      {loading && value === undefined ? "—" : number(value)}
                    </strong>
                  </article>
                ))}
              </div>
              <section className="[overflow:hidden] [border:1px_solid_#e7eae4] [border-radius:5px] [background:#fff]">
                <div className="[display:flex] [min-height:65px] [align-items:center] [justify-content:space-between] [gap:15px] [padding:12px_17px] [border-bottom:1px_solid_#edf0eb]">
                  <div>
                    <h2 className="[margin:0] [color:#39463e] [font-size:13px] [font-family:'Manrope',sans-serif]">Recently created links</h2>
                    <p className="[margin:5px_0_0] [color:#9aa39c] [font-size:9px]">Latest short links across all workspaces</p>
                  </div>
                  <button
                    className="[display:inline-flex] [align-items:center] [gap:4px] [margin-top:7px] [padding:0] [border:0] [background:none] [color:var(--pulse-green)] [cursor:pointer] [font-size:11px] [font-weight:700] [margin:0] [white-space:nowrap]"
                    onClick={() => changeSection("links")}
                    type="button"
                  >
                    Review all <ArrowUpRight size={15} />
                  </button>
                </div>
                <div className="[overflow-x:auto]">
                  <table className="[width:100%] [border-collapse:collapse] [text-align:left] [font-size:10px]">
                    <thead>
                      <tr>
                        <th className="[padding:12px_14px] [border-bottom:1px_solid_#edf0eb] [background:#fbfcfa] [color:#9aa39c] [font-size:8px] [letter-spacing:.7px] [white-space:nowrap]">SHORT CODE</th>
                        <th className="[padding:12px_14px] [border-bottom:1px_solid_#edf0eb] [background:#fbfcfa] [color:#9aa39c] [font-size:8px] [letter-spacing:.7px] [white-space:nowrap]">DESTINATION</th>
                        <th className="[padding:12px_14px] [border-bottom:1px_solid_#edf0eb] [background:#fbfcfa] [color:#9aa39c] [font-size:8px] [letter-spacing:.7px] [white-space:nowrap]">WORKSPACE</th>
                        <th className="[padding:12px_14px] [border-bottom:1px_solid_#edf0eb] [background:#fbfcfa] [color:#9aa39c] [font-size:8px] [letter-spacing:.7px] [white-space:nowrap]">CLICKS</th>
                        <th className="[padding:12px_14px] [border-bottom:1px_solid_#edf0eb] [background:#fbfcfa] [color:#9aa39c] [font-size:8px] [letter-spacing:.7px] [white-space:nowrap]">CREATED</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentLinks.map((link) => (
                        <tr key={link.id}>
                          <td className="[max-width:260px] [padding:12px_14px] [border-bottom:1px_solid_#f0f2ee] [color:#6e7971] [white-space:nowrap] [border-bottom:0]">
                            <span className="[color:#416d52] [font-weight:700]">
                              /{link.shortCode}
                            </span>
                          </td>
                          <td
                            className="[max-width:260px] [padding:12px_14px] [border-bottom:1px_solid_#f0f2ee] [color:#6e7971] [white-space:nowrap] [border-bottom:0] [overflow:hidden] [text-overflow:ellipsis] [max-width:250px]!"
                            title={link.destinationUrl}
                          >
                            {link.destinationUrl}
                          </td>
                          <td className="[max-width:260px] [padding:12px_14px] [border-bottom:1px_solid_#f0f2ee] [color:#6e7971] [white-space:nowrap] [border-bottom:0]">{link.workspaceName || "—"}</td>
                          <td className="[max-width:260px] [padding:12px_14px] [border-bottom:1px_solid_#f0f2ee] [color:#6e7971] [white-space:nowrap] [border-bottom:0]">{number(link.totalClicks)}</td>
                          <td className="[max-width:260px] [padding:12px_14px] [border-bottom:1px_solid_#f0f2ee] [color:#6e7971] [white-space:nowrap] [border-bottom:0]">{date(link.createdAt)}</td>
                        </tr>
                      ))}
                      {!recentLinks.length && (
                        <tr>
                          <td className="[max-width:260px] [padding:12px_14px] [border-bottom:1px_solid_#f0f2ee] [color:#6e7971] [white-space:nowrap] [border-bottom:0] [max-width:none] [padding:30px_14px] [color:#98a29b] [text-align:center]" colSpan="5">
                            {loading
                              ? "Loading platform links…"
                              : "No links have been created yet."}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </section>
          )}
          {section === "links" && (
            <section className="[padding:29px_0_35px] max-[600px]:[padding-top:22px]">
              <div className="[display:flex] [align-items:end] [justify-content:space-between] [gap:20px] [margin:2px_0_23px] max-[600px]:[align-items:start] max-[600px]:[flex-direction:column] max-[600px]:[gap:12px]">
                <div>
                  <p className="[margin:0_0_13px] [color:var(--green)] [font-size:10px] [font-weight:700] [letter-spacing:1.8px] [&:last-child]:[margin:8px_0_0] [&:last-child]:[color:#818c84] [&:last-child]:[font-size:12px] [margin:0_0_8px] [color:#8c704c] [font-size:9px]">PLATFORM GOVERNANCE</p>
                  <h1 className="[margin:0] [color:#2d3832] [font-size:clamp(26px,2.5vw,35px)] [font-weight:650] [letter-spacing:-.5px] [font-family:'Manrope',sans-serif] max-[600px]:[font-size:27px]">All short links.</h1>
                  <p className="[&:last-child]:[margin:8px_0_0] [&:last-child]:[color:#818c84] [&:last-child]:[font-size:12px]">
                    Review every workspace link and disable suspicious
                    redirects.
                  </p>
                </div>
                <span className="[display:inline-flex] [align-items:center] [gap:6px] [padding:8px_10px] [border:1px_solid_#e9e6de] [border-radius:4px] [color:#85785f] [font-size:9px] [font-weight:800] [letter-spacing:.8px] [white-space:nowrap]">
                  {number(pagination.total)} TOTAL
                </span>
              </div>
              <form className="[display:flex] [align-items:center] [gap:9px] [margin-bottom:13px] max-[600px]:[flex-wrap:wrap]" onSubmit={searchLinks}>
                <label className="[display:flex] [width:min(100%,_340px)] [height:38px] [align-items:center] [gap:9px] [padding:0_11px] [border:1px_solid_#e4e9e2] [border-radius:5px] [background:#fff] [color:#8d9891] [flex:1] max-[600px]:[width:100%] max-[600px]:[min-width:100%]">
                  <Search size={16} />
                  <input className="[width:100%] [border:0] [outline:none] [background:transparent] [color:var(--ink)] [font-size:11px] [&::placeholder]:[color:#a1aaa5]"
                    aria-label="Search all links"
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search short codes or destinations"
                    value={search}
                  />
                </label>
                <select className="[height:38px] [padding:0_11px] [border:1px_solid_#e4e9e2] [border-radius:5px] [background:#fff] [color:#647067] [font-size:10px] max-[600px]:[flex:1]"
                  aria-label="Filter link status"
                  onChange={(event) => {
                    const nextStatus = event.target.value;
                    setStatus(nextStatus);
                    void loadLinks({ search, status: nextStatus, page: 1 });
                  }}
                  value={status}
                >
                  <option value="">All statuses</option>
                  <option value="active">Active</option>
                  <option value="disabled">Disabled</option>
                </select>
                <button className="[display:inline-flex] [min-height:40px] [align-items:center] [justify-content:center] [gap:8px] [padding:0_15px] [border:1px_solid_var(--pulse-green)] [border-radius:5px] [background:var(--pulse-green)] [color:#fff] [cursor:pointer] [text-decoration:none] [font-size:12px] [font-weight:700] [transition:transform_.16s,_background_.16s] [&:hover:not(:disabled)]:[transform:translateY(-1px)] [&:hover:not(:disabled)]:[background:var(--pulse-green-dark)] [&:disabled]:[opacity:.65] [&:disabled]:[cursor:wait] [min-height:38px]" type="submit">
                  Search links
                </button>
              </form>
              <section className="[overflow:hidden] [border:1px_solid_#e7eae4] [border-radius:5px] [background:#fff]">
                <div className="[overflow-x:auto]">
                  <table className="[width:100%] [border-collapse:collapse] [text-align:left] [font-size:10px]">
                    <thead>
                      <tr>
                        <th className="[padding:12px_14px] [border-bottom:1px_solid_#edf0eb] [background:#fbfcfa] [color:#9aa39c] [font-size:8px] [letter-spacing:.7px] [white-space:nowrap]">SHORT LINK</th>
                        <th className="[padding:12px_14px] [border-bottom:1px_solid_#edf0eb] [background:#fbfcfa] [color:#9aa39c] [font-size:8px] [letter-spacing:.7px] [white-space:nowrap]">DESTINATION</th>
                        <th className="[padding:12px_14px] [border-bottom:1px_solid_#edf0eb] [background:#fbfcfa] [color:#9aa39c] [font-size:8px] [letter-spacing:.7px] [white-space:nowrap]">OWNER / WORKSPACE</th>
                        <th className="[padding:12px_14px] [border-bottom:1px_solid_#edf0eb] [background:#fbfcfa] [color:#9aa39c] [font-size:8px] [letter-spacing:.7px] [white-space:nowrap]">CLICKS</th>
                        <th className="[padding:12px_14px] [border-bottom:1px_solid_#edf0eb] [background:#fbfcfa] [color:#9aa39c] [font-size:8px] [letter-spacing:.7px] [white-space:nowrap]">STATUS</th>
                        <th className="[padding:12px_14px] [border-bottom:1px_solid_#edf0eb] [background:#fbfcfa] [color:#9aa39c] [font-size:8px] [letter-spacing:.7px] [white-space:nowrap]">ACTION</th>
                      </tr>
                    </thead>
                    <tbody>
                      {links.map((link) => (
                        <tr key={link.id}>
                          <td className="[max-width:260px] [padding:12px_14px] [border-bottom:1px_solid_#f0f2ee] [color:#6e7971] [white-space:nowrap] [border-bottom:0]">
                            <span className="[color:#416d52] [font-weight:700]">
                              /{link.shortCode}
                            </span>
                            {link.campaign?.name && (
                              <small className="[display:block] [margin-top:4px] [color:#9aa49c] [font-size:9px] [font-weight:400]">
                                {link.campaign.name}
                              </small>
                            )}
                          </td>
                          <td
                            className="[max-width:260px] [padding:12px_14px] [border-bottom:1px_solid_#f0f2ee] [color:#6e7971] [white-space:nowrap] [border-bottom:0] [overflow:hidden] [text-overflow:ellipsis] [max-width:250px]!"
                            title={link.destinationUrl}
                          >
                            {link.destinationUrl}
                          </td>
                          <td className="[max-width:260px] [padding:12px_14px] [border-bottom:1px_solid_#f0f2ee] [color:#6e7971] [white-space:nowrap] [border-bottom:0]">
                            {link.workspace?.owner?.name || "Unknown owner"}
                            <small className="[display:block] [margin-top:4px] [color:#9aa49c] [font-size:9px] [font-weight:400]">
                              {link.workspace?.name || "Unknown workspace"}
                            </small>
                          </td>
                          <td className="[max-width:260px] [padding:12px_14px] [border-bottom:1px_solid_#f0f2ee] [color:#6e7971] [white-space:nowrap] [border-bottom:0]">{number(link.totalClicks)}</td>
                          <td className="[max-width:260px] [padding:12px_14px] [border-bottom:1px_solid_#f0f2ee] [color:#6e7971] [white-space:nowrap] [border-bottom:0]">
                            <span
                              className={`[display:inline-flex] [width:fit-content] [align-items:center] [gap:6px] [padding:5px_8px] [border-radius:12px] [background:#f1f3ef] [color:#818a84] [text-transform:capitalize] [font-size:9px] [font-weight:700] ${
                                link.status === "active"
                                  ? "[background:#eff5e9] [color:#507648]"
                                  : ""
                              }`}
                            >
                              <span
                                className={`[width:5px] [height:5px] [border-radius:50%] [background:#9aa39c] ${
                                  link.status === "active"
                                    ? "[background:#67a457]"
                                    : ""
                                }`}
                              />
                              {link.status}
                            </span>
                          </td>
                          <td className="[max-width:260px] [padding:12px_14px] [border-bottom:1px_solid_#f0f2ee] [color:#6e7971] [white-space:nowrap] [border-bottom:0]">
                            <button
                              className="[padding:5px_9px] [border:1px_solid_#e5e9e3] [border-radius:4px] [background:#fff] [color:#66736b] [cursor:pointer] [font-size:10px] [font-weight:700]"
                              disabled={busyLink === link.id}
                              onClick={() => void toggleLink(link)}
                              type="button"
                            >
                              {busyLink === link.id
                                ? "Updating…"
                                : link.status === "active"
                                  ? "Disable"
                                  : "Enable"}
                            </button>
                          </td>
                        </tr>
                      ))}
                      {!links.length && (
                        <tr>
                          <td className="[max-width:260px] [padding:12px_14px] [border-bottom:1px_solid_#f0f2ee] [color:#6e7971] [white-space:nowrap] [border-bottom:0] [max-width:none] [padding:30px_14px] [color:#98a29b] [text-align:center]" colSpan="6">
                            {linksLoading
                              ? "Loading links…"
                              : "No links match these filters."}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="[display:flex] [min-height:45px] [align-items:center] [justify-content:space-between] [gap:12px] [padding:0_14px] [border-top:1px_solid_#edf0eb] [color:#929c95] [font-size:9px]">
                  <span>
                    Page {pagination.page} of {pagination.totalPages} ·{" "}
                    {number(pagination.total)} links
                  </span>
                  <div className="[display:flex] [gap:5px]">
                    <button className="[display:grid] [width:29px] [height:27px] [place-items:center] [border:1px_solid_#e5e9e3] [border-radius:4px] [background:#fff] [color:#647269] [cursor:pointer] [&:disabled]:[color:#bdc4be] [&:disabled]:[cursor:not-allowed]"
                      aria-label="Previous page"
                      disabled={linksLoading || pagination.page <= 1}
                      onClick={() =>
                        void loadLinks({
                          search,
                          status,
                          page: pagination.page - 1,
                        })
                      }
                      type="button"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button className="[display:grid] [width:29px] [height:27px] [place-items:center] [border:1px_solid_#e5e9e3] [border-radius:4px] [background:#fff] [color:#647269] [cursor:pointer] [&:disabled]:[color:#bdc4be] [&:disabled]:[cursor:not-allowed]"
                      aria-label="Next page"
                      disabled={
                        linksLoading || pagination.page >= pagination.totalPages
                      }
                      onClick={() =>
                        void loadLinks({
                          search,
                          status,
                          page: pagination.page + 1,
                        })
                      }
                      type="button"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </section>
            </section>
          )}
          {section === "users" && (
            <AdminDataTable
              eyebrow="ACCOUNT DIRECTORY"
              title="Platform users."
              description="All registered Link Pulse accounts."
              columns={["USER", "EMAIL", "ROLE", "JOINED"]}
              rows={users.map((item) => [
                item.name,
                item.email,
                item.role,
                date(item.createdAt),
              ])}
              empty="No users registered yet."
            />
          )}
          {section === "workspaces" && (
            <>
              <form
                className="[display:flex] [align-items:end] [gap:10px] [margin:0_0_16px] [padding:14px] [border:1px_solid_#e7eae4] [border-radius:5px] [background:#fff] max-[600px]:[flex-wrap:wrap]"
                onSubmit={submitWorkspace}
              >
                <label className="[display:grid] [min-width:180px] [gap:6px] [color:#526057] [font-size:10px] [font-weight:700] [flex:1] max-[600px]:[min-width:100%]">
                  Workspace name
                  <input
                    className="[height:36px] [padding:0_9px] [border:1px_solid_#e4e9e2] [border-radius:4px] [font-size:11px]"
                    maxLength={80}
                    minLength={2}
                    onChange={(event) => setWorkspaceName(event.target.value)}
                    placeholder="e.g. Marketing team"
                    required
                    value={workspaceName}
                  />
                </label>
                <label className="[display:grid] [min-width:180px] [gap:6px] [color:#526057] [font-size:10px] [font-weight:700] [flex:1] max-[600px]:[min-width:100%]">
                  Owner
                  <select
                    className="[height:36px] [padding:0_9px] [border:1px_solid_#e4e9e2] [border-radius:4px] [background:#fff] [font-size:11px]"
                    onChange={(event) => setWorkspaceOwnerId(event.target.value)}
                    required
                    value={workspaceOwnerId}
                  >
                    <option value="">Choose an account</option>
                    {users.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name} ({item.email})
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  className="[display:inline-flex] [min-height:36px] [align-items:center] [justify-content:center] [gap:6px] [padding:0_12px] [border:0] [border-radius:4px] [background:#60482f] [color:#fff] [cursor:pointer] [font-size:10px] [font-weight:700] [&:disabled]:[opacity:.65]"
                  disabled={workspaceSubmitting || !users.length}
                  type="submit"
                >
                  <Building2 size={14} />
                  {workspaceSubmitting ? "Creating…" : "Create workspace"}
                </button>
              </form>
              <AdminDataTable
                eyebrow="TEAM ORGANIZATION"
                title="All workspaces."
                description="Workspaces and their owners across the platform."
                columns={["WORKSPACE", "OWNER", "EMAIL", "CREATED"]}
                rows={workspaces.map((item) => [
                  item.name,
                  item.owner?.name || "Unknown",
                  item.owner?.email || "—",
                  date(item.createdAt),
                ])}
                empty="No workspaces found."
              />
            </>
          )}
          {section === "campaigns" && (
            <AdminDataTable
              eyebrow="CAMPAIGN DIRECTORY"
              title="All campaigns."
              description="Campaigns organized by workspace and account owner."
              columns={["CAMPAIGN", "WORKSPACE", "OWNER", "CREATED"]}
              rows={campaigns.map((item) => [
                item.name,
                item.workspace?.name || "Unknown",
                item.workspace?.owner?.name || "Unknown",
                date(item.createdAt),
              ])}
              empty="No campaigns have been created."
            />
          )}
          {section === "blocklist" && (
            <section className="[padding:29px_0_35px] max-[600px]:[padding-top:22px]">
              <div className="[display:flex] [align-items:end] [justify-content:space-between] [gap:20px] [margin:2px_0_23px] max-[600px]:[align-items:start] max-[600px]:[flex-direction:column] max-[600px]:[gap:12px]">
                <div>
                  <p className="[margin:0_0_13px] [color:var(--green)] [font-size:10px] [font-weight:700] [letter-spacing:1.8px] [&:last-child]:[margin:8px_0_0] [&:last-child]:[color:#818c84] [&:last-child]:[font-size:12px] [margin:0_0_8px] [color:#8c704c] [font-size:9px]">REDIRECT SAFETY</p>
                  <h1 className="[margin:0] [color:#2d3832] [font-size:clamp(26px,2.5vw,35px)] [font-weight:650] [letter-spacing:-.5px] [font-family:'Manrope',sans-serif] max-[600px]:[font-size:27px]">Domain blocklist.</h1>
                  <p className="[&:last-child]:[margin:8px_0_0] [&:last-child]:[color:#818c84] [&:last-child]:[font-size:12px]">
                    Blocked domains cannot be used as destinations for new
                    links.
                  </p>
                </div>
                <span className="[display:inline-flex] [align-items:center] [gap:6px] [padding:8px_10px] [border:1px_solid_#e9e6de] [border-radius:4px] [color:#85785f] [font-size:9px] [font-weight:800] [letter-spacing:.8px] [white-space:nowrap]">
                  <Globe2 size={15} /> {blockedDomains.length} DOMAINS
                </span>
              </div>
              <div className="[display:flex] [align-items:center] [gap:10px] [margin:0_0_15px] [padding:12px_14px] [border:1px_solid_#eee4ce] [border-radius:5px] [background:#fbf8ef] [color:#887248] [font-size:10px] [line-height:1.5]">
                <AlertTriangle size={17} />
                <span>
                  Adding a domain prevents new links to it. Existing links are
                  not automatically disabled.
                </span>
              </div>
              <form
                className="[display:flex] [align-items:end] [gap:10px] [margin-bottom:16px] [padding:15px] [border:1px_solid_#e7ebe4] [border-radius:5px] [background:#fff] max-[600px]:[align-items:stretch] max-[600px]:[flex-direction:column]"
                onSubmit={(event) => void submitDomain(event)}
              >
                <label className="[display:grid] [gap:8px] [color:#35413d] [font-size:12px] [font-weight:700] [flex:1]">
                  <span>Block a domain</span>
                  <input className="[width:100%] [height:51px] [padding:0_15px] [border:1px_solid_#dce2dc] [border-radius:4px] [background:#fff] [color:var(--ink)] [font-size:14px] [transition:border-color_.18s,_box-shadow_.18s] [&::placeholder]:[color:#a0a9a4] [&:focus]:[border-color:var(--green)] [&:focus]:[box-shadow:0_0_0_3px_rgba(35,91,78,.1)] [&:focus]:[outline:none] [height:39px] [padding:0_11px] [border:1px_solid_#e1e7df] [border-radius:5px] [font-size:11px]"
                    onChange={(event) => setDomain(event.target.value)}
                    placeholder="example.com"
                    required
                    value={domain}
                  />
                </label>
                <button
                  className="[display:inline-flex] [min-height:40px] [align-items:center] [justify-content:center] [gap:8px] [padding:0_15px] [border:1px_solid_var(--pulse-green)] [border-radius:5px] [background:var(--pulse-green)] [color:#fff] [cursor:pointer] [text-decoration:none] [font-size:12px] [font-weight:700] [transition:transform_.16s,_background_.16s] [&:hover:not(:disabled)]:[transform:translateY(-1px)] [&:hover:not(:disabled)]:[background:var(--pulse-green-dark)] [&:disabled]:[opacity:.65] [&:disabled]:[cursor:wait] [min-height:39px] [background:#795e3d] [border-color:#795e3d] max-[600px]:[align-self:end]"
                  disabled={domainSubmitting}
                  type="submit"
                >
                  {domainSubmitting ? (
                    "Adding…"
                  ) : (
                    <>
                      <Ban size={15} /> Block domain
                    </>
                  )}
                </button>
              </form>
              <section className="[overflow:hidden] [border:1px_solid_#e7eae4] [border-radius:5px] [background:#fff]">
                <div className="[display:flex] [min-height:65px] [align-items:center] [justify-content:space-between] [gap:15px] [padding:12px_17px] [border-bottom:1px_solid_#edf0eb]">
                  <div>
                    <h2 className="[margin:0] [color:#39463e] [font-size:13px] [font-family:'Manrope',sans-serif]">Blocked domains</h2>
                    <p className="[margin:5px_0_0] [color:#9aa39c] [font-size:9px]">Domains currently restricted on the platform</p>
                  </div>
                </div>
                <div className="[overflow-x:auto]">
                  <table className="[width:100%] [border-collapse:collapse] [text-align:left] [font-size:10px]">
                    <thead>
                      <tr>
                        <th className="[padding:12px_14px] [border-bottom:1px_solid_#edf0eb] [background:#fbfcfa] [color:#9aa39c] [font-size:8px] [letter-spacing:.7px] [white-space:nowrap]">DOMAIN</th>
                        <th className="[padding:12px_14px] [border-bottom:1px_solid_#edf0eb] [background:#fbfcfa] [color:#9aa39c] [font-size:8px] [letter-spacing:.7px] [white-space:nowrap]">ADDED</th>
                        <th className="[padding:12px_14px] [border-bottom:1px_solid_#edf0eb] [background:#fbfcfa] [color:#9aa39c] [font-size:8px] [letter-spacing:.7px] [white-space:nowrap]">ACTION</th>
                      </tr>
                    </thead>
                    <tbody>
                      {blockedDomains.map((item) => (
                        <tr key={item.id}>
                          <td className="[max-width:260px] [padding:12px_14px] [border-bottom:1px_solid_#f0f2ee] [color:#6e7971] [white-space:nowrap] [border-bottom:0]">
                            <span className="[display:inline-flex] [align-items:center] [gap:8px] [color:#48554c] [font-weight:700]">
                              <Globe2 size={15} />
                              {item.domain}
                            </span>
                          </td>
                          <td className="[max-width:260px] [padding:12px_14px] [border-bottom:1px_solid_#f0f2ee] [color:#6e7971] [white-space:nowrap] [border-bottom:0]">{date(item.createdAt)}</td>
                          <td className="[max-width:260px] [padding:12px_14px] [border-bottom:1px_solid_#f0f2ee] [color:#6e7971] [white-space:nowrap] [border-bottom:0]">
                            <button
                              className="[min-height:28px] [padding:0_9px] [border:1px_solid_#dce6d8] [border-radius:4px] [background:#f5f8f2] [color:#55774d] [cursor:pointer] [font-size:9px] [font-weight:700] [&:disabled]:[opacity:.5] [&:disabled]:[cursor:wait]"
                              onClick={() => void removeBlockedDomain(item.id)}
                              type="button"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                      {!blockedDomains.length && (
                        <tr>
                          <td className="[max-width:260px] [padding:12px_14px] [border-bottom:1px_solid_#f0f2ee] [color:#6e7971] [white-space:nowrap] [border-bottom:0] [max-width:none] [padding:30px_14px] [color:#98a29b] [text-align:center]" colSpan="3">
                            No domains are currently blocked.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </section>
          )}
          <footer className="[display:flex] [justify-content:space-between] [padding:15px_0_20px] [border-top:1px_solid_#eaede8] [color:#a2aaa4] [font-size:8px] [font-weight:700] [letter-spacing:1px] max-[600px]:[font-size:7px]">
            <span className="[&:last-child]:[font-weight:500] [&:last-child]:[letter-spacing:0]">LINK PULSE · ADMIN</span>
            <span className="[&:last-child]:[font-weight:500] [&:last-child]:[letter-spacing:0]">Platform-wide view · changes apply immediately</span>
          </footer>
        </div>
      </main>
    </div>
  );
}

function AdminDataTable({ eyebrow, title, description, columns, rows, empty }) {
  const { loading } = useAdmin();
  return (
    <section className="[padding:29px_0_35px] max-[600px]:[padding-top:22px]">
      <div className="[display:flex] [align-items:end] [justify-content:space-between] [gap:20px] [margin:2px_0_23px] max-[600px]:[align-items:start] max-[600px]:[flex-direction:column] max-[600px]:[gap:12px]">
        <div>
          <p className="[margin:0_0_13px] [color:var(--green)] [font-size:10px] [font-weight:700] [letter-spacing:1.8px] [&:last-child]:[margin:8px_0_0] [&:last-child]:[color:#818c84] [&:last-child]:[font-size:12px] [margin:0_0_8px] [color:#8c704c] [font-size:9px]">{eyebrow}</p>
          <h1 className="[margin:0] [color:#2d3832] [font-size:clamp(26px,2.5vw,35px)] [font-weight:650] [letter-spacing:-.5px] [font-family:'Manrope',sans-serif] max-[600px]:[font-size:27px]">{title}</h1>
          <p className="[&:last-child]:[margin:8px_0_0] [&:last-child]:[color:#818c84] [&:last-child]:[font-size:12px]">{description}</p>
        </div>
        <span className="[display:inline-flex] [align-items:center] [gap:6px] [padding:8px_10px] [border:1px_solid_#e9e6de] [border-radius:4px] [color:#85785f] [font-size:9px] [font-weight:800] [letter-spacing:.8px] [white-space:nowrap]">{number(rows.length)} TOTAL</span>
      </div>
      <section className="[overflow:hidden] [border:1px_solid_#e7eae4] [border-radius:5px] [background:#fff]">
        <div className="[overflow-x:auto]">
          <table className="[width:100%] [border-collapse:collapse] [text-align:left] [font-size:10px]">
            <thead>
              <tr>
                {columns.map((column) => (
                  <th className="[padding:12px_14px] [border-bottom:1px_solid_#edf0eb] [background:#fbfcfa] [color:#9aa39c] [font-size:8px] [letter-spacing:.7px] [white-space:nowrap]" key={column}>{column}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={`${row[0]}-${index}`}>
                  {row.map((cell, cellIndex) => (
                    <td
                      className={`[padding:11px_14px] [border-bottom:1px_solid_#f0f2ee] [color:#6e7971] [font-size:10px] ${
                        cellIndex === 0
                          ? "[color:var(--ink)] [font-weight:700]"
                          : ""
                      }`}
                      key={`${cell}-${cellIndex}`}
                    >
                      {cellIndex === 2 && columns[cellIndex] === "ROLE" ? (
                        <span className="[padding:4px_7px] [border-radius:3px] [background:#f5f0e8] [color:#80623d] [font-size:8px] [font-weight:800] [text-transform:uppercase]">{cell}</span>
                      ) : (
                        cell
                      )}
                    </td>
                  ))}
                </tr>
              ))}
              {!rows.length && (
                <tr>
                  <td className="[max-width:260px] [padding:12px_14px] [border-bottom:1px_solid_#f0f2ee] [color:#6e7971] [white-space:nowrap] [border-bottom:0] [max-width:none] [padding:30px_14px] [color:#98a29b] [text-align:center]" colSpan={columns.length}>
                    {loading ? "Loading platform data…" : empty}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}

function AdminDashboardPage() {
  return (
    <AdminProvider>
      <AdminDashboard />
    </AdminProvider>
  );
}

export { AdminDashboardPage };
