import React from "react";

interface NutritionBadgeProps {
  label: string;
  value: string | number;
  unit?: string;
  color?: string;
}

const NutritionBadge: React.FC<NutritionBadgeProps> = ({
  label,
  value,
  unit = "",
  color = "bg-primary-100 text-primary-800",
}) => {
  return (
    <div className={`px-3 py-1.5 rounded-lg ${color} inline-flex flex-col items-center justify-center`}>
      <span className="text-xs font-medium">{label}</span>
      <span className="font-bold text-sm">
        {value}
        {unit && <span className="text-xs ml-0.5">{unit}</span>}
      </span>
    </div>
  );
};

export default NutritionBadge;