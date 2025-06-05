import React from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import SwipeQuiz from "@/components/onboarding/SwipeQuiz";
import { useSwipeQuiz } from "@/hooks/useSwipeQuiz";
import { useAuth } from "@/hooks/useAuth";

export default function Onboarding() {
  const router = useRouter();
  const { questions, handleComplete } = useSwipeQuiz();
  const { user } = useAuth();

  React.useEffect(() => {
    // If user already has preferences, redirect to home
    if (user && user.preferences && Object.keys(user.preferences).length > 0) {
      router.push('/');
    }
  }, [user, router]);

  const onQuizComplete = async (answers) => {
    await handleComplete(answers);
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Head>
        <title>Welcome to CookEase</title>
        <meta name="description" content="Set up your preferences" />
      </Head>

      <div className="max-w-md mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Welcome to CookEase</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Let's personalize your experience by understanding your preferences
          </p>
        </div>

        <SwipeQuiz 
          questions={questions} 
          onComplete={onQuizComplete} 
        />
      </div>
    </div>
  );
}