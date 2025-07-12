
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  className?: string;
}

const ProgressBar = ({ value, className }: ProgressBarProps) => {
  const getProgressColor = () => {
    if (value < 30) return "bg-red-500";
    if (value < 70) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <div className={cn("h-2 w-full bg-gray-200 rounded-full overflow-hidden", className)}>
      <div
        className={cn("h-full transition-all duration-500", getProgressColor())}
        style={{ width: `${value}%` }}
      />
    </div>
  );
};

export default ProgressBar;
