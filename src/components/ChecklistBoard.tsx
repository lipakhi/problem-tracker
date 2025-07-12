
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checklist } from "@/types/checklist";
import ChecklistItem from "./ChecklistItem";
import ProgressBar from "./ProgressBar";

interface ChecklistBoardProps {
  checklist: Checklist;
  onUpdateChecklist: (updatedChecklist: Checklist) => void;
}

const ChecklistBoard = ({ checklist, onUpdateChecklist }: ChecklistBoardProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleToggleItem = (itemId: string) => {
    const updatedItems = checklist.items.map(item =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    
    onUpdateChecklist({
      ...checklist,
      items: updatedItems
    });
  };

  const handleUpdateNotes = (itemId: string, notes: string) => {
    const updatedItems = checklist.items.map(item =>
      item.id === itemId ? { ...item, notes } : item
    );
    
    onUpdateChecklist({
      ...checklist,
      items: updatedItems
    });
  };

  const totalItems = checklist.items.length;
  const completedItems = checklist.items.filter(item => item.completed).length;
  const progressPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  const easyItems = checklist.items.filter(item => item.difficulty === "easy");
  const mediumItems = checklist.items.filter(item => item.difficulty === "medium");
  const hardItems = checklist.items.filter(item => item.difficulty === "hard");

  const easyCompleted = easyItems.filter(item => item.completed).length;
  const mediumCompleted = mediumItems.filter(item => item.completed).length;
  const hardCompleted = hardItems.filter(item => item.completed).length;

  return (
    <Card className="shadow-md transition-all duration-300 hover:shadow-lg">
      <CardHeader className="pb-2 cursor-pointer" onClick={() => setIsCollapsed(!isCollapsed)}>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl text-purple-800">{checklist.title}</CardTitle>
          <div className="text-sm text-gray-500">
            {completedItems}/{totalItems} completed
          </div>
        </div>
        <ProgressBar value={progressPercentage} />
        
        <div className="flex gap-4 mt-2 text-sm">
          {easyItems.length > 0 && (
            <div className="flex items-center gap-1">
              <span className="h-3 w-3 rounded-full bg-green-500"></span>
              <span className="text-green-700">Easy: {easyCompleted}/{easyItems.length}</span>
            </div>
          )}
          {mediumItems.length > 0 && (
            <div className="flex items-center gap-1">
              <span className="h-3 w-3 rounded-full bg-yellow-500"></span>
              <span className="text-yellow-700">Medium: {mediumCompleted}/{mediumItems.length}</span>
            </div>
          )}
          {hardItems.length > 0 && (
            <div className="flex items-center gap-1">
              <span className="h-3 w-3 rounded-full bg-red-500"></span>
              <span className="text-red-700">Hard: {hardCompleted}/{hardItems.length}</span>
            </div>
          )}
        </div>
      </CardHeader>

      {!isCollapsed && (
        <CardContent className="pt-4">
          {checklist.items.length === 0 ? (
            <div className="text-center text-gray-500 py-4">No items in this checklist</div>
          ) : (
            <div className="space-y-2">
              {checklist.items.map((item) => (
                <ChecklistItem
                  key={item.id}
                  item={item}
                  onToggle={() => handleToggleItem(item.id)}
                  onUpdateNotes={(notes) => handleUpdateNotes(item.id, notes)}
                />
              ))}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};

export default ChecklistBoard;
