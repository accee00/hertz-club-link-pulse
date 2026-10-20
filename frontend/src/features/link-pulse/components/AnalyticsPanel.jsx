import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, BarChart3, MousePointer2, Users } from "lucide-react";
import { useLinkPulse } from "../hook/useLinkPulse.js";

function AnalyticsPanel() {
  const { links, campaigns, loadAnalytics } = useLinkPulse();
  const options = useMemo(
    () => [
      ...campaigns.map((campaign) => ({
        id: `campaign:${campaign.id}`,
        kind: "campaign",
        name: campaign.name,
      })),
      ...links.map((link) => ({
        id: `link:${link.id}`,
        kind: "link",
        name: link.shortCode,
      })),
    ],
    [campaigns, links],
  );
  const [selectedId, setSelectedId] = useState("");
  const [period, setPeriod] = useState("7d");
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!options.some((option) => option.id === selectedId)) {
      setSelectedId(options[0]?.id || "");
    }
  }, [options, selectedId]);

  useEffect(() => {
    if (!selectedId) {
      setAnalytics(null);
      return undefined;
    }
    const [kind, id] = selectedId.split(":");
    let active = true;
    setLoading(true);
    setError("");
    loadAnalytics(kind, id, period)
      .then((response) => {
        if (active) setAnalytics(response.data);
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
  }, [loadAnalytics, period, selectedId]);

  const summary = analytics?.summary;
  const series = analytics?.timeSeries || [];
  const maxClicks = Math.max(1, ...series.map((point) => point.clicks));
  const selected = options.find((option) => option.id === selectedId);

  return (
    <section className="[padding:9px_0_35px] max-[600px]:[padding-top:5px]">
      <div className="[display:flex] [align-items:end] [justify-content:space-between] [gap:20px] [margin:3px_0_23px] [align-items:center] max-[600px]:[align-items:start] max-[600px]:[flex-direction:column] max-[600px]:[gap:14px] max-[600px]:[margin-bottom:17px] max-[600px]:[align-items:stretch]">
        <div>
          <h1 className="[margin:0] [color:#27362f] [font-size:clamp(25px,_2.5vw,_34px)] [font-weight:650] [line-height:1.2] [letter-spacing:-.6px] [font-family:'Manrope',_sans-serif] max-[600px]:[font-size:25px]">Analytics</h1>
        </div>
        <div className="[display:flex] [gap:8px] max-[600px]:[display:grid] max-[600px]:[grid-template-columns:1fr_1fr]">
          <label className="[position:absolute] [width:1px] [height:1px] [overflow:hidden] [clip:rect(0,0,0,0)] [white-space:nowrap] [clip-path:inset(50%)]" htmlFor="analytics-target">
            Choose a campaign or link
          </label>
          <select className="[width:100%] [height:39px] [padding:0_10px] [border:1px_solid_#e5e9e3] [border-radius:5px] [background:#fafbf9] [color:#36433d] [font-size:12px] [min-width:140px] [background:#fff] [&:first-of-type]:[max-width:210px] max-[600px]:[min-width:0] max-[600px]:[&:first-of-type]:[max-width:none]"
            id="analytics-target"
            onChange={(event) => setSelectedId(event.target.value)}
            value={selectedId}
          >
            {campaigns.length > 0 && (
              <optgroup label="Campaigns">
                {options
                  .filter((option) => option.kind === "campaign")
                  .map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
              </optgroup>
            )}
            {links.length > 0 && (
              <optgroup label="Links">
                {options
                  .filter((option) => option.kind === "link")
                  .map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
              </optgroup>
            )}
          </select>
          <select className="[width:100%] [height:39px] [padding:0_10px] [border:1px_solid_#e5e9e3] [border-radius:5px] [background:#fafbf9] [color:#36433d] [font-size:12px] [min-width:140px] [background:#fff] [&:first-of-type]:[max-width:210px] max-[600px]:[min-width:0] max-[600px]:[&:first-of-type]:[max-width:none]"
            aria-label="Analytics period"
            onChange={(event) => setPeriod(event.target.value)}
            value={period}
          >
            <option value="24h">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="all">All time</option>
          </select>
        </div>
      </div>
      {error && (
        <p className="[padding:10px_12px] [border-left:3px_solid_var(--red)] [background:#fff2ef] [color:#8c3b2d] [font-size:11px]" role="alert">
          {error}
        </p>
      )}
      {loading && !analytics ? (
        <p className="[display:grid] [min-height:190px] [align-content:center] [justify-items:center] [gap:8px] [padding:22px] [color:#99a39c] [text-align:center] [font-size:11px]">Gathering your analytics…</p>
      ) : !selected ? (
        <div className="[display:grid] [min-height:190px] [align-content:center] [justify-items:center] [gap:8px] [padding:22px] [color:#99a39c] [text-align:center] [font-size:11px] [min-height:260px] [border:1px_dashed_#e0e7de] [border-radius:6px] [background:#fff]">
          <span className="[display:grid] [width:39px] [height:39px] [margin-bottom:4px] [place-items:center] [background:#f0efea] [color:var(--pulse-green)]">
            <BarChart3 size={20} />
          </span>
          <strong className="[color:#45544b] [font-size:14px] [font-family:'Manrope',_sans-serif]">No analytics yet</strong>
          <span>Create a link to see click data.</span>
        </div>
      ) : (
        analytics && (
          <>
            <div className="[display:grid] [grid-template-columns:repeat(3,_minmax(0,1fr))] [gap:13px] [margin:23px_0_14px] max-[600px]:[grid-template-columns:1fr] max-[600px]:[gap:8px] max-[600px]:[margin-top:16px]">
              <article className="[position:relative] [display:grid] [min-height:132px] [align-content:start] [gap:7px] [padding:17px] [border:1px_solid_#e7ebe4] [border-radius:6px] [background:#fff] [border-color:#dce7d7] [background:linear-gradient(135deg,_#f8fbf3,_#fff)] max-[600px]:[min-height:105px]">
                <span className="[position:absolute] [top:14px] [right:15px] [display:grid] [width:30px] [height:30px] [place-items:center] [border-radius:7px] [background:#eef3e9] [color:var(--pulse-green)]">
                  <MousePointer2 size={18} />
                </span>
                <span className="[color:#94a097] [font-size:8px] [font-weight:800] [letter-spacing:1px]">TOTAL CLICKS</span>
                <strong className="[margin-top:4px] [color:#293a31] [font-size:27px] [font-family:'Manrope',_sans-serif]">{(summary?.totalClicks || 0).toLocaleString()}</strong>
                <span className="[color:#9ba49e] [font-size:9px]">
                  {selected.name} ·{" "}
                  {period === "all" ? "all time" : `last ${period}`}
                </span>
              </article>
              <article className="[position:relative] [display:grid] [min-height:132px] [align-content:start] [gap:7px] [padding:17px] [border:1px_solid_#e7ebe4] [border-radius:6px] [background:#fff] max-[600px]:[min-height:105px]">
                <span className="[position:absolute] [top:14px] [right:15px] [display:grid] [width:30px] [height:30px] [place-items:center] [border-radius:7px] [background:#eef3e9] [color:var(--pulse-green)]">
                  <Users size={18} />
                </span>
                <span className="[color:#94a097] [font-size:8px] [font-weight:800] [letter-spacing:1px]">UNIQUE VISITORS</span>
                <strong className="[margin-top:4px] [color:#293a31] [font-size:27px] [font-family:'Manrope',_sans-serif]">
                  {(summary?.uniqueVisitors || 0).toLocaleString()}
                </strong>
                <span className="[color:#9ba49e] [font-size:9px]">
                  Distinct visitors in this period
                </span>
              </article>
              <article className="[position:relative] [display:grid] [min-height:132px] [align-content:start] [gap:7px] [padding:17px] [border:1px_solid_#e7ebe4] [border-radius:6px] [background:#fff] max-[600px]:[min-height:105px]">
                <span className="[position:absolute] [top:14px] [right:15px] [display:grid] [width:30px] [height:30px] [place-items:center] [border-radius:7px] [background:#eef3e9] [color:var(--pulse-green)]">
                  <BarChart3 size={18} />
                </span>
                <span className="[color:#94a097] [font-size:8px] [font-weight:800] [letter-spacing:1px]">QR SCANS</span>
                <strong className="[margin-top:4px] [color:#293a31] [font-size:27px] [font-family:'Manrope',_sans-serif]">{(summary?.qrScans || 0).toLocaleString()}</strong>
                <span className="[color:#9ba49e] [font-size:9px]">
                  {(summary?.directClicks || 0).toLocaleString()} direct visits
                </span>
              </article>
            </div>
            <div className="[display:grid] [grid-template-columns:minmax(0,1.55fr)_minmax(220px,1fr)] [gap:13px] max-[850px]:[grid-template-columns:1fr] max-[600px]:[gap:9px]">
              <section className="[min-width:0] [padding:17px] [border:1px_solid_#e7ebe4] [border-radius:6px] [background:#fff] [min-height:262px] max-[600px]:[padding:13px]">
                <div className="[display:flex] [align-items:start] [justify-content:space-between] [gap:12px]">
                  <div>
                    <h2 className="[margin:0] [color:#34433a] [font-size:14px] [font-family:'Manrope',_sans-serif]">Click activity</h2>
                    <p className="[margin:5px_0_0] [color:#99a39c] [font-size:9px]">Clicks over the selected period</p>
                  </div>
                  <span className="[display:inline-flex] [align-items:center] [gap:5px] [color:#89958c] [font-size:9px]">
                    <i className="[width:7px] [height:7px] [border-radius:50%] [background:#67a17c]" /> Clicks
                  </span>
                </div>
                {series.length ? (
                  <div
                    className="[display:flex] [height:168px] [align-items:end] [gap:7px] [overflow-x:auto] [margin-top:24px] [padding:0_2px_0] [border-bottom:1px_solid_#edf0eb] max-[600px]:[gap:3px]"
                    aria-label={`${series.length} time periods of click data`}
                  >
                    {series.map((point) => (
                      <div
                        className="[display:flex] [min-width:18px] [height:100%] [flex:1_0_18px] [flex-direction:column] [align-items:center] [justify-content:end] [gap:5px]"
                        key={point.date}
                        title={`${point.date}: ${point.clicks} clicks`}
                      >
                        <span className="[min-height:10px] [color:#859188] [font-size:8px]">
                          {point.clicks || ""}
                        </span>
                        <span
                          className="[width:min(100%,_24px)] [min-height:4px] [border-radius:3px_3px_0_0] [background:linear-gradient(180deg,_#79b589,_#3f795c)]"
                          style={{
                            height: `${Math.max(5, (point.clicks / maxClicks) * 100)}%`,
                          }}
                        />
                        <span className="[overflow:hidden] [width:100%] [padding-top:4px] [color:#a0aaa3] [text-align:center] [text-overflow:ellipsis] [white-space:nowrap] [font-size:8px]">
                          {period === "24h"
                            ? point.date.slice(-5)
                            : point.date.slice(5)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="[display:grid] [min-height:140px] [place-items:center] [color:#a1aaa4] [text-align:center] [font-size:10px]">
                    No clicks recorded in this period yet.
                  </p>
                )}
              </section>
              <section className="[min-width:0] [padding:17px] [border:1px_solid_#e7ebe4] [border-radius:6px] [background:#fff]">
                <div className="[display:flex] [align-items:start] [justify-content:space-between] [gap:12px]">
                  <div>
                    <h2 className="[margin:0] [color:#34433a] [font-size:14px] [font-family:'Manrope',_sans-serif]">Devices</h2>
                    <p className="[margin:5px_0_0] [color:#99a39c] [font-size:9px]">By device</p>
                  </div>
                  <ArrowUpRight size={17} />
                </div>
                {Object.entries(analytics.byDevice || {}).some(
                  ([, count]) => count > 0,
                ) ? (
                  <div className="[display:grid] [gap:15px] [margin-top:24px]">
                    {Object.entries(analytics.byDevice).map(
                      ([device, count]) => {
                        const total = Math.max(1, summary?.totalClicks || 0);
                        return (
                          <div className="[display:grid] [grid-template-columns:56px_1fr_24px] [align-items:center] [gap:9px] [color:#77847b] [text-transform:capitalize] [font-size:9px]" key={device}>
                            <span>{device}</span>
                            <div className="[height:5px] [overflow:hidden] [border-radius:4px] [background:#f0f2ed]">
                              <span className="[display:block] [height:100%] [border-radius:inherit] [background:#6c9d71]"
                                style={{ width: `${(count / total) * 100}%` }}
                              />
                            </div>
                            <strong className="[color:#405047] [text-align:right] [font-size:10px]">{count}</strong>
                          </div>
                        );
                      },
                    )}
                  </div>
                ) : (
                  <p className="[display:grid] [min-height:140px] [place-items:center] [color:#a1aaa4] [text-align:center] [font-size:10px]">
                    Device details will appear after the first click.
                  </p>
                )}
              </section>
              <section className="[min-width:0] [padding:17px] [border:1px_solid_#e7ebe4] [border-radius:6px] [background:#fff] [grid-column:1_/_-1] max-[850px]:[grid-column:auto]">
                <div className="[display:flex] [align-items:start] [justify-content:space-between] [gap:12px]">
                  <div>
                    <h2 className="[margin:0] [color:#34433a] [font-size:14px] [font-family:'Manrope',_sans-serif]">Top referrers</h2>
                    <p className="[margin:5px_0_0] [color:#99a39c] [font-size:9px]">By source</p>
                  </div>
                  <ArrowUpRight size={17} />
                </div>
                {analytics.topReferrers?.length ? (
                  <div className="[display:grid] [gap:15px] [margin-top:24px] [grid-template-columns:repeat(2,_minmax(0,1fr))] [gap:0_22px] max-[600px]:[grid-template-columns:1fr]">
                    {analytics.topReferrers.slice(0, 5).map((referrer) => (
                      <div className="[display:flex] [min-width:0] [justify-content:space-between] [gap:12px] [padding:10px_0] [border-bottom:1px_solid_#f0f2ee] [color:#748078] [font-size:10px]" key={referrer.referrer}>
                        <span className="[overflow:hidden] [text-overflow:ellipsis] [white-space:nowrap]" title={referrer.referrer}>
                          {referrer.referrer}
                        </span>
                        <strong className="[color:#405047] [text-align:right] [font-size:10px]">{referrer.count}</strong>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="[display:grid] [min-height:140px] [place-items:center] [color:#a1aaa4] [text-align:center] [font-size:10px]">
                    Referrer data will appear after the first click.
                  </p>
                )}
              </section>
            </div>
          </>
        )
      )}
    </section>
  );
}

export { AnalyticsPanel };
