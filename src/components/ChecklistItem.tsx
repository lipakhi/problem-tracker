
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ChecklistItem as ChecklistItemType } from "@/types/checklist";
import { Pencil, Check, ClipboardCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChecklistItemProps {
  item: ChecklistItemType;
  onToggle: () => void;
  onUpdateNotes: (notes: string) => void;
}

const ChecklistItem = ({ item, onToggle, onUpdateNotes }: ChecklistItemProps) => {
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesDraft, setNotesDraft] = useState(item.notes);
  const [showNotes, setShowNotes] = useState(false);

  const handleNotesSave = () => {
    onUpdateNotes(notesDraft);
    setEditingNotes(false);
  };

  const getDifficultyColor = () => {
    switch (item.difficulty) {
      case "easy":
        return "bg-green-100 border-green-200";
      case "medium":
        return "bg-yellow-100 border-yellow-200";
      case "hard":
        return "bg-red-100 border-red-200";
      default:
        return "bg-gray-100 border-gray-200";
    }
  };

  const getDifficultyTextColor = () => {
    switch (item.difficulty) {
      case "easy":
        return "text-green-700";
      case "medium":
        return "text-yellow-700";
      case "hard":
        return "text-red-700";
      default:
        return "text-gray-700";
    }
  };

  return (
    <div 
      className={cn(
        "border rounded-md p-3 transition-all",
        getDifficultyColor(),
        item.completed ? "opacity-70" : "opacity-100"
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Checkbox 
            checked={item.completed} 
            onCheckedChange={onToggle} 
            className={cn(
              item.difficulty === "easy" ? "border-green-500" : 
              item.difficulty === "medium" ? "border-yellow-500" : 
              "border-red-500"
            )}
          />
          <div className="flex flex-col">
            <span className={cn("font-medium", item.completed ? "line-through text-gray-500" : "")}>
              {item.title}
            </span>
            <span className={cn("text-xs capitalize", getDifficultyTextColor())}>
              {item.difficulty}
            </span>
          </div>
        </div>
        <div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0" 
            onClick={() => {
              setShowNotes(!showNotes);
              if (!showNotes && !item.notes) {
                setEditingNotes(true);
              }
            }}
          >
            <ClipboardCheck className="h-4 w-4 text-gray-500" />
          </Button>
        </div>
      </div>

      {showNotes && (
        <div className="mt-3 pl-10">
          {editingNotes ? (
            <div className="space-y-2">
              <Textarea
                value={notesDraft}
                onChange={(e) => setNotesDraft(e.target.value)}
                className="min-h-[100px] text-sm"
                placeholder="Add your notes here..."
              />
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    setNotesDraft(item.notes);
                    setEditingNotes(false);
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  size="sm"
                  onClick={handleNotesSave}
                  className="bg-purple-700 hover:bg-purple-800"
                >
                  Save Notes
                </Button>
              </div>
            </div>
          ) : (
            <div className="relative bg-white bg-opacity-60 rounded p-3 border text-sm">
              {item.notes ? (
                <>
                  <p className="whitespace-pre-wrap">{item.notes}</p>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="absolute top-2 right-2 h-6 w-6 p-0" 
                    onClick={() => setEditingNotes(true)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                </>
              ) : (
                <div className="flex justify-center items-center py-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center gap-1"
                    onClick={() => setEditingNotes(true)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Add Notes
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChecklistItem;
