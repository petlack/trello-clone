import { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';

import TaskComponent from './Task';
import BoardComponent from './Board';
import NewBoard from './NewBoard';
import NewTask from './NewTask';

import {
  Board,
  Task,
  CreateTaskArgs,
  MoveTaskArgs,
  DeleteTaskArgs,
  CreateBoardArgs,
} from '../types';

import './Boards.css';

type BoardsData = { [key: string]: Board };
type TasksData = { [key: string]: Task[] };

export type BoardsProps = {
  data: Board[];
  timestamp: string;
  moveTask: (data: MoveTaskArgs) => void;
  deleteTask: (data: DeleteTaskArgs) => void;
  createTask: (data: CreateTaskArgs) => void;
  createBoard: (data: CreateBoardArgs) => void;
};

function reorder(tasks: TasksData, srcBoard: string, srcIndex: number, dstIndex: number) {
  const list = tasks[srcBoard];
  const result = Array.from(list);
  const [removed] = result.splice(srcIndex, 1);
  result.splice(dstIndex, 0, removed);
  const newTasks = { ...tasks };
  newTasks[srcBoard] = result;
  return newTasks;
}

function move(
  tasks: TasksData,
  srcBoard: string,
  dstBoard: string,
  srcIndex: number,
  dstIndex: number,
) {
  const source = tasks[srcBoard];
  const destination = tasks[dstBoard];
  const sourceClone = Array.from(source);
  const destClone = Array.from(destination);
  const [removed] = sourceClone.splice(srcIndex, 1);

  destClone.splice(dstIndex, 0, removed);

  const result: TasksData = {};
  result[srcBoard] = sourceClone;
  result[dstBoard] = destClone;

  let newTasks = { ...tasks };
  newTasks[srcBoard] = result[srcBoard];
  newTasks[dstBoard] = result[dstBoard];

  return newTasks;
}

function toBoardsData(data: Board[]): BoardsData {
  return data.reduce(
    (res, item) => ({
      ...res,
      [item.id]: item,
    }),
    {},
  );
}

function toTasksData(data: Board[]): TasksData {
  return data.reduce(
    (res, item) => ({
      ...res,
      [item.id]: item.tasks.slice().sort((a, b) => a.position - b.position),
    }),
    {},
  );
}

function Boards({ data, timestamp, moveTask, deleteTask, createTask, createBoard }: BoardsProps) {
  const initialBoards = toBoardsData(data);
  const initialTasks = toTasksData(data);

  const [tasks, setTasks] = useState(initialTasks);
  const [boards, setBoards] = useState(initialBoards);

  useEffect(() => {
    setTasks(toTasksData(data));
    setBoards(toBoardsData(data));
  }, [data, timestamp]);

  const idx2board = Object.keys(boards);

  function addTask({ boardId, description, badge }: CreateTaskArgs) {
    const newTasks = { ...tasks };
    const newTask = {
      id: '__',
      boardId,
      description,
      badge,
      position: boards[boardId].tasks.length,
    };
    newTasks[boardId] = [...newTasks[boardId], newTask];
    setTasks(newTasks);
    createTask({
      boardId,
      description,
      badge,
    });
  }

  function removeTask(boardIdx: number, taskIdx: number, taskId: string) {
    const newTasks = { ...tasks };
    newTasks[idx2board[boardIdx]].splice(taskIdx, 1);
    setTasks(newTasks);
    deleteTask({ taskId });
  }

  function onDragEnd(result: DropResult) {
    let { source, destination, draggableId } = result;

    if (!destination) {
      return;
    }
    const srcBoard = idx2board[+source.droppableId];
    const dstBoard = idx2board[+destination.droppableId];

    if (srcBoard === dstBoard && source.index === destination.index) {
      return;
    }

    let newTasks: TasksData = tasks;

    if (srcBoard === dstBoard) {
      newTasks = reorder(tasks, srcBoard, source.index, destination.index);
    } else {
      newTasks = move(tasks, srcBoard, dstBoard, source.index, destination.index);
    }

    setTasks(newTasks);
    moveTask({
      boardId: dstBoard,
      taskId: draggableId,
      position: destination.index,
    });
  }

  function addBoard() {
    const boardName = `board-${Object.keys(boards).length}`;
    const newTasks = { ...tasks, [boardName]: [] };
    const board = { id: '__', title: boardName, tasks: [] };
    const newBoards = { ...boards, [boardName]: board };
    setBoards(newBoards);
    setTasks(newTasks);
    createBoard({ title: boardName });
  }

  return (
    <div className="app boards">
      <DragDropContext onDragEnd={onDragEnd}>
        {idx2board.map((boardId, boardIdx) => (
          <Droppable key={boardIdx} droppableId={`${boardIdx}`}>
            {(provided, snapshot) => (
              <BoardComponent
                board={boards[boardId]}
                divRef={provided.innerRef}
                divClassName={snapshot.isDraggingOver ? 'is-over' : ''}
                divProps={provided.droppableProps}
              >
                <>
                  {tasks[boardId].map((task, taskIdx) => (
                    <Draggable key={task.id} draggableId={task.id} index={taskIdx}>
                      {(provided, snapshot) => (
                        <TaskComponent
                          task={task}
                          divClassName={snapshot.isDragging ? 'is-dragging' : ''}
                          divStyle={provided.draggableProps.style}
                          divRef={provided.innerRef}
                          divProps={{ ...provided.draggableProps, ...provided.dragHandleProps }}
                          remove={() => removeTask(boardIdx, taskIdx, task.id)}
                        />
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                  <NewTask
                    submit={(value: string) =>
                      addTask({
                        boardId,
                        description: value,
                      })
                    }
                  />
                </>
              </BoardComponent>
            )}
          </Droppable>
        ))}
      </DragDropContext>
      <NewBoard submit={addBoard} />
    </div>
  );
}

export default Boards;
