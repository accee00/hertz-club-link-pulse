import { ArrowUpRight, Link2 } from 'lucide-react';

function AuthLayout({ children, eyebrow, title, description }) {
  return (
    <main className="[min-height:100vh] [display:grid] [grid-template-columns:minmax(0,_1.05fr)_minmax(440px,_.95fr)] [background:var(--paper)] max-[900px]:[grid-template-columns:minmax(0,_.8fr)_minmax(400px,_1fr)] max-[700px]:[display:block]">
      <section className="[min-height:100vh] [position:relative] [isolation:isolate] [display:flex] [flex-direction:column] [justify-content:space-between] [overflow:hidden] [padding:38px_clamp(32px,_5.2vw,_82px)_30px] [color:white] [background:#243a34] max-[900px]:[padding-right:34px] max-[900px]:[padding-left:34px] max-[700px]:[min-height:230px] max-[700px]:[padding:22px_24px]" aria-label="Link Pulse">
        <div className="[position:absolute] [z-index:-2] [inset:0] [background-position:center] [background-size:cover] [transform:scale(1.02)] [animation:photo-arrive_1.1s_ease-out_both] [background-image:linear-gradient(180deg,_rgba(18,_38,_33,_.27),_rgba(18,_38,_33,_.12)_35%,_rgba(15,_35,_30,_.82)),_url('https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1600&q=85')]" />
        <div className="[display:flex] [align-items:center] [justify-content:space-between]">
          <a className="[display:inline-flex] [align-items:center] [gap:10px] [text-decoration:none] [font-size:13px] [font-weight:800] [letter-spacing:1.2px] [font-family:'Manrope',_sans-serif]" href="/login" aria-label="Link Pulse home">
            <span className="[display:grid] [width:34px] [height:34px] [place-items:center] [border:1px_solid_rgba(255,255,255,.42)] [border-radius:50%] [color:var(--lime)]">
              <Link2 size={19} strokeWidth={2.5} />
            </span>
            <span>LINK PULSE</span>
          </a>
          <span className="[font-size:10px] [font-weight:700] [letter-spacing:1.8px] [color:rgba(255,255,255,.72)] max-[700px]:[display:none]">01 / 02</span>
        </div>
        <div className="[max-width:570px] [margin:auto_0] [padding:70px_0] [animation:rise-in_.65s_.12s_both] max-[700px]:[margin:auto_0_0] max-[700px]:[padding:28px_0_0]">
          <p className="[font-size:10px] [font-weight:700] [letter-spacing:1.8px] [margin:0_0_20px] [color:var(--lime)] max-[700px]:[margin-bottom:9px] max-[700px]:[font-size:9px]">SHORTER LINKS. CLEARER SIGNAL.</p>
          <h1 className="[max-width:560px] [margin:0] [font-size:60px] [font-weight:600] [line-height:1.04] [font-family:'Manrope',_sans-serif] max-[900px]:[font-size:48px] max-[700px]:[max-width:420px] max-[700px]:[font-size:32px]">Make every link easier to share.</h1>
          <div className="[display:flex] [align-items:center] [justify-content:space-between] [max-width:440px] [margin-top:34px] [padding-top:17px] [border-top:1px_solid_rgba(255,255,255,.38)] [color:rgba(255,255,255,.8)] [font-size:13px] max-[700px]:[display:none]">
            <span>Shorten, share, and keep track of every link.</span>
            <ArrowUpRight size={19} />
          </div>
        </div>
        <div className="[display:flex] [align-items:center] [justify-content:space-between] [font-size:10px] [font-weight:700] [letter-spacing:1.8px] [color:rgba(255,255,255,.62)] [font-size:9px] max-[700px]:[display:none]">
          <span>ONE SIMPLE LINK TOOL</span>
          <span>LINK PULSE</span>
        </div>
      </section>

      <section className="[min-height:100vh] [display:flex] [flex-direction:column] [justify-content:center] [padding:48px_clamp(32px,_7vw,_108px)] [position:relative] max-[900px]:[padding-right:42px] max-[900px]:[padding-left:42px] max-[700px]:[min-height:calc(100vh_-_230px)] max-[700px]:[padding:38px_24px_64px]">
        <div className="[width:min(100%,_420px)] [margin:auto] [animation:rise-in_.55s_.08s_both] max-[700px]:[margin:auto]">
          <p className="[margin:0_0_13px] [color:var(--green)] [font-size:10px] [font-weight:700] [letter-spacing:1.8px]">{eyebrow}</p>
          <h2 className="[margin:0] [font-size:42px] [font-weight:700] [letter-spacing:0] [line-height:1.13] [font-family:'Manrope',_sans-serif]">{title}</h2>
          <p className="[margin:12px_0_34px] [color:var(--muted)] [font-size:14px]">{description}</p>
          {children}
          <p className="[margin:28px_0_0] [color:#929b96] [font-size:11px] [line-height:1.65]">
            By continuing, you agree to our <a className="[color:var(--green)] [font-weight:700] [text-decoration:none] [&:hover]:[text-decoration:underline] [color:#65756e]" href="#terms">Terms</a> and{' '}
            <a className="[color:var(--green)] [font-weight:700] [text-decoration:none] [&:hover]:[text-decoration:underline] [color:#65756e]" href="#privacy">Privacy Policy</a>.
          </p>
        </div>
        <div className="[position:absolute] [right:clamp(32px,_7vw,_108px)] [bottom:30px] [left:clamp(32px,_7vw,_108px)] [display:flex] [justify-content:space-between] [color:#99a29d] [font-size:9px] [font-weight:700] [letter-spacing:1.4px] max-[900px]:[right:42px] max-[900px]:[left:42px] max-[700px]:[right:24px] max-[700px]:[bottom:22px] max-[700px]:[left:24px]">
          <span>LINK PULSE</span>
          <span>ACCOUNT ACCESS</span>
        </div>
      </section>
    </main>
  );
}

export { AuthLayout };