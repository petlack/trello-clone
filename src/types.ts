export type Board = {
  id: string;
  title: string;
  tasks: Task[];
};

export type Task = {
  id: string;
  description: string;
  badge?: string;
  boardId: string;
  position: number;
};

export type CreateTaskArgs = {
  description: string;
  badge?: string;
  boardId: string;
};

export type MoveTaskArgs = {
  boardId: string;
  taskId: string;
  position: number;
};

export type DeleteTaskArgs = {
  taskId: string;
};

export type CreateBoardArgs = {
  title: string;
};
