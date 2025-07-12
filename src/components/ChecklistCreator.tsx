
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Checklist, ChecklistItem, DifficultyLevel } from "@/types/checklist";
import { PlusCircle } from "lucide-react";

interface ChecklistCreatorProps {
  onCreateChecklist: (checklist: Checklist) => void;
}

const ChecklistCreator = ({ onCreateChecklist }: ChecklistCreatorProps) => {
  const [title, setTitle] = useState("");
  const [easyCount, setEasyCount] = useState(0);
  const [mediumCount, setMediumCount] = useState(0);
  const [hardCount, setHardCount] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || (easyCount === 0 && mediumCount === 0 && hardCount === 0)) {
      return;
    }

    const items: ChecklistItem[] = [];
    
    // Generate items for each difficulty level
    const generateItems = (count: number, difficulty: DifficultyLevel) => {
      const startIndex = items.length;
      for (let i = 0; i < count; i++) {
        items.push({
          id: `${difficulty}-${Date.now()}-${i}`,
          index: startIndex + i,
          title: `${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Problem ${i + 1}`,
          difficulty,
          completed: false,
          notes: ""
        });
      }
    };
    
    generateItems(easyCount, "easy");
    generateItems(mediumCount, "medium");
    generateItems(hardCount, "hard");
    
    const newChecklist: Checklist = {
      id: `checklist-${Date.now()}`,
      title,
      items,
      createdAt: new Date()
    };
    
    onCreateChecklist(newChecklist);
    
    // Reset form
    setTitle("");
    setEasyCount(0);
    setMediumCount(0);
    setHardCount(0);
    setIsExpanded(false);
  };

  const handleNumberChange = (setter: React.Dispatch<React.SetStateAction<number>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 0) {
      setter(value);
    } else {
      setter(0);
    }
  };

  if (!isExpanded) {
    return (
      <Button 
        onClick={() => setIsExpanded(true)} 
        className="w-full py-6 text-lg flex items-center justify-center gap-2 bg-purple-700 hover:bg-purple-800"
      >
        <PlusCircle className="w-5 h-5" />
        Create New Checklist
      </Button>
    );
  }

  return (
    <Card className="p-6 shadow-md animate-fade-in">
      <form onSubmit={handleSubmit}>
        <div className="space-y-5">
          <div>
            <Label htmlFor="title" className="text-lg font-medium">Checklist Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1"
              placeholder="e.g., LeetCode Problems, Algorithms Study"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label 
                htmlFor="easy-count" 
                className="flex items-center text-green-600 font-medium"
              >
                Easy Problems
              </Label>
              <Input
                id="easy-count"
                type="number"
                min="0"
                value={easyCount || ""}
                onChange={handleNumberChange(setEasyCount)}
                className="border-green-200 focus:ring-green-500"
              />
            </div>

            <div className="space-y-1">
              <Label 
                htmlFor="medium-count" 
                className="flex items-center text-yellow-600 font-medium"
              >
                Medium Problems
              </Label>
              <Input
                id="medium-count"
                type="number"
                min="0"
                value={mediumCount || ""}
                onChange={handleNumberChange(setMediumCount)}
                className="border-yellow-200 focus:ring-yellow-500"
              />
            </div>

            <div className="space-y-1">
              <Label 
                htmlFor="hard-count" 
                className="flex items-center text-red-600 font-medium"
              >
                Hard Problems
              </Label>
              <Input
                id="hard-count"
                type="number"
                min="0"
                value={hardCount || ""}
                onChange={handleNumberChange(setHardCount)}
                className="border-red-200 focus:ring-red-500"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <Button 
              type="button" 
              onClick={() => setIsExpanded(false)}
              variant="outline"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={!title || (easyCount === 0 && mediumCount === 0 && hardCount === 0)}
              className="bg-purple-700 hover:bg-purple-800"
            >
              Create Checklist
            </Button>
          </div>
        </div>
      </form>
    </Card>
  );
};

export default ChecklistCreator;
