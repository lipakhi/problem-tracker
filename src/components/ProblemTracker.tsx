import { useEffect, useState } from "react";
import { DailyRecord, DifficultyLevel, Problem } from "@/types/checklist";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Trash2, Edit, Save, Tag as TagIcon, Search, CalendarSearch, List, Grid } from "lucide-react";
import { cn } from "@/lib/utils";
import { TabsContent, Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import ProblemTagSelector from "./ProblemTagSelector";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

const STORAGE_KEY = "problem-tracker-data";

const ProblemTracker = () => {
  const [records, setRecords] = useState<DailyRecord[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [problemName, setProblemName] = useState("");
  const [difficulty, setDifficulty] = useState<DifficultyLevel | "">("");
  const [tags, setTags] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("add");
  
  // Edit mode states
  const [editingProblem, setEditingProblem] = useState<Problem | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDifficulty, setEditDifficulty] = useState<DifficultyLevel>("medium");
  const [editTags, setEditTags] = useState<string[]>([]);
  
  // Date search state
  const [searchDate, setSearchDate] = useState<Date | undefined>(undefined);
  const [isDateSearchOpen, setIsDateSearchOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  // Load data from localStorage when component mounts
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        // Convert string dates back to Date objects
        const processedData = parsedData.map((record: any) => ({
          ...record,
          date: new Date(record.date),
          problems: record.problems.map((problem: any) => ({
            ...problem,
            createdAt: new Date(problem.createdAt)
          }))
        }));
        setRecords(processedData);
      } catch (error) {
        console.error("Error parsing saved data:", error);
      }
    }
  }, []);

  // Save data to localStorage whenever records change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  }, [records]);

  const addProblem = () => {
    if (!problemName.trim() || !difficulty) return;
    
    const newProblem: Problem = {
      id: `problem-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      name: problemName,
      difficulty: difficulty as DifficultyLevel,
      tags: tags.length > 0 ? [...tags] : undefined,
      createdAt: new Date()
    };

    setRecords(prevRecords => {
      // Find if we already have a record for this date
      const dateString = format(selectedDate, 'yyyy-MM-dd');
      const existingRecordIndex = prevRecords.findIndex(record => 
        format(record.date, 'yyyy-MM-dd') === dateString
      );

      if (existingRecordIndex >= 0) {
        // Update existing record
        const updatedRecords = [...prevRecords];
        updatedRecords[existingRecordIndex] = {
          ...updatedRecords[existingRecordIndex],
          problems: [...updatedRecords[existingRecordIndex].problems, newProblem]
        };
        return updatedRecords;
      } else {
        // Create new record
        return [...prevRecords, {
          date: selectedDate,
          problems: [newProblem]
        }];
      }
    });

    // Reset form
    setProblemName("");
    setTags([]);
    toast.success("Problem added successfully!");
  };

  const deleteProblem = (problemId: string) => {
    setRecords(prevRecords => {
      return prevRecords.map(record => {
        // Filter out the deleted problem
        const updatedProblems = record.problems.filter(problem => problem.id !== problemId);
        
        // If no problems left for this date, remove the record
        if (updatedProblems.length === 0) {
          return null;
        }
        
        return {
          ...record,
          problems: updatedProblems
        };
      }).filter(Boolean) as DailyRecord[];
    });
    
    toast.success("Problem deleted successfully!");
  };

  const openEditDialog = (problem: Problem) => {
    setEditingProblem(problem);
    setEditName(problem.name);
    setEditDifficulty(problem.difficulty);
    setEditTags(problem.tags || []);
    setIsEditing(true);
  };

  const saveEditedProblem = () => {
    if (!editingProblem || !editName.trim()) return;

    setRecords(prevRecords => {
      return prevRecords.map(record => {
        const problemIndex = record.problems.findIndex(p => p.id === editingProblem.id);
        
        if (problemIndex === -1) return record;
        
        const updatedProblems = [...record.problems];
        updatedProblems[problemIndex] = {
          ...updatedProblems[problemIndex],
          name: editName,
          difficulty: editDifficulty,
          tags: editTags.length > 0 ? [...editTags] : undefined
        };
        
        return {
          ...record,
          problems: updatedProblems
        };
      });
    });

    setIsEditing(false);
    setEditingProblem(null);
    toast.success("Problem updated successfully!");
  };

  // Sort records by date (newest first)
  const sortedRecords = [...records].sort((a, b) => 
    b.date.getTime() - a.date.getTime()
  );

  // Filter records based on search date
  const filteredRecords = searchDate 
    ? sortedRecords.filter(record => format(record.date, 'yyyy-MM-dd') === format(searchDate, 'yyyy-MM-dd'))
    : sortedRecords;

  // Get problems for the selected date
  const getProblemsForDate = (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    const record = records.find(record => 
      format(record.date, 'yyyy-MM-dd') === dateString
    );
    return record?.problems || [];
  };

  // Sort problems by difficulty (easy -> medium -> hard)
  const sortProblemsByDifficulty = (problems: Problem[]) => {
    const difficultyOrder: { [key in DifficultyLevel]: number } = {
      "easy": 0,
      "medium": 1,
      "hard": 2
    };
    
    return [...problems].sort(
      (a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]
    );
  };

  const selectedDateProblems = sortProblemsByDifficulty(getProblemsForDate(selectedDate));

  // Count problems by difficulty
  const countProblemsByDifficulty = (problems: Problem[]) => {
    return problems.reduce(
      (counts, problem) => {
        counts[problem.difficulty]++;
        return counts;
      },
      { easy: 0, medium: 0, hard: 0 } as Record<DifficultyLevel, number>
    );
  };

  const getDifficultyColor = (difficulty: DifficultyLevel) => {
    switch (difficulty) {
      case "easy": return "text-green-600";
      case "medium": return "text-yellow-600";
      case "hard": return "text-red-600";
      default: return "";
    }
  };

  const getDifficultyBgColor = (difficulty: DifficultyLevel) => {
    switch (difficulty) {
      case "easy": return "bg-green-100";
      case "medium": return "bg-yellow-100";
      case "hard": return "bg-red-100";
      default: return "";
    }
  };

  // Get pastel background colors for view page problems
  const getPastelBgColor = (difficulty: DifficultyLevel) => {
    switch (difficulty) {
      case "easy": return "bg-gradient-to-br from-green-50 to-green-100 border-green-200";
      case "medium": return "bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200";
      case "hard": return "bg-gradient-to-br from-red-50 to-red-100 border-red-200";
      default: return "bg-white";
    }
  };

  return (
    <Card className="shadow-lg border-purple-100">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-white border-b border-purple-100">
        <CardTitle className="text-xl text-purple-800"></CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 m-4 mb-2 bg-purple-50">
            <TabsTrigger value="add" className="data-[state=active]:bg-white data-[state=active]:text-purple-800">Add Problem</TabsTrigger>
            <TabsTrigger value="view" className="data-[state=active]:bg-white data-[state=active]:text-purple-800">View Problems</TabsTrigger>
          </TabsList>
          
          <TabsContent value="add" className="p-4 space-y-4">
            <div className="flex flex-col space-y-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal border-purple-200"
                      id="date"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => date && setSelectedDate(date)}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="problem-name">Problem Name</Label>
                <Input
                  id="problem-name"
                  value={problemName}
                  onChange={(e) => setProblemName(e.target.value)}
                  placeholder="Enter problem name"
                  className="w-full border-purple-200 focus-visible:ring-purple-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty</Label>
                <ToggleGroup 
                  type="single" 
                  value={difficulty} 
                  onValueChange={(value) => setDifficulty(value as DifficultyLevel)}
                  className="justify-start w-full"
                >
                  <ToggleGroupItem 
                    value="easy" 
                    className={`flex-1 ${difficulty === 'easy' 
                      ? 'bg-green-500 text-white hover:bg-green-600 shadow-md' 
                      : 'bg-green-100 text-green-700 hover:bg-green-200'} 
                      transition-colors border-green-200 rounded-l-md`}
                  >
                    Easy
                  </ToggleGroupItem>
                  <ToggleGroupItem 
                    value="medium" 
                    className={`flex-1 ${difficulty === 'medium' 
                      ? 'bg-yellow-500 text-white hover:bg-yellow-600 shadow-md' 
                      : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'} 
                      transition-colors border-yellow-200`}
                  >
                    Medium
                  </ToggleGroupItem>
                  <ToggleGroupItem 
                    value="hard" 
                    className={`flex-1 ${difficulty === 'hard' 
                      ? 'bg-red-500 text-white hover:bg-red-600 shadow-md' 
                      : 'bg-red-100 text-red-700 hover:bg-red-200'} 
                      transition-colors border-red-200 rounded-r-md`}
                  >
                    Hard
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>

              <div className="space-y-2">
                <Label>Problem Tags</Label>
                <ProblemTagSelector tags={tags} onTagsChange={setTags} />
              </div>

              <Button 
                className="bg-purple-700 hover:bg-purple-800 w-full mt-4 shadow-md transition-all hover:translate-y-[-1px]"
                onClick={addProblem}
                disabled={!problemName.trim() || !difficulty}
              >
                Add Problem
              </Button>
            </div>

            {selectedDateProblems.length > 0 && (
              <div className="mt-6">
                <h3 className="font-medium text-lg mb-2">
                  Problems for {format(selectedDate, "MMM dd, yyyy")}
                </h3>
                <div className="space-y-2 mt-2">
                  {selectedDateProblems.map(problem => (
                    <div 
                      key={problem.id} 
                      className={`p-3 rounded-md ${getDifficultyBgColor(problem.difficulty)} border border-opacity-30 flex justify-between items-center shadow-sm`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{problem.name}</span>
                          <span className={`font-semibold capitalize ${getDifficultyColor(problem.difficulty)}`}>
                            {problem.difficulty}
                          </span>
                        </div>
                        
                        {problem.tags && problem.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {problem.tags.map(tag => (
                              <Badge 
                                key={tag} 
                                variant="outline"
                                className="text-xs bg-purple-50 text-purple-700 px-2"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-gray-500 hover:text-purple-600 hover:bg-purple-50"
                          onClick={() => openEditDialog(problem)}
                        >
                          <Edit size={16} />
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="text-gray-500 hover:text-red-600 hover:bg-red-50"
                            >
                              <Trash2 size={16} />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Problem</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{problem.name}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => deleteProblem(problem.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="view" className="m-0">
            {records.length > 0 ? (
              <div>
                {/* Total count and view options */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 border-b bg-gradient-to-r from-purple-50 to-white">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4 sm:mb-0">
                    <h3 className="text-xl font-bold text-purple-800">
                      Total Problems: {records.reduce((sum, record) => sum + record.problems.length, 0)}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-purple-600">
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full">
                        Easy: {records.reduce((sum, record) => sum + countProblemsByDifficulty(record.problems).easy, 0)}
                      </span>
                      <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                        Medium: {records.reduce((sum, record) => sum + countProblemsByDifficulty(record.problems).medium, 0)}
                      </span>
                      <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full">
                        Hard: {records.reduce((sum, record) => sum + countProblemsByDifficulty(record.problems).hard, 0)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                      className="flex items-center gap-2"
                    >
                      <List size={16} />
                      List
                    </Button>
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                      className="flex items-center gap-2"
                    >
                      <Grid size={16} />
                      Grid
                    </Button>
                  </div>
                </div>
                
                {/* Date search functionality */}
                <div className="flex items-center gap-2 p-4 border-b">
                  <Popover open={isDateSearchOpen} onOpenChange={setIsDateSearchOpen}>
                    <PopoverTrigger asChild>
                      <Button 
                        variant="outline"
                        className="flex items-center gap-2 border-purple-200 hover:bg-purple-50"
                      >
                        <CalendarSearch size={18} />
                        {searchDate ? format(searchDate, "MMMM dd, yyyy") : "Search by date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={searchDate}
                        onSelect={(date) => {
                          setSearchDate(date);
                          setIsDateSearchOpen(false);
                        }}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                  
                  {searchDate && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-gray-500"
                      onClick={() => setSearchDate(undefined)}
                    >
                      Clear
                    </Button>
                  )}
                </div>
              
                <ScrollArea className="h-[calc(100vh-320px)] pr-4">
                  <div className={`p-4 ${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-6'}`}>
                    {filteredRecords.map(record => {
                      const sortedProblems = sortProblemsByDifficulty(record.problems);
                      const counts = countProblemsByDifficulty(record.problems);
                      
                      return (
                        <div key={format(record.date, 'yyyy-MM-dd')} 
                          className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-white to-purple-50/30">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-lg text-purple-800">
                              {format(record.date, "MMMM dd, yyyy")}
                            </h3>
                            
                            <div className="flex items-center gap-2">
                              <Badge className="bg-purple-600">{record.problems.length} Problems</Badge>
                            </div>
                          </div>
                          
                          <div className="flex gap-3 mb-4 flex-wrap">
                            <span className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
                              Easy: {counts.easy}
                            </span>
                            <span className="text-sm bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full font-medium">
                              Medium: {counts.medium}
                            </span>
                            <span className="text-sm bg-red-100 text-red-700 px-3 py-1 rounded-full font-medium">
                              Hard: {counts.hard}
                            </span>
                          </div>

                          <div className="space-y-3">
                            {sortedProblems.map(problem => (
                              <div 
                              key={problem.id} 
                              className={`p-4 rounded-lg border shadow-sm ${getPastelBgColor(problem.difficulty)}`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <h4 className="font-medium text-gray-900">{problem.name}</h4>
                                  
                                  {problem.tags && problem.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                      {problem.tags.map(tag => (
                                        <Badge 
                                          key={tag}
                                          variant="outline" 
                                          className="text-xs bg-purple-50/80 text-purple-700 border-purple-200"
                                        >
                                          {tag}
                                        </Badge>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                
                                <div className="flex flex-col items-end gap-2">
                                  <Badge 
                                    className={`capitalize ${
                                      problem.difficulty === 'easy' 
                                        ? 'bg-green-200 text-green-800 hover:bg-green-300' 
                                        : problem.difficulty === 'medium'
                                          ? 'bg-yellow-200 text-yellow-800 hover:bg-yellow-300'
                                          : 'bg-red-200 text-red-800 hover:bg-red-300'
                                    }`}
                                  >
                                    {problem.difficulty}
                                  </Badge>
                                  
                                  <div className="flex gap-1">
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      className="h-8 w-8 p-0 text-gray-500 hover:text-purple-600 hover:bg-purple-50/50"
                                      onClick={() => openEditDialog(problem)}
                                    >
                                      <Edit size={16} />
                                    </Button>
                                    
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button 
                                          variant="ghost" 
                                          size="sm"
                                          className="h-8 w-8 p-0 text-gray-500 hover:text-red-600 hover:bg-red-50/50"
                                        >
                                          <Trash2 size={16} />
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>Delete Problem</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            Are you sure you want to delete "{problem.name}"? This action cannot be undone.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                                          <AlertDialogAction 
                                            onClick={() => deleteProblem(problem.id)}
                                            className="bg-red-600 hover:bg-red-700"
                                          >
                                            Delete
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </div>
                                </div>
                              </div>
                            </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 bg-purple-50/50 rounded-lg m-4">
                <div className="flex flex-col items-center gap-2">
                  <div className="bg-purple-100 p-3 rounded-full">
                    <TagIcon className="h-8 w-8 text-purple-500" />
                  </div>
                  <h3 className="text-lg font-medium text-purple-800">No problems yet</h3>
                  <p className="max-w-md text-gray-500">
                    No problems tracked yet. Add some problems to get started with your learning journey!
                  </p>
                  <Button 
                    className="mt-4 bg-purple-600 hover:bg-purple-700"
                    onClick={() => setActiveTab("add")}
                  >
                    Add Your First Problem
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Edit Problem Dialog */}
        <Dialog open={isEditing} onOpenChange={(open) => !open && setIsEditing(false)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Problem</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Problem Name</Label>
                <Input
                  id="edit-name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Enter problem name"
                  className="border-purple-200 focus-visible:ring-purple-400"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-difficulty">Difficulty</Label>
                <ToggleGroup 
                  type="single" 
                  value={editDifficulty} 
                  onValueChange={(value) => value && setEditDifficulty(value as DifficultyLevel)}
                  className="justify-start w-full"
                >
                  <ToggleGroupItem 
                    value="easy" 
                    className={`flex-1 ${editDifficulty === 'easy' 
                      ? 'bg-green-500 text-white hover:bg-green-600 shadow-md' 
                      : 'bg-green-100 text-green-700 hover:bg-green-200'} 
                      transition-colors border-green-200 rounded-l-md`}
                  >
                    Easy
                  </ToggleGroupItem>
                  <ToggleGroupItem 
                    value="medium" 
                    className={`flex-1 ${editDifficulty === 'medium' 
                      ? 'bg-yellow-500 text-white hover:bg-yellow-600 shadow-md' 
                      : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'} 
                      transition-colors border-yellow-200`}
                  >
                    Medium
                  </ToggleGroupItem>
                  <ToggleGroupItem 
                    value="hard" 
                    className={`flex-1 ${editDifficulty === 'hard' 
                      ? 'bg-red-500 text-white hover:bg-red-600 shadow-md' 
                      : 'bg-red-100 text-red-700 hover:bg-red-200'} 
                      transition-colors border-red-200 rounded-r-md`}
                  >
                    Hard
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
              
              <div className="space-y-2">
                <Label>Problem Tags</Label>
                <ProblemTagSelector tags={editTags} onTagsChange={setEditTags} />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditing(false)}
                className="border-purple-200"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={saveEditedProblem}
                className="bg-purple-700 hover:bg-purple-800"
                disabled={!editName.trim()}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default ProblemTracker;
