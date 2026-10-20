import { useState } from "react";
import {
  Activity,
  BarChart3,
  FolderKanban,
  Link2,
  LogOut,
  Plus,
  QrCode,
} from "lucide-react";
import { useAuth } from "../../auth/hook/useAuth.js";
import { useLinkPulse } from "../hook/useLinkPulse.js";

const navigation = [
  { id: "links", label: "Links", icon: Link2 },
  { id: "campaigns", label: "Campaigns", icon: FolderKanban },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
];

function AppShell({ activeSection, onNavigate, onCreateLink, children }) {
  const { user, logout } = useAuth();
  const { workspaces, workspaceId, setWorkspaceId, createWorkspace } =
    useLinkPulse();
  const [workspaceName, setWorkspaceName] = useState("");
  const [workspaceSubmitting, setWorkspaceSubmitting] = useState(false);

  const handleCreateWorkspace = async (event) => {
    event.preventDefault();
    setWorkspaceSubmitting(true);
    try {
      await createWorkspace(workspaceName.trim());
      setWorkspaceName("");
    } catch {
      // The Link Pulse provider exposes the API error in the dashboard alert.
    } finally {
      setWorkspaceSubmitting(false);
    }
  };

  return (
    <div className="[display:flex] [min-height:100vh] [background:#f5f5f5] [--pulse-green:#111111] [--pulse-green-dark:#3a3a3a] [--pulse-lime:#a8a151]">
      <aside className="[position:fixed] [z-index:5] [inset:0_auto_0_0] [display:flex] [width:248px] [flex-direction:column] [padding:26px_17px_16px] [border-right:1px_solid_#e8ebe5] [background:#fff] max-[850px]:[width:205px] max-[850px]:[padding-right:12px] max-[850px]:[padding-left:12px] max-[600px]:[display:none]">
        <a
          className="[display:flex] [align-items:center] [gap:11px] [padding:2px_9px_29px] [color:#23332d] [font-size:14px] [font-weight:800] [letter-spacing:1.1px] [text-decoration:none] [font-family:'Manrope',_sans-serif]"
          href="/dashboard"
          aria-label="Link Pulse home"
        >
          <span className="[color:var(--pulse-green)] [display:grid] [width:36px] [height:36px] [place-items:center] [border-radius:11px] [background:var(--pulse-green)] [color:var(--pulse-lime)]">
            <Activity size={20} />
          </span>
          <span className="[color:var(--pulse-green)]">
            LINK<span className="[color:var(--pulse-green)]">PULSE</span>
          </span>
        </a>
        <div className="[display:grid] [gap:8px] [padding:15px_9px_22px] [border-top:1px_solid_#eff1ed]">
          <span className="[color:#9ba49f] [font-size:9px] [font-weight:800] [letter-spacing:1.35px]">WORKSPACE</span>
          <select className="[width:100%] [height:39px] [padding:0_10px] [border:1px_solid_#e5e9e3] [border-radius:5px] [background:#fafbf9] [color:#36433d] [font-size:12px]"
            aria-label="Choose workspace"
            onChange={(event) => setWorkspaceId(event.target.value)}
            value={workspaceId}
          >
            {workspaces.map((workspace) => (
              <option key={workspace.id} value={workspace.id}>
                {workspace.name}
              </option>
            ))}
          </select>
          <form className="[display:flex] [gap:6px]" onSubmit={handleCreateWorkspace}>
            <input
              aria-label="New workspace name"
              className="[min-width:0] [height:34px] [padding:0_8px] [border:1px_solid_#e5e9e3] [border-radius:5px] [background:#fff] [font-size:11px] [flex:1]"
              maxLength={80}
              minLength={2}
              onChange={(event) => setWorkspaceName(event.target.value)}
              placeholder="New workspace"
              required
              value={workspaceName}
            />
            <button
              aria-label="Create workspace"
              className="[display:grid] [width:34px] [height:34px] [place-items:center] [border:0] [border-radius:5px] [background:var(--pulse-green)] [color:#fff] [cursor:pointer] [&:disabled]:[opacity:.65]"
              disabled={workspaceSubmitting}
              title="Create workspace"
              type="submit"
            >
              <Plus size={16} />
            </button>
          </form>
        </div>
        <span className="select-none [color:#9ba49f] [font-size:9px] [font-weight:800] [letter-spacing:1.35px] [padding:9px_12px_10px]">WORKSPACE</span>
        <nav className="[display:grid] [gap:4px]" aria-label="Main navigation">
          {navigation.map(({ id, label, icon: Icon }) => (
            <button
              aria-current={activeSection === id ? "page" : undefined}
              className={`[display:flex] [min-height:43px] [align-items:center] [gap:12px] [padding:0_12px] [border:0] [border-radius:5px] [background:transparent] [color:#69756f] [cursor:pointer] [text-align:left] [font-size:13px] [font-weight:600] [transition:color_.16s,_background_.16s] [&:hover]:[background:#f5f7f3] [&:hover]:[color:var(--pulse-green)] ${
                activeSection === id
                  ? "[background:#f0efea] [color:var(--pulse-green-dark)] [&>svg]:[color:#a8a151] [&:hover]:[background:#f0efea] [&:hover]:[color:var(--pulse-green-dark)] [&:hover>svg]:[color:#a8a151]"
                  : ""
              }`}
              key={id}
              onClick={() => onNavigate(id)}
              type="button"
            >
              <Icon size={18} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="[margin-top:auto]">
          <div className="[padding:17px_14px_16px] [border:1px_solid_#e9eee6] [border-radius:7px] [background:linear-gradient(145deg,_#fbfcf8,_#f2f5eb)]">
            <span className="[display:grid] [width:31px] [height:31px] [place-items:center] [border-radius:7px] [background:#e8f0dc] [color:var(--pulse-green)] [&:last-child]:[color:var(--muted)] [&:last-child]:[font-size:11px] [&:last-child]:[line-height:1.55]">
              <QrCode size={18} />
            </span>
            <p className="[margin:12px_0_5px] [font-size:13px] [font-weight:700] [font-family:'Manrope',_sans-serif]">One link. A clearer picture.</p>
            <span className="[&:last-child]:[color:var(--muted)] [&:last-child]:[font-size:11px] [&:last-child]:[line-height:1.55]">Shorten, share and understand what works.</span>
          </div>
          <div className="[display:flex] [align-items:center] [gap:9px] [margin-top:15px] [padding:14px_1px_0] [border-top:1px_solid_#eff1ed]">
            <span className="[display:grid] [width:34px] [height:34px] [flex:0_0_34px] [place-items:center] [border-radius:50%] [background:#e7eee0] [color:var(--pulse-green)] [font-size:13px] [font-weight:800]">
              {user.name.slice(0, 1).toUpperCase()}
            </span>
            <span className="[display:grid] [min-width:0] [gap:3px] [flex:1]">
              <strong className="[overflow:hidden] [color:#33413a] [text-overflow:ellipsis] [white-space:nowrap] [font-size:11px]">{user.name}</strong>
              <span className="[overflow:hidden] [color:#8a948e] [text-overflow:ellipsis] [white-space:nowrap] [font-size:10px]">{user.email}</span>
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
        <header className="[position:sticky] [z-index:4] [top:0] [display:flex] [height:64px] [align-items:center] [justify-content:space-between] [padding:0_clamp(24px,_4.2vw,_64px)] [border-bottom:1px_solid_#e9ece7] [background:rgba(255,255,255,.94)] [backdrop-filter:blur(12px)] max-[600px]:[height:56px] max-[600px]:[padding:0_16px]">
          <div className="[display:none] [align-items:center] [gap:7px] [color:var(--pulse-green)] [font-size:12px] [font-weight:800] [letter-spacing:.5px] max-[600px]:[display:inline-flex]">
            <Activity size={18} /> LINK PULSE
          </div>
          <div className="[display:flex] [align-items:center] [gap:10px] [color:#99a19c] [font-size:11px] max-[600px]:[display:none]">
            <span>Workspace</span>
            <span>/</span>
            <strong className="[color:#3a4841] [font-weight:700]">
              {navigation.find((item) => item.id === activeSection)?.label}
            </strong>
          </div>
          <button
            className="[display:inline-flex] [min-height:40px] [align-items:center] [justify-content:center] [gap:8px] [padding:0_15px] [border:1px_solid_var(--pulse-green)] [border-radius:5px] [background:var(--pulse-green)] [color:#fff] [cursor:pointer] [text-decoration:none] [font-size:12px] [font-weight:700] [transition:transform_.16s,_background_.16s] [&:hover:not(:disabled)]:[transform:translateY(-1px)] [&:hover:not(:disabled)]:[background:var(--pulse-green-dark)] [&:disabled]:[opacity:.65] [&:disabled]:[cursor:wait] [min-height:36px] [font-size:11px] max-[600px]:[min-height:33px] max-[600px]:[padding:0_10px] max-[600px]:[font-size:10px]"
            onClick={onCreateLink}
            type="button"
          >
            <Plus size={17} /> Create link
          </button>
        </header>
        <nav
          aria-label="Mobile main navigation"
          className="[display:none] max-[600px]:[display:flex] [gap:5px] [overflow-x:auto] [padding:8px_16px] [border-bottom:1px_solid_#e9ece7] [background:#fff]"
        >
          {navigation.map(({ id, label, icon: Icon }) => (
            <button
              aria-current={activeSection === id ? "page" : undefined}
              className={`[display:inline-flex] [min-height:34px] [align-items:center] [gap:6px] [padding:0_10px] [border:1px_solid_#e5e9e3] [border-radius:5px] [background:#fff] [color:#69756f] [white-space:nowrap] [font-size:10px] ${
                activeSection === id
                  ? "[border-color:#e5e5e5] [background:#f0efea] [color:var(--pulse-green-dark)]"
                  : ""
              }`}
              key={id}
              onClick={() => onNavigate(id)}
              type="button"
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </nav>
        <div className="[display:none] max-[600px]:[display:flex] [align-items:center] [gap:7px] [padding:8px_16px] [border-bottom:1px_solid_#e9ece7] [background:#fff]">
          <label className="[color:#89938d] [font-size:10px]" htmlFor="mobile-workspace-select">
            Workspace
          </label>
          <select
            className="[min-width:0] [height:32px] [padding:0_7px] [border:1px_solid_#e5e9e3] [border-radius:5px] [background:#fafbf9] [color:#36433d] [font-size:10px] [flex:1]"
            id="mobile-workspace-select"
            onChange={(event) => setWorkspaceId(event.target.value)}
            value={workspaceId}
          >
            {workspaces.map((workspace) => (
              <option key={workspace.id} value={workspace.id}>
                {workspace.name}
              </option>
            ))}
          </select>
          <form className="[display:flex] [gap:4px]" onSubmit={handleCreateWorkspace}>
            <input
              aria-label="New workspace name"
              className="[width:100px] [height:32px] [padding:0_6px] [border:1px_solid_#e5e9e3] [border-radius:5px] [font-size:10px]"
              maxLength={80}
              minLength={2}
              onChange={(event) => setWorkspaceName(event.target.value)}
              placeholder="New workspace"
              required
              value={workspaceName}
            />
            <button
              aria-label="Create workspace"
              className="[display:grid] [width:32px] [height:32px] [place-items:center] [border:0] [border-radius:5px] [background:var(--pulse-green)] [color:#fff]"
              disabled={workspaceSubmitting}
              type="submit"
            >
              <Plus size={15} />
            </button>
          </form>
        </div>
        <div className="[width:min(100%,_1440px)] [min-height:calc(100vh_-_64px)] [margin:0_auto] [padding:0_clamp(24px,_4.2vw,_64px)] max-[850px]:[padding-right:22px] max-[850px]:[padding-left:22px] max-[600px]:[padding:0_16px]">{children}</div>
      </main>
    </div>
  );
}

export { AppShell };
