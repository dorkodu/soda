function save() {
  localStorage.setItem("todos", JSON.stringify(todos));
}

function load() {
  todos = JSON.parse(localStorage.getItem("todos"));

  if (!todos) {
    todos = [
      { id: 0, content: "Write report about Soda", done: true },
      { id: 1, content: "Study", done: false }
    ]

    save();
  }

  for (let i = 0; i < todos.length; ++i) {
    if (id < todos[i].id) id = todos[i].id + 1;
  }
}

export let todos = [];
let id = 0;

load();

export function addTodo(todo) {
  todos.push({ id: id++, content: todo, done: false });
  save()
  todoContainer.update();
}

export function removeTodo(todo) {
  for (let i = 0; i < todos.length; ++i) {
    if (todos[i].id === todo.id) {
      todos.splice(i, 1);
      save()
      todoContainer.update();
      return;
    }
  }
}

export function doneTodo(todo) {
  for (let i = 0; i < todos.length; ++i) {
    if (todos[i].id === todo.id) {
      todos[i].done = !todos[i].done;
      save()
      todoContainer.update();
      return;
    }
  }
}

export function setTodoContainer(component) {
  todoContainer = component;
}

export let todoContainer;