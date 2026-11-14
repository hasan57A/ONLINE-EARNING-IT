import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

interface RouterContextType {
  path: string;
  navigate: (to: string, state?: unknown) => void;
  queryParams: URLSearchParams;
}

const RouterContext = createContext<RouterContextType | undefined>(undefined);

export const RouterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [path, setPath] = useState<string>(() => window.location.pathname || '/');
  const [search, setSearch] = useState<string>(() => window.location.search || '');

  useEffect(() => {
    const handlePopState = () => {
      setPath(window.location.pathname || '/');
      setSearch(window.location.search || '');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = useCallback((to: string) => {
    const [targetPath, targetSearch = ''] = to.split('?');
    if (window.location.pathname !== targetPath || window.location.search !== (targetSearch ? `?${targetSearch}` : '')) {
      window.history.pushState({}, '', to);
      setPath(targetPath);
      setSearch(targetSearch ? `?${targetSearch}` : '');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const queryParams = new URLSearchParams(search);

  return (
    <RouterContext.Provider value={{ path, navigate, queryParams }}>
      {children}
    </RouterContext.Provider>
  );
};

export const useRouter = () => {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error('useRouter must be used within a RouterProvider');
  return ctx;
};
