import React, { useState } from "react";
import Head from "next/head";
import { useAuth } from "@/hooks/useAuth";

export default function Profile() {
  const { user, logout, updateUserPreferences } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [preferences, setPreferences] = useState(user?.preferences || {});

  const handlePreferenceChange = (category, value, isChecked) => {
    setPreferences(prev => {
      const currentValues = prev[category] || [];
      if (isChecked) {
        return { ...prev, [category]: [...currentValues, value] };
      } else {
        return { ...prev, [category]: currentValues.filter(v => v !== value) };
      }
    });
  };

  const handleSavePreferences = async () => {
    try {
      await updateUserPreferences(preferences);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update preferences:", error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-500 dark:text-gray-400">Please log in to view your profile</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Head>
        <title>My Profile | CookEase</title>
        <meta name="description" content="Manage your profile and preferences" />
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Profile</h1>
            <button 
              onClick={logout}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              Log Out
            </button>
          </div>
          
          <div className="mb-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Account Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Name</label>
                <p className="text-gray-900 dark:text-white">{user.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Email</label>
                <p className="text-gray-900 dark:text-white">{user.email}</p>
              </div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Preferences</h2>
              {isEditing ? (
                <div className="space-x-2">
                  <button 
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-1 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSavePreferences}
                    className="px-3 py-1 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition-colors"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  Edit
                </button>
              )}
            </div>
            
            {/* Preferences sections would go here - simplified for brevity */}
            <div className="space-y-4">
              {isEditing ? (
                <p className="text-gray-500 dark:text-gray-400">Preference editing UI would go here</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Dietary Restrictions</h3>
                    <p className="text-gray-900 dark:text-white">
                      {user.preferences?.dietaryRestrictions?.join(', ') || 'None'}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Allergies</h3>
                    <p className="text-gray-900 dark:text-white">
                      {user.preferences?.allergies?.join(', ') || 'None'}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Cuisine Preferences</h3>
                    <p className="text-gray-900 dark:text-white">
                      {user.preferences?.cuisinePreferences?.join(', ') || 'None'}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Meal Types</h3>
                    <p className="text-gray-900 dark:text-white">
                      {user.preferences?.mealTypes?.join(', ') || 'None'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}