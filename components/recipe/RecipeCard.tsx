import React from "react";
import Image from "next/image";
import Link from "next/link";

interface RecipeCardProps {
  id: string;
  title: string;
  image: string;
  price?: number;
  rating?: number;
  cookTime?: string;
  calories?: number;
}

const RecipeCard: React.FC<RecipeCardProps> = ({
  id,
  title,
  image,
  price,
  rating = 4.5,
  cookTime = "20 min",
  calories = 320,
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
      <Link href={`/recipe/${id}`}>
        <div className="relative h-40 w-full">
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover"
          />
          <button className="absolute top-2 right-2 bg-white dark:bg-gray-800 p-1.5 rounded-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-400 hover:text-primary-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </button>
        </div>
        <div className="p-3">
          <h3 className="font-semibold text-gray-800 dark:text-white">{title}</h3>
          <div className="flex justify-between items-center mt-2">
            {price && (
              <p className="font-bold text-primary-600">${price.toFixed(2)}</p>
            )}
            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-yellow-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                />
              </svg>
              <span className="text-xs ml-1 text-gray-600 dark:text-gray-300">
                {rating}
              </span>
            </div>
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
            <span>{cookTime}</span>
            <span>{calories} cal</span>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default RecipeCard;