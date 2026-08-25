"use client";

import NextTopLoader from "nextjs-toploader";

export function NavigationProgress() {
  return (
    <NextTopLoader
      color="#002048"
      height={3}
      showSpinner={false}
      shadow="0 0 10px #002048,0 0 5px #FC4400"
      crawlSpeed={180}
      speed={300}
      zIndex={9999}
    />
  );
}
