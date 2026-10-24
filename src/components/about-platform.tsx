const websiteUrl = "https://pradipmanandhar.com.np/";
const whatsappUrl = "https://wa.me/9779818718074";

const cards = [
  {
    label: "Platform",
    title: "AS Fixit Sim Vendor Platform",
    description: "Built to make vendor operations and order management easier.",
  },
  {
    label: "Version",
    title: "2.1.6",
    description: "A platform for vendor operations and order management.",
  },
  {
    label: "Developer",
    title: "Pradip Manandhar",
    description: "Designed and developed with care.",
  },
  {
    label: "Need help?",
    title: "Need a similar system for your business?",
    description: "Get in touch to discuss your project.",
  },
];

export function AboutPlatform() {
  return (
    <div>
      <p className="text-sm font-bold uppercase tracking-[0.28em] text-blue-600">
        About / Developer
      </p>
      <h1 className="mt-2 text-3xl font-black text-slate-950">
        About Platform
      </h1>
      <p className="mt-2 text-slate-600">
        Details about the AS Fixit Sim platform and how to reach the developer.
      </p>

      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <section
            key={card.label}
            className="min-h-44 rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_12px_35px_rgba(15,23,42,0.04)]"
          >
            <p className="text-sm font-medium text-slate-500">{card.label}</p>
            <h2 className="mt-2 text-xl font-bold text-slate-950">
              {card.title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {card.description}
            </p>
            {card.label === "Developer" && (
              <a
                className="mt-3 inline-block text-sm font-semibold text-blue-700 hover:text-blue-800"
                href={websiteUrl}
                target="_blank"
                rel="noreferrer"
              >
                {/* pradipmanandhar.com.np */}
              </a>
            )}
            {card.label === "Need help?" && (
              <a
                className="mt-3 inline-block text-sm font-semibold text-blue-700 hover:text-blue-800"
                href={websiteUrl}
                target="_blank"
                rel="noreferrer"
              >
                Visit my website
              </a>
            )}
          </section>
        ))}
      </div>

      <section className="mt-6 flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_12px_35px_rgba(15,23,42,0.04)] md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.28em] text-blue-600">
            Contact
          </p>
          <h2 className="mt-2 text-2xl font-bold text-slate-950">
            Let’s build your next system
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Reach out to discuss a custom web app, vendor platform, or business
            workflow tailored to your needs.
          </p>
        </div>
        <a
          className="inline-flex shrink-0 items-center justify-center rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800"
          href={whatsappUrl}
          target="_blank"
          rel="noreferrer"
        >
          Contact me on WhatsApp
        </a>
      </section>
    </div>
  );
}
