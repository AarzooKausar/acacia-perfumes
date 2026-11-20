import { BottleSize, Product } from "../types";

export const HERO_CAMPAIGN_IMAGE =
  "/src/assets/images/acacia_hero_campaign_1794716207555.jpg";

export const ATELIER_STORY_IMAGE =
  "/src/assets/images/acacia_atelier_story_1794716212383.jpg";

export const STUDIO_PERFUME_IMAGES: { label: string; url: string }[] = [
  {
    label: "Amber Faceted Flacon (Oud)",
    url: "/src/assets/images/perfume_oud_qamar_1794716207813.jpg",
  },
  {
    label: "Smoked Sandalwood Cylinder",
    url: "/src/assets/images/perfume_santal_velours_1794716208705.jpg",
  },
  {
    label: "Octagonal Cut Crystal",
    url: "/src/assets/images/perfume_fleur_nuit_1794716209869.jpg",
  },
  {
    label: "Obsidian Brass Cologne",
    url: "/src/assets/images/perfume_noir_botanica_1794716209921.jpg",
  },
  {
    label: "Fluted Rose Crystal",
    url: "/src/assets/images/perfume_rose_imperiale_1794716211180.jpg",
  },
  {
    label: "Cognac Apothecary Square",
    url: "/src/assets/images/perfume_ambre_dore_1794716210993.jpg",
  },
  {
    label: "Clear Geometric Crystal",
    url: "/src/assets/images/perfume_cedre_blanc_1794716211366.jpg",
  },
  {
    label: "Frosted Champagne Oval",
    url: "/src/assets/images/perfume_iris_celeste_1794716211547.jpg",
  },
  {
    label: "Smoked Bronze Knurled Cap",
    url: "/src/assets/images/perfume_musc_sauvage_1794716212143.jpg",
  },
];

export function formatPKR(amount: number): string {
  return `PKR ${Math.round(amount).toLocaleString("en-PK")}`;
}

export function parseSizes(sizesStr: string): BottleSize[] {
  const valid: BottleSize[] = ["30ml", "50ml", "100ml"];
  const parsed = sizesStr
    .split(",")
    .map((s) => s.trim())
    .filter((s): s is BottleSize => valid.includes(s as BottleSize));
  return parsed.length > 0 ? parsed : ["30ml", "50ml", "100ml"];
}

export function getPriceForSize(basePrice50ml: number, size: BottleSize): number {
  if (size === "30ml") {
    return Math.round((basePrice50ml * 0.72) / 100) * 100;
  }
  if (size === "100ml") {
    return Math.round((basePrice50ml * 1.55) / 100) * 100;
  }
  return basePrice50ml;
}

export function getCollectionSummary(product: Product): string {
  const parts: string[] = [product.category];
  if (product.is_luxury) parts.push("Luxury Collection");
  if (product.is_bestseller) parts.push("Best Seller");
  return parts.join(" · ");
}

export const FREE_DELIVERY_THRESHOLD = 15000;
export const STANDARD_DELIVERY_FEE = 350;
