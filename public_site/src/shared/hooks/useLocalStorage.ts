"use client";

/**
 * =====================================================
 * Hook بسيط للتعامل مع localStorage
 * =====================================================
 */

import { useEffect, useState } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);

  useEffect(() => {
    const storedValue = window.localStorage.getItem(key);
    if (storedValue) {
      setValue(JSON.parse(storedValue) as T);
    }
  }, [key]);

  const updateValue = (nextValue: T) => {
    setValue(nextValue);
    window.localStorage.setItem(key, JSON.stringify(nextValue));
  };

  return [value, updateValue] as const;
}
