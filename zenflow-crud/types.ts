
export enum TaskCategory {
  WORK = 'Work',
  PERSONAL = 'Personal',
  IDEAS = 'Ideas',
  URGENT = 'Urgent'
}

export enum TaskStatus {
  TODO = 'Todo',
  IN_PROGRESS = 'In Progress',
  DONE = 'Done'
}

export interface Task {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  status: TaskStatus;
  createdAt: number;
}

export interface GeminiResponse {
  refinedTitle: string;
  refinedDescription: string;
  suggestedCategory: TaskCategory;
}
