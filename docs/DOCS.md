# 

**🥤  - the fresh UI library in javascript**



#### Basic Usage

> In ****, each component is a function that takes in an object as a parameter and returns a `jsx` expression. The parameter it takes in is a local data container for the component. It also contains `update` function which triggers a re-render for the component.

> **** only contains 1 function to be used, which is `render`. `render` takes in the `jsx` expression of the component and the **DOM element** that you want the component to be rendered to.

```jsx
// You dont have to name the parameter as "component",
// name it whatever you like to.
function App(component) {
  return <div>Hello, world!</div>
}

.render(<App />, document.getElementById("app"))
```

Component `App` returns a `div` with "Hello, world! in it. Then the `.render` function will render the component to the given DOM element.



#### Local State

```jsx
function Counter(component) {
  // If state is undefined, it will be set to { count: 0 },
  // otherwise it's value will be kept.
  component.state = component.state || { count: 0 };
  
  // This function increases the count by 1, 
  // then triggers a re-render for the component.
  const increase = () => { component.state.count++; component.update(); }
  
  return <div onClick={increase}>Count: {component.state.count}</div>
}

.render(<Counter />, document.getElementById("app"))
```

In order to add local state to a component, we define `component.state` (it doesn't have to be `component.state`, you can name it whatever you want) and give it a initial value. The function `increase`  will increase the count by 1 and will trigger a re-render. In the `jsx` expression, we set `onClick` to `increase` which will call `increase` function when clicked to the component.

> **** only updates what needs to be updated in the DOM which makes it blazingly fast.



#### Components within Components

```jsx
function App(component) {
  return (
    <div>
      <Greeting />
      <Greeting />
    </div>
  )
}

function Greeting(component) {
  return <div>Hi!</div>
}

.render(<App />, document.getElementById("app"))
```

It's possible for components to contain other components in it's `jsx` expression. 

> We recommend separating components into smaller components to both increase performance and readability of the code. If you had only 1 component containing all of your app, in each re-render, **** would need to check a lot of things which might decrease the performance drastically.



#### Passing Attributes to the Components

```jsx
function Post(component) {
  // It's just for easier access to post property.
  const post = component.attrs.post;

  return <div>{post.content}</div>
}

.render(
  <Post post={{ content: " is awesome!" }} />, 
  document.getElementById("app")
)
```

Any attribute passed on to a component can be accessed from `attrs` property.



#### Rendering an Array of Components

```jsx
const posts = [
  { content: "Hi!" },
  { content: "Hello, world!" }
]

function App(component) {
  return (
    <div>
      {posts.map((post) => <Post post={post} />)}
    </div>
  )
}

function Post(component) {
  const post = component.attrs.post;
    
  return <div>{post.content}</div>
}

.render(<App />, document.getElementById("app"))
```

We make use of `map` function and pass attribute to the `Post` component.

> Currently, **** doesn't support direct mapping arrays to DOM elements, it only support mapping to  components. Which means `{posts.map((post) => <div>{post.content}</div>)}` won't work.



#### Optimizing Re-renders for Array of Components

> If you tried to add or remove one element to the array, then trigger a re-render by calling `update`, **** would need to re-render the whole array of components since there is no hint to tell **** what had actually happened. Which may cause performance issues with large arrays (think of twitter, when you scroll to the bottom, to show more tweets, it would have to process all other tweets even though it's completely unnecessary). To overcome this problem, you can hint **solid.js** with `key` property.

> `key`'s should be unique among siblings and should be stable (for ex. post id or user id from database).

> `key` property is needed for dynamic arrays, but not needed for static arrays.

```jsx
const posts = [
  { id: 0, content: "Hi!" },
  { id: 1, content: "Hello, world!" }
]

function App(component) {
  return (
    <div>
      {posts.map((post) => <Post key={post.id} post={post} />)}
    </div>
  )
}

function Post(component) {
  const post = component.attrs.post;
  return <div>{post.content}</div>
}

.render(<App />, document.getElementById("app"))
```

Each post has a unique `key` attribute which will optimize re-renders adding or removing from the `posts` array.



#### Input from Form Elements

```jsx
function App(component) {
  // Initialize component's state.
  component.state = component.state || { todos: [], todoText: "" };

  // Will be called on each input.
  const handleInput = (ev) => {
    // ev.target.value stores the text written inside input element,
    // and also settings state does not cause a re-render unless update is called.
    component.state.todoText = ev.target.value;
  }

  const addTodo = () => {
    component.state.todos.push(component.state.todoText);
    component.update();
  }

  return (
    <div>
      <input type="text" onInput={handleInput} />
      <button onClick={addTodo}>Add todo</button>
      <div>
        {component.state.todos.map((todo, index) => <Todo key={index} todo={todo} />)}
      </div>
    </div>
  )
}

function Todo(component) {
  const todo = component.attrs.todo;

  return <div>{todo}</div>
}

.render(<App />, document.getElementById("app"))
```

Since form elements keep their own state themselves, we can receive input by using the `onInput` event. In the `jsx` expression, we pass `todo` as an attribute and also we have to pass an index to the `key` property since it's a dynamic array meaning we might add or remove elements to it.