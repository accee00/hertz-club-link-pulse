import { ArrowUpRight, Link2 } from 'lucide-react';

function AuthLayout({ children, eyebrow, title, description }) {
  return (
    <main className="auth-page">
      <section className="auth-story" aria-label="Link Pulse">
        <div className="story-photo" />
        <div className="story-topline">
          <a className="brand" href="/login" aria-label="Link Pulse home">
            <span className="brand-mark">
              <Link2 size={19} strokeWidth={2.5} />
            </span>
            <span>LINK PULSE</span>
          </a>
          <span className="story-index">01 / 02</span>
        </div>
        <div className="story-copy">
          <p className="story-kicker">SHORTER LINKS. CLEARER SIGNAL.</p>
          <h1>Make every link easier to share.</h1>
          <div className="story-bottomline">
            <span>Shorten, share, and keep track of every link.</span>
            <ArrowUpRight size={19} />
          </div>
        </div>
        <div className="story-caption">
          <span>ONE SIMPLE LINK TOOL</span>
          <span>LINK PULSE</span>
        </div>
      </section>

      <section className="auth-side">
        <div className="auth-form-wrap">
          <p className="eyebrow">{eyebrow}</p>
          <h2>{title}</h2>
          <p className="form-description">{description}</p>
          {children}
          <p className="form-footnote">
            By continuing, you agree to our <a href="#terms">Terms</a> and{' '}
            <a href="#privacy">Privacy Policy</a>.
          </p>
        </div>
        <div className="side-footer">
          <span>LINK PULSE</span>
          <span>ACCOUNT ACCESS</span>
        </div>
      </section>
    </main>
  );
}

export { AuthLayout };