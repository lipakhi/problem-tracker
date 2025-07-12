
export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export interface ChecklistItem {
  id: string;
  index: number;
  title: string;
  difficulty: DifficultyLevel;
  completed: boolean;
  notes: string;
}

export interface Checklist {
  id: string;
  title: string;
  items: ChecklistItem[];
  createdAt: Date;
}

export interface Problem {
  id: string;
  name: string;
  difficulty: DifficultyLevel;
  tags?: string[];
  createdAt: Date;
}

export interface DailyRecord {
  date: Date;
  problems: Problem[];
}
