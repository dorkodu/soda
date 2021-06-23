### Installation

------

Just download our source code from [here](https://github.com/dorkodu/lucid) and locate `lucid.js` into your project. Also, to use Lucid, `node.js` is not mandatory.



### Overview

------


```js
import { Lucid } from "./lucid.js";

const Page = Lucid.component({
  attributes: {
    count: 0
  },
  render: function (ev) {
    return `
      <div>
        <h1>Example with lucid.js</h1>
        <div>Counter has been clicked for {{attributes.count}} times.</div>
        <div lucid-id="${Counter.id}" lucid-key="0"></div>
      </div>
    `;
  },
  watch: {
    count: function (oldValue, newValue) {
      this.update();
    }
  }
});

const Counter = Lucid.component({
  state: {
    count: 0
  },
  methods: {
    count: function () {
      this.state.count++;
      Lucid.setAttribute(Page.id, 0, "count", this.state.count)
      this.update()
    }
  },
  render: function () {
    return `<div onclick="{{methods.count}}">Count: {{state.count}}</div>`;
  }
});

Lucid.render(document.getElementById("app"), Page, 0);
```

To help make you get comfortable with Lucid, let's look at the example above. When creating a component,         call `Lucid.component` with an object that has a few properties. Those are `attributes`, `state`, `methods`, `render`, `hooks`, and `watch` of which **only render property is mandatory**. This function returns us the component to reference it later on if needed.

In our first component `Page`, we have specified only `attributes`, `render` and `watch` properties. Let's now look how they influence our component. `attributes` property is all about any data that our component may use it to render itself. It can be set from outside, which is very useful when creating components from data that is, for example, fetched from the server.  In our case, `attributes` has only one property called `count`, which has a initial value of 0. 

The `render` property, which is a function, is about how our component will look like in the **DOM**. It's converted into a efficient data structure in run-time called `skeleton`. Our component has a parent `div`, which has a `h1`, and two `div`'s. In the first `div`, there is our **string variable**, `{{attributes.count}}`. This means whenever our component is being rendered, it will show `attributes.count`'s value instead. In our case, 0. In the last div, we used it to create another component inside our component, which is the `Counter` component with a key of 0. `lucid-id` is a number that specifies components id, while `lucid-key` is a unique number specifying which instance it is. When our component is rendered, `lucid.js`, will  render a `Counter` component here. 

The `watch` property, contains callbacks for `attribute`'s properties and called when they are changed by `Lucid.setAttribute` function. Each callback get two parameters that are **new value** and **old value**. In our case, we have a callback for `count` property. When it's changed, we will call `this.update` to make the component re-render itself.

Now on to the `Counter` component, which has state, methods and render properties. `state` contains private data of our component which is not accessible from outside unlike the `attributes` which is public state of the component, accessible from outside by using `Lucid.getAttribute`. `state` has `count` property which has an initial value of 0.

`methods` contain functions that can be called by either `hooks`, `watch` or events in our DOM. If called by DOM events, `methods` will receive the event as a parameter. Our component has one method that is called `count`. When called, it will increase the `count` by one, set the `count` attribute of the **Page** component and re-render itself.

In the `render`, we have a `div` with an `onclick` property which is set to `{{methods.count}}`, meaning when the click event is triggered, it will call `count` method that we have defined.

Lastly, we render our `Page` component with a key of 0 inside a div.



### API Reference

------

#### Lucid.component(props)

Returns the component with it's properties and auto-assigned id.



A component has 6 properties (props); attributes, state, methods, render, hooks and watch.

- ##### attributes (optional)

  - An object that stores public data of a component. Can be set or accessed by [Lucid.setAttribute]() and [Lucid.getAttribute]() from outside of the component. To access inside the component itself, `this.attributes` is used.

    ```js
    const myComponent = Lucid.component({
      attributes: {
          name: "John Doe",
    	  relations: { null }
      }
    });
    ```

- ##### state (optional)

  - An object that stores private data of a component. Can not be set or accessed from the outside of the component unlike the [attributes](). To access inside the component itself, `this.state` is used.

    ```js
    const myComponent = Lucid.component({
      state: {
          buttonPressed: true,
          input: ""
      }
    });
    ```

- ##### methods (optional)

  - An object that contains functions that can only be used by the component. To call the methods, `this.method_name` is used.

  - Functions inside the `methods` object must have a depth level of 1.

    ```js
    const myComponent = Lucid.component({
      methods: {
        myFunction: function () { ... },
        myOtherFunction: function () { ... },
        ourFunction: function () { ... },
        container: { ourOtherFunction: function () { ... } } /* Since this function is inside a object, it will not work and will cause errors. */
      }
    });
    ```

- ##### render

  - A function that returns a string which represents the look of the component on the DOM which is then converted into a efficient data-structure called [skeleton]().

    ```js
    const myComponent = Lucid.component({
      render: function () {
        return `
          <div>
          	<h1>API Reference</h1>
          	<p>...</p>
          </div>
        `;
      }
    });
    ```

  - The render template must at least have 1 element and parent element can not have a sibling.

    ```js
    /* In this example, parent element has a sibling which will cause error. */
    const myComponent = Lucid.component({
      render: function () {
        return `
          <div>1</div>
          <div>2</div>
        `;
      }
    });
    ```
    
  - In the render template, [string variables]() can be used, which makes components dynamic.

    ```js
    /* In this example, each time the div is clicked, the value it shows will be incremented */
    const myComponent = Lucid.component({
      state: { count: 0 },
      methods: {
        increment: function (ev) {
          this.state.count++;
          this.update();
        }
      },
      render: function () {
        return `
          <div onclick="{{methods.increment}}">{{state.count}}</div>
        `;
      }
    });
    ```

    

- ##### hooks (optional)

  - An object that contains 4 optional functions; `created`, `connected`, `disconnected` and `updated`.

  - **created:** Called once the memory has been first allocated for the component.

  - **connected:** Called once the component's view has been added to the DOM.

  - **disconnected:** Called once the component's view has been removed from the DOM.

  - **updated:** Called once the update function (`this.update`) has been called.

    ```js
    const myComponent = Lucid.component({
      hooks: {
        created: function () { ... },
        connected: function () { ... },
        disconnected: function () { ... },
        updated: function () { ... }
      }
    });
    ```

- ##### watch (optional)

  - An object  that contains functions that are called once the same named `attribute` has been changed by [Lucid.setAttribute]().

    ```js
    const myComponent = Lucid.component({
      attributes: { name: "John Doe" },
      watch: {
          name: function () { ... }
      }
    });
    ```



**Note:** When creating a component, it is highly advised not to have any function with the same name inside `methods`, `hooks` and `watch` as well as not naming any function `update` since it will cause undefined behavior.

```js
/* In this example, names of all 3 properties above are clashing. */
const myComponent = Lucid.component({
  methods: { myFunction: function () { ... } },
  hooks: { myFunction: function () { ... } },
  watch: { myFunction: function () { ... } }
});
```

```js
/* This example shows update function inside methods, which clashes with the update function that Lucid provides. */
const myComponent = Lucid.component({
  methods: { update: function () { ... } }
});
```



**this keyword**

- [attributes](), [state](), [methods](), [render](), [hooks](), [watch](), [update]() function, [refs](), `id` and `key` can be accessed from anywhere of the component with `this` keyword.



**update** **function**

- A function which forces the component to be re-rendered in a efficient manner. Should be used after an important `state` change in the component which changes look of the component.

  ```js
  const myComponent = Lucid.component({
      state: { name: "John Doe" },
      methods: { 
        changeName: function () {
        	this.state.name = "Doe John";
          this.update(); /* The component will be re-rendered and new name will be shown. */
        } 
      }
      render: function () {
          return `
            <div onclick="{{methods.changeName}}">{{state.name}}</div>
          `;
      }
  });
  ```



**string variables**

- Are variables that can be used in render template such as calling a function when a event fires, or showing the value of a `state` or `attributes` property. Example usage: {{methods.myFunction}}, {{state.ourValue}}, {{attributes.myValue}}.

  ```js
  /* In this example we have a component which shows "Hello world!". */
  const myComponent = Lucid.component({
    state: { text: "Hello" },
    attributes: { text: "world" },
    render: function () {
      return `
     	  <div>{{state.text}} {{attributes.text}}!</div>
      `;
    }
  });
  ```

- Functions that are called on events receive the event object as a parameter.

  ```js
  const myComponent = Lucid.component({
    state: { count: 0 },
    methods: {
      increment: function (ev) { /* Event object is received as "ev" parameter. */
        this.state.count++;
        this.update();
      }
    },
    render: function () {
      return `
        <div onclick="{{methods.increment}}">{{state.count}}</div>
      `;
    }
  });
  ```



**referencing elements**

- To have easy access to an inner element of the render template, elements are referenced using a special attribute "lucid-ref" which are added to `refs` property that can be accessed by `this.refs`.

  ```js
  const myComponent = Lucid.component({
    methods: {
      access: function (ev) {
        console.log(this.refs["section2"]); /* Returns the DOM object that element */
      }
    }
    render: function () {
      return `
        <div>
  		<div>Section 1</div>
          <div>
            <div onclick="{{methods.access}}" lucid-ref="section2">Section 2</div>
          </div>
          <div>Section 3</div>
  	  </div>
      `;
    }
  });
  ```

  

#### Lucid.render(dom, component, key, attributes, settings)

Renders the component with given key, attributes and settings to the DOM.



- **dom**
  - Container of the component that is going to be rendered.
- **component**
  - Object of the component that is going to be rendered.
- **key**
  - Key of the component that is going to be rendered.
  - All instances of the same component must have different keys.
- **attributes (optional)**
  - `attributes` of the component that is going to be rendered. 
  - Is used instead of calling [Lucid.setAttribute]() after the component has been rendered.
- **settings** **(optional)**
  - Object that stores render settings of the component that is going to be rendered.
  - Has 3 properties; first (boolean), last (boolean) and index (integer). For example, if first is true, the component will be the first child of it's parent, or if index is set to 4, it will be the forth child of it's parent.
  - Note: If the parent, for example, has 3 children and index is set to 3, it will cause undefined behavior. Instead, last property should be used.



#### Lucid.remove(component, key)

Removes the component with the given key from the DOM.



- **component**
  - Object of the component that is going to be removed.
- **key**
  - Key of the component that is going to be removed.



