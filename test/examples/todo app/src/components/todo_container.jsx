import { Soda } from "@dorkodu/soda";

import { Todo } from "./todo.jsx";

import { todos, setTodoContainer } from "../core/core";

export function TodoContainer(component) {
  setTodoContainer(component);

  return (
    <div>
      {todos.map((todo) => <Todo key={todo.id} todo={todo} />)}
    </div>
  )
}