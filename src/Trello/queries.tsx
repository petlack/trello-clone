import { gql } from "@apollo/client";

export const BOARDS_QUERY = gql`
query BoardsQuery {
  timestamp
  boards {
    id
    title
    tasks {
      id
      description
      badge
      position
    }
  }
}
`;

export const CREATE_TASK_MUTATION = gql`
mutation CreateTask($boardId: String!, $description: String!, $badge: String) {
  createTask(boardId: $boardId, description: $description, badge: $badge) {
    id
    description
    badge
    position
    board {
      id
    }
  }
}
`;

export const MOVE_TASK_MUTATION = gql`
mutation MoveTask($boardId: String!, $taskId: String!, $position: Int!) {
  moveTask(boardId: $boardId, taskId: $taskId, position: $position) {
    id
    description
    badge
    position
  }
}
`;

export const CREATE_BOARD_MUTATION = gql`
mutation CreateBoard($title: String!) {
  createBoard(title: $title) {
    id
    title
  }
}
`;

export const DELETE_TASK_MUTATION = gql`
mutation DeleteTask($taskId: String!) {
  deleteTask(taskId: $taskId) {
    id
    description
    badge
  }
}
`;