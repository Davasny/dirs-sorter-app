import type { ReactNode } from "react";

export default function Page({children}: { children: ReactNode }) {
  return (
    <div className="w-screen h-screen flex items-start justify-center pt-2 md:pt-20">
      <div className="w-full md:w-1/3 max-w-xl px-2">{children}</div>
    </div>
  );
}
