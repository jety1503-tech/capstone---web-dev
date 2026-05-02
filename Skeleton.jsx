import React from "react";

export function SkeletonCard() {
  return (
    <div className="card space-y-3">
      <div className="skeleton h-10 w-10 rounded-full" />
      <div className="skeleton h-5 w-2/3" />
      <div className="skeleton h-4 w-1/2" />
      <div className="space-y-2 pt-2">
        <div className="skeleton h-3 w-full" />
        <div className="skeleton h-3 w-5/6" />
        <div className="skeleton h-3 w-4/6" />
      </div>
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex gap-3 items-center p-4">
      <div className="skeleton h-8 w-8 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="skeleton h-4 w-1/3" />
        <div className="skeleton h-3 w-1/2" />
      </div>
      <div className="skeleton h-6 w-16 rounded-full" />
    </div>
  );
}
