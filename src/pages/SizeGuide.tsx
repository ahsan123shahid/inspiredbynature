import { useState } from "react";
import { motion } from "framer-motion";

interface SizeCategory {
  label: string;
  headers: string[];
  rows: string[][];
  note?: string;
}

const sizeData: SizeCategory[] = [
  {
    label: "Concentration Guide",
    headers: ["Type", "Oil %", "Longevity", "Best For"],
    rows: [
      ["Eau de Cologne", "2 – 4%", "2 – 3 hrs", "Hot weather, quick refresh"],
      ["Eau de Toilette", "5 – 15%", "3 – 5 hrs", "Daytime, office wear"],
      ["Eau de Parfum", "15 – 20%", "5 – 8 hrs", "Evening, long days"],
      ["Parfum", "20 – 30%", "8+ hrs", "Special occasions"],
    ],
    note: "Concentration affects how long a scent lasts. Choose higher concentration for all-day wear.",
  },
  {
    label: "Bottle Sizes",
    headers: ["Size", "Volume", "Sprays", "Ideal Use"],
    rows: [
      ["Travel", "10 ml", "~120", "On-the-go, trying a scent"],
      ["Mini", "30 ml", "~350", "Daily wear, handbag"],
      ["Standard", "50 ml", "~600", "Signature everyday scent"],
      ["Large", "100 ml", "~1200", "Collector, best value"],
    ],
  },
  {
    label: "Fragrance Families",
    headers: ["Family", "Character", "Top Notes", "Season"],
    rows: [
      ["Floral", "Soft, romantic", "Rose, Jasmine", "Spring"],
      ["Woody", "Warm, earthy", "Oud, Sandalwood", "Autumn"],
      ["Fresh", "Clean, airy", "Citrus, Aqua", "Summer"],
      ["Oriental", "Rich, spicy", "Amber, Vanilla", "Winter"],
    ],
    note: "Not sure where to start? Floral and fresh are the safest everyday choices.",
  },
  {
    label: "Sillage & Projection",
    headers: ["Level", "Trail", "Projection", "Recommended For"],
    rows: [
      ["Intimate", "Close to skin", "0 – 1 ft", "Office, sensitive spaces"],
      ["Moderate", "Arm's length", "1 – 3 ft", "Daily social wear"],
      ["Strong", "Room-filling", "3+ ft", "Events, evenings"],
    ],
    note: "Apply to pulse points and avoid rubbing to preserve the top notes.",
  },
];

const measurementTips = [
  {
    part: "Pulse Points",
    instruction: "Apply to warm areas — wrists, neck, and behind the ears — to help the scent develop naturally.",
  },
  {
    part: "Layering",
    instruction: "Use a matching body lotion or unscented moisturizer before spraying to extend longevity.",
  },
  {
    part: "Clothing & Hair",
    instruction: "A light mist on clothing or hair projects scent gently without overwhelming those around you.",
  },
  {
    part: "Storage",
    instruction: "Keep bottles away from direct sunlight and heat to preserve the fragrance for years.",
  },
  {
    part: "Testing",
    instruction: "Let a scent sit on your skin for 15 minutes before judging — top, heart, and base notes unfold over time.",
  },
];

const SizeGuide = () => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="bg-canvas text-ink">
      {/* Hero */}
      <section className="bg-canvas-cream py-huge">
        <div className="max-w-screen-md mx-auto px-5 sm:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-script-lead text-ink/60 mb-2 font-serif italic">Find Your Scent</p>
            <h1 className="text-heading-section text-ink mb-4" style={{ fontSize: "clamp(28px, 4vw, 40px)" }}>
              Fragrance Guide
            </h1>
            <p className="text-body-md text-shade-50 max-w-lg mx-auto">
              Use our detailed charts and tips to choose the perfect INSPIREDBYNATURE fragrance for every mood and occasion.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Size Tables */}
      <section className="max-w-screen-lg mx-auto px-5 sm:px-8 py-huge">
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-3 mb-10 justify-center">
          {sizeData.map((cat, i) => (
            <button
              key={cat.label}
              onClick={() => setActiveTab(i)}
              className={`px-5 py-2.5 rounded-pill text-product-title font-semibold transition-all duration-300 border ${
                activeTab === i
                  ? "bg-ink text-on-primary border-ink"
                  : "bg-canvas text-shade-50 border-hairline hover:border-ink hover:text-ink"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Active Table */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="overflow-x-auto border border-hairline rounded-md">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-canvas-cream">
                  {sizeData[activeTab].headers.map((header) => (
                    <th
                      key={header}
                      className="py-4 px-5 text-product-title font-semibold text-ink whitespace-nowrap border-b border-hairline"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sizeData[activeTab].rows.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className={`border-b border-hairline/50 ${
                      rowIndex % 2 === 0 ? "bg-canvas" : "bg-canvas-cream/40"
                    } hover:bg-canvas-cream transition-colors`}
                  >
                    {row.map((cell, cellIndex) => (
                      <td
                        key={cellIndex}
                        className={`py-3.5 px-5 text-body-md whitespace-nowrap ${
                          cellIndex === 0 ? "font-semibold text-ink" : "text-shade-50"
                        }`}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {sizeData[activeTab].note && (
            <p className="mt-4 text-product-caption text-shade-40 italic">
              * {sizeData[activeTab].note}
            </p>
          )}
        </motion.div>
      </section>

      {/* How to Measure */}
      <section className="bg-canvas-cream py-huge">
        <div className="max-w-screen-md mx-auto px-5 sm:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <p className="text-script-lead text-primary/80 mb-2 font-serif italic">How to Wear</p>
            <h2 className="text-heading-section text-ink">Application Tips</h2>
          </motion.div>

          <div className="space-y-6">
            {measurementTips.map((tip, i) => (
              <motion.div
                key={tip.part}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="flex items-start gap-5 bg-canvas p-5 rounded-md border border-hairline"
              >
                <span className="flex-shrink-0 w-10 h-10 rounded-full bg-ink text-on-primary flex items-center justify-center text-product-title font-bold">
                  {i + 1}
                </span>
                <div>
                  <h3 className="text-heading-md text-ink mb-1">{tip.part}</h3>
                  <p className="text-body-md text-shade-50">{tip.instruction}</p>
                </div>
              </motion.div>
            ))}
          </div>

            <div className="mt-12 text-center">
              <p className="text-body-md text-shade-50 mb-1">Need help choosing a scent?</p>
              <p className="text-body-md text-shade-50">
                Contact us on WhatsApp and we'll help you find your perfect fragrance.
              </p>
            </div>
        </div>
      </section>
    </div>
  );
};

export default SizeGuide;
