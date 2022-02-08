import { Soda } from "@dorkodu/soda";

import { doneTodo, removeTodo } from "../core/core";

export function Todo(component) {
  const todo = component.attrs.todo;

  return (
    <div class="todo">
      <DoneIcon onclick={() => { doneTodo(todo) }} />
      <RemoveIcon onclick={() => { removeTodo(todo) }} />
      <span class={"text " + (todo.done ? "done" : "")}>{todo.content}</span>
    </div>
  )
}

function DoneIcon(component) {
  const onclick = component.attrs.onclick;

  return (
    <svg class="icon" onclick={onclick} width="32" height="32" viewBox="0 0 24 24" stroke-width="1" stroke="#000000" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <circle cx="12" cy="12" r="9" />
      <path d="M9 12l2 2l4 -4" />
    </svg>
  )
}

function RemoveIcon(component) {
  const onclick = component.attrs.onclick;

  return (
    <svg class="icon" onclick={onclick} width="32" height="32" viewBox="0 0 24 24" stroke-width="1" stroke="#000000" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <circle cx="12" cy="12" r="9" />
      <path d="M10 10l4 4m0 -4l-4 4" />
    </svg>
  )
}
