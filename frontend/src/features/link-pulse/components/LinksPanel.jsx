import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  Copy,
  ExternalLink,
  QrCode,
  Search,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { LinkImportModal } from "./LinkImportModal.jsx";
import { useLinkPulse } from "../hook/useLinkPulse.js";

function LinksPanel({ onCreateLink }) {
  const {
    links,
    campaigns,
    updateLink,
    loadQrCode,
    importLinks,
    loading,
    setError,
  } = useLinkPulse();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [qrCode, setQrCode] = useState(null);
  const [busyId, setBusyId] = useState("");
  const [importOpen, setImportOpen] = useState(false);
  const filteredLinks = useMemo(
    () =>
      links.filter((link) => {
        const matchesSearch =
          `${link.shortCode} ${link.destinationUrl} ${(link.tags || []).join(" ")}`
            .toLowerCase()
            .includes(search.toLowerCase());
        return matchesSearch && (filter === "all" || link.status === filter);
      }),
    [filter, links, search],
  );

  const copyLink = async (link) => {
    try {
      await navigator.clipboard.writeText(link.shortUrl);
      setError("");
    } catch {
      setError(
        "Could not copy this link. Check clipboard permissions and try again.",
      );
    }
  };

  const toggleLink = async (link) => {
    setBusyId(link.id);
    try {
      await updateLink(link.id, {
        status: link.status === "active" ? "disabled" : "active",
      });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusyId("");
    }
  };

  const showQrCode = async (link) => {
    setBusyId(link.id);
    try {
      const response = await loadQrCode(link.id);
      setQrCode({ ...response.data, shortCode: link.shortCode });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusyId("");
    }
  };

  return (
    <section className="[padding:9px_0_35px] max-[600px]:[padding-top:5px]">
      <div className="[display:flex] [align-items:end] [justify-content:space-between] [gap:20px] [margin:3px_0_23px] max-[600px]:[align-items:start] max-[600px]:[flex-direction:column] max-[600px]:[gap:14px] max-[600px]:[margin-bottom:17px]">
        <div>
          <p className="[margin:0_0_13px] [color:var(--green)] [font-size:10px] [font-weight:700] [letter-spacing:1.8px] [margin-bottom:8px] [font-size:9px] [&:last-child]:[margin:8px_0_0] [&:last-child]:[color:#7c8780] [&:last-child]:[font-size:12px] max-[600px]:[&:last-child]:[max-width:340px] max-[600px]:[&:last-child]:[line-height:1.5]">YOUR LINK LIBRARY</p>
          <h1 className="[margin:0] [color:#27362f] [font-size:clamp(25px,_2.5vw,_34px)] [font-weight:650] [line-height:1.2] [letter-spacing:-.6px] [font-family:'Manrope',_sans-serif] max-[600px]:[font-size:25px]">Links that move you forward.</h1>
          <p className="[&:last-child]:[margin:8px_0_0] [&:last-child]:[color:#7c8780] [&:last-child]:[font-size:12px] max-[600px]:[&:last-child]:[max-width:340px] max-[600px]:[&:last-child]:[line-height:1.5]">One place to create, organize, and keep an eye on every link.</p>
        </div>
        <div className="[display:flex] [flex:0_0_auto] [align-items:center] [gap:8px] max-[600px]:[width:100%]">
          <button
            className="[display:inline-flex] [min-height:40px] [align-items:center] [gap:6px] [padding:0_12px] [border:1px_solid_#e1e7df] [border-radius:5px] [background:#fff] [color:#66736b] [cursor:pointer] [font-size:11px] [font-weight:700] [&:disabled]:[opacity:.55] [&:disabled]:[cursor:wait] max-[600px]:[flex:1]"
            onClick={() => setImportOpen(true)}
            type="button"
          >
            <span>↑</span> Import CSV
          </button>
          <button
            className="[display:inline-flex] [min-height:40px] [align-items:center] [justify-content:center] [gap:8px] [padding:0_15px] [border:1px_solid_var(--pulse-green)] [border-radius:5px] [background:var(--pulse-green)] [color:#fff] [cursor:pointer] [text-decoration:none] [font-size:12px] [font-weight:700] [transition:transform_.16s,_background_.16s] [&:hover:not(:disabled)]:[transform:translateY(-1px)] [&:hover:not(:disabled)]:[background:var(--pulse-green-dark)] [&:disabled]:[opacity:.65] [&:disabled]:[cursor:wait] [flex:0_0_auto] max-[600px]:[flex:1]"
            onClick={onCreateLink}
            type="button"
          >
            <span className="[font-size:17px] [line-height:0]">+</span> Create link
          </button>
        </div>
      </div>
      <div className="[display:flex] [align-items:center] [justify-content:space-between] [gap:15px] [margin-bottom:12px] max-[600px]:[align-items:stretch] max-[600px]:[flex-direction:column] max-[600px]:[gap:8px]">
        <label className="[display:flex] [width:min(100%,_340px)] [height:38px] [align-items:center] [gap:9px] [padding:0_11px] [border:1px_solid_#e4e9e2] [border-radius:5px] [background:#fff] [color:#8d9891] max-[600px]:[width:100%]">
          <Search size={17} />
          <input className="[width:100%] [border:0] [outline:none] [background:transparent] [color:var(--ink)] [font-size:11px] [&::placeholder]:[color:#a1aaa5]"
            aria-label="Search links"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search links or destinations"
            value={search}
          />
        </label>
        <div className="[display:flex] [align-items:center] [gap:3px] max-[600px]:[justify-content:start]" aria-label="Filter links">
          {["all", "active", "disabled"].map((status) => (
            <button
              aria-pressed={filter === status}
              className={`[min-height:32px] [padding:0_11px] [border:0] [border-radius:4px] [background:transparent] [color:#839087] [cursor:pointer] [text-transform:capitalize] [font-size:10px] [font-weight:600] ${
                filter === status
                  ? "[background:#eaf0e4] [color:var(--pulse-green)]"
                  : ""
              }`}
              key={status}
              onClick={() => setFilter(status)}
              type="button"
            >
              {status === "all" ? "All links" : status}
            </button>
          ))}
        </div>
      </div>
      <div className="[overflow:hidden] [border:1px_solid_#e6eae4] [border-radius:6px] [background:#fff] max-[600px]:[margin-right:-1px] max-[600px]:[margin-left:-1px]">
        <div className="[display:grid] [grid-template-columns:minmax(190px,_2fr)_minmax(140px,_1.3fr)_minmax(80px,_.65fr)_minmax(85px,_.7fr)_minmax(110px,_.8fr)] [align-items:center] [gap:14px] [padding:0_20px] [min-height:40px] [border-bottom:1px_solid_#edf0eb] [background:#fbfcfa] [color:#99a39c] [font-size:8px] [font-weight:800] [letter-spacing:.95px] max-[1100px]:[grid-template-columns:minmax(150px,_1.7fr)_minmax(110px,_1fr)_70px_76px_100px] max-[1100px]:[gap:9px] max-[1100px]:[padding-right:13px] max-[1100px]:[padding-left:13px] max-[850px]:[display:none]">
          <span>SHORT LINK</span>
          <span>CAMPAIGN / TAGS</span>
          <span>CLICKS</span>
          <span>STATUS</span>
          <span>ACTIONS</span>
        </div>
        {loading && !links.length ? (
          <p className="[display:grid] [min-height:190px] [align-content:center] [justify-items:center] [gap:8px] [padding:22px] [color:#99a39c] [text-align:center] [font-size:11px]">Loading your links…</p>
        ) : filteredLinks.length ? (
          <div className="[display:grid]">
            {filteredLinks.map((link) => (
              <article className="[display:grid] [grid-template-columns:minmax(190px,_2fr)_minmax(140px,_1.3fr)_minmax(80px,_.65fr)_minmax(85px,_.7fr)_minmax(110px,_.8fr)] [align-items:center] [gap:14px] [padding:0_20px] [min-height:74px] [border-bottom:1px_solid_#f0f2ee] [&:last-child]:[border-bottom:0] max-[1100px]:[grid-template-columns:minmax(150px,_1.7fr)_minmax(110px,_1fr)_70px_76px_100px] max-[1100px]:[gap:9px] max-[1100px]:[padding-right:13px] max-[1100px]:[padding-left:13px] max-[850px]:[grid-template-columns:minmax(0,1fr)_90px] max-[850px]:[gap:9px_12px] max-[850px]:[padding-top:13px] max-[850px]:[padding-bottom:13px] max-[600px]:[grid-template-columns:minmax(0,1fr)_64px] max-[600px]:[padding-right:11px] max-[600px]:[padding-left:11px]" key={link.id}>
                <div className="[display:grid] [min-width:0] [gap:6px]">
                  <a className="[display:inline-flex] [width:fit-content] [max-width:100%] [align-items:center] [gap:4px] [overflow:hidden] [color:#2c634f] [text-decoration:none] [text-overflow:ellipsis] [white-space:nowrap] [font-size:11px] [font-weight:700] [&:hover]:[text-decoration:underline] max-[600px]:[font-size:10px]" href={link.shortUrl} rel="noreferrer" target="_blank">
                    {link.shortUrl.replace(/^https?:\/\//, "")}{" "}
                    <ExternalLink size={13} />
                  </a>
                  <span
                    className="[overflow:hidden] [color:#98a19b] [text-overflow:ellipsis] [white-space:nowrap] [font-size:9px]"
                    title={link.destinationUrl}
                  >
                    {link.destinationUrl}
                  </span>
                </div>
                <div className="[display:grid] [min-width:0] [gap:6px] max-[850px]:[grid-column:1] max-[850px]:[grid-row:2]">
                  <span className="[overflow:hidden] [color:#59675e] [text-overflow:ellipsis] [white-space:nowrap] [font-size:10px] [font-weight:600]">
                    {link.campaign?.name || (
                      <span className="[overflow:hidden] [color:#59675e] [text-overflow:ellipsis] [white-space:nowrap] [font-size:10px] [font-weight:600] [color:#a1aaa4] [font-weight:400]">Unassigned</span>
                    )}
                  </span>
                  <div className="[display:flex] [gap:4px]">
                    {(link.tags || []).slice(0, 3).map((tag) => (
                      <span className="[overflow:hidden] [color:#59675e] [text-overflow:ellipsis] [white-space:nowrap] [font-size:10px] [font-weight:600] [max-width:72px] [padding:3px_6px] [border-radius:3px] [background:#f1f3ed] [color:#78847a] [font-size:8px]" key={tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <strong className="[color:#38473e] [font-size:11px] max-[850px]:[grid-column:2] max-[850px]:[grid-row:1] max-[850px]:[justify-self:end] max-[600px]:[font-size:10px]">
                  {(link.totalClicks || 0).toLocaleString()} <span className="[color:#a0a9a3] [font-size:9px] [font-weight:500] max-[600px]:[display:block] max-[600px]:[margin-top:2px] max-[600px]:[text-align:right]">clicks</span>
                </strong>
                <span
                  className={`[display:inline-flex] [width:fit-content] [align-items:center] [gap:6px] [padding:5px_8px] [border-radius:12px] [background:#f1f3ef] [color:#818a84] [text-transform:capitalize] [font-size:9px] [font-weight:700] ${
                    link.status === "active"
                      ? "[background:#eff5e9] [color:#507648]"
                      : ""
                  }`}
                >
                  <span
                    className={`[width:5px] [height:5px] [border-radius:50%] [background:#9aa39c] ${
                      link.status === "active" ? "[background:#67a457]" : ""
                    }`}
                  />
                  {link.status}
                </span>
                <div className="[display:flex] [align-items:center] [gap:1px] max-[850px]:[grid-column:2] max-[850px]:[grid-row:2_/_4] max-[850px]:[justify-self:end] max-[850px]:[align-self:center] max-[600px]:[gap:0]">
                  <button
                    aria-label={`Copy ${link.shortCode}`}
                    className="[display:inline-grid] [width:38px] [height:38px] [place-items:center] [border:0] [border-radius:50%] [background:transparent] [color:#687570] [cursor:pointer] [&:hover]:[background:#edf0eb] [&:hover]:[color:var(--green-dark)] [width:31px] [height:31px] [color:#78857b] [&:disabled]:[opacity:.45] [&:disabled]:[cursor:wait] max-[600px]:[width:28px] max-[600px]:[height:29px]"
                    onClick={() => void copyLink(link)}
                    title="Copy short link"
                    type="button"
                  >
                    <Copy size={16} />
                  </button>
                  <button
                    aria-label={`Show QR code for ${link.shortCode}`}
                    className="[display:inline-grid] [width:38px] [height:38px] [place-items:center] [border:0] [border-radius:50%] [background:transparent] [color:#687570] [cursor:pointer] [&:hover]:[background:#edf0eb] [&:hover]:[color:var(--green-dark)] [width:31px] [height:31px] [color:#78857b] [&:disabled]:[opacity:.45] [&:disabled]:[cursor:wait] max-[600px]:[width:28px] max-[600px]:[height:29px]"
                    disabled={busyId === link.id}
                    onClick={() => void showQrCode(link)}
                    title="QR code"
                    type="button"
                  >
                    <QrCode size={17} />
                  </button>
                  <button
                    aria-label={`${link.status === "active" ? "Disable" : "Enable"} ${link.shortCode}`}
                    className="[display:inline-grid] [width:38px] [height:38px] [place-items:center] [border:0] [border-radius:50%] [background:transparent] [color:#687570] [cursor:pointer] [&:hover]:[background:#edf0eb] [&:hover]:[color:var(--green-dark)] [width:31px] [height:31px] [color:#78857b] [&:disabled]:[opacity:.45] [&:disabled]:[cursor:wait] max-[600px]:[width:28px] max-[600px]:[height:29px]"
                    disabled={busyId === link.id}
                    onClick={() => void toggleLink(link)}
                    title={
                      link.status === "active" ? "Disable link" : "Enable link"
                    }
                    type="button"
                  >
                    {link.status === "active" ? (
                      <ToggleRight size={20} />
                    ) : (
                      <ToggleLeft size={20} />
                    )}
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="[display:grid] [min-height:190px] [align-content:center] [justify-items:center] [gap:8px] [padding:22px] [color:#99a39c] [text-align:center] [font-size:11px]">
            <span className="[display:grid] [width:39px] [height:39px] [margin-bottom:4px] [place-items:center] [border-radius:50%] [background:#eff4e9] [color:var(--pulse-green)]">
              <ArrowUpRight size={21} />
            </span>
            <strong className="[color:#45544b] [font-size:14px] [font-family:'Manrope',_sans-serif]">
              {links.length
                ? "No links match these filters."
                : "Your next great link starts here."}
            </strong>
            <span>
              {links.length
                ? "Try another search or status filter."
                : "Create your first short link and see it come to life."}
            </span>
            {!links.length && (
              <button
                className="[display:inline-flex] [align-items:center] [gap:4px] [margin-top:7px] [padding:0] [border:0] [background:none] [color:var(--pulse-green)] [cursor:pointer] [font-size:11px] [font-weight:700]"
                onClick={onCreateLink}
                type="button"
              >
                Create a link <ArrowUpRight size={15} />
              </button>
            )}
          </div>
        )}
        <div className="[min-height:37px] [padding:12px_20px] [border-top:1px_solid_#f0f2ee] [color:#9aa39d] [font-size:9px]">
          {filteredLinks.length} {filteredLinks.length === 1 ? "link" : "links"}{" "}
          shown
        </div>
      </div>
      {qrCode && (
        <div
          className="[position:fixed] [z-index:20] [inset:0] [display:grid] [overflow-y:auto] [place-items:center] [padding:24px] [background:rgba(22,36,30,.5)] [backdrop-filter:blur(3px)] max-[600px]:[align-items:end] max-[600px]:[padding:0]"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setQrCode(null);
          }}
        >
          <section
            aria-labelledby="qr-title"
            aria-modal="true"
            className="[width:min(100%,_535px)] [max-height:min(90vh,_760px)] [overflow-y:auto] [padding:28px] [border:1px_solid_rgba(255,255,255,.6)] [border-radius:9px] [background:#fff] [box-shadow:0_20px_70px_rgba(22,40,31,.2)] [animation:rise-in_.2s_ease-out_both] [width:min(100%,_390px)] [text-align:center] max-[600px]:[width:100%] max-[600px]:[max-height:92vh] max-[600px]:[padding:23px_19px_21px] max-[600px]:[border-radius:12px_12px_0_0]"
            role="dialog"
          >
            <div className="[display:flex] [align-items:start] [justify-content:space-between] [gap:15px] [text-align:left]">
              <div>
                <p className="[margin:0_0_13px] [color:var(--green)] [font-size:10px] [font-weight:700] [letter-spacing:1.8px] [margin-bottom:9px] [&:last-child]:[margin:7px_0_0] [&:last-child]:[color:#849088] [&:last-child]:[font-size:11px]">SCAN TO OPEN</p>
                <h2 className="[margin:0] [color:#293931] [font-size:23px] [font-family:'Manrope',_sans-serif]" id="qr-title">Your QR code</h2>
                <p className="[&:last-child]:[margin:7px_0_0] [&:last-child]:[color:#849088] [&:last-child]:[font-size:11px]">{qrCode.shortCode}</p>
              </div>
              <button
                aria-label="Close QR code"
                className="[display:inline-grid] [width:38px] [height:38px] [place-items:center] [border:0] [border-radius:50%] [background:transparent] [color:#687570] [cursor:pointer] [&:hover]:[background:#edf0eb] [&:hover]:[color:var(--green-dark)] [flex:0_0_36px]"
                onClick={() => setQrCode(null)}
                type="button"
              >
                ×
              </button>
            </div>
            <img
              alt={`QR code for ${qrCode.shortCode}`}
              className="[display:block] [width:min(100%,_260px)] [margin:18px_auto] [image-rendering:pixelated]"
              src={qrCode.qrCode}
            />
            <a
              className="[display:inline-flex] [min-height:40px] [align-items:center] [justify-content:center] [gap:8px] [padding:0_15px] [border:1px_solid_var(--pulse-green)] [border-radius:5px] [background:var(--pulse-green)] [color:#fff] [cursor:pointer] [text-decoration:none] [font-size:12px] [font-weight:700] [transition:transform_.16s,_background_.16s] [&:hover:not(:disabled)]:[transform:translateY(-1px)] [&:hover:not(:disabled)]:[background:var(--pulse-green-dark)] [&:disabled]:[opacity:.65] [&:disabled]:[cursor:wait] [width:100%]"
              download={`${qrCode.shortCode}-qr.png`}
              href={qrCode.qrCode}
            >
              Download PNG <ArrowUpRight size={16} />
            </a>
          </section>
        </div>
      )}
      {importOpen && (
        <LinkImportModal
          campaigns={campaigns}
          onClose={() => setImportOpen(false)}
          onImport={importLinks}
        />
      )}
    </section>
  );
}

export { LinksPanel };
