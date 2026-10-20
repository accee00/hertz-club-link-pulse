function AuthLayout({ children, title, description }) {
  return (
    <main className="[display:flex] [min-height:100vh] [align-items:center] [justify-content:center] [background:var(--paper)] [padding:40px_24px]">
      <section className="[width:min(100%,_420px)]">
        <header className="[margin-bottom:34px] [text-align:center]">
          <a
            className="brand-name [color:#111111] [font-family:'Manrope',_sans-serif] [font-size:24px] [font-weight:800] [letter-spacing:-.5px] [text-decoration:none]"
            href="/"
          >
            LinkPulse
          </a>
        </header>
        <div>
          <h1 className="[margin:0] [font-family:'Manrope',_sans-serif] [font-size:42px] [font-weight:700] [line-height:1.13]">
            {title}
          </h1>
          <p className="[margin:12px_0_34px] [color:var(--muted)] [font-size:14px]">
            {description}
          </p>
          {children}
        </div>
      </section>
    </main>
  );
}

export { AuthLayout };
