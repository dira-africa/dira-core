import React from "react";

export type SkeletonType = "card" | "list" | "profile" | "wallet";

interface LoadingSkeletonProps {
  type?: SkeletonType;
  className?: string;
  count?: number;
}

export default function LoadingSkeleton({
  type = "card",
  className = "",
  count = 1,
}: LoadingSkeletonProps) {
  const renderSkeleton = () => {
    switch (type) {
      case "profile":
        return (
          <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-2xl backdrop-blur-md border border-white/10 w-full animate-pulse">
            <div className="rounded-full bg-white/10 h-16 w-16" />
            <div className="flex-1 space-y-3 py-1">
              <div className="h-4 bg-white/10 rounded-md w-1/3" />
              <div className="h-3 bg-white/10 rounded-md w-2/3" />
            </div>
          </div>
        );
      case "list":
        return (
          <div className="space-y-3 w-full animate-pulse">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5"
              >
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-white/10 rounded-md w-1/4" />
                  <div className="h-3 bg-white/10 rounded-md w-1/2" />
                </div>
                <div className="h-8 w-16 bg-white/10 rounded-lg" />
              </div>
            ))}
          </div>
        );
      case "wallet":
        return (
          <div className="p-6 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl border border-white/10 space-y-6 w-full animate-pulse">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <div className="h-3 bg-white/10 rounded-md w-24" />
                <div className="h-7 bg-white/15 rounded-lg w-40" />
              </div>
              <div className="h-10 w-10 bg-white/15 rounded-full" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 2 }).map((_, idx) => (
                <div key={idx} className="p-3 bg-white/5 rounded-xl space-y-2 border border-white/5">
                  <div className="h-3 bg-white/10 rounded-md w-16" />
                  <div className="h-4 bg-white/15 rounded-md w-24" />
                </div>
              ))}
            </div>
          </div>
        );
      case "card":
      default:
        return (
          <div className="p-5 bg-white/5 rounded-2xl border border-white/10 space-y-4 w-full animate-pulse">
            <div className="h-48 bg-white/10 rounded-xl w-full" />
            <div className="space-y-2">
              <div className="h-4 bg-white/15 rounded-md w-3/4" />
              <div className="h-3 bg-white/10 rounded-md w-5/6" />
            </div>
            <div className="flex justify-between items-center pt-2">
              <div className="h-4 bg-white/10 rounded-md w-1/4" />
              <div className="h-8 w-24 bg-primary/20 rounded-xl" />
            </div>
          </div>
        );
    }
  };

  return (
    <div className={`w-full space-y-4 ${className}`}>
      {Array.from({ length: count }).map((_, idx) => (
        <React.Fragment key={idx}>{renderSkeleton()}</React.Fragment>
      ))}
    </div>
  );
}
