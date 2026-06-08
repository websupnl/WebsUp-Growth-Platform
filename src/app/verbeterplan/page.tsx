import { VerbeterplanForm } from "./verbeterplan-form";

// Publieke pagina, geen auth nodig. Middleware laat /verbeterplan door.
// Embed deze URL op websup.nl als CTA of gebruik als standalone landingspagina.

export const metadata = {
  title: "Gratis Website Verbeterplan | WebsUp",
  description:
    "Upload je website en ontvang binnen 48 uur een persoonlijk verbeterplan van Daan Koolhaas.",
};

export default function VerbeterplanPage() {
  return (
    <div
      className="min-h-screen px-4 py-16"
      style={{ background: "#06040c", color: "#fff", fontFamily: "system-ui, sans-serif" }}
    >
      <div className="mx-auto max-w-lg">
        {/* Header */}
        <div className="mb-10 text-center">
          <span
            className="mb-4 inline-block rounded-full px-4 py-1.5 text-sm font-medium"
            style={{ background: "#15101f", color: "#a78bfa", border: "1px solid #241c34" }}
          >
            Gratis, binnen 48 uur
          </span>
          <h1
            className="mb-4 text-4xl font-bold leading-tight"
            style={{ fontFamily: "system-ui, sans-serif" }}
          >
            Wat kan er beter aan{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #f97316 0%, #ec4899 50%, #a78bfa 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              jouw website?
            </span>
          </h1>
          <p style={{ color: "#9b93ad", fontSize: "18px", lineHeight: 1.6 }}>
            Ik kijk naar je website en stuur je een persoonlijk verbeterplan.
            Geen automatische scan, maar mijn eigen observaties als specialist.
          </p>
        </div>

        {/* Wat je krijgt */}
        <div
          className="mb-8 rounded-2xl p-5"
          style={{ background: "#15101f", border: "1px solid #241c34" }}
        >
          <p className="mb-3 text-sm font-medium" style={{ color: "#9b93ad" }}>
            Wat je ontvangt:
          </p>
          <ul className="space-y-2">
            {[
              "Concrete verbeterpunten gerangschikt op impact",
              "Wat je morgen al kunt doen (quick wins)",
              "Wat je misloopt zonder deze aanpassingen",
              "Eerlijk advies, geen verkooppraatje",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-white">
                <span style={{ color: "#a78bfa", flexShrink: 0 }}>+</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Formulier */}
        <div
          className="rounded-2xl p-6"
          style={{ background: "#15101f", border: "1px solid #241c34" }}
        >
          <VerbeterplanForm />
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-sm" style={{ color: "#9b93ad" }}>
          Door Daan Koolhaas, WebsUp.nl
        </p>
      </div>
    </div>
  );
}
