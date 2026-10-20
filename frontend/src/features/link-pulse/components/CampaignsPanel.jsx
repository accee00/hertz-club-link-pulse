import { useState } from "react";
import { ArrowLeft, ArrowUpRight, FolderKanban, Plus } from "lucide-react";
import { useLinkPulse } from "../hook/useLinkPulse.js";

function CampaignsPanel() {
  const { campaigns, links, createCampaign } = useLinkPulse();
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState("");
  const selectedCampaign = campaigns.find(
    (campaign) => campaign.id === selectedCampaignId,
  );
  const selectedCampaignLinks = links.filter(
    (link) => link.campaign?.id === selectedCampaignId,
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await createCampaign(name.trim());
      setName("");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (selectedCampaign) {
    const clickCount = selectedCampaignLinks.reduce(
      (sum, link) => sum + (link.totalClicks || 0),
      0,
    );

    return (
      <section className="[padding:9px_0_35px] max-[600px]:[padding-top:5px]">
        <button
          className="[display:inline-flex] [align-items:center] [gap:7px] [margin:0_0_20px] [padding:7px_10px] [border:1px_solid_#e5e9e3] [border-radius:5px] [background:#fff] [color:#526057] [cursor:pointer] [font-size:11px] [font-weight:700]"
          onClick={() => setSelectedCampaignId("")}
          type="button"
        >
          <ArrowLeft size={15} /> Back to campaigns
        </button>
        <div className="[margin-bottom:20px]">
          <p className="[margin:0_0_8px] [color:var(--green)] [font-size:9px] [font-weight:700] [letter-spacing:1.8px]">
            CAMPAIGN DETAILS
          </p>
          <h1 className="[margin:0] [color:#27362f] [font-size:clamp(25px,_2.5vw,_34px)] [font-weight:650] [line-height:1.2] [letter-spacing:-.6px] [font-family:'Manrope',_sans-serif]">
            {selectedCampaign.name}
          </h1>
          <p className="[margin:8px_0_0] [color:#7c8780] [font-size:12px]">
            {selectedCampaign.workspace?.name || "Your workspace"}
          </p>
        </div>
        <section
          aria-label="Campaign summary"
          className="[display:grid] [grid-template-columns:repeat(3,_minmax(0,1fr))] [gap:12px] [margin-bottom:18px] max-[600px]:[grid-template-columns:1fr]"
        >
          {[
            ["LINKS", selectedCampaignLinks.length],
            ["TOTAL CLICKS", clickCount.toLocaleString()],
            [
              "ACTIVE LINKS",
              selectedCampaignLinks.filter((link) => link.status === "active")
                .length,
            ],
          ].map(([label, value]) => (
            <article
              className="[display:grid] [gap:8px] [padding:16px] [border:1px_solid_#e7ebe4] [border-radius:6px] [background:#fff]"
              key={label}
            >
              <span className="[color:#96a099] [font-size:9px] [font-weight:800] [letter-spacing:1px]">
                {label}
              </span>
              <strong className="[color:#273831] [font-size:23px] [font-family:'Manrope',_sans-serif]">
                {value}
              </strong>
            </article>
          ))}
        </section>
        <section className="[overflow:hidden] [border:1px_solid_#e7ebe4] [border-radius:6px] [background:#fff]">
          <div className="[padding:15px_16px] [border-bottom:1px_solid_#edf0eb]">
            <h2 className="[margin:0] [color:#39463e] [font-size:14px] [font-family:'Manrope',_sans-serif]">
              Campaign links
            </h2>
          </div>
          {selectedCampaignLinks.length ? (
            <div className="[overflow-x:auto]">
              <table className="[width:100%] [border-collapse:collapse] [text-align:left] [font-size:11px]">
                <thead>
                  <tr>
                    {["SHORT LINK", "DESTINATION", "STATUS", "CLICKS"].map(
                      (column) => (
                        <th
                          className="[padding:11px_14px] [border-bottom:1px_solid_#edf0eb] [background:#fbfcfa] [color:#9aa39c] [font-size:8px] [letter-spacing:.7px] [white-space:nowrap]"
                          key={column}
                        >
                          {column}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {selectedCampaignLinks.map((link) => (
                    <tr key={link.id}>
                      <td className="[padding:12px_14px] [border-bottom:1px_solid_#f0f2ee] [color:#111111] [font-weight:700] [white-space:nowrap]">
                        /{link.shortCode}
                      </td>
                      <td
                        className="[max-width:320px] [overflow:hidden] [padding:12px_14px] [border-bottom:1px_solid_#f0f2ee] [color:#6e7971] [text-overflow:ellipsis] [white-space:nowrap]"
                        title={link.destinationUrl}
                      >
                        {link.destinationUrl}
                      </td>
                      <td className="[padding:12px_14px] [border-bottom:1px_solid_#f0f2ee] [color:#6e7971] [text-transform:capitalize]">
                        {link.status}
                      </td>
                      <td className="[padding:12px_14px] [border-bottom:1px_solid_#f0f2ee] [color:#6e7971]">
                        {(link.totalClicks || 0).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="[margin:0] [padding:24px_16px] [color:#89948d] [font-size:11px]">
              No links have been added to this campaign yet.
            </p>
          )}
        </section>
      </section>
    );
  }

  return (
    <section className="[padding:9px_0_35px] max-[600px]:[padding-top:5px]">
      <div className="[display:flex] [align-items:end] [justify-content:space-between] [gap:20px] [margin:3px_0_23px] max-[600px]:[align-items:start] max-[600px]:[flex-direction:column] max-[600px]:[gap:14px] max-[600px]:[margin-bottom:17px]">
        <div>
          <p className="[margin:0_0_8px] [color:var(--green)] [font-size:9px] [font-weight:700] [letter-spacing:1.8px]">
            KEEP YOUR WORK IN SYNC
          </p>
          <h1 className="[margin:0] [color:#27362f] [font-size:clamp(25px,_2.5vw,_34px)] [font-weight:650] [line-height:1.2] [letter-spacing:-.6px] [font-family:'Manrope',_sans-serif] max-[600px]:[font-size:25px]">
            Campaigns with a pulse.
          </h1>
          <p className="[&:last-child]:[margin:8px_0_0] [&:last-child]:[color:#7c8780] [&:last-child]:[font-size:12px] max-[600px]:[&:last-child]:[max-width:340px] max-[600px]:[&:last-child]:[line-height:1.5]">
            Group related links and see how each campaign is performing.
          </p>
        </div>
      </div>
      <form
        className="[display:flex] [align-items:end] [gap:12px] [margin:24px_0_20px] [padding:18px] [border:1px_solid_#e7ebe4] [border-radius:6px] [background:#fff] max-[600px]:[flex-wrap:wrap] max-[600px]:[padding:13px]"
        onSubmit={handleSubmit}
      >
        <div className="[display:grid] [width:39px] [height:39px] [flex:0_0_39px] [align-self:center] [place-items:center] [background:#f0efea] [color:var(--pulse-green)] max-[600px]:[display:none]">
          <Plus size={19} />
        </div>
        <label className="[display:grid] [gap:8px] [color:#35413d] [font-size:12px] [font-weight:700] [flex:1] max-[600px]:[min-width:100%]">
          <span>Create a campaign</span>
          <input
            className="[width:100%] [min-width:0] [height:39px] [padding:0_12px] [border:1px_solid_#e1e7df] [border-radius:5px] [background:#fff] [color:#314039] [font-size:12px] [&::placeholder]:[color:#a0a9a4] [&:focus]:[border-color:var(--pulse-green)] [&:focus]:[outline:3px_solid_rgba(36,94,78,.09)]"
            maxLength={80}
            minLength={2}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Autumn launch"
            required
            value={name}
          />
        </label>
        <button
          className="[display:inline-flex] [min-height:40px] [align-items:center] [justify-content:center] [gap:8px] [padding:0_15px] [border:1px_solid_var(--pulse-green)] [border-radius:5px] [background:var(--pulse-green)] [color:#fff] [cursor:pointer] [text-decoration:none] [font-size:12px] [font-weight:700] [transition:transform_.16s,_background_.16s] [&:hover:not(:disabled)]:[transform:translateY(-1px)] [&:hover:not(:disabled)]:[background:var(--pulse-green-dark)] [&:disabled]:[opacity:.65] [&:disabled]:[cursor:wait] [min-height:39px] [flex:0_0_auto] max-[600px]:[margin-left:auto]"
          disabled={submitting}
          type="submit"
        >
          {submitting ? "Creating…" : "Add campaign"} <ArrowUpRight size={16} />
        </button>
      </form>
      {error && (
        <p
          className="[padding:10px_12px] [border-left:3px_solid_var(--red)] [background:#fff2ef] [color:#8c3b2d] [font-size:11px]"
          role="alert"
        >
          {error}
        </p>
      )}
      <div className="[display:grid] [grid-template-columns:repeat(3,_minmax(0,1fr))] [gap:13px] max-[1100px]:[grid-template-columns:repeat(2,_minmax(0,1fr))] max-[600px]:[grid-template-columns:1fr]">
        {campaigns.map((campaign, index) => {
          const campaignLinks = links.filter(
            (link) => link.campaign?.id === campaign.id,
          );
          const clickCount = campaignLinks.reduce(
            (sum, link) => sum + (link.totalClicks || 0),
            0,
          );
          return (
            <button
              aria-label={`Open campaign ${campaign.name}`}
              className="[min-height:220px] [padding:17px] [border:1px_solid_#e7ebe4] [background:#fff] [color:inherit] [text-align:left] [cursor:pointer] [transition:border-color_.16s,_transform_.16s] [&:hover]:[border-color:#a8a151] [&:hover]:[transform:translateY(-2px)] [&:focus-visible]:[outline:2px_solid_#a8a151] [&:focus-visible]:[outline-offset:3px] max-[600px]:[min-height:205px]"
              key={campaign.id}
              onClick={() => setSelectedCampaignId(campaign.id)}
              type="button"
            >
              <div
                className={`[display:grid] [width:37px] [height:37px] [margin-bottom:14px] [place-items:center] [background:#f0efea] [color:#a8a151] ${
                  [
                    "",
                    "[background:#f0efea] [color:#a8a151]",
                    "[background:#f5f5f5] [color:#3a3a3a]",
                    "[background:#a7bfd9] [color:#2c3e50]",
                  ][index % 4]
                }`}
              >
                <FolderKanban size={19} />
              </div>
              <span className="[color:#a1aaa4] [font-size:8px] [font-weight:800] [letter-spacing:1px]">
                CAMPAIGN {String(index + 1).padStart(2, "0")}
              </span>
              <h2 className="[overflow:hidden] [margin:7px_0_4px] [color:#314038] [text-overflow:ellipsis] [white-space:nowrap] [font-size:17px] [font-family:'Manrope',_sans-serif]">
                {campaign.name}
              </h2>
              <p className="[margin:0] [color:#9aa49c] [font-size:10px]">
                {campaign.workspace?.name || "Your workspace"}
              </p>
              <div className="[display:flex] [gap:17px] [margin-top:21px] [padding-bottom:13px] [border-bottom:1px_solid_#edf0eb] [color:#97a19a] [font-size:9px]">
                <span>
                  <strong className="[color:#3e4c43] [font-size:12px]">
                    {campaignLinks.length}
                  </strong>{" "}
                  links
                </span>
                <span>
                  <strong className="[color:#3e4c43] [font-size:12px]">
                    {clickCount.toLocaleString()}
                  </strong>{" "}
                  clicks
                </span>
              </div>
              <div className="[display:flex] [justify-content:space-between] [padding-top:11px] [color:#819087] [font-size:9px]">
                <span>
                  {
                    campaignLinks.filter((link) => link.status === "active")
                      .length
                  }{" "}
                  active
                </span>
                <ArrowUpRight size={16} />
              </div>
            </button>
          );
        })}
        {!campaigns.length && (
          <div className="[display:grid] [min-height:190px] [align-content:center] [justify-items:center] [gap:8px] [padding:22px] [color:#99a39c] [text-align:center] [font-size:11px] [grid-column:1_/_-1] [border:1px_dashed_#e0e7de] [border-radius:6px] [background:#fff]">
            <span className="[display:grid] [width:39px] [height:39px] [margin-bottom:4px] [place-items:center] [background:#f0efea] [color:var(--pulse-green)]">
              <FolderKanban size={20} />
            </span>
            <strong className="[color:#45544b] [font-size:14px] [font-family:'Manrope',_sans-serif]">
              No campaigns yet.
            </strong>
            <span>
              Create your first campaign above to start grouping links.
            </span>
          </div>
        )}
      </div>
    </section>
  );
}

export { CampaignsPanel };
