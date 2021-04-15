### Installation

------

Just download our source code from [here](https://github.com/dorkodu/lucid) and put `lucid.js` into your project. Also, to use Lucid, `node.js` is not mandatory.

### Overview

------


```js
import { Lucid } from "./lucid.js";

const Counter = Lucid.createComponent("Counter", {
    state: {
        count: 0
    },
    methods: {
        increment: function() {
            this.setState({state: this.state.count + 1})
        }
    },
    render: function() {
        return `
			<div>
				<h1 onclick="{{methods.increment}}">{{state.count}}</h1>
			</div>
		`;
    }
});

const app = Lucid.createApp({
    containerId: "app"
});

app.render(app.container, "Counter", "0");
```

To help make you get comfortable with Lucid, let's look at the example above. When creating component's we call `Lucid.createComponent` function with a few parameters and assign it to a variable. The first parameter is the name of the component and it will used for referencing this component. The second parameter, which is an object, contains all properties that our component has. In our example, we have only used `state`, `methods` and `render`. But there actually are a lot more.

`state` is where we store private data of our component. In this case, we have `count`. A `state` inside a component, is used as the default `state` when a new component is rendered.

`methods` are where we store the functions, that we want to use with our component. In the example, we have `increment` function that sets the state to `count + 1`.

`render` is where we define the look of our component. It's written as a string template, but then Lucid translates it into a very efficient data-structure called `skeleton`. In the string template, we defined a `h1` inside a `div`. If you look closely to `h1`, you'll notice that it has an `onclick` event which is equal to `{{methods.increment}}` which means, each time you click on to that `h1`, Lucid is going to call increment method that we have defined. Lastly, the text content of our `h1` element has `{{state.count}}`. In Lucid, we call them `string variables`. Lucid will change `{{state.count}}` with the count of the state, when rendering. But don't worry, it will not show `{{state.count}}` as the text content even for a millisecond.