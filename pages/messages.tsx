import React from 'react';
import Head from 'next/head';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import { useAuth } from '@/hooks/useAuth';

export default function Messages() {
  const { user } = useAuth();

  if (!user) {
    return (
      <>
        <Head>
          <title>Messages | FoodToday</title>
          <meta name="description" content="Your messages" />
        </Head>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Please login to view messages</h1>
          </div>
        </div>
        <BottomNav />
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Messages | FoodToday</title>
        <meta name="description" content="Your messages" />
      </Head>
      <Header />
      <div className="min-h-screen bg-gray-50 px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <span className="text-6xl mb-6 block">💬</span>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Messages</h1>
            <p className="text-gray-600 mb-8">Coming Soon! This feature is under development.</p>
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-gray-500">Soon you'll be able to:</p>
              <ul className="text-left mt-4 space-y-2 text-gray-600">
                <li>• Chat with other food enthusiasts</li>
                <li>• Share cooking tips</li>
                <li>• Ask recipe questions</li>
                <li>• Join cooking communities</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <BottomNav />
    </>
  );
} 