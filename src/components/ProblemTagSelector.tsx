
import { useState } from "react";
import { X, Plus, Tag as TagIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

const PREDEFINED_TAGS = [
  "Array", "Backtracking", "Binary Search", "Bit Manipulation", 
  "Divide and Conquer", "Dynamic Programming", "Graph", "Greedy",
  "Hash Table", "Linked List", "Math", "Priority Queue", 
  "Recursion", "Sorting", "Stack & Queue", "String", 
  "Tree", "Two Pointers"
];

interface ProblemTagSelectorProps {
  tags: string[];
  onTagsChange: (newTags: string[]) => void;
}

const ProblemTagSelector = ({ tags, onTagsChange }: ProblemTagSelectorProps) => {
  const [tagInput, setTagInput] = useState("");
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [showCustomTagInput, setShowCustomTagInput] = useState(false);

  const addTag = (tag: string) => {
    if (tag.trim() && !tags.includes(tag.trim())) {
      onTagsChange([...tags, tag.trim()]);
      setTagInput("");
      setShowCustomTagInput(false);
    }
  };

  const removeTag = (tagToRemove: string) => {
    onTagsChange(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag(tagInput);
    } else if (e.key === "Escape") {
      setShowCustomTagInput(false);
    }
  };

  const handleSelectPredefinedTag = (tag: string) => {
    if (!tags.includes(tag)) {
      addTag(tag);
    } else {
      removeTag(tag);
    }
  };

  return (
    <div className="space-y-2">
      {/* Tag Selection Section */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {PREDEFINED_TAGS.map((tag) => (
          <Badge 
            key={tag} 
            variant="outline"
            className={`
              cursor-pointer px-2 py-1 text-xs
              ${tags.includes(tag) 
                ? 'bg-purple-200 text-purple-900 hover:bg-purple-300 border-purple-300' 
                : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
              }
            `}
            onClick={() => handleSelectPredefinedTag(tag)}
          >
            {tag}
            {tags.includes(tag) && (
              <button
                type="button"
                className="ml-1 rounded-full hover:bg-purple-400 p-0.5"
                onClick={(e) => {
                  e.stopPropagation();
                  removeTag(tag);
                }}
              >
                <X size={12} />
              </button>
            )}
          </Badge>
        ))}
        
        {/* Add Custom Tag Badge Button - styled like the other tag badges */}
        {!showCustomTagInput && (
          <Badge 
            variant="outline"
            className="cursor-pointer px-2 py-1 text-xs bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200 flex items-center gap-1"
            onClick={() => setShowCustomTagInput(true)}
          >
            <Plus size={12} />
            Add Custom
          </Badge>
        )}
      </div>

      {/* Custom Tag Input (conditionally shown) */}
      {showCustomTagInput && (
        <div className="flex gap-2">
          <div className="relative flex-grow">
            <TagIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Add a custom tag"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-9"
              autoFocus
            />
          </div>
          
          <Button
            type="button"
            onClick={() => addTag(tagInput)}
            variant="outline"
            size="sm"
            className="whitespace-nowrap"
          >
            Add Custom
          </Button>
          
          <Button
            type="button"
            onClick={() => setShowCustomTagInput(false)}
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={16} />
          </Button>
        </div>
      )}

      {/* Selected Tags Display */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {tags.map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className="bg-purple-50 text-purple-700 hover:bg-purple-100 px-2 py-1 flex items-center gap-1"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="ml-1 rounded-full hover:bg-purple-200 p-0.5"
              >
                <X size={14} />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProblemTagSelector;
