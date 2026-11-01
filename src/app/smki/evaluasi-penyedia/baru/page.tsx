import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import ServiceRouteGuard from "@/components/auth/ServiceRouteGuard";
import EvaluasiPenyediaWizardTemplate from "@/components/smki/evaluasi-penyedia/templates/EvaluasiPenyediaWizardTemplate";

export default function EvaluasiPenyediaBaruPage() {
  return (
    <Suspense
      fallback={
        <ServiceRouteGuard requiredService="SMKI">
          <div className="py-24 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto mb-3" />
            <p className="text-sm text-slate-500">Memuat formulir evaluasi...</p>
          </div>
        </ServiceRouteGuard>
      }
    >
      <EvaluasiPenyediaWizardTemplate />
    </Suspense>
  );
}
