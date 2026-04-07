import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type PageContainerProps = HTMLAttributes<HTMLDivElement> & {
  size?: "default" | "wide";
};

export default function PageContainer({ size = "default", className, ...props }: PageContainerProps) {
  return (
    <div
      className={cn(
        "space-y-6",
        size === "wide"
          ? "mx-auto w-full max-w-[100rem] px-4 sm:px-6 lg:px-8"
          : "mx-auto w-full max-w-[100rem] px-4 sm:px-6 lg:px-8",
        className,
      )}
      {...props}
    />
  );
}
