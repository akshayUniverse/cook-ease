import { useAuth } from './useAuth';
import { useRouter } from 'next/router';

export function useRequireAuth() {
  const { user } = useAuth();
  const router = useRouter();

  const requireAuth = (action: () => void, actionName?: string) => {
    if (!user) {
      const shouldLogin = confirm(
        `To ${actionName || 'perform this action'}, you need to sign in. Would you like to sign in now?`
      );
      
      if (shouldLogin) {
        // Store the current page to redirect back after login
        sessionStorage.setItem('redirect_after_login', router.asPath);
        router.push('/auth');
      }
      return false;
    }
    
    action();
    return true;
  };

  return { requireAuth, isAuthenticated: !!user };
} 