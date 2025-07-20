import React from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();
  
  // Redirect to home page to browse recipes without login required
  React.useEffect(() => {
    router.push('/home');
  }, [router]);
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
      <p className="text-gray-600">Loading FoodToday...</p>
    </div>
  );
}
