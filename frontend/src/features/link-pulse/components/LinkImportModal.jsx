import { useState } from "react";
import { ArrowUpRight, FileUp, X } from "lucide-react";

function LinkImportModal({ onClose, onImport }) {
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [results, setResults] = useState(null);
  const [importing, setImporting] = useState(false);

  const handleFile = (event) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;
    setError("");
    setResults(null);
    setFile(null);
    if (
      !selectedFile.name.toLowerCase().endsWith(".csv") ||
      selectedFile.size > 2_000_000
    ) {
      setError("Choose a CSV file smaller than 2 MB.");
      return;
    }
    setFile(selectedFile);
  };

  const handleImport = async () => {
    setError("");
    setImporting(true);
    try {
      setResults(await onImport(file));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div
      className="[position:fixed] [z-index:20] [inset:0] [display:grid] [overflow-y:auto] [place-items:center] [padding:24px] [background:rgba(22,36,30,.5)] [backdrop-filter:blur(3px)] max-[600px]:[align-items:end] max-[600px]:[padding:0]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !importing) onClose();
      }}
    >
      <section
        aria-labelledby="import-links-title"
        aria-modal="true"
        className="[width:min(100%,_535px)] [max-height:min(90vh,_760px)] [overflow-y:auto] [padding:28px] [border:1px_solid_rgba(255,255,255,.6)] [border-radius:9px] [background:#fff] [box-shadow:0_20px_70px_rgba(22,40,31,.2)] [animation:rise-in_.2s_ease-out_both] [width:min(100%,_600px)] max-[600px]:[width:100%] max-[600px]:[max-height:92vh] max-[600px]:[padding:23px_19px_21px] max-[600px]:[border-radius:12px_12px_0_0]"
        role="dialog"
      >
        <div className="[display:flex] [align-items:start] [justify-content:space-between] [gap:15px]">
          <div>
            <p className="[margin:0_0_13px] [color:var(--green)] [font-size:10px] [font-weight:700] [letter-spacing:1.8px] [margin-bottom:9px] [&:last-child]:[margin:7px_0_0] [&:last-child]:[color:#849088] [&:last-child]:[font-size:11px]">BULK LINK IMPORT</p>
            <h2 className="[margin:0] [color:#293931] [font-size:23px] [font-family:'Manrope',_sans-serif]" id="import-links-title">Bring your links along.</h2>
            <p className="[&:last-child]:[margin:7px_0_0] [&:last-child]:[color:#849088] [&:last-child]:[font-size:11px]">
              Upload a CSV to validate and import links into this workspace.
            </p>
          </div>
          <button
            aria-label="Close"
            className="[display:inline-grid] [width:38px] [height:38px] [place-items:center] [border:0] [border-radius:50%] [background:transparent] [color:#687570] [cursor:pointer] [&:hover]:[background:#edf0eb] [&:hover]:[color:var(--green-dark)] [flex:0_0_36px]"
            disabled={importing}
            onClick={onClose}
            type="button"
          >
            <X size={19} />
          </button>
        </div>
        <div className="[display:grid] [gap:6px] [margin:20px_0_12px] [padding:12px] [border:1px_solid_#e8ede5] [border-radius:5px] [background:#f9fbf7] [color:#7d8980] [font-size:10px] [line-height:1.55]">
          <strong className="[color:#48574e] [font-size:10px]">CSV columns</strong>
          <span>
            Required: <code className="[color:#376b50] [font-size:9px]">destinationUrl</code>. Optional:{" "}
            <code className="[color:#376b50] [font-size:9px]">customAlias</code>, <code className="[color:#376b50] [font-size:9px]">tags</code> (use | between tags),{" "}
            <code className="[color:#376b50] [font-size:9px]">campaign</code> (existing campaign name).
          </span>
        </div>
        <label className="[position:relative] [display:flex] [min-height:47px] [align-items:center] [gap:10px] [overflow:hidden] [padding:0_13px] [border:1px_dashed_#bacbb7] [border-radius:5px] [background:#fbfcfa] [color:#55705d] [cursor:pointer] [font-size:11px] [font-weight:700] [&:hover]:[border-color:var(--pulse-green)] [&:hover]:[background:#f6f9f3]">
          <FileUp size={19} />
          <span>
            {file?.name || "Choose a CSV file"}
          </span>
          <input className="[position:absolute] [inset:0] [width:100%] [height:100%] [opacity:0] [cursor:pointer]"
            accept=".csv,text/csv"
            onChange={(event) => void handleFile(event)}
            type="file"
          />
        </label>
        {error && (
          <p className="[padding:10px_12px] [border-left:3px_solid_var(--red)] [background:#fff2ef] [color:#8c3b2d] [font-size:11px]" role="alert">
            {error}
          </p>
        )}
        {results && (
          <div className="[display:grid] [gap:6px] [max-height:120px] [overflow-y:auto] [margin-top:13px] [padding:11px] [border-radius:4px] [background:#f3f7ef] [color:#577252] [font-size:10px]" role="status">
            <strong className="[color:#426347] [font-size:11px]">
              Imported {results.filter((result) => result.link).length} of{" "}
              {results.length} links; {results.filter((result) => result.error).length} need attention.
            </strong>
            {results
              .filter((result) => result.error)
              .map((result) => (
                <span key={result.rowNumber}>
                  Row {result.rowNumber}: {result.error}
                </span>
              ))}
          </div>
        )}
        <div className="[display:flex] [align-items:center] [justify-content:space-between] [gap:12px] [margin-top:4px] [margin-top:16px]">
          <button
            className="[display:inline-flex] [min-height:40px] [align-items:center] [gap:6px] [padding:0_12px] [border:1px_solid_#e1e7df] [border-radius:5px] [background:#fff] [color:#66736b] [cursor:pointer] [font-size:11px] [font-weight:700] [&:disabled]:[opacity:.55] [&:disabled]:[cursor:wait]"
            disabled={importing}
            onClick={onClose}
            type="button"
          >
            {results ? "Done" : "Cancel"}
          </button>
          {!results && (
            <button
              className="[display:inline-flex] [min-height:40px] [align-items:center] [justify-content:center] [gap:8px] [padding:0_15px] [border:1px_solid_var(--pulse-green)] [border-radius:5px] [background:var(--pulse-green)] [color:#fff] [cursor:pointer] [text-decoration:none] [font-size:12px] [font-weight:700] [transition:transform_.16s,_background_.16s] [&:hover:not(:disabled)]:[transform:translateY(-1px)] [&:hover:not(:disabled)]:[background:var(--pulse-green-dark)] [&:disabled]:[opacity:.65] [&:disabled]:[cursor:wait]"
              disabled={!file || importing}
              onClick={() => void handleImport()}
              type="button"
            >
              {importing ? (
                "Importing…"
              ) : (
                <>
                  Import CSV <ArrowUpRight size={15} />
                </>
              )}
            </button>
          )}
        </div>
      </section>
    </div>
  );
}

export { LinkImportModal };
