import { SuiteHeader } from "@/components/suite/SuiteHeader";
import { SuiteFooter } from "@/components/suite/SuiteFooter";
import { useState } from "react";
import type { SuiteProduct } from "@/components/suite/SuiteHeader";

const SuiteLayout = () => {
  const [product, setProduct] = useState<SuiteProduct>("worldaml");

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <SuiteHeader currentProduct={product} />

      {/* Demo content */}
      <main className="flex-1 max-w-6xl mx-auto px-6 py-16 w-full">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-[hsl(215_20%_50%)] mb-4">
          Preview — switch the active product
        </p>
        <div className="flex gap-2 mb-10">
          {(["worldaml", "worldkycsearch", "duediligenceworld"] as SuiteProduct[]).map((p) => (
            <button
              key={p}
              onClick={() => setProduct(p)}
              className={`px-3 py-1.5 rounded-full border text-[12px] font-medium transition-colors ${
                product === p
                  ? "bg-[hsl(222_47%_11%)] text-white border-[hsl(222_47%_11%)]"
                  : "border-[hsl(215_20%_88%)] text-[hsl(215_20%_45%)] hover:border-[hsl(222_47%_11%)]"
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        <div className="rounded-2xl border border-[hsl(215_20%_90%)] bg-[hsl(215_20%_98%)] p-12 text-center">
          <p className="text-[13px] text-[hsl(215_20%_50%)]">
            Page content for <strong className="text-[hsl(222_47%_11%)]">{product}</strong> goes here.
          </p>
          <p className="text-[12px] text-[hsl(215_20%_60%)] mt-2">
            Scroll down to see the footer ↓
          </p>
        </div>
      </main>

      <SuiteFooter />
    </div>
  );
};

export default SuiteLayout;
