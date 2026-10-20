import {
  Activity,
  ArrowRight,
  BarChart3,
  Link2,
  QrCode,
} from "lucide-react";
import { Link } from "react-router-dom";

const features = [
  {
    icon: Link2,
    title: "Short links, made simple",
    description:
      "Turn long destinations into clean, shareable links that are easy to remember.",
  },
  {
    icon: BarChart3,
    title: "Know what gets attention",
    description:
      "See clicks and engagement at a glance, so you can understand what is working.",
  },
  {
    icon: QrCode,
    title: "Ready for every channel",
    description:
      "Create QR codes and organize links into campaigns for easier sharing.",
  },
];

function LandingPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-paper text-ink">
      <header className="mx-auto flex w-[min(100%_-_40px,_1180px)] justify-end py-5 sm:w-[min(100%_-_64px,_1180px)] sm:py-7">
        <nav aria-label="Account" className="flex items-center gap-3 sm:gap-5">
          <Link
            className="rounded px-2 py-2 text-xs font-bold text-[#526159] no-underline transition-colors hover:text-pulse-green sm:text-sm"
            to="/login"
          >
            Sign in
          </Link>
          <Link
            className="inline-flex min-h-10 items-center gap-2 rounded-md bg-pulse-green px-3.5 text-xs font-bold text-white no-underline transition-colors hover:bg-pulse-green-dark sm:px-4 sm:text-sm"
            to="/register"
          >
            Sign up <ArrowRight size={15} />
          </Link>
        </nav>
      </header>

      <section className="relative mx-auto grid w-[min(100%_-_40px,_1180px)] items-center gap-10 pb-16 pt-9 sm:w-[min(100%_-_64px,_1180px)] sm:gap-12 sm:pb-24 sm:pt-16 lg:grid-cols-[1.05fr_.95fr] lg:gap-16">
        <div className="relative z-10 max-w-[610px] animate-[rise-in_.65s_ease-out_both]">
          <h1 className="m-0 font-display text-[clamp(42px,8vw,76px)] font-semibold leading-[1.03] tracking-[-2.8px] text-[#23352d]">
            Make every link{" "}
            <span className="text-pulse-green">go further.</span>
          </h1>
          <p className="mt-5 max-w-[490px] text-sm leading-7 text-muted sm:mt-6 sm:text-base">
            Create short links, bring your campaigns together, and see how
            people engage — all in one clear workspace.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3 sm:mt-9">
            <Link
              className="inline-flex min-h-12 items-center gap-2 rounded-md bg-pulse-green px-5 text-sm font-bold text-white no-underline shadow-[0_8px_20px_rgba(36,94,78,.15)] transition-[transform,background] hover:-translate-y-0.5 hover:bg-pulse-green-dark"
              to="/register"
            >
              Get started <ArrowRight size={17} />
            </Link>
            <Link
              className="inline-flex min-h-12 items-center rounded-md border border-[#dce3dc] bg-white/70 px-5 text-sm font-bold text-[#44544b] no-underline transition-colors hover:border-pulse-green hover:text-pulse-green"
              to="/login"
            >
              I already have an account
            </Link>
          </div>
        </div>

        <div
          aria-label="Preview of the Link Pulse analytics dashboard"
          className="relative mx-auto w-full max-w-[500px] animate-[rise-in_.75s_.12s_ease-out_both]"
        >
          <div className="absolute -right-8 -top-10 size-40 rounded-full bg-[#e5edcf] blur-3xl sm:size-56" />
          <div className="absolute -bottom-8 -left-8 size-36 rounded-full bg-[#dcebe1] blur-3xl sm:size-48" />
          <div className="relative rounded-2xl border border-[#e5e9e2] bg-white p-4 shadow-[0_24px_70px_rgba(36,58,46,.12)] sm:rounded-[22px] sm:p-6">
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
              <div className="rounded-xl border border-[#edf0eb] bg-[#fcfdfa] p-3.5 sm:p-4">
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
              <div className="rounded-xl border border-[#edf0eb] bg-[#fcfdfa] p-3.5 sm:p-4">
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

            <div className="rounded-xl border border-[#edf0eb] p-3.5 sm:p-4">
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
                      className={`min-w-0 flex-1 rounded-t-sm ${
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

            <div className="mt-3 flex items-center gap-3 rounded-xl bg-[#f7f9f5] p-3">
              <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-white text-pulse-green shadow-sm">
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
              Less link admin. More momentum.
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
