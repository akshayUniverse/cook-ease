import React, { useState } from "react";
import Image from "next/image";

interface QuizQuestion {
  id: string;
  question: string;
  options: {
    id: string;
    text: string;
    image?: string;
  }[];
}

interface SwipeQuizProps {
  questions: QuizQuestion[];
  onComplete: (answers: Record<string, string[]>) => void;
}

const SwipeQuiz: React.FC<SwipeQuizProps> = ({ questions, onComplete }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  const currentQuestion = questions[currentQuestionIndex];

  const handleOptionSelect = (optionId: string) => {
    if (selectedOptions.includes(optionId)) {
      setSelectedOptions(selectedOptions.filter(id => id !== optionId));
    } else {
      setSelectedOptions([...selectedOptions, optionId]);
    }
  };

  const handleNext = () => {
    // Save answers for current question
    setAnswers({
      ...answers,
      [currentQuestion.id]: selectedOptions,
    });

    // Move to next question or complete
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOptions([]);
    } else {
      const finalAnswers = {
        ...answers,
        [currentQuestion.id]: selectedOptions,
      };
      onComplete(finalAnswers);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-6">
        <div className="flex justify-between mb-2">
          <span className="text-sm text-gray-500">
            Question {currentQuestionIndex + 1} of {questions.length}
          </span>
          <span className="text-sm text-primary-600 font-medium">
            {Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700">
          <div
            className="bg-primary-600 h-1.5 rounded-full"
            style={{
              width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
            }}
          ></div>
        </div>
      </div>

      <h2 className="text-xl font-bold mb-6 text-center">
        {currentQuestion.question}
      </h2>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {currentQuestion.options.map((option) => (
          <div
            key={option.id}
            onClick={() => handleOptionSelect(option.id)}
            className={`border rounded-xl p-3 cursor-pointer transition-all ${selectedOptions.includes(option.id)
              ? "border-primary-600 bg-primary-50 dark:bg-primary-900/20"
              : "border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600"
              }`}
          >
            {option.image && (
              <div className="relative h-24 w-full mb-2 rounded-lg overflow-hidden">
                <Image
                  src={option.image}
                  alt={option.text}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="flex items-center">
              <div
                className={`w-5 h-5 rounded-full border flex-shrink-0 flex items-center justify-center mr-2 ${selectedOptions.includes(option.id)
                  ? "bg-primary-600 border-primary-600"
                  : "border-gray-300 dark:border-gray-600"
                  }`}
              >
                {selectedOptions.includes(option.id) && (
                  <svg
                    className="w-3 h-3 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                )}
              </div>
              <span className="text-sm font-medium">{option.text}</span>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleNext}
        disabled={selectedOptions.length === 0}
        className="w-full py-3 px-4 bg-primary-600 text-white font-medium rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-700 transition-colors"
      >
        {currentQuestionIndex < questions.length - 1 ? "Next" : "Complete"}
      </button>
    </div>
  );
};

export default SwipeQuiz;