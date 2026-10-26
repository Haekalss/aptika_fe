import React, { memo } from "react";
import { CheckCircle2, LucideIcon } from "lucide-react";

export interface StepItem {
  id: number;
  title: string;
  icon: LucideIcon;
}

interface FormStepperProps {
  steps: StepItem[];
  currentStep: number;
  onStepClick: (stepId: number) => void;
  tahun: string;
  noDokumen: string;
}

export const FormStepper: React.FC<FormStepperProps> = memo(({
  steps,
  currentStep,
  onStepClick,
  tahun,
  noDokumen,
}) => {
  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-bold text-slate-800">
          Langkah {currentStep} dari {steps.length}: {steps[currentStep - 1]?.title}
        </span>
        <span className="text-xs font-semibold text-slate-500">
          Tahun SMKI {tahun} • {noDokumen}
        </span>
      </div>

      <div className="flex items-center w-full mt-4 overflow-x-auto pb-2 sm:pb-0">
        {steps.map((step, idx) => {
          const isPassed = step.id < currentStep;
          const isCurrent = step.id === currentStep;

          return (
            <div key={step.id} className="flex items-center flex-1 relative min-w-[140px] sm:min-w-0">
              <div
                className={`flex items-center gap-2 z-10 bg-white pr-4 ${
                  isPassed
                    ? "text-emerald-600 cursor-pointer"
                    : isCurrent
                    ? "text-emerald-700 font-bold"
                    : "text-slate-400"
                }`}
                onClick={() => isPassed && onStepClick(step.id)}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isPassed
                      ? "bg-emerald-600 text-white"
                      : isCurrent
                      ? "bg-emerald-100 text-emerald-700 border-2 border-emerald-600"
                      : "bg-slate-100 text-slate-400 border-2 border-slate-200"
                  }`}
                >
                  {isPassed ? <CheckCircle2 className="w-4 h-4" /> : step.id}
                </div>
                <span className={`text-xs whitespace-nowrap ${isCurrent ? "text-slate-800" : ""}`}>
                  {step.title}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div
                  className={`h-[2px] flex-1 mx-2 ${
                    isPassed ? "bg-emerald-500" : "bg-slate-200"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
});

FormStepper.displayName = "FormStepper";
