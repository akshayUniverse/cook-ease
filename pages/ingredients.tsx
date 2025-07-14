import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Header from '@/components/layout/Header';

export default function IngredientsPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to search page with ingredients mode
    router.replace('/search?mode=ingredients');
  }, [router]);

  return (
    <>
      <Head>
        <title>Find Recipes by Ingredients | CookEase</title>
        <meta name="description" content="Find recipes by ingredients you have available" />
      </Head>
      
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to ingredient search...</p>
        </div>
      </div>
    </>
  );
} 