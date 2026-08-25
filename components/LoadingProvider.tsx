"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { Spinner } from "@/components/ui/spinner";

type LoadingContextValue = {
  active: boolean;
  message: string;
  showLoading: (message?: string) => void;
  hideLoading: () => void;
  withLoading: <T>(task: () => Promise<T>, message?: string) => Promise<T>;
};

const LoadingContext = createContext<LoadingContextValue | null>(null);

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [count, setCount] = useState(0);
  const [message, setMessage] = useState("Carregando...");

  const showLoading = useCallback((nextMessage = "Carregando...") => {
    setMessage(nextMessage);
    setCount((current) => current + 1);
  }, []);

  const hideLoading = useCallback(() => {
    setCount((current) => Math.max(0, current - 1));
  }, []);

  const withLoading = useCallback(
    async <T,>(task: () => Promise<T>, nextMessage = "Carregando...") => {
      showLoading(nextMessage);
      try {
        return await task();
      } finally {
        hideLoading();
      }
    },
    [showLoading, hideLoading],
  );

  const value = useMemo(
    () => ({
      active: count > 0,
      message,
      showLoading,
      hideLoading,
      withLoading,
    }),
    [count, message, showLoading, hideLoading, withLoading],
  );

  return (
    <LoadingContext.Provider value={value}>
      {children}
      {count > 0 && (
        <div className="fixed inset-0 z-[100] bg-ink/35 backdrop-blur-[2px] flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl border border-line shadow-2xl px-8 py-7 flex flex-col items-center gap-4 min-w-[220px]">
            <Spinner size="lg" />
            <p className="text-sm font-bold text-ink text-center">{message}</p>
          </div>
        </div>
      )}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error("useLoading must be used within LoadingProvider");
  }
  return context;
}
