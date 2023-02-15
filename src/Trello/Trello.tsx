import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';

import Boards from './Boards';
import Ripple from './Ripple';
import { LoadingScreen, ErrorScreen } from './Screens';
import { IconCross } from './icons';

import {
  BOARDS_QUERY,
  CREATE_TASK_MUTATION,
  MOVE_TASK_MUTATION,
  CREATE_BOARD_MUTATION,
  DELETE_TASK_MUTATION,
} from './queries';

import { CreateBoardArgs, CreateTaskArgs, DeleteTaskArgs, MoveTaskArgs } from './types';

import './Trello.css'

function Trello() {
  const {
    data: boardsData,
    loading: boardsLoading,
    error: boardsError,
    refetch,
    client,
  } = useQuery(BOARDS_QUERY);

  const refetchParams = {
    refetchQueries: [{ query: BOARDS_QUERY }, 'BoardsQuery'],
    awaitRefetchQueries: true,
    onError: () => client.refetchQueries({ include: [BOARDS_QUERY] })
  };

  const [
    createBoardMutation,
    { loading: createBoardLoading, error: createBoardError },
  ] = useMutation(CREATE_BOARD_MUTATION);

  function createBoard({ title }: CreateBoardArgs) {
    return createBoardMutation({
      variables: { title },
      ...refetchParams,
    });
  }

  const [
    createTaskMutation,
    { loading: createTaskLoading, error: createTaskError },
  ] = useMutation(CREATE_TASK_MUTATION);

  function createTask({ boardId, description, badge }: CreateTaskArgs) {
    return createTaskMutation({
      variables: {
        boardId,
        description,
        badge,
      },
      ...refetchParams,
    })
  }

  const [
    moveTaskMutation,
    { loading: moveTaskLoading, error: moveTaskError },
  ] = useMutation(MOVE_TASK_MUTATION);

  function moveTask({ boardId, taskId, position }: MoveTaskArgs) {
    return moveTaskMutation({
      variables: {
        boardId,
        taskId,
        position,
      },
      ...refetchParams,
    })
  }

  const [
    deleteTaskMutation,
    { loading: deleteTaskLoading, error: deleteTaskError },
  ] = useMutation(DELETE_TASK_MUTATION);

  function deleteTask({ taskId }: DeleteTaskArgs) {
    return deleteTaskMutation({
      variables: {
        taskId,
      },
      ...refetchParams,
    })
  }

  const anyLoading = !!(
    createBoardLoading ||
    createTaskLoading ||
    moveTaskLoading ||
    deleteTaskLoading
  );
  const anyError = !!(
    createBoardError ||
    createTaskError ||
    moveTaskError ||
    deleteTaskError
  );

  const [isError, setIsError] = useState(anyError)

  useEffect(() => {
    setIsError(anyError);
  }, [anyError]);

  if (boardsLoading) {
    return <LoadingScreen />
  }

  if (boardsError) {
    return <ErrorScreen refetch={() => refetch()} />
  }

  const boards = boardsData.boards;
  const timestamp = boardsData.timestamp;

  return (
    <div className="main">
      <Boards
        timestamp={timestamp}
        data={boards}
        moveTask={moveTask}
        deleteTask={deleteTask}
        createTask={createTask}
        createBoard={createBoard}
      />
      <div className={`loading ${anyLoading ? 'visible' : 'hidden'}`}>
        <Ripple />
      </div>
      <div className={`error ${isError ? 'visible' : 'hidden'}`}>
        <div className="close" onClick={() => setIsError(false)}>
          {IconCross}
        </div>
        <p>An error occurred</p>
      </div>
    </div>
  );
}

export default Trello;