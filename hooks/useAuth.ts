import React, { useState, useEffect, createContext, useContext, ReactNode } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  preferences?: {
    dietaryRestrictions?: string[];
    allergies?: string[];
    cuisinePreferences?: string[];
    skillLevel?: string;
    mealTypes?: string[];
  };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUserPreferences: (preferences: User["preferences"]) => Promise<void>;
  setError: (error: string | null) => void;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: false,
  error: null,
  login: async () => {},
  signup: async () => {},
  logout: () => {},
  updateUserPreferences: async () => {},
  setError: () => {},
});

// Real API functions
const apiLogin = async (email: string, password: string): Promise<User> => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Login failed');
  }

  const data = await response.json();
  
  // Store token in localStorage
  if (data.token) {
    localStorage.setItem('authToken', data.token);
  }
  
  return {
    id: data.user.id,
    name: data.user.name,
    email: data.user.email,
    preferences: {
      dietaryRestrictions: JSON.parse(data.user.dietaryRestrictions || '[]'),
      allergies: JSON.parse(data.user.allergies || '[]'),
      cuisinePreferences: JSON.parse(data.user.cuisinePreferences || '[]'),
      skillLevel: data.user.skillLevel,
    },
  };
};

const apiSignup = async (name: string, email: string, password: string): Promise<User> => {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Signup failed');
  }

  const data = await response.json();
  
  // Store token in localStorage
  if (data.token) {
    localStorage.setItem('authToken', data.token);
  }
  
  return {
    id: data.user.id,
    name: data.user.name,
    email: data.user.email,
    preferences: {
      dietaryRestrictions: JSON.parse(data.user.dietaryRestrictions || '[]'),
      allergies: JSON.parse(data.user.allergies || '[]'),
      cuisinePreferences: JSON.parse(data.user.cuisinePreferences || '[]'),
      skillLevel: data.user.skillLevel,
    },
  };
};

const apiUpdatePreferences = async (preferences: User["preferences"]): Promise<void> => {
  const token = localStorage.getItem('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch('/api/auth/preferences', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      dietaryRestrictions: JSON.stringify(preferences?.dietaryRestrictions || []),
      allergies: JSON.stringify(preferences?.allergies || []),
      cuisinePreferences: JSON.stringify(preferences?.cuisinePreferences || []),
      skillLevel: preferences?.skillLevel || null,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update preferences');
  }
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for saved user and token in localStorage
    const savedUser = localStorage.getItem("user");
    const token = localStorage.getItem("authToken");
    
    if (savedUser && token) {
      try {
        const parsedUser = JSON.parse(savedUser);
        console.log("Restored user from localStorage:", parsedUser);
        setUser(parsedUser);
      } catch (err) {
        console.error("Error parsing saved user:", err);
        localStorage.removeItem("user");
        localStorage.removeItem("authToken");
      }
    } else {
      console.log("No saved user found in localStorage");
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      console.log("Attempting login for:", email);
      const user = await apiLogin(email, password);
      console.log("Login successful, user:", user);
      setUser(user);
      localStorage.setItem("user", JSON.stringify(user));
      console.log("User stored in localStorage");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred during login";
      setError(errorMessage);
      console.error("Login error:", err);
      // Re-throw the error so the calling function knows login failed
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      console.log("Attempting signup for:", name, email);
      const user = await apiSignup(name, email, password);
      console.log("Signup successful, user:", user);
      setUser(user);
      localStorage.setItem("user", JSON.stringify(user));
      console.log("User stored in localStorage after signup");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred during signup";
      setError(errorMessage);
      console.error("Signup error:", err);
      // Re-throw the error so the calling function knows signup failed
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("authToken");
  };

  const updateUserPreferences = async (preferences: User["preferences"]) => {
    setLoading(true);
    setError(null);
    try {
      await apiUpdatePreferences(preferences);
      
      // Update local user state
      if (user) {
        const updatedUser = {
          ...user,
          preferences: {
            ...user.preferences,
            ...preferences,
          },
        };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred updating preferences");
      console.error("Update preferences error:", err);
    } finally {
      setLoading(false);
    }
  };

  return React.createElement(
    AuthContext.Provider,
    {
      value: {
        user,
        loading,
        error,
        login,
        signup,
        logout,
        updateUserPreferences,
        setError,
      },
    },
    children
  );
};

export const useAuth = () => useContext(AuthContext);