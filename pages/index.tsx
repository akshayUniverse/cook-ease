import React from 'react';
import { useRouter } from 'next/router';
import Header from '@/components/layout/Header';

export default function Home() {
  const router = useRouter();
  return (
    <>
      <Header />
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <h2 className="text-xl font-heading text-gray-700 text-center mb-6 max-w-xs">
          Get 4 personalized meal ideas in seconds. Discover your next favorite dish!
        </h2>
        <button
          className="bg-primary text-white font-heading text-lg rounded-full px-8 py-3 shadow-lg hover:bg-orange-700 transition-colors"
          onClick={() => router.push('/auth')}
        >
          Get Started
        </button>
      </div>
    </>
  );
}
