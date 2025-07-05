import React from "react";
import Head from "next/head";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import Header from '@/components/layout/Header';

export default function Profile() {
  const { user, logout } = useAuth();

  if (!user) {
    return (
      <>
        <Head>
          <title>Profile | CookEase</title>
          <meta name="description" content="Your CookEase profile" />
        </Head>
        <Header />
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
          <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <span className="text-3xl">👤</span>
            </div>
            <h2 className="text-xl font-heading text-gray-800 mb-2">Please log in</h2>
            <p className="text-gray-500 mb-6 text-center">You need to log in to view your profile</p>
            <Link 
              href="/auth" 
              className="px-6 py-3 bg-primary text-white rounded-full hover:bg-orange-700 transition-colors font-heading"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Profile | CookEase</title>
        <meta name="description" content="Your CookEase profile" />
      </Head>
      <Header />
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-2xl flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <span className="text-3xl font-heading text-primary">{user.name[0]}</span>
          </div>
          <div className="font-heading text-lg text-gray-800 mb-1">{user.name}</div>
          <div className="text-gray-500 text-sm mb-6">{user.email}</div>
          
          <div className="w-full">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Preferences</h2>
            
            {user.preferences?.dietaryRestrictions && user.preferences.dietaryRestrictions.length > 0 && (
              <div className="mb-4">
                <div className="font-semibold text-gray-700 mb-2">Dietary Restrictions</div>
                <div className="flex flex-wrap gap-2">
                  {user.preferences.dietaryRestrictions.map((restriction) => (
                    <span key={restriction} className="bg-red-100 text-red-800 rounded-full px-3 py-1 text-xs font-semibold">
                      {restriction}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {user.preferences?.allergies && user.preferences.allergies.length > 0 && (
              <div className="mb-4">
                <div className="font-semibold text-gray-700 mb-2">Allergies</div>
                <div className="flex flex-wrap gap-2">
                  {user.preferences.allergies.map((allergy) => (
                    <span key={allergy} className="bg-yellow-100 text-yellow-800 rounded-full px-3 py-1 text-xs font-semibold">
                      {allergy}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {user.preferences?.cuisinePreferences && user.preferences.cuisinePreferences.length > 0 && (
              <div className="mb-4">
                <div className="font-semibold text-gray-700 mb-2">Favorite Cuisines</div>
                <div className="flex flex-wrap gap-2">
                  {user.preferences.cuisinePreferences.map((cuisine) => (
                    <span key={cuisine} className="bg-green-100 text-green-800 rounded-full px-3 py-1 text-xs font-semibold">
                      {cuisine}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {user.preferences?.skillLevel && (
              <div className="mb-4">
                <div className="font-semibold text-gray-700 mb-2">Skill Level</div>
                <span className="bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-xs font-semibold">
                  {user.preferences.skillLevel}
                </span>
              </div>
            )}
            
            {(!user.preferences || Object.keys(user.preferences).length === 0) && (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No preferences set yet</p>
                <Link 
                  href="/onboarding" 
                  className="px-4 py-2 bg-primary text-white rounded-full hover:bg-orange-700 transition-colors"
                >
                  Set Preferences
                </Link>
              </div>
            )}
          </div>
          
          <button 
            onClick={logout}
            className="bg-red-500 text-white rounded-full py-2 px-6 font-heading text-base mt-6 shadow hover:bg-red-600 transition-colors"
          >
            Log Out
          </button>
        </div>
      </div>
    </>
  );
}