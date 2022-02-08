import "./styles/styles.scss";

import { soda } from "@dorkodu/soda";

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

soda.render(<App />, document.body);