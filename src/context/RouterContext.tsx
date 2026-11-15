import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

interface RouterContextType {
  path: string;
  navigate: (to: string, state?: unknown) => void;
  queryParams: URLSearchParams;
}

const RouterContext = createContext<RouterContextType | undefined>(undefined);

const APP_ROUTE_PREFIXES = [
  '/',
  '/signin',
  '/signup',
  '/dashboard',
  '/tools',
  '/resources',
  '/history',
  '/saved-results',
  '/profile',
  '/settings',
  '/announcements',
  '/payment',
  '/support',
  '/admin',
];

function isKnownAppPath(pathname: string): boolean {
  if (pathname === '/' || pathname === '') return true;
  return APP_ROUTE_PREFIXES.some(
    prefix => prefix !== '/' && (pathname === prefix || pathname.startsWith(`${prefix}/`))
  );
}

function shouldUseHashRouting(): boolean {
  if (typeof window === 'undefined') return false;
  if (window.location.hash.startsWith('#/')) return true;
  if (window.location.hostname.endsWith('.github.io')) return true;
  if (window.location.protocol === 'file:') return true;
  if (!isKnownAppPath(window.location.pathname)) return true;
  return false;
}

function parseRouteFromLocation(useHash: boolean): { path: string; search: string } {
  if (typeof window === 'undefined') return { path: '/', search: '' };

  if (window.location.hash.startsWith('#/')) {
    const raw = window.location.hash.slice(1);
    const [hashPath, hashQuery = ''] = raw.split('?');
    return {
      path: hashPath || '/',
      search: hashQuery ? `?${hashQuery}` : '',
    };
  }

  if (useHash) {
    return {
      path: '/',
      search: window.location.search || '',
    };
  }

  return {
    path: window.location.pathname || '/',
    search: window.location.search || '',
  };
}

export const RouterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [useHash] = useState<boolean>(() => shouldUseHashRouting());
  const [route, setRoute] = useState<{ path: string; search: string }>(() =>
    parseRouteFromLocation(shouldUseHashRouting())
  );

  useEffect(() => {
    const syncRoute = () => {
      setRoute(parseRouteFromLocation(useHash));
    };

    window.addEventListener('popstate', syncRoute);
    window.addEventListener('hashchange', syncRoute);
    return () => {
      window.removeEventListener('popstate', syncRoute);
      window.removeEventListener('hashchange', syncRoute);
    };
  }, [useHash]);

  const navigate = useCallback(
    (to: string) => {
      const normalizedTo = to.startsWith('/') ? to : `/${to}`;
      const [targetPath, targetSearch = ''] = normalizedTo.split('?');
      const nextSearch = targetSearch ? `?${targetSearch}` : '';

      if (useHash) {
        const nextHash = `#${normalizedTo}`;
        if (window.location.hash !== nextHash) {
          window.location.hash = nextHash;
        }
        setRoute({ path: targetPath || '/', search: nextSearch });
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      if (window.location.pathname !== targetPath || window.location.search !== nextSearch) {
        window.history.pushState({}, '', normalizedTo);
        setRoute({ path: targetPath || '/', search: nextSearch });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
    [useHash]
  );

  const queryParams = new URLSearchParams(route.search);

  return (
    <RouterContext.Provider value={{ path: route.path, navigate, queryParams }}>
      {children}
    </RouterContext.Provider>
  );
};

export const useRouter = () => {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error('useRouter must be used within a RouterProvider');
  return ctx;
};

export function resolvePublicAsset(relPath: string): string {
  const clean = relPath.replace(/^\/+/, '');
  return shouldUseHashRouting() ? `./${clean}` : `/${clean}`;
}

export const PLATFORM_LOGO_URL = resolvePublicAsset(
  'assets/aistudio/Online_Earning_IT_Logo__e2215d9f_e2215d9f.png'
);
