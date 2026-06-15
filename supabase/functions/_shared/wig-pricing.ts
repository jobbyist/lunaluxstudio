// Server-side canonical pricing for the custom wig builder.
// MUST stay in sync with src/pages/CustomizeProduct.tsx option lists.
// Client-supplied prices are NEVER trusted; the edge functions recompute totals
// using these tables based on the option NAMES sent in selectedOptions.

type PriceMap = Record<string, number>;

const LENGTH_PRICES: PriceMap = {
  '16"': 2200,
  '18"': 2400,
  '20"': 2800,
  '22"': 3200,
  '24"': 4000,
  '26"': 4200,
  '28"': 4400,
};

const TEXTURE_PRICES: PriceMap = {
  "Straight": 0,
  "Body Wave": 0,
  "Deep Wave": 200,
  "Water Wave": 200,
  "Italian Curly": 200,
};

const HAIR_TYPE_PRICES: PriceMap = {
  "Brazilian (Standard)": 0,
  "Vietnamese": 1500,
  "Raw Hair": 2500,
};

const CLOSURE_FRONTAL_PRICES: PriceMap = {
  "5x5 Closure": 800,
  "5x5 HD Closure": 1400,
  "6x6 HD Closure": 1800,
  "13x4 Frontal": 1500,
  "13x4 HD Frontal": 1900,
};

const CAP_SIZE_PRICES: PriceMap = {
  "Small (S)": 0,
  "Medium (M)": 0,
  "Large (L)": 0,
};

const COLOR_PRICES: PriceMap = {
  "Natural 1B Black": 0,
  "Jet Black": 400,
  "Chestnut Brown": 900,
};

const CUSTOMISATION_PRICES: PriceMap = {
  "None": 0,
  "Standard Bleaching + Plucking": 150,
  "Extra Plucking": 100,
};

// Styling values are from a different list than texture (curl style).
const STYLING_PRICES: PriceMap = {
  "Straight": 0,
  "Tight Curl": 100,
  "Loose Curl": 100,
};

const CUT_PRICES: PriceMap = {
  "None": 0,
  "Natural Layers": 200,
  "Dramatic Layers": 250,
};

// Maps the selectedOptions[].name → table to look value up in.
const OPTION_TABLES: Record<string, PriceMap> = {
  "Length": LENGTH_PRICES,
  "Texture": TEXTURE_PRICES,
  "Hair Type": HAIR_TYPE_PRICES,
  "Closure/Frontal": CLOSURE_FRONTAL_PRICES,
  "Cap Size": CAP_SIZE_PRICES,
  "Color": COLOR_PRICES,
  "Customisation": CUSTOMISATION_PRICES,
  "Styling": STYLING_PRICES,
  "Cut": CUT_PRICES,
};

export interface SelectedOption {
  name: string;
  value: string;
}

/**
 * Server-side recompute of a single custom wig's unit price (ZAR).
 * Throws if a required option is missing or the value is unknown.
 */
export function computeCustomWigUnitPrice(selectedOptions: SelectedOption[]): number {
  if (!Array.isArray(selectedOptions) || selectedOptions.length === 0) {
    throw new Error("Custom wig has no selectedOptions");
  }

  // Length is REQUIRED — it sets the base.
  const lengthOpt = selectedOptions.find((o) => o.name === "Length");
  if (!lengthOpt || LENGTH_PRICES[lengthOpt.value] === undefined) {
    throw new Error(`Invalid or missing wig length: ${lengthOpt?.value ?? "(none)"}`);
  }

  let total = 0;
  for (const opt of selectedOptions) {
    const table = OPTION_TABLES[opt.name];
    if (!table) continue; // Ignore unknown keys like "Free Shipping", "SKU", "Base Bundle"
    const price = table[opt.value];
    if (price === undefined) {
      throw new Error(`Invalid value for ${opt.name}: ${opt.value}`);
    }
    total += price;
  }

  return total;
}
