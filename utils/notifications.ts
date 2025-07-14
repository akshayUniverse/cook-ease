// Push Notification and Timer Service
export interface NotificationConfig {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
  actions?: NotificationAction[];
  requireInteraction?: boolean;
  silent?: boolean;
  vibrate?: number[];
  timestamp?: number;
}

export interface CookingTimer {
  id: string;
  recipeId: string;
  recipeName: string;
  step: string;
  duration: number; // in seconds
  startTime: number;
  endTime: number;
  isActive: boolean;
  isCompleted: boolean;
}

export class NotificationService {
  private static instance: NotificationService;
  private swRegistration: ServiceWorkerRegistration | null = null;
  private timers: Map<string, CookingTimer> = new Map();
  private timerIntervals: Map<string, NodeJS.Timeout> = new Map();

  private constructor() {
    this.init();
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private async init() {
    if (typeof window !== 'undefined') {
      // Get service worker registration
      if ('serviceWorker' in navigator) {
        this.swRegistration = await navigator.serviceWorker.ready;
      }
      
      // Request permission on initialization
      await this.requestPermission();
      
      // Load saved timers
      this.loadTimers();
      
      // Setup notification click handlers
      this.setupNotificationHandlers();
    }
  }

  // Request notification permission
  public async requestPermission(): Promise<boolean> {
    if ('Notification' in window) {
      try {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
      } catch (error) {
        console.error('Error requesting notification permission:', error);
        return false;
      }
    }
    return false;
  }

  // Check if notifications are supported and permitted
  public isNotificationSupported(): boolean {
    return 'Notification' in window && Notification.permission === 'granted';
  }

  // Send local notification
  public async sendLocalNotification(config: NotificationConfig): Promise<Notification | null> {
    if (!this.isNotificationSupported()) {
      console.warn('Notifications not supported or permission denied');
      return null;
    }

    const notificationConfig: NotificationOptions = {
      body: config.body,
      icon: config.icon || '/icons/icon-192x192.png',
      badge: config.badge || '/icons/icon-72x72.png',
      tag: config.tag || 'general',
      data: config.data || {},
      requireInteraction: config.requireInteraction || false,
      silent: config.silent || false,
      vibrate: config.vibrate || [200, 100, 200],
      timestamp: config.timestamp || Date.now()
    };

    if (config.actions) {
      notificationConfig.actions = config.actions;
    }

    const notification = new Notification(config.title, notificationConfig);

    // Auto-close after 5 seconds if not require interaction
    if (!config.requireInteraction) {
      setTimeout(() => {
        notification.close();
      }, 5000);
    }

    return notification;
  }

  // Send push notification (via service worker)
  public async sendPushNotification(config: NotificationConfig): Promise<void> {
    if (!this.swRegistration) {
      console.warn('Service Worker not registered');
      return;
    }

    // Send message to service worker to show notification
    this.swRegistration.active?.postMessage({
      type: 'SHOW_NOTIFICATION',
      notification: config
    });
  }

  // Recipe-specific notifications
  public async sendRecipeNotification(type: 'new' | 'reminder' | 'timer', data: any): Promise<void> {
    let config: NotificationConfig;

    switch (type) {
      case 'new':
        config = {
          title: 'New Recipe Available! 🍳',
          body: `Check out "${data.recipeName}" - ${data.description}`,
          icon: '/icons/icon-192x192.png',
          tag: 'new-recipe',
          data: { recipeId: data.recipeId, url: `/recipe/${data.recipeId}` },
          actions: [
            { action: 'view', title: 'View Recipe', icon: '/icons/view-action.png' },
            { action: 'save', title: 'Save for Later', icon: '/icons/save-action.png' }
          ],
          requireInteraction: true
        };
        break;

      case 'reminder':
        config = {
          title: 'Cooking Reminder 🔔',
          body: `Time to cook "${data.recipeName}"!`,
          icon: '/icons/icon-192x192.png',
          tag: 'cooking-reminder',
          data: { recipeId: data.recipeId, url: `/recipe/${data.recipeId}` },
          actions: [
            { action: 'start', title: 'Start Cooking', icon: '/icons/start-action.png' },
            { action: 'snooze', title: 'Remind Later', icon: '/icons/snooze-action.png' }
          ],
          requireInteraction: true
        };
        break;

      case 'timer':
        config = {
          title: 'Cooking Timer ⏰',
          body: `${data.step} is complete! (${data.recipeName})`,
          icon: '/icons/icon-192x192.png',
          tag: 'cooking-timer',
          data: { recipeId: data.recipeId, timerId: data.timerId },
          actions: [
            { action: 'next', title: 'Next Step', icon: '/icons/next-action.png' },
            { action: 'stop', title: 'Stop Timer', icon: '/icons/stop-action.png' }
          ],
          requireInteraction: true,
          vibrate: [300, 100, 300, 100, 300]
        };
        break;
    }

    await this.sendLocalNotification(config);
  }

  // Cooking timer management
  public createCookingTimer(recipeId: string, recipeName: string, step: string, duration: number): string {
    const timerId = `timer-${Date.now()}`;
    const startTime = Date.now();
    const endTime = startTime + (duration * 1000);

    const timer: CookingTimer = {
      id: timerId,
      recipeId,
      recipeName,
      step,
      duration,
      startTime,
      endTime,
      isActive: true,
      isCompleted: false
    };

    this.timers.set(timerId, timer);
    this.saveTimers();

    // Start the timer
    this.startTimer(timerId);

    return timerId;
  }

  private startTimer(timerId: string): void {
    const timer = this.timers.get(timerId);
    if (!timer) return;

    const interval = setInterval(() => {
      const now = Date.now();
      
      if (now >= timer.endTime) {
        // Timer completed
        timer.isCompleted = true;
        timer.isActive = false;
        
        // Send notification
        this.sendRecipeNotification('timer', {
          recipeName: timer.recipeName,
          step: timer.step,
          recipeId: timer.recipeId,
          timerId: timer.id
        });

        // Clean up
        clearInterval(interval);
        this.timerIntervals.delete(timerId);
        this.saveTimers();

        // Dispatch event for UI updates
        window.dispatchEvent(new CustomEvent('timer-completed', {
          detail: { timerId, timer }
        }));
      } else {
        // Dispatch progress event
        const remaining = timer.endTime - now;
        window.dispatchEvent(new CustomEvent('timer-progress', {
          detail: { timerId, remaining, total: timer.duration * 1000 }
        }));
      }
    }, 1000);

    this.timerIntervals.set(timerId, interval);
  }

  public stopTimer(timerId: string): void {
    const timer = this.timers.get(timerId);
    if (timer) {
      timer.isActive = false;
      
      const interval = this.timerIntervals.get(timerId);
      if (interval) {
        clearInterval(interval);
        this.timerIntervals.delete(timerId);
      }
      
      this.saveTimers();
    }
  }

  public getActiveTimers(): CookingTimer[] {
    return Array.from(this.timers.values()).filter(timer => timer.isActive);
  }

  public getTimer(timerId: string): CookingTimer | null {
    return this.timers.get(timerId) || null;
  }

  public clearCompletedTimers(): void {
    for (const [id, timer] of this.timers) {
      if (timer.isCompleted) {
        this.timers.delete(id);
      }
    }
    this.saveTimers();
  }

  // Schedule recurring notifications
  public scheduleRecurringNotification(
    type: 'daily' | 'weekly',
    time: string, // HH:MM format
    config: NotificationConfig
  ): void {
    const [hours, minutes] = time.split(':').map(Number);
    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(hours, minutes, 0, 0);

    // If scheduled time is in the past today, schedule for tomorrow/next week
    if (scheduledTime < now) {
      if (type === 'daily') {
        scheduledTime.setDate(scheduledTime.getDate() + 1);
      } else {
        scheduledTime.setDate(scheduledTime.getDate() + 7);
      }
    }

    const delay = scheduledTime.getTime() - now.getTime();

    setTimeout(() => {
      this.sendLocalNotification(config);
      
      // Schedule next occurrence
      const nextDelay = type === 'daily' ? 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;
      setTimeout(() => {
        this.scheduleRecurringNotification(type, time, config);
      }, nextDelay);
    }, delay);
  }

  // Meal reminder notifications
  public scheduleMealReminders(): void {
    const mealTimes = [
      { time: '08:00', meal: 'breakfast', emoji: '🍳' },
      { time: '12:30', meal: 'lunch', emoji: '🥗' },
      { time: '18:00', meal: 'dinner', emoji: '🍽️' }
    ];

    mealTimes.forEach(({ time, meal, emoji }) => {
      this.scheduleRecurringNotification('daily', time, {
        title: `${emoji} ${meal.charAt(0).toUpperCase() + meal.slice(1)} Time!`,
        body: `Time to start preparing your ${meal}. Check out some delicious recipes!`,
        tag: `meal-reminder-${meal}`,
        data: { meal, url: `/search?mealType=${meal}` },
        actions: [
          { action: 'browse', title: 'Browse Recipes', icon: '/icons/browse-action.png' },
          { action: 'snooze', title: 'Remind Later', icon: '/icons/snooze-action.png' }
        ]
      });
    });
  }

  // Weekly meal planning reminder
  public scheduleWeeklyPlanningReminder(): void {
    this.scheduleRecurringNotification('weekly', '10:00', {
      title: '📅 Weekly Meal Planning',
      body: 'Time to plan your meals for the week! Save time and eat better.',
      tag: 'weekly-planning',
      data: { url: '/search' },
      actions: [
        { action: 'plan', title: 'Plan Meals', icon: '/icons/plan-action.png' },
        { action: 'browse', title: 'Browse Recipes', icon: '/icons/browse-action.png' }
      ]
    });
  }

  // Save/load timers to/from localStorage
  private saveTimers(): void {
    const timersData = Array.from(this.timers.entries());
    localStorage.setItem('cookingTimers', JSON.stringify(timersData));
  }

  private loadTimers(): void {
    const saved = localStorage.getItem('cookingTimers');
    if (saved) {
      try {
        const timersData = JSON.parse(saved) as [string, CookingTimer][];
        this.timers = new Map(timersData);
        
        // Restart active timers
        for (const [id, timer] of this.timers) {
          if (timer.isActive && !timer.isCompleted) {
            // Check if timer should have completed while app was closed
            if (Date.now() >= timer.endTime) {
              timer.isCompleted = true;
              timer.isActive = false;
            } else {
              this.startTimer(id);
            }
          }
        }
        
        this.saveTimers();
      } catch (error) {
        console.error('Error loading timers:', error);
      }
    }
  }

  // Setup notification click handlers
  private setupNotificationHandlers(): void {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data.type === 'NOTIFICATION_CLICK') {
          const { action, notification } = event.data;
          this.handleNotificationAction(action, notification);
        }
      });
    }
  }

  private handleNotificationAction(action: string, notification: any): void {
    switch (action) {
      case 'view':
        if (notification.data.url) {
          window.open(notification.data.url, '_blank');
        }
        break;
        
      case 'save':
        // Handle save action
        if (notification.data.recipeId) {
          this.saveRecipeFromNotification(notification.data.recipeId);
        }
        break;
        
      case 'start':
        // Handle start cooking action
        if (notification.data.url) {
          window.open(notification.data.url, '_blank');
        }
        break;
        
      case 'snooze':
        // Snooze for 15 minutes
        setTimeout(() => {
          this.sendLocalNotification({
            title: notification.title,
            body: notification.body,
            ...notification
          });
        }, 15 * 60 * 1000);
        break;
        
      case 'next':
        // Handle next step in recipe
        window.dispatchEvent(new CustomEvent('recipe-next-step', {
          detail: { recipeId: notification.data.recipeId }
        }));
        break;
        
      case 'stop':
        // Stop timer
        if (notification.data.timerId) {
          this.stopTimer(notification.data.timerId);
        }
        break;
    }
  }

  private async saveRecipeFromNotification(recipeId: string): Promise<void> {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      await fetch(`/api/recipes/${recipeId}/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      this.sendLocalNotification({
        title: 'Recipe Saved! 📚',
        body: 'Recipe has been added to your favorites.',
        tag: 'recipe-saved'
      });
    } catch (error) {
      console.error('Error saving recipe from notification:', error);
    }
  }

  // Get notification statistics
  public getNotificationStats(): {
    permission: NotificationPermission;
    supported: boolean;
    activeTimers: number;
    completedTimers: number;
  } {
    return {
      permission: Notification.permission,
      supported: 'Notification' in window,
      activeTimers: this.getActiveTimers().length,
      completedTimers: Array.from(this.timers.values()).filter(t => t.isCompleted).length
    };
  }
}

// Export singleton instance
export const notificationService = NotificationService.getInstance();

// Export utility functions
export const requestNotificationPermission = () => notificationService.requestPermission();
export const sendNotification = (config: NotificationConfig) => notificationService.sendLocalNotification(config);
export const sendRecipeNotification = (type: 'new' | 'reminder' | 'timer', data: any) => 
  notificationService.sendRecipeNotification(type, data);
export const createTimer = (recipeId: string, recipeName: string, step: string, duration: number) => 
  notificationService.createCookingTimer(recipeId, recipeName, step, duration);
export const stopTimer = (timerId: string) => notificationService.stopTimer(timerId);
export const getActiveTimers = () => notificationService.getActiveTimers();
export const scheduleMealReminders = () => notificationService.scheduleMealReminders();
export const scheduleWeeklyPlanning = () => notificationService.scheduleWeeklyPlanningReminder();
export const getNotificationStats = () => notificationService.getNotificationStats(); 