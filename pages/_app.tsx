import { useEffect, useState } from 'react';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import Head from 'next/head';
import '../styles/globals.css';
import { AuthProvider } from '../hooks/useAuth';
import { TranslationProvider } from '../contexts/TranslationContext';
import { getPWAManager } from '../utils/pwa';

// PWA Install Button Component
function PWAInstallButton() {
  const handleInstall = () => {
    const pwaManager = getPWAManager();
    pwaManager?.installApp();
  };

  return (
    <button
      id="install-button"
      onClick={handleInstall}
      style={{ display: 'none' }}
      className="fixed bottom-4 right-4 bg-primary text-white px-4 py-2 rounded-full shadow-lg hover:bg-orange-700 transition-colors z-50"
    >
      📱 Install App
    </button>
  );
}

// PWA Status Component
function PWAStatus() {
  useEffect(() => {
    // Show PWA status notifications
    const handleAppFocus = () => {
      const status = getPWAManager()?.getInstallStatus();
      if (status?.isInstalled) {
        console.log('PWA is installed and running');
      }
    };

    window.addEventListener('app-focus', handleAppFocus);
    return () => window.removeEventListener('app-focus', handleAppFocus);
  }, []);

  return null;
}

// Offline Indicator Component
function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const router = useRouter();

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => {
      setIsOnline(false);
      // Redirect to offline page if not already there
      if (router.pathname !== '/offline') {
        router.push('/offline');
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [router]);

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-red-500 text-white text-center py-2 text-sm z-50">
      <div className="flex items-center justify-center space-x-2">
        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
        <span>You're offline - Limited functionality available</span>
      </div>
    </div>
  );
}

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  useEffect(() => {
    // Initialize PWA
    getPWAManager();

    // Handle route changes for PWA
    const handleRouteChange = (url: string) => {
      // Track page views for PWA analytics
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('config', 'GA_MEASUREMENT_ID', {
          page_path: url,
        });
      }
    };

    router.events.on('routeChangeComplete', handleRouteChange);

    // Cleanup
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router]);

  // Handle PWA updates
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Check if there are unsaved changes
      const hasUnsavedChanges = localStorage.getItem('unsavedChanges');
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // Handle PWA sharing
  useEffect(() => {
    const handleShare = async (e: Event) => {
      const customEvent = e as CustomEvent;
      const { title, text, url } = customEvent.detail;
      const pwaManager = getPWAManager();
      if (pwaManager) {
        await pwaManager.shareContent({ title, text, url });
      }
    };

    window.addEventListener('pwa-share', handleShare);
    return () => window.removeEventListener('pwa-share', handleShare);
  }, []);

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes, viewport-fit=cover" />
      </Head>
    <TranslationProvider>
      <AuthProvider>
        <Component {...pageProps} />
        <PWAInstallButton />
        <PWAStatus />
        <OfflineIndicator />
      </AuthProvider>
    </TranslationProvider>
    </>
  );
}
