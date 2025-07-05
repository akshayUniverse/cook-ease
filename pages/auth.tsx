import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/layout/Header';

export default function AuthPage() {
  const [isSignIn, setIsSignIn] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [success, setSuccess] = useState<string | null>(null);
  
  const router = useRouter();
  const { login, signup, loading, error, setError } = useAuth();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear errors when user starts typing
    if (error) {
      setError(null);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(null);
    
    try {
      if (isSignIn) {
        console.log("Attempting login...");
        await login(formData.email, formData.password);
        console.log("Login successful! Setting success message and redirecting...");
        setSuccess("Login successful! Redirecting...");
        // Small delay to show success message and ensure state is updated
        setTimeout(() => {
          router.push('/home');
        }, 1500);
      } else {
        console.log("Attempting signup...");
        await signup(formData.name, formData.email, formData.password);
        console.log("Signup successful! Setting success message and redirecting...");
        setSuccess("Account created successfully! Redirecting...");
        // Small delay to show success message and ensure state is updated
        setTimeout(() => {
          router.push('/home');
        }, 1500);
      }
    } catch (err) {
      // Error is handled by the useAuth hook - do NOT redirect on error
      console.error('Authentication failed, staying on auth page:', err);
      console.log("Error state should be visible now");
      // Stay on auth page to show error message
      // Small delay to ensure error state is properly updated
      setTimeout(() => {
        console.log("Error should now be visible in UI");
      }, 100);
    }
  };

  const switchMode = () => {
    setIsSignIn(!isSignIn);
    // Keep email when switching from login to signup (in case email not found)
    if (isSignIn && formData.email) {
      setFormData({ name: '', email: formData.email, password: '' });
    } else {
      setFormData({ name: '', email: '', password: '' });
    }
    setSuccess(null);
    setError(null); // Clear any existing errors
  };

  // Auto-suggest switching to sign up when email not found
  React.useEffect(() => {
    if (error && error.includes('Email not found') && isSignIn) {
      // Show a helpful message to switch to sign up
    }
  }, [error, isSignIn]);

  return (
    <>
      <Header />
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-xs flex flex-col items-center">
          
          {/* Toggle Tabs */}
          <div className="flex w-full mb-6">
            <button
              className={`flex-1 pb-2 font-heading text-lg border-b-2 transition-colors ${
                isSignIn ? 'border-primary text-primary' : 'border-transparent text-gray-400'
              }`}
              onClick={() => setIsSignIn(true)}
            >
              Sign In
            </button>
            <button
              className={`flex-1 pb-2 font-heading text-lg border-b-2 transition-colors ${
                !isSignIn ? 'border-primary text-primary' : 'border-transparent text-gray-400'
              }`}
              onClick={() => setIsSignIn(false)}
            >
              Sign Up
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="w-full mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">
              {error}
              {error.includes('Email not found') && isSignIn && (
                <div className="mt-2 pt-2 border-t border-red-200">
                  <button
                    onClick={switchMode}
                    className="text-red-600 hover:text-red-800 underline text-sm font-medium"
                  >
                    Click here to create a new account →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="w-full mb-4 p-3 bg-green-100 border border-green-300 text-green-700 rounded-lg text-sm">
              {success}
            </div>
          )}

          {/* Auth Form */}
          <form onSubmit={handleAuth} className="w-full flex flex-col gap-4">
            {!isSignIn && (
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleInputChange}
                className="rounded-lg border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            )}
            
            <input
              type="email"
              name="email"
              placeholder="E-mail address"
              value={formData.email}
              onChange={handleInputChange}
              className="rounded-lg border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
            
            <input
              type="password"
              name="password"
              placeholder="Enter password"
              value={formData.password}
              onChange={handleInputChange}
              className="rounded-lg border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              required
              minLength={6}
            />
            
            <button
              type="submit"
              disabled={loading}
              className={`rounded-full py-2 font-heading text-lg mt-2 shadow transition-colors ${
                loading 
                  ? 'bg-gray-400 text-white cursor-not-allowed' 
                  : 'bg-primary text-white hover:bg-orange-700'
              }`}
            >
              {loading ? 'Loading...' : (isSignIn ? 'Login' : 'Create Account')}
            </button>
          </form>

          {/* Divider */}
          <div className="w-full flex items-center my-4">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="mx-2 text-gray-400 text-sm">OR</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Switch Mode */}
          <button
            onClick={switchMode}
            className="text-primary text-sm hover:underline"
          >
            {isSignIn ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>

          {/* Demo Credentials (for testing) */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg text-xs text-blue-600">
            <p className="font-semibold mb-1">For testing:</p>
            <p>Create a new account or use any email/password</p>
          </div>
        </div>
      </div>
    </>
  );
} 