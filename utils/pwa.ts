// PWA Utility Functions
export class PWAManager {
  private static instance: PWAManager;
  private swRegistration: ServiceWorkerRegistration | null = null;
  private deferredPrompt: any = null;
  private isInstalled = false;
  private isOnline = true; // Default to online, will be updated in browser

  private constructor() {
    // Only initialize if we're in the browser
    if (typeof window !== 'undefined') {
      this.isOnline = navigator.onLine;
      this.init();
    }
  }

  public static getInstance(): PWAManager {
    if (!PWAManager.instance) {
      PWAManager.instance = new PWAManager();
    }
    return PWAManager.instance;
  }

  private async init() {
    if (typeof window !== 'undefined') {
      // Register service worker
      await this.registerServiceWorker();
      
      // Set up event listeners
      this.setupEventListeners();
      
      // Check if app is already installed
      this.checkInstallStatus();
      
      // Set up push notifications
      this.setupPushNotifications();
    }
  }

  // Register Service Worker
  private async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });
        
        this.swRegistration = registration;
        console.log('Service Worker registered successfully:', registration);

        // Handle service worker updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New content available
                this.showUpdateNotification();
              }
            });
          }
        });

        // Listen for messages from service worker
        navigator.serviceWorker.addEventListener('message', (event) => {
          console.log('Message from service worker:', event.data);
        });

      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }

  // Setup event listeners
  private setupEventListeners() {
    // Listen for app install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      this.showInstallButton();
    });

    // Listen for app installed event
    window.addEventListener('appinstalled', () => {
      console.log('PWA installed successfully');
      this.isInstalled = true;
      this.hideInstallButton();
      this.trackInstall();
    });

    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.handleOnline();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.handleOffline();
    });

    // Listen for visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.handleAppFocus();
      }
    });
  }

  // Show install button
  private showInstallButton() {
    const installButton = document.getElementById('install-button');
    if (installButton) {
      installButton.style.display = 'block';
    }
    
    // Create dynamic install banner if it doesn't exist
    this.createInstallBanner();
  }

  // Hide install button
  private hideInstallButton() {
    const installButton = document.getElementById('install-button');
    if (installButton) {
      installButton.style.display = 'none';
    }
    
    const installBanner = document.getElementById('install-banner');
    if (installBanner) {
      installBanner.remove();
    }
  }

  // Create install banner
  private createInstallBanner() {
    if (document.getElementById('install-banner')) return;

    const banner = document.createElement('div');
    banner.id = 'install-banner';
    banner.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: #ea6100;
      color: white;
      padding: 12px 20px;
      border-radius: 25px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 1000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 12px;
      max-width: 300px;
      animation: slideUp 0.3s ease-out;
    `;

    banner.innerHTML = `
      <span>📱</span>
      <span>Install CookEase for quick access</span>
      <button id="install-now-btn" style="
        background: rgba(255,255,255,0.2);
        border: none;
        color: white;
        padding: 4px 12px;
        border-radius: 12px;
        cursor: pointer;
        font-size: 12px;
      ">Install</button>
      <button id="install-dismiss-btn" style="
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        font-size: 18px;
        padding: 0;
        width: 20px;
        height: 20px;
      ">×</button>
    `;

    // Add animation keyframes
    if (!document.getElementById('install-banner-styles')) {
      const style = document.createElement('style');
      style.id = 'install-banner-styles';
      style.textContent = `
        @keyframes slideUp {
          from { transform: translateX(-50%) translateY(100px); opacity: 0; }
          to { transform: translateX(-50%) translateY(0); opacity: 1; }
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(banner);

    // Add event listeners
    document.getElementById('install-now-btn')?.addEventListener('click', () => {
      this.installApp();
    });

    document.getElementById('install-dismiss-btn')?.addEventListener('click', () => {
      banner.remove();
    });
  }

  // Install app
  public async installApp() {
    if (this.deferredPrompt) {
      this.deferredPrompt.prompt();
      const { outcome } = await this.deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted install prompt');
      } else {
        console.log('User dismissed install prompt');
      }
      
      this.deferredPrompt = null;
      this.hideInstallButton();
    }
  }

  // Check if app is installed
  private checkInstallStatus() {
    // Check if running in standalone mode
    if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
      this.isInstalled = true;
      return;
    }

    // Check for iOS Safari standalone mode
    if ((window.navigator as any).standalone) {
      this.isInstalled = true;
      return;
    }

    // Check for TWA (Trusted Web Activity)
    if (document.referrer.includes('android-app://')) {
      this.isInstalled = true;
      return;
    }
  }

  // Show update notification
  private showUpdateNotification() {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #4CAF50;
      color: white;
      padding: 16px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 1000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      max-width: 300px;
    `;

    notification.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
        <span>✨</span>
        <strong>Update Available</strong>
      </div>
      <p style="margin: 0 0 12px 0; font-size: 13px;">
        A new version of CookEase is available with improvements and bug fixes.
      </p>
      <button id="update-now-btn" style="
        background: rgba(255,255,255,0.2);
        border: none;
        color: white;
        padding: 6px 12px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 13px;
        margin-right: 8px;
      ">Update Now</button>
      <button id="update-dismiss-btn" style="
        background: none;
        border: 1px solid rgba(255,255,255,0.3);
        color: white;
        padding: 6px 12px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 13px;
      ">Later</button>
    `;

    document.body.appendChild(notification);

    // Add event listeners
    document.getElementById('update-now-btn')?.addEventListener('click', () => {
      this.updateApp();
      notification.remove();
    });

    document.getElementById('update-dismiss-btn')?.addEventListener('click', () => {
      notification.remove();
    });

    // Auto-dismiss after 10 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 10000);
  }

  // Update app
  private async updateApp() {
    if (this.swRegistration) {
      const waitingWorker = this.swRegistration.waiting;
      if (waitingWorker) {
        waitingWorker.postMessage({ type: 'SKIP_WAITING' });
        window.location.reload();
      }
    }
  }

  // Setup push notifications
  private async setupPushNotifications() {
    if ('Notification' in window && 'serviceWorker' in navigator) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        console.log('Push notifications enabled');
      }
    }
  }

  // Request push notification permission
  public async requestNotificationPermission(): Promise<boolean> {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }

  // Send local notification
  public showNotification(title: string, options: NotificationOptions = {}) {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(title, {
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        ...options
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      return notification;
    }
  }

  // Cache recipe for offline access
  public cacheRecipe(recipe: any) {
    if (this.swRegistration) {
      this.swRegistration.active?.postMessage({
        type: 'CACHE_RECIPE',
        recipe: recipe
      });
    }
  }

  // Handle online event
  private handleOnline() {
    console.log('App is back online');
    this.showNotification('Back Online', {
      body: 'Your connection has been restored. All features are available.',
      tag: 'online-status'
    });
  }

  // Handle offline event
  private handleOffline() {
    console.log('App is offline');
    this.showNotification('You\'re Offline', {
      body: 'You can still view your saved recipes and use basic features.',
      tag: 'offline-status'
    });
  }

  // Handle app focus
  private handleAppFocus() {
    // Refresh data when app comes back into focus
    if (this.isOnline) {
      // Trigger data refresh
      window.dispatchEvent(new CustomEvent('app-focus'));
    }
  }

  // Track install analytics
  private trackInstall() {
    // Track PWA install for analytics
    if (typeof window !== 'undefined' && 'gtag' in window) {
      (window as any).gtag('event', 'pwa_install', {
        event_category: 'PWA',
        event_label: 'App Installed'
      });
    }
  }

  // Get installation status
  public getInstallStatus() {
    return {
      isInstalled: this.isInstalled,
      canInstall: this.deferredPrompt !== null,
      isOnline: this.isOnline
    };
  }

  // Get service worker registration
  public getServiceWorkerRegistration() {
    return this.swRegistration;
  }

  // Share content using Web Share API
  public async shareContent(data: ShareData) {
    if (navigator.share) {
      try {
        await navigator.share(data);
        return true;
      } catch (error) {
        console.log('Share cancelled or failed:', error);
        return false;
      }
    } else {
      // Fallback to clipboard
      if (navigator.clipboard && data.url) {
        await navigator.clipboard.writeText(data.url);
        this.showNotification('Link Copied', {
          body: 'Recipe link copied to clipboard',
          tag: 'share-fallback'
        });
        return true;
      }
      return false;
    }
  }

  // Take screenshot (if supported)
  public async takeScreenshot() {
    if ('getDisplayMedia' in navigator.mediaDevices) {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true
        });
        
        const video = document.createElement('video');
        video.srcObject = stream;
        video.play();
        
        return new Promise((resolve) => {
          video.onloadedmetadata = () => {
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(video, 0, 0);
            
            stream.getTracks().forEach(track => track.stop());
            resolve(canvas.toDataURL());
          };
        });
      } catch (error) {
        console.log('Screenshot failed:', error);
        return null;
      }
    }
    return null;
  }
}

// Export singleton instance getter function
export const getPWAManager = () => {
  if (typeof window !== 'undefined') {
    return PWAManager.getInstance();
  }
  return null;
};

// Export utility functions
export const registerPWA = () => {
  const manager = getPWAManager();
  return manager;
};
export const installApp = () => {
  const manager = getPWAManager();
  return manager?.installApp();
};
export const cacheRecipe = (recipe: any) => {
  const manager = getPWAManager();
  return manager?.cacheRecipe(recipe);
};
export const shareRecipe = (recipe: any) => {
  const manager = getPWAManager();
  return manager?.shareContent({
    title: recipe.title,
    text: recipe.description,
    url: `${window.location.origin}/recipe/${recipe.id}`
  });
};
export const requestNotifications = () => {
  const manager = getPWAManager();
  return manager?.requestNotificationPermission();
};
export const showNotification = (title: string, options?: NotificationOptions) => {
  const manager = getPWAManager();
  return manager?.showNotification(title, options);
};
export const getPWAStatus = () => {
  const manager = getPWAManager();
  return manager?.getInstallStatus();
}; 