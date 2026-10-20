import { useState } from "react";
import { AppShell } from "../components/AppShell.jsx";
import { AnalyticsPanel } from "../components/AnalyticsPanel.jsx";
import { CampaignsPanel } from "../components/CampaignsPanel.jsx";
import { LinkCreateModal } from "../components/LinkCreateModal.jsx";
import { LinksPanel } from "../components/LinksPanel.jsx";
import { useLinkPulse } from "../hook/useLinkPulse.js";
import { LinkPulseProvider } from "../state/LinkPulseContext.jsx";

function DashboardContent() {
  const { links, campaigns, loading, error, setError, createLink, refresh } =
    useLinkPulse();
  const [activeSection, setActiveSection] = useState("links");
  const [createOpen, setCreateOpen] = useState(false);
  const totalClicks = links.reduce(
    (sum, link) => sum + (link.totalClicks || 0),
    0,
  );
  const activeLinks = links.filter((link) => link.status === "active").length;

  return (
    <AppShell
      activeSection={activeSection}
      onCreateLink={() => setCreateOpen(true)}
      onNavigate={setActiveSection}
    >
      <div className="[display:flex] [min-height:62px] [align-items:center] [justify-content:space-between] [gap:15px] [border-bottom:1px_solid_#e9ece7] max-[600px]:[min-height:53px]">
        <div className="[display:flex] [align-items:center] [gap:16px] max-[600px]:[display:grid] max-[600px]:[gap:5px]">
          <span className="[color:#95a099] [font-size:9px] [font-weight:800] [letter-spacing:1px] max-[600px]:[font-size:8px]">
            {loading ? "SYNCING YOUR WORKSPACE" : "YOUR WORKSPACE, AT A GLANCE"}
          </span>
          <strong className="[display:flex] [align-items:center] [gap:9px] [color:#617067] [font-size:11px] [font-weight:600] max-[600px]:[gap:6px] max-[600px]:[font-size:9px]">
            {links.length} links <i className="[width:3px] [height:3px] [border-radius:50%] [background:#aab4ac]" /> {totalClicks.toLocaleString()} clicks{" "}
            <i className="[width:3px] [height:3px] [border-radius:50%] [background:#aab4ac]" /> {campaigns.length} campaigns
          </strong>
        </div>
        <span className="[color:#95a099] [font-size:9px] [font-weight:800] [letter-spacing:1px] [display:inline-flex] [align-items:center] [gap:7px] [color:#75827a] max-[600px]:[font-size:8px]">
          <i className="[width:6px] [height:6px] [border-radius:50%] [background:#6bac64] [box-shadow:0_0_0_3px_#e9f2e5]" /> LIVE DATA
        </span>
      </div>
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
            Try again
          </button>
        </div>
      )}
      <section aria-label="Workspace metrics" className="[display:grid] [grid-template-columns:repeat(4,_minmax(0,_1fr))] [gap:13px] [padding:23px_0_30px] max-[850px]:[grid-template-columns:repeat(2,minmax(0,1fr))] max-[600px]:[gap:8px] max-[600px]:[padding:15px_0_22px]">
        <article className="[position:relative] [display:grid] [min-height:123px] [align-content:start] [gap:7px] [padding:17px_18px] [border:1px_solid_#e8ece6] [border-radius:6px] [background:#fff] max-[600px]:[min-height:110px] max-[600px]:[padding:13px]">
          <span className="[position:absolute] [top:14px] [right:16px] [display:grid] [width:30px] [height:30px] [place-items:center] [border-radius:8px] [font-size:16px] [font-weight:700] [background:#eef3e7] [color:#376c51] max-[600px]:[top:10px] max-[600px]:[right:11px] max-[600px]:[width:25px] max-[600px]:[height:25px]">↗</span>
          <span className="[color:#96a099] [font-size:9px] [font-weight:800] [letter-spacing:1.1px] max-[600px]:[font-size:8px]">TOTAL LINKS</span>
          <strong className="[margin-top:1px] [color:#273831] [font-size:26px] [font-weight:700] [line-height:1.1] [font-family:'Manrope',_sans-serif] max-[600px]:[font-size:23px]">{links.length}</strong>
          <span className="[color:#9aa39d] [font-size:10px] max-[600px]:[font-size:9px]">Across this workspace</span>
        </article>
        <article className="[position:relative] [display:grid] [min-height:123px] [align-content:start] [gap:7px] [padding:17px_18px] [border:1px_solid_#e8ece6] [border-radius:6px] [background:#fff] max-[600px]:[min-height:110px] max-[600px]:[padding:13px]">
          <span className="[position:absolute] [top:14px] [right:16px] [display:grid] [width:30px] [height:30px] [place-items:center] [border-radius:8px] [font-size:16px] [font-weight:700] [background:#f2f0e7] [color:#8b7650] max-[600px]:[top:10px] max-[600px]:[right:11px] max-[600px]:[width:25px] max-[600px]:[height:25px]">⌁</span>
          <span className="[color:#96a099] [font-size:9px] [font-weight:800] [letter-spacing:1.1px] max-[600px]:[font-size:8px]">TOTAL CLICKS</span>
          <strong className="[margin-top:1px] [color:#273831] [font-size:26px] [font-weight:700] [line-height:1.1] [font-family:'Manrope',_sans-serif] max-[600px]:[font-size:23px]">{totalClicks.toLocaleString()}</strong>
          <span className="[color:#9aa39d] [font-size:10px] max-[600px]:[font-size:9px]">Lifetime link visits</span>
        </article>
        <article className="[position:relative] [display:grid] [min-height:123px] [align-content:start] [gap:7px] [padding:17px_18px] [border:1px_solid_#e8ece6] [border-radius:6px] [background:#fff] max-[600px]:[min-height:110px] max-[600px]:[padding:13px]">
          <span className="[position:absolute] [top:14px] [right:16px] [display:grid] [width:30px] [height:30px] [place-items:center] [border-radius:8px] [font-size:16px] [font-weight:700] [background:#edf4ee] [color:#548159] max-[600px]:[top:10px] max-[600px]:[right:11px] max-[600px]:[width:25px] max-[600px]:[height:25px]">✓</span>
          <span className="[color:#96a099] [font-size:9px] [font-weight:800] [letter-spacing:1.1px] max-[600px]:[font-size:8px]">ACTIVE LINKS</span>
          <strong className="[margin-top:1px] [color:#273831] [font-size:26px] [font-weight:700] [line-height:1.1] [font-family:'Manrope',_sans-serif] max-[600px]:[font-size:23px]">{activeLinks}</strong>
          <span className="[color:#9aa39d] [font-size:10px] max-[600px]:[font-size:9px]">Ready to redirect</span>
        </article>
        <article className="[position:relative] [display:grid] [min-height:123px] [align-content:start] [gap:7px] [padding:17px_18px] [border:1px_solid_#e8ece6] [border-radius:6px] [background:#fff] max-[600px]:[min-height:110px] max-[600px]:[padding:13px]">
          <span className="[position:absolute] [top:14px] [right:16px] [display:grid] [width:30px] [height:30px] [place-items:center] [border-radius:8px] [font-size:16px] [font-weight:700] [background:#f3edf0] [color:#8a6575] max-[600px]:[top:10px] max-[600px]:[right:11px] max-[600px]:[width:25px] max-[600px]:[height:25px]">◫</span>
          <span className="[color:#96a099] [font-size:9px] [font-weight:800] [letter-spacing:1.1px] max-[600px]:[font-size:8px]">CAMPAIGNS</span>
          <strong className="[margin-top:1px] [color:#273831] [font-size:26px] [font-weight:700] [line-height:1.1] [font-family:'Manrope',_sans-serif] max-[600px]:[font-size:23px]">{campaigns.length}</strong>
          <span className="[color:#9aa39d] [font-size:10px] max-[600px]:[font-size:9px]">Organizing your work</span>
        </article>
      </section>
      {activeSection === "links" && (
        <LinksPanel onCreateLink={() => setCreateOpen(true)} />
      )}
      {activeSection === "campaigns" && (
        <CampaignsPanel />
      )}
      {activeSection === "analytics" && <AnalyticsPanel />}
      {createOpen && (
        <LinkCreateModal
          campaigns={campaigns}
          onClose={() => setCreateOpen(false)}
          onCreate={createLink}
        />
      )}
      <footer className="[display:flex] [justify-content:space-between] [padding:15px_0_20px] [border-top:1px_solid_#eaede8] [color:#a2aaa4] [font-size:8px] [font-weight:700] [letter-spacing:1px] max-[600px]:[font-size:7px]">
        <span className="[&:last-child]:[font-weight:500] [&:last-child]:[letter-spacing:0]">LINK PULSE</span>
        <span className="[&:last-child]:[font-weight:500] [&:last-child]:[letter-spacing:0]">Make every link count.</span>
      </footer>
    </AppShell>
  );
}

function LinkPulseDashboardPage() {
  return (
    <LinkPulseProvider>
      <DashboardContent />
    </LinkPulseProvider>
  );
}

export { LinkPulseDashboardPage };
