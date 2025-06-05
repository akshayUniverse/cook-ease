import { useState } from "react";
import { useAuth } from "./useAuth";

interface QuizQuestion {
  id: string;
  question: string;
  options: {
    id: string;
    text: string;
    image?: string;
    value: string;
    category: "dietaryRestrictions" | "allergies" | "cuisinePreferences" | "mealTypes";
  }[];
}

export const useSwipeQuiz = () => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const { updateUserPreferences } = useAuth();

  // Sample quiz questions
  const questions: QuizQuestion[] = [
    {
      id: "dietary",
      question: "Do you have any dietary restrictions?",
      options: [
        {
          id: "vegetarian",
          text: "Vegetarian",
          value: "vegetarian",
          category: "dietaryRestrictions",
        },
        {
          id: "vegan",
          text: "Vegan",
          value: "vegan",
          category: "dietaryRestrictions",
        },
        {
          id: "gluten-free",
          text: "Gluten Free",
          value: "gluten-free",
          category: "dietaryRestrictions",
        },
        {
          id: "dairy-free",
          text: "Dairy Free",
          value: "dairy-free",
          category: "dietaryRestrictions",
        },
      ],
    },
    {
      id: "allergies",
      question: "Do you have any food allergies?",
      options: [
        {
          id: "nuts",
          text: "Nuts",
          value: "nuts",
          category: "allergies",
        },
        {
          id: "shellfish",
          text: "Shellfish",
          value: "shellfish",
          category: "allergies",
        },
        {
          id: "eggs",
          text: "Eggs",
          value: "eggs",
          category: "allergies",
        },
        {
          id: "soy",
          text: "Soy",
          value: "soy",
          category: "allergies",
        },
      ],
    },
    {
      id: "cuisine",
      question: "What cuisines do you prefer?",
      options: [
        {
          id: "italian",
          text: "Italian",
          value: "italian",
          category: "cuisinePreferences",
        },
        {
          id: "mexican",
          text: "Mexican",
          value: "mexican",
          category: "cuisinePreferences",
        },
        {
          id: "asian",
          text: "Asian",
          value: "asian",
          category: "cuisinePreferences",
        },
        {
          id: "mediterranean",
          text: "Mediterranean",
          value: "mediterranean",
          category: "cuisinePreferences",
        },
      ],
    },
    {
      id: "meals",
      question: "What types of meals are you looking for?",
      options: [
        {
          id: "breakfast",
          text: "Breakfast",
          value: "breakfast",
          category: "mealTypes",
        },
        {
          id: "lunch",
          text: "Lunch",
          value: "lunch",
          category: "mealTypes",
        },
        {
          id: "dinner",
          text: "Dinner",
          value: "dinner",
          category: "mealTypes",
        },
        {
          id: "snacks",
          text: "Snacks",
          value: "snacks",
          category: "mealTypes",
        },
      ],
    },
  ];

  const handleAnswer = (questionId: string, selectedOptions: string[]) => {
    setAnswers({
      ...answers,
      [questionId]: selectedOptions,
    });
  };

  const nextStep = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeQuiz();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeQuiz = async () => {
    // Process answers into user preferences
    const preferences: Record<string, string[]> = {};

    // Group answers by category
    questions.forEach((question) => {
      const selectedOptionIds = answers[question.id] || [];
      const selectedOptions = question.options.filter((option) =>
        selectedOptionIds.includes(option.id)
      );

      // Group by category
      selectedOptions.forEach((option) => {
        if (!preferences[option.category]) {
          preferences[option.category] = [];
        }
        preferences[option.category].push(option.value);
      });
    });

    // Update user preferences
    await updateUserPreferences(preferences);
    setIsComplete(true);
  };

  return {
    currentQuestion: questions[currentStep],
    totalQuestions: questions.length,
    currentStep,
    isComplete,
    handleAnswer,
    nextStep,
    prevStep,
    answers,
  };
};