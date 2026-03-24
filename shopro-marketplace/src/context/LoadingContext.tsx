import React, { createContext, useContext, useEffect, useState } from 'react';
import { loadingManager } from '../lib/LoadingManager';

const LoadingContext = createContext<{ isLoading: boolean }>({ isLoading: false });

export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(loadingManager.isLoading);

  useEffect(() => {
    const unsubscribe = loadingManager.subscribe((state) => {
      setIsLoading(state);
    });
    return () => { unsubscribe(); };
  }, []);

  return (
    <LoadingContext.Provider value={{ isLoading }}>
      {children}
    </LoadingContext.Provider>
  );
};

export const useGlobalLoading = () => useContext(LoadingContext);
