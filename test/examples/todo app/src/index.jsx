import "./styles/styles.scss";

import { Soda } from "@dorkodu/soda";

import { Input } from "./components/input.jsx";
import { TodoContainer } from "./components/todo_container.jsx";

function App(component) {
  return (
    <div id="app">
      <Input />
      <TodoContainer />
    </div>
  )
}

Soda.render(<App />, document.body);