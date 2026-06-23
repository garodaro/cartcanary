import { BrandLogo } from "@/components/BrandLogo";
import { ConversionSnapshotCard } from "@/components/ConversionSnapshotCard";
import { ExpertContactForm } from "@/components/ExpertContactForm";
import Image from "next/image";

type LandingPageProps = {
  onStart: () => void;
};

export function LandingPage({ onStart }: LandingPageProps) {
  const howItWorksSteps = [
    {
      step: "1",
      title: "Enter your store details",
      copy: "Tell us about your store, traffic, revenue, platform, and biggest concern.",
      image: "/brand/mascot-shopping-cart-step.png",
      alt: "CartCanary mascot riding in a shopping cart",
    },
    {
      step: "2",
      title: "CartCanary reviews conversion signals",
      copy: "We scan your public site experience and combine it with practical CRO logic.",
      image: "/brand/mascot-magnifier.png",
      alt: "CartCanary mascot holding a magnifying glass",
    },
    {
      step: "3",
      title: "Get a prioritized action plan",
      copy: "Receive a clear report with what to fix, test, or investigate and why.",
      image: "/brand/mascot-clipboard.png",
      alt: "CartCanary mascot holding a checklist",
    },
  ];

  return (
    <section className="min-h-screen overflow-x-hidden bg-[#F8FAFC] text-slate-950">
      <div className="mx-auto w-full max-w-7xl px-6 py-6 sm:px-8 lg:px-10">
        <header className="flex items-center justify-between gap-6">
          <BrandLogo />
          <nav className="hidden items-center gap-10 text-sm font-bold text-slate-800 md:flex">
            <a href="#how-it-works">How it works</a>
            <a href="#what-it-checks">What it checks</a>
            <a href="#contact">Contact</a>
          </nav>
          <button
            onClick={onStart}
            className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
          >
            Start audit
          </button>
        </header>

        <div className="grid items-center gap-12 py-16 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="mb-7 inline-flex rounded-full border border-yellow-200 bg-yellow-50 px-4 py-2 text-xs font-black uppercase tracking-wide text-yellow-700">
              AI-assisted conversion audits for ecommerce stores
            </p>
            <h1 className="max-w-3xl text-5xl font-black leading-tight tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
              Find what&apos;s costing your store{" "}
              <span className="text-blue-600">sales.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              CartCanary scans your store experience, spots conversion friction,
              and turns it into a practical fix / test / investigate action plan.
            </p>
            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              <button
                onClick={onStart}
                className="rounded-xl bg-blue-600 px-7 py-4 font-black text-white shadow-xl shadow-blue-600/20 transition hover:bg-blue-700"
              >
                Start free audit
              </button>
              <a
                href="#what-it-checks"
                className="rounded-xl border border-slate-300 bg-white px-7 py-4 text-center font-black text-slate-900 shadow-sm transition hover:border-blue-200 hover:text-blue-700"
              >
                See what it checks
              </a>
            </div>
            <div className="mt-9 grid gap-4 text-sm font-semibold text-slate-600 sm:grid-cols-3">
              <TrustPill
                label="Built for ecommerce teams"
                icon="/brand/icon-trust.png"
                alt="Trust shield icon"
              />
              <TrustPill
                label="No admin access needed"
                icon="/brand/icon-security.png"
                alt="Security lock icon"
              />
              <TrustPill
                label="Takes about 2 minutes"
                icon="/brand/icon-fast.png"
                alt="Fast audit lightning icon"
              />
            </div>
          </div>

          <div className="relative">
            <div className="absolute -right-8 top-4 h-72 w-72 rounded-full bg-blue-100 blur-3xl" />
            <div className="relative">
              <ConversionSnapshotCard />
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {[
            [
              "Uncover friction",
              "Find unclear CTAs, weak trust signals, and purchase-path blockers.",
              "/brand/icon-uncover-friction.png",
              "Magnifying glass friction icon",
            ],
            [
              "Prioritize action",
              "Know what to fix now, test later, or investigate first.",
              "/brand/icon-prioritize-action.png",
              "Checklist action icon",
            ],
            [
              "Plan smarter tests",
              "Match recommendations to your traffic level and A/B test feasibility.",
              "/brand/icon-plan-tests.png",
              "Analytics chart icon",
            ],
          ].map(([title, copy, icon, alt]) => (
            <article
              key={title}
              className="rounded-2xl border border-slate-200 bg-white p-8 shadow-lg shadow-slate-950/5"
            >
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-100 bg-white shadow-sm">
                <Image
                  src={icon}
                  alt={alt}
                  width={56}
                  height={56}
                  className="h-12 w-12 object-contain"
                />
              </div>
              <h3 className="text-xl font-black text-slate-950">{title}</h3>
              <p className="mt-3 leading-7 text-slate-600">{copy}</p>
            </article>
          ))}
        </div>

        <section className="mt-8 overflow-hidden rounded-[1.5rem] border border-yellow-200 bg-yellow-50 shadow-xl shadow-yellow-950/10">
          <div className="grid lg:grid-cols-[1.08fr_0.92fr]">
            <div className="relative min-h-[18rem] overflow-hidden lg:min-h-[30rem]">
              <Image
                src="/brand/cartcanary-ab-callout-illustration-v2.png"
                alt="CartCanary mascot riding a mine cart away from a tunnel"
                width={730}
                height={484}
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/3 bg-gradient-to-r from-transparent to-yellow-50 lg:block" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-yellow-50/70 to-transparent lg:hidden" />
            </div>
            <div className="flex items-center bg-yellow-50 px-6 py-8 sm:px-10 lg:px-12">
              <div>
                <h2 className="text-3xl font-black leading-tight tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
                  Know what&apos;s risky before you test.
                </h2>
                <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-700">
                  CartCanary helps ecommerce teams spot risky assumptions, weak hypotheses, and
                  measurement gaps before they spend traffic on them. Think of it like a canary in
                  a coal mine for your experimentation roadmap.
                </p>
                <div className="mt-6 flex items-start gap-4">
                  <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-yellow-400 text-sm font-black text-white shadow-sm">
                    ✓
                  </span>
                  <p className="max-w-xl text-lg font-semibold leading-8 text-slate-700">
                    Know what to fix, what to test, what to investigate, and what to ignore.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="py-16">
          <p className="text-center text-sm font-black uppercase tracking-[0.18em] text-blue-600">
            How it works
          </p>
          <h2 className="mx-auto mt-3 max-w-3xl text-center text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            Get your conversion roadmap in 3 simple steps
          </h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {howItWorksSteps.map(({ step, title, copy, image, alt }) => (
              <article
                key={step}
                className="relative min-h-[18rem] overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 pb-28 shadow-lg shadow-slate-950/5"
              >
                <div className="relative z-10">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-black text-blue-700">
                    {step}
                  </span>
                  <h3 className="mt-5 max-w-[14rem] text-xl font-black text-slate-950">
                    {title}
                  </h3>
                  <p className="mt-3 max-w-[15rem] leading-7 text-slate-600">{copy}</p>
                </div>
                <Image
                  src={image}
                  alt={alt}
                  width={124}
                  height={124}
                  className="pointer-events-none absolute bottom-4 right-4 h-24 w-24 object-contain sm:h-28 sm:w-28"
                />
              </article>
            ))}
          </div>
        </section>

        <section id="what-it-checks" className="grid gap-8 py-8 lg:grid-cols-[0.75fr_1.25fr]">
          <div>
            <h2 className="text-3xl font-black tracking-tight text-slate-950">
              Built for ecommerce. Focused on what matters.
            </h2>
            <p className="mt-4 leading-7 text-slate-600">
              CartCanary looks at the public experience and the submitted business
              numbers to prioritize practical conversion opportunities.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-950/5">
            <h3 className="text-xl font-black text-slate-950">What it checks</h3>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {[
                "Homepage and product-page clarity",
                "Trust signals and offer clarity",
                "Purchase path and CTA effectiveness",
                "Analytics setup and tracking gaps",
                "A/B test feasibility by traffic level",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <span className="mt-1 h-5 w-5 rounded-full bg-blue-600" />
                  <span className="font-semibold text-slate-700">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          id="contact"
          className="grid scroll-mt-8 gap-8 py-12 lg:grid-cols-[0.85fr_1.15fr]"
        >
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-blue-600">
              Contact
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              Need expert help deciding what to do next?
            </h2>
            <p className="mt-4 leading-7 text-slate-600">
              CartCanary gives you a fast, structured view of likely conversion friction.
              For higher-stakes decisions, you can request guidance from Gareth or another
              CartCanary experimentation expert.
            </p>
            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="font-black text-slate-950">Who is Gareth?</h3>
              <p className="mt-3 leading-7 text-slate-600">
                Gareth Wilson is a product and experimentation leader with 10+ years of
                experience optimizing ecommerce, subscription, entertainment, and consumer
                digital products across Disney Experiences, Fender, global retail ecommerce,
                and high-traffic digital platforms.
              </p>
            </div>
            <p className="mt-6 leading-7 text-slate-600">
              Get help interpreting your audit, prioritizing fixes, identifying what is actually
              worth testing, and avoiding experiments that are unlikely to produce a reliable read.
            </p>
          </div>
          <ExpertContactForm />
        </section>

        <section
          className="my-14 flex flex-col gap-6 overflow-hidden rounded-2xl border border-yellow-200 bg-yellow-50 p-8 shadow-lg shadow-yellow-950/5 md:flex-row md:items-center md:justify-between"
        >
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <Image
              src="/brand/mascot-cart-wave.png"
              alt="CartCanary mascot waving from a cart"
              width={124}
              height={128}
              className="pointer-events-none h-24 w-24 object-contain sm:h-28 sm:w-28"
            />
            <div>
              <h2 className="text-2xl font-black tracking-tight text-slate-950">
                Ready to find what&apos;s holding your store back?
              </h2>
              <p className="mt-2 text-slate-600">Start your free audit in less than 2 minutes.</p>
            </div>
          </div>
          <button
            onClick={onStart}
            className="rounded-xl bg-blue-600 px-7 py-4 font-black text-white shadow-xl shadow-blue-600/20 transition hover:bg-blue-700"
          >
            Start free audit
          </button>
        </section>

        <footer className="flex flex-col gap-5 border-t border-slate-200 py-6 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
          <BrandLogo compact />
          <nav className="flex flex-wrap gap-6 font-semibold">
            <a href="#how-it-works">How it works</a>
            <a href="#what-it-checks">What it checks</a>
            <a href="#contact">Contact</a>
            <span>Privacy</span>
          </nav>
          <p>© 2026 CartCanary</p>
        </footer>
      </div>
    </section>
  );
}

function TrustPill({ label, icon, alt }: { label: string; icon: string; alt: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm">
        <Image src={icon} alt={alt} width={26} height={26} className="h-6 w-6 object-contain" />
      </span>
      <span>{label}</span>
    </div>
  );
}
