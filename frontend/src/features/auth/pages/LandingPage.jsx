import {
  Activity,
  ArrowRight,
  Link2,
  QrCode,
  BarChart3,
} from "lucide-react";
import { Link } from "react-router-dom";

const features = [
  {
    icon: Link2,
    title: "Short links",
    description: "Create and share short links.",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    description: "Track link clicks.",
  },
  {
    icon: QrCode,
    title: "QR codes and campaigns",
    description: "Organize links and create QR codes.",
  },
];

function LandingPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-paper text-ink">
      <header className="mx-auto flex w-[calc(100%_-_48px)] items-center justify-between py-5 sm:w-[calc(100%_-_64px)] sm:py-7">
        <Link
          aria-label="LinkPulse home"
          className="brand-name font-display text-sm font-extrabold tracking-[1.2px] text-[#111111] no-underline"
          to="/"
        >
          LinkPulse
        </Link>
        <nav aria-label="Account" className="flex items-center gap-3 sm:gap-5">
          <Link
            className="rounded px-2 py-2 text-xs font-bold text-[#526159] no-underline transition-colors hover:text-pulse-green sm:text-sm"
            to="/login"
          >
            Sign in
          </Link>
          <Link
            className="inline-flex min-h-10 items-center gap-2 bg-pulse-green px-3.5 text-xs font-bold text-white no-underline transition-colors hover:bg-pulse-green-dark sm:px-4 sm:text-sm"
            to="/register"
          >
            Sign up <ArrowRight size={15} />
          </Link>
        </nav>
      </header>

      <section className="relative mx-auto grid w-[min(100%_-_40px,_1180px)] items-center gap-10 pb-16 pt-9 sm:w-[min(100%_-_64px,_1180px)] sm:gap-12 sm:pb-24 sm:pt-16 lg:grid-cols-[1.05fr_.95fr] lg:gap-16">
        <div className="relative z-10 max-w-[610px] animate-[rise-in_.65s_ease-out_both]">
          <h1 className="m-0 font-display text-[clamp(42px,8vw,76px)] font-semibold leading-[1.03] tracking-[-2.8px] text-[#23352d]">
            Shorten and track{" "}
            <span className="text-pulse-green">your links.</span>
          </h1>
          <p className="mt-5 max-w-[490px] text-sm leading-7 text-muted sm:mt-6 sm:text-base">
            Create links, organize campaigns, and track clicks.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3 sm:mt-9">
            <Link
              className="inline-flex min-h-12 items-center gap-2 bg-pulse-green px-5 text-sm font-bold text-white no-underline transition-colors hover:bg-pulse-green-dark"
              to="/register"
            >
              Get started <ArrowRight size={17} />
            </Link>
            <Link
              className="inline-flex min-h-12 items-center border border-[#dce3dc] bg-white/70 px-5 text-sm font-bold text-[#44544b] no-underline transition-colors hover:border-pulse-green hover:text-pulse-green"
              to="/login"
            >
              I already have an account
            </Link>
          </div>
        </div>

        <div
          aria-label="Preview of the LinkPulse analytics dashboard"
          className="relative mx-auto w-full max-w-[500px] animate-[rise-in_.75s_.12s_ease-out_both]"
        >
          <div className="relative border border-[#e5e9e2] bg-white p-4 sm:p-6">
            <div className="flex items-center justify-between border-b border-[#edf0eb] pb-4">
              <div className="flex items-center gap-2.5">
                <span className="grid size-8 place-items-center bg-[#f0efea] text-pulse-green">
                  <Activity size={17} />
                </span>
                <div>
                  <p className="m-0 text-xs font-bold text-[#35443c]">
                    Link overview
                  </p>
                  <p className="m-0 mt-0.5 text-[10px] text-[#98a29b]">
                    Your workspace
                  </p>
                </div>
              </div>
              <span className="bg-[#f0efea] px-2.5 py-1 text-[9px] font-bold text-pulse-green">
                LAST 7 DAYS
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 py-4 sm:gap-4 sm:py-5">
              <div className="border border-[#edf0eb] bg-[#fcfdfa] p-3.5 sm:p-4">
                <p className="m-0 text-[9px] font-extrabold tracking-[1px] text-[#98a29b]">
                  TOTAL CLICKS
                </p>
                <p className="mb-0 mt-2 font-display text-2xl font-bold text-[#293a31] sm:text-3xl">
                  12,486
                </p>
                <p className="mb-0 mt-1 text-[10px] text-[#6c9d71]">
                  ↑ 18.6% this week
                </p>
              </div>
              <div className="border border-[#edf0eb] bg-[#fcfdfa] p-3.5 sm:p-4">
                <p className="m-0 text-[9px] font-extrabold tracking-[1px] text-[#98a29b]">
                  ACTIVE LINKS
                </p>
                <p className="mb-0 mt-2 font-display text-2xl font-bold text-[#293a31] sm:text-3xl">
                  24
                </p>
                <p className="mb-0 mt-1 text-[10px] text-[#89958d]">
                  Across 5 campaigns
                </p>
              </div>
            </div>
            <div className="border border-[#edf0eb] p-3.5 sm:p-4">
              <div className="flex items-center justify-between">
                <p className="m-0 text-xs font-bold text-[#405047]">
                  Click activity
                </p>
                <BarChart3 className="text-pulse-green" size={17} />
              </div>
              <div className="mt-5 flex h-[108px] items-end gap-2 sm:h-[132px] sm:gap-3">
                {[38, 55, 43, 72, 56, 88, 68, 96, 74, 100, 80, 91].map(
                  (height, index) => (
                    <span
                      aria-hidden="true"
                      className={`min-w-0 flex-1 ${
                        index === 9 ? "bg-pulse-green" : "bg-[#dfe9d6]"
                      }`}
                      key={index}
                      style={{ height: `${height}%` }}
                    />
                  ),
                )}
              </div>
              <div className="mt-2 flex justify-between text-[9px] text-[#9aa49d]">
                <span>MON</span>
                <span>WED</span>
                <span>FRI</span>
                <span>SUN</span>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-3 bg-[#f7f9f5] p-3">
              <span className="grid size-8 shrink-0 place-items-center bg-white text-pulse-green">
                <Link2 size={16} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="m-0 truncate text-[10px] font-bold text-[#405047]">
                  pulse.link/spring-launch
                </p>
                <p className="m-0 mt-1 truncate text-[9px] text-[#9aa49d]">
                  example.com/collections/spring
                </p>
              </div>
              <span className="text-[10px] font-bold text-[#526b56]">2.4k</span>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-[#e6eae4] bg-white/65">
        <div className="mx-auto w-[min(100%_-_40px,_1180px)] py-14 sm:w-[min(100%_-_64px,_1180px)] sm:py-20">
          <div className="max-w-[540px]">
            <h2 className="m-0 font-display text-3xl font-semibold tracking-[-.8px] text-[#27362f] sm:text-4xl">
              Features
            </h2>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3 sm:mt-10">
            {features.map(({ icon: Icon, title, description }) => (
              <article
                className="rounded-xl border border-[#e7ebe4] bg-white p-5 sm:p-6"
                key={title}
              >
                <span className="grid size-10 place-items-center bg-[#f0efea] text-pulse-green">
                  <Icon size={20} />
                </span>
                <h3 className="mb-0 mt-4 font-display text-base font-bold text-[#34433b]">
                  {title}
                </h3>
                <p className="mb-0 mt-2 text-sm leading-6 text-muted">
                  {description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

    </main>
  );
}

export { LandingPage };
