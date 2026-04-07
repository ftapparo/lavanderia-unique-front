import { cn } from "@/lib/utils";

export type StepDef = {
  label: string;
  description?: string;
};

export type StepState = "pending" | "current" | "done" | "success" | "error";

type StepTimelineProps = {
  steps: StepDef[];
  current: number; // 1-based
  orientation?: "horizontal" | "vertical";
  stepStates?: Partial<Record<number, StepState>>;
};

export function StepTimeline({ steps, current, orientation = "horizontal", stepStates }: StepTimelineProps) {
  const isVertical = orientation === "vertical";

  const resolveState = (stepNum: number): StepState => {
    const forced = stepStates?.[stepNum];
    if (forced) return forced;
    if (stepNum < current) return "done";
    if (stepNum === current) return "current";
    return "pending";
  };

  const circleClass = (state: StepState) =>
    cn(
      "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors",
      (state === "done" || state === "success" || state === "current") && "border-primary bg-primary text-primary-foreground",
      state === "error" && "border-destructive bg-destructive text-destructive-foreground",
      state === "pending" && "border-muted-foreground/30 bg-background text-muted-foreground",
      state === "current" && "shadow-sm shadow-primary/30",
    );

  const segmentClass = (state: StepState) =>
    cn(
      "transition-colors",
      (state === "done" || state === "success" || state === "current") && "bg-primary",
      state === "error" && "bg-destructive",
      state === "pending" && "bg-muted-foreground/20",
    );

  const labelClass = (state: StepState) =>
    cn(
      "leading-tight",
      (state === "current" || state === "done" || state === "success") ? "font-medium text-foreground" : "text-muted-foreground",
      state === "error" && "font-medium text-destructive",
    );

  if (!isVertical) {
    return (
      <div className="flex w-full items-start">
        {steps.map((step, index) => {
          const stepNum = index + 1;
          const state = resolveState(stepNum);
          const prevState = index > 0 ? resolveState(stepNum - 1) : "pending";
          const isLast = index === steps.length - 1;

          return (
            <div key={stepNum} className="relative flex min-w-0 flex-1 flex-col items-center px-2">
              {index > 0 && (
                <div
                  className={cn(
                    "absolute right-1/2 top-4 h-0.5 w-1/2 -translate-x-4",
                    segmentClass(state === "error" ? "error" : prevState),
                  )}
                />
              )}

              {!isLast && (
                <div
                  className={cn(
                    "absolute left-1/2 top-4 h-0.5 w-1/2 translate-x-4",
                    segmentClass(state),
                  )}
                />
              )}

              <div className={circleClass(state)}>
                {state === "done" || state === "success" ? (
                  <svg
                    viewBox="0 0 12 12"
                    className="h-3.5 w-3.5 stroke-current fill-none"
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="1,6 5,10 11,2" />
                  </svg>
                ) : state === "error" ? (
                  <svg
                    viewBox="0 0 12 12"
                    className="h-3.5 w-3.5 stroke-current fill-none"
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="2" y1="2" x2="10" y2="10" />
                    <line x1="10" y1="2" x2="2" y2="10" />
                  </svg>
                ) : (
                  stepNum
                )}
              </div>

              <div className="mt-3 w-full text-center">
                <p
                  className={cn("text-xs", labelClass(state))}
                >
                  {step.label}
                </p>
                {step.description ? (
                  <p className="mt-1 text-[11px] leading-tight text-muted-foreground/90">
                    {step.description}
                  </p>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {steps.map((step, index) => {
        const stepNum = index + 1;
        const state = resolveState(stepNum);
        const isLast = index === steps.length - 1;

        return (
          <div
            key={stepNum}
            className={cn(
              "min-w-0",
              "flex flex-1 items-start gap-3",
            )}
          >
            {/* Circle + label */}
            <div className="relative flex h-full shrink-0 items-start">
              <div className={cn(circleClass(state), "h-8 w-8")}>
                {state === "done" || state === "success" ? (
                  <svg viewBox="0 0 12 12" className="h-3.5 w-3.5 stroke-current fill-none" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="1,6 5,10 11,2" />
                  </svg>
                ) : state === "error" ? (
                  <svg viewBox="0 0 12 12" className="h-3.5 w-3.5 stroke-current fill-none" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                    <line x1="2" y1="2" x2="10" y2="10" />
                    <line x1="10" y1="2" x2="2" y2="10" />
                  </svg>
                ) : (
                  stepNum
                )}
              </div>

              {!isLast ? (
                <div
                  className={cn(
                    "absolute bottom-0 left-4 top-8 w-0.5 -translate-x-1/2",
                    segmentClass(state),
                  )}
                />
              ) : null}
            </div>

            <div className="space-y-0.5 pt-1">
              <p
                className={cn("text-sm", labelClass(state))}
              >
                {step.label}
              </p>
              {step.description ? (
                <p className="text-xs leading-tight text-muted-foreground/90">
                  {step.description}
                </p>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
