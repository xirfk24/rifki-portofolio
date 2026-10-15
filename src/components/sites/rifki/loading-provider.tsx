"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type LoadingContextValue = {
  isLoading: boolean;
  setIsLoading: (v: boolean) => void;
  threeJsLoaded: boolean;
  setThreeJsLoaded: (v: boolean) => void;
  apiLoaded: boolean;
  setApiLoaded: (v: boolean) => void;
  progress: number;
};

const LoadingContext = createContext<LoadingContextValue | null>(null);

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [threeJsLoaded, setThreeJsLoaded] = useState(false);
  const [apiLoaded, setApiLoaded] = useState(true); // data is static, so API is always loaded

  const progress = apiLoaded && threeJsLoaded ? 100 : (apiLoaded ? 50 : 0) + (threeJsLoaded ? 50 : 0);

  return (
    <LoadingContext.Provider
      value={{
        isLoading,
        setIsLoading,
        threeJsLoaded,
        setThreeJsLoaded,
        apiLoaded,
        setApiLoaded,
        progress,
      }}
    >
      {children}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const ctx = useContext(LoadingContext);
  if (!ctx) throw new Error("useLoading must be used within LoadingProvider");
  return ctx;
}
