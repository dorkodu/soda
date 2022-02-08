import { soda } from "@dorkodu/soda";

import { addTodo } from "../core/core";

export function Input(component) {
  const input = soda.ref();

  const add = () => {
    if (input.dom.value !== "") {
      addTodo(input.dom.value);
      input.dom.value = "";
    }
  }

  return (
    <div>
      <input ref={input} maxLength="29" type="text" class="input" placeholder="Todo..." />
      <button class="button" onClick={add}>Add todo</button>
    </div>
  )
}