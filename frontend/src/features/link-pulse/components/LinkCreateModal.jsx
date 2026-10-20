import { useState } from "react";
import { ArrowLeft, ArrowRight, X } from "lucide-react";

function LinkCreateModal({ campaigns, onClose, onCreate }) {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    if (step === 1) {
      setStep(2);
      return;
    }

    const formData = new FormData(event.currentTarget);
    const clickLimit = formData.get("clickLimit");
    const expiresAt = formData.get("expiresAt");
    const tags = formData.get("tags");
    setSubmitting(true);
    try {
      const link = await onCreate({
        destinationUrl: formData.get("destinationUrl").trim(),
        customAlias: formData.get("customAlias").trim() || null,
        campaignId: formData.get("campaignId") || null,
        tags: tags
          ? tags
              .split(",")
              .map((tag) => tag.trim())
              .filter(Boolean)
          : [],
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
        clickLimit: clickLimit ? Number(clickLimit) : null,
        password: formData.get("password") || null,
      });
      onClose(link);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="[position:fixed] [z-index:20] [inset:0] [display:grid] [overflow-y:auto] [place-items:center] [padding:24px] [background:rgba(22,36,30,.5)] [backdrop-filter:blur(3px)] max-[600px]:[align-items:end] max-[600px]:[padding:0]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        aria-labelledby="create-link-title"
        aria-modal="true"
        className="[width:min(100%,_535px)] [max-height:min(90vh,_760px)] [overflow-y:auto] [padding:28px] [border:1px_solid_rgba(255,255,255,.6)] [border-radius:9px] [background:#fff] [box-shadow:0_20px_70px_rgba(22,40,31,.2)] [animation:rise-in_.2s_ease-out_both] max-[600px]:[width:100%] max-[600px]:[max-height:92vh] max-[600px]:[padding:23px_19px_21px] max-[600px]:[border-radius:12px_12px_0_0]"
        role="dialog"
      >
        <div className="[display:flex] [align-items:start] [justify-content:space-between] [gap:15px]">
          <div>
            <p className="[margin:0_0_13px] [color:var(--green)] [font-size:10px] [font-weight:700] [letter-spacing:1.8px] [margin-bottom:9px] [&:last-child]:[margin:7px_0_0] [&:last-child]:[color:#849088] [&:last-child]:[font-size:11px]">
              NEW SHORT LINK · STEP {step} OF 2
            </p>
            <h2
              className="[margin:0] [color:#293931] [font-size:23px] [font-family:'Manrope',_sans-serif]"
              id="create-link-title"
            >
              {step === 1 ? "Link destination" : "Link settings"}
            </h2>
            <p className="[&:last-child]:[margin:7px_0_0] [&:last-child]:[color:#849088] [&:last-child]:[font-size:11px]">
              {step === 1
                ? "Enter a destination and optional alias."
                : "Choose a campaign and access settings."}
            </p>
          </div>
          <button
            aria-label="Close"
            className="[display:inline-grid] [width:38px] [height:38px] [place-items:center] [border:0] [border-radius:50%] [background:transparent] [color:#687570] [cursor:pointer] [&:hover]:[background:#edf0eb] [&:hover]:[color:var(--green-dark)] [flex:0_0_36px]"
            onClick={() => onClose()}
            type="button"
          >
            <X size={19} />
          </button>
        </div>
        <div
          aria-label={`Step ${step} of 2`}
          className="[display:grid] [grid-template-columns:1fr_1fr] [gap:7px] [margin:22px_0]"
        >
          <span
            className={`[height:4px] [border-radius:2px] [background:#e8ece6] ${
              step >= 1 ? "[background:var(--pulse-green)]" : ""
            }`}
          />
          <span
            className={`[height:4px] [border-radius:2px] [background:#e8ece6] ${
              step >= 2 ? "[background:var(--pulse-green)]" : ""
            }`}
          />
        </div>
        {error && (
          <p
            className="[padding:10px_12px] [border-left:3px_solid_var(--red)] [background:#fff2ef] [color:#8c3b2d] [font-size:11px]"
            role="alert"
          >
            {error}
          </p>
        )}
        <form className="[display:grid] [gap:17px]" onSubmit={handleSubmit}>
          <div
            className={`[gap:17px] ${step === 1 ? "[display:grid]" : "hidden"}`}
          >
            <label className="[display:grid] [gap:7px] [color:#35413d] [font-size:12px] [font-weight:700]">
              <span>Destination URL</span>
              <input
                className="[width:100%] [min-width:0] [height:43px] [padding:0_12px] [border:1px_solid_#e1e7df] [border-radius:5px] [background:#fff] [color:#314039] [font-size:12px] [&::placeholder]:[color:#a0a9a4] [&:focus]:[border-color:var(--pulse-green)] [&:focus]:[outline:3px_solid_rgba(36,94,78,.09)]"
                autoFocus
                name="destinationUrl"
                placeholder="https://example.com/your-page"
                required
                type="url"
              />
            </label>
            <label className="[display:grid] [gap:7px] [color:#35413d] [font-size:12px] [font-weight:700]">
              <span>
                Custom alias{" "}
                <span className="[margin-left:4px] [color:#a5ada7] [font-size:8px] [letter-spacing:.6px]">
                  OPTIONAL
                </span>
              </span>
              <input
                className="[width:100%] [min-width:0] [height:43px] [padding:0_12px] [border:1px_solid_#e1e7df] [border-radius:5px] [background:#fff] [color:#314039] [font-size:12px] [&::placeholder]:[color:#a0a9a4] [&:focus]:[border-color:var(--pulse-green)] [&:focus]:[outline:3px_solid_rgba(36,94,78,.09)]"
                maxLength={30}
                minLength={3}
                name="customAlias"
                pattern="[a-zA-Z0-9_-]+"
                placeholder="summer-launch"
              />
              <small className="[color:#9ba49e] [font-size:10px] [font-weight:400]">
                Leave blank and we’ll generate one for you.
              </small>
            </label>
          </div>
          <div
            className={`[gap:17px] ${step === 2 ? "[display:grid]" : "hidden"}`}
          >
            <label className="[display:grid] [gap:7px] [color:#35413d] [font-size:12px] [font-weight:700]">
              <span>
                Campaign{" "}
                <span className="[margin-left:4px] [color:#a5ada7] [font-size:8px] [letter-spacing:.6px]">
                  OPTIONAL
                </span>
              </span>
              <select
                className="[width:100%] [min-width:0] [height:43px] [padding:0_12px] [border:1px_solid_#e1e7df] [border-radius:5px] [background:#fff] [color:#314039] [font-size:12px] [&:focus]:[border-color:var(--pulse-green)] [&:focus]:[outline:3px_solid_rgba(36,94,78,.09)]"
                defaultValue=""
                name="campaignId"
              >
                <option value="">No campaign</option>
                {campaigns.map((campaign) => (
                  <option key={campaign.id} value={campaign.id}>
                    {campaign.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="[display:grid] [gap:7px] [color:#35413d] [font-size:12px] [font-weight:700]">
              <span>
                Tags{" "}
                <span className="[margin-left:4px] [color:#a5ada7] [font-size:8px] [letter-spacing:.6px]">
                  OPTIONAL
                </span>
              </span>
              <input
                className="[width:100%] [min-width:0] [height:43px] [padding:0_12px] [border:1px_solid_#e1e7df] [border-radius:5px] [background:#fff] [color:#314039] [font-size:12px] [&::placeholder]:[color:#a0a9a4] [&:focus]:[border-color:var(--pulse-green)] [&:focus]:[outline:3px_solid_rgba(36,94,78,.09)]"
                name="tags"
                placeholder="product, launch, social"
              />
              <small className="[color:#9ba49e] [font-size:10px] [font-weight:400]">
                Separate tags with commas.
              </small>
            </label>
            <div className="[display:grid] [grid-template-columns:1fr_1fr] [gap:12px] max-[600px]:[grid-template-columns:1fr]">
              <label className="[display:grid] [gap:7px] [color:#35413d] [font-size:12px] [font-weight:700]">
                <span>
                  Expires on{" "}
                  <span className="[margin-left:4px] [color:#a5ada7] [font-size:8px] [letter-spacing:.6px]">
                    OPTIONAL
                  </span>
                </span>
                <input
                  className="[width:100%] [min-width:0] [height:43px] [padding:0_12px] [border:1px_solid_#e1e7df] [border-radius:5px] [background:#fff] [color:#314039] [font-size:12px] [&::placeholder]:[color:#a0a9a4] [&:focus]:[border-color:var(--pulse-green)] [&:focus]:[outline:3px_solid_rgba(36,94,78,.09)]"
                  name="expiresAt"
                  type="datetime-local"
                />
              </label>
              <label className="[display:grid] [gap:7px] [color:#35413d] [font-size:12px] [font-weight:700]">
                <span>
                  Click limit{" "}
                  <span className="[margin-left:4px] [color:#a5ada7] [font-size:8px] [letter-spacing:.6px]">
                    OPTIONAL
                  </span>
                </span>
                <input
                  className="[width:100%] [min-width:0] [height:43px] [padding:0_12px] [border:1px_solid_#e1e7df] [border-radius:5px] [background:#fff] [color:#314039] [font-size:12px] [&::placeholder]:[color:#a0a9a4] [&:focus]:[border-color:var(--pulse-green)] [&:focus]:[outline:3px_solid_rgba(36,94,78,.09)]"
                  min="1"
                  name="clickLimit"
                  placeholder="No limit"
                  type="number"
                />
              </label>
            </div>
            <label className="[display:grid] [gap:7px] [color:#35413d] [font-size:12px] [font-weight:700]">
              <span>
                Password protection{" "}
                <span className="[margin-left:4px] [color:#a5ada7] [font-size:8px] [letter-spacing:.6px]">
                  OPTIONAL
                </span>
              </span>
              <input
                className="[width:100%] [min-width:0] [height:43px] [padding:0_12px] [border:1px_solid_#e1e7df] [border-radius:5px] [background:#fff] [color:#314039] [font-size:12px] [&::placeholder]:[color:#a0a9a4] [&:focus]:[border-color:var(--pulse-green)] [&:focus]:[outline:3px_solid_rgba(36,94,78,.09)]"
                minLength={4}
                name="password"
                placeholder="At least 4 characters"
                type="password"
              />
            </label>
          </div>
          <div className="[display:flex] [align-items:center] [justify-content:space-between] [gap:12px] [margin-top:4px]">
            {step === 2 ? (
              <button
                className="[display:inline-flex] [min-height:40px] [align-items:center] [gap:6px] [padding:0_12px] [border:1px_solid_#e1e7df] [border-radius:5px] [background:#fff] [color:#66736b] [cursor:pointer] [font-size:11px] [font-weight:700] [&:disabled]:[opacity:.55] [&:disabled]:[cursor:wait]"
                onClick={() => setStep(1)}
                type="button"
              >
                <ArrowLeft size={16} /> Back
              </button>
            ) : (
              <span />
            )}
            <button
              className="[display:inline-flex] [min-height:40px] [align-items:center] [justify-content:center] [gap:8px] [padding:0_15px] [border:1px_solid_var(--pulse-green)] [border-radius:5px] [background:var(--pulse-green)] [color:#fff] [cursor:pointer] [text-decoration:none] [font-size:12px] [font-weight:700] [transition:transform_.16s,_background_.16s] [&:hover:not(:disabled)]:[transform:translateY(-1px)] [&:hover:not(:disabled)]:[background:var(--pulse-green-dark)] [&:disabled]:[opacity:.65] [&:disabled]:[cursor:wait]"
              disabled={submitting}
              type="submit"
            >
              {step === 1 ? (
                <>
                  Options <ArrowRight size={16} />
                </>
              ) : submitting ? (
                "Creating…"
              ) : (
                <>
                  Create short link <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export { LinkCreateModal };
