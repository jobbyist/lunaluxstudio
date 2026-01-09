/**
 * Products allowed in the Main Character collection
 */
export const ALLOWED_MAIN_CHARACTER_PRODUCTS = [
  'The Ferina Unit',
  'The Armani Unit',
  'The Kendra Unit',
  'Aphrodite Unit (Double Drawn)'
];

/**
 * Product handles for collection category links
 */
export const COLLECTION_PRODUCT_LINKS = {
  // Vietnamese Virgin collection
  'vietnamese-virgin': {
    bundles: 'virgin-vietnamese-bundles',
    closures: 'hd-virgin-closures',
  },
  // Raw Vietnamese collection
  'raw-vietnamese': {
    bundles: 'raw-vietnamese-bundles',
    closures: 'hd-virgin-closures',
  },
  // Brazilian Virgin collection - uses category pages
  'brazilian-virgin': {
    bundles: null, // Uses category page
    closures: null,
  },
} as const;
