import { ArrowRight } from "lucide-react";
import { CollectionFilter, PageRoute } from "../types";
import { ATELIER_STORY_IMAGE } from "../lib/format";
import { LuxuryImage } from "./LuxuryImage";

interface AboutViewProps {
  onNavigate: (page: PageRoute, filter?: CollectionFilter) => void;
}

export function AboutView({ onNavigate }: AboutViewProps) {
  return (
    <section className="bg-[#FAF8F4]">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-14 sm:py-20">
        {/* Editorial Intro Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-stretch">
          <div className="lg:col-span-6 flex flex-col justify-center">
            <p className="text-[11px] tracking-[0.2em] uppercase text-[#9E7B36] font-semibold">
              The House of ACACIA
            </p>
            <h1
              className="mt-2 font-display text-4xl sm:text-5xl lg:text-[54px] font-medium leading-[1.08] text-[#0E0D0C]"
              style={{ textWrap: "balance" }}
            >
              Elegance, Confidence &amp; Unforgettable Fragrances.
            </h1>
            <p className="mt-6 text-[15px] leading-relaxed text-[#0E0D0C]/85">
              Founded for those who treat scent as a quiet signature rather than a passing trend, ACACIA represents timeless elegance, poise, and enduring confidence. Each composition is built around raw botanicals, aged heartwoods, and resinous ambers sourced from trusted growers.
            </p>
            <p className="mt-4 text-[15px] leading-relaxed text-[#6E655B]">
              Rather than rushing blends to shelf, every ACACIA extrait rests for eight weeks in dark glass vessels so top spices, floral hearts, and deep woody bases marry into a single seamless arc on the skin.
            </p>

            <div className="mt-8">
              <button
                type="button"
                onClick={() => onNavigate("shop", "All")}
                className="inline-flex items-center gap-3 px-7 py-3.5 bg-[#0E0D0C] text-[#FAF8F4] text-xs font-semibold tracking-[0.14em] uppercase hover:bg-[#26231F] transition-colors"
              >
                <span>Explore the Collection</span>
                <ArrowRight className="w-4 h-4 text-[#C5A059]" />
              </button>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="aspect-[4/3] lg:h-full w-full overflow-hidden bg-[#EDE6DA] border border-[#0E0D0C]/10">
              <LuxuryImage
                src={ATELIER_STORY_IMAGE}
                alt="ACACIA perfumery atelier workbench with raw oud wood, jasmine blossoms, and amber glass flacons"
                fallbackTitle="ACACIA Atelier"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Three Craftsmanship Pillars */}
        <div className="mt-16 pt-14 border-t border-[#0E0D0C]/10 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <span className="text-xs tracking-[0.16em] text-[#9E7B36] font-semibold">
              01 · Concentration
            </span>
            <h2 className="mt-2 font-display text-2xl font-medium text-[#0E0D0C]">
              28% Perfume Oil Density
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[#6E655B]">
              Formulated at extrait strength so two sprays evolve gracefully across ten to twelve hours without harsh alcohol sharpness.
            </p>
          </div>

          <div>
            <span className="text-xs tracking-[0.16em] text-[#9E7B36] font-semibold">
              02 · Botanicals
            </span>
            <h2 className="mt-2 font-display text-2xl font-medium text-[#0E0D0C]">
              Traceable Raw Essences
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[#6E655B]">
              From Calabrian bergamot and Kashmiri saffron to aged Cambodian oud and Florentine iris butter, every note is selected for depth.
            </p>
          </div>

          <div>
            <span className="text-xs tracking-[0.16em] text-[#9E7B36] font-semibold">
              03 · Presentation
            </span>
            <h2 className="mt-2 font-display text-2xl font-medium text-[#0E0D0C]">
              Heavy Architectural Flacons
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[#6E655B]">
              Housed in thick UV-shielded glass and weighted brass caps, finished by hand for dressing tables and gift keepsakes alike.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
