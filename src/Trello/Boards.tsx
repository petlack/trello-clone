import { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult, DraggableLocation } from 'react-beautiful-dnd';

import { IconBoard, IconCross, IconPlusCircleFill, IconPlusDotted } from './icons';

import { Board, Task, CreateTaskArgs, MoveTaskArgs, DeleteTaskArgs, CreateBoardArgs } from './types'

import './Boards.css';

function reorder<T>(list: T[], startIndex: number, endIndex: number): T[] {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

function move<T>(source: T[], destination: T[], droppableSource: DraggableLocation, droppableDestination: DraggableLocation) {
  const sourceClone = Array.from(source);
  const destClone = Array.from(destination);
  const [removed] = sourceClone.splice(droppableSource.index, 1);

  destClone.splice(droppableDestination.index, 0, removed);

  const result: { [key: string]: T[] } = {};
  result[droppableSource.droppableId] = sourceClone;
  result[droppableDestination.droppableId] = destClone;

  return result;
};

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

function getInitialNewTasks(data: Board[]): NewTasksData {
  return data.reduce((res, item) => ({
    ...res,
    [item.id]: '',
  }), {});
}

type BoardsData = { [key: string]: Board }
type TasksData = { [key: string]: Task[] }
type NewTasksData = { [key: string]: string }

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
  const initialNewTasks = getInitialNewTasks(data);
  
  const [tasks, setTasks] = useState(initialTasks)
  const [boards, setBoards] = useState(initialBoards)
  const [newTasks, setNewTasks] = useState(initialNewTasks)

  useEffect(() => {
    setTasks(getInitialTasks(data));
    setBoards(getInitialBoards(data));
    setNewTasks(getInitialNewTasks(data));
  }, [data, timestamp]);

  const id2column = Object.keys(tasks);

  function addTask({ boardId, description, badge }: CreateTaskArgs) {
    const newState = { ...tasks };
    const newTask = { id: '__', boardId, description, badge, position: boards[boardId].tasks.length }
    newState[boardId] = [...newState[boardId], newTask]
    setTasks(newState)
    createTask({
      boardId,
      description,
      badge,
    })
    setNewTasks({
      ...newTasks,
      [boardId]: '',
    })
  }

  function removeTask(ind: number, index: number, taskId: string) {
    const newState = {...tasks};
    newState[id2column[ind]].splice(index, 1);
    setTasks(newState);
    deleteTask({ taskId })
  };

  function onDragEnd(result: DropResult) {
    let { source, destination, draggableId } = result;

    // dropped outside the list
    if (!destination) {
      return;
    }
    const srcColumn = id2column[+source.droppableId];
    const dstColumn = id2column[+destination.droppableId];

    source = { ...source, droppableId: srcColumn }
    destination = { ...destination, droppableId: dstColumn }

    if (srcColumn === dstColumn) {
      const items = reorder(tasks[srcColumn], source.index, destination.index);
      const newState = {...tasks};
      newState[srcColumn] = items;
      setTasks(newState);
    } else {
      const result = move(
        tasks[srcColumn],
        tasks[dstColumn],
        source,
        destination,
      );
      const newState = {...tasks};
      newState[srcColumn] = result[srcColumn];
      newState[dstColumn] = result[dstColumn];
      setTasks(newState);
    }

    moveTask({
      boardId: dstColumn,
      taskId: draggableId,
      position: destination.index,
    })
  }

  function addBoard() {
    const newColumn = `column-${Object.keys(boards).length}`;
    const newTasks: TasksData = { ...tasks, [newColumn]: [] };
    const newBoards: BoardsData = { ...boards, [newColumn]: { id: '__', title: 'Column', tasks: [] } };
    setBoards(newBoards);
    setTasks(newTasks);
    createBoard({ title: newColumn });
  }

  return (
    <div className="app boards">
      <DragDropContext onDragEnd={onDragEnd}>
        {Object.keys(tasks).map((columnKey, ind) => (
          <Droppable key={ind} droppableId={`${ind}`}>
            {(provided, snapshot) => (
              <div className="board">
                <div className="header">
                  <div className="icon xsmall">{IconBoard}</div>
                  <h3>{boards[columnKey].title}</h3>
                </div>
                <div
                  ref={provided.innerRef}
                  className={`tasks ${snapshot.isDraggingOver ? 'is-over' : ''}`}
                  {...provided.droppableProps}
                >
                  {tasks[columnKey].map((item, index) => (
                    <Draggable
                      key={item.id}
                      draggableId={item.id}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          className={`task ${snapshot.isDragging ? 'is-dragging' : ''}`}
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={provided.draggableProps.style}
                        >
                          <span className="description">
                            {item.description}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeTask(ind, index, item.id)}
                          >
                            {IconCross}
                          </button>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                  <div className="new-task">
                    <input
                      type="text"
                      value={newTasks[columnKey]}
                      placeholder="Add task"
                      onChange={e => setNewTasks({
                        ...newTasks,
                        [columnKey]: e.target.value,
                      })}
                    />
                    <button type="button" onClick={() => addTask({
                      boardId: columnKey,
                      description: newTasks[columnKey],
                    })}><div className="icon small">{IconPlusCircleFill}</div></button>
                  </div>
                </div>
              </div>
            )}
          </Droppable>
        ))}
      </DragDropContext>
      <div className="board half">
        <div className="icon large" onClick={addBoard}>
          {IconPlusDotted}
        </div>
      </div>
    </div>
  );
}
export default Boards;