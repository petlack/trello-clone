import { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';

import TaskComponent from './Task';
import BoardComponent from './Board';
import NewTask from './NewTask';
import { IconPlusDotted } from '../icons';

import { Board, Task, CreateTaskArgs, MoveTaskArgs, DeleteTaskArgs, CreateBoardArgs } from '../types';

import './Boards.css';

function reorder(tasks: TasksData, srcBoard: string, startIndex: number, endIndex: number) {
  const list = tasks[srcBoard];
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  const newTasks = {...tasks};
  newTasks[srcBoard] = result;
  return newTasks;
}

function move(tasks: TasksData, srcBoard: string, dstBoard: string, srcIndex: number, dstIndex: number) {
  const source = tasks[srcBoard];
  const destination = tasks[dstBoard];
  const sourceClone = Array.from(source);
  const destClone = Array.from(destination);
  const [removed] = sourceClone.splice(srcIndex, 1);

  destClone.splice(dstIndex, 0, removed);

  const result: TasksData = {};
  result[srcBoard] = sourceClone;
  result[dstBoard] = destClone;

  let newTasks = {...tasks};
  newTasks[srcBoard] = result[srcBoard];
  newTasks[dstBoard] = result[dstBoard];

  return newTasks;
}

function getInitialBoards(data: Board[]): BoardsData {
  return data.reduce((res, item) => ({
    ...res,
    [item.id]: item,
  }), {});
}

function getInitialTasks(data: Board[]): TasksData {
  return data.reduce((res, item) => ({
    ...res,
    [item.id]: item.tasks.slice().sort((a, b) => a.position - b.position),
  }), {});
}

type BoardsData = { [key: string]: Board }
type TasksData = { [key: string]: Task[] }

export type BoardsProps = {
  data: Board[]
  timestamp: string
  moveTask: (data: MoveTaskArgs) => void
  deleteTask: (data: DeleteTaskArgs) => void
  createTask: (data: CreateTaskArgs) => void
  createBoard: (data: CreateBoardArgs) => void
}

function Boards({ data, timestamp, moveTask, deleteTask, createTask, createBoard }: BoardsProps) {
  const initialBoards = getInitialBoards(data);
  const initialTasks = getInitialTasks(data);
  
  const [tasks, setTasks] = useState(initialTasks)
  const [boards, setBoards] = useState(initialBoards)

  useEffect(() => {
    setTasks(getInitialTasks(data));
    setBoards(getInitialBoards(data));
  }, [data, timestamp]);

  const idx2board = Object.keys(boards);

  function addTask({ boardId, description, badge }: CreateTaskArgs) {
    const newState = { ...tasks };
    const newTask = {
      id: '__',
      boardId,
      description,
      badge,
      position: boards[boardId].tasks.length,
    };
    newState[boardId] = [...newState[boardId], newTask];
    setTasks(newState);
    createTask({
      boardId,
      description,
      badge,
    });
  }

  function submitTask(boardId: string, value: string) {
    addTask({
      boardId: boardId,
      description: value,
    });
  }

  function removeTask(boardIdx: number, taskIdx: number, taskId: string) {
    const newState = {...tasks};
    newState[idx2board[boardIdx]].splice(taskIdx, 1);
    setTasks(newState);
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
      newTasks = reorder(
        tasks,
        srcBoard,
        source.index,
        destination.index,
      );
    }
    else {
      newTasks = move(
        tasks,
        srcBoard,
        dstBoard,
        source.index,
        destination.index,
      );
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
              >
                <div
                  ref={provided.innerRef}
                  className={`tasks ${snapshot.isDraggingOver ? 'is-over' : ''}`}
                  {...provided.droppableProps}
                >
                  {tasks[boardId].map((task, taskIdx) => (
                    <Draggable
                      key={task.id}
                      draggableId={task.id}
                      index={taskIdx}
                    >
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
                    submit={(value: string) => submitTask(boardId, value)}
                  />
                </div>
              </BoardComponent>
            )}
          </Droppable>
        ))}
      </DragDropContext>
      <div className="new-board">
        <div className="icon large" onClick={addBoard}>
          {IconPlusDotted}
        </div>
      </div>
    </div>
  );
}

export default Boards;