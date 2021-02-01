import { Lucid } from "./lucid.js";

/* --- COMPONENTS --- */
const Counter = Lucid.createComponent("Counter", {
  state: { count: 0 },
  methods: {
    increment: function () {
      this.setState({ count: this.state.count + 1 });
    }
  },
  render() {
    return `
    <div>
      <h1 onclick="{{methods.increment}}">Count: {{state.count}}</h1>
    </div>
    `;
  },
  hooks: {
    created: function () { console.log("Component created!"); },
    connected: function () { console.log("Component connected!"); },
    disconnected: function () { console.log("Component disconnected!"); },
    updated: function () { console.log("Component updated!"); }
  }
});
/* --- COMPONENTS --- */

/* --- PAGES --- */
const HomePage = Lucid.createPage({
  path: "/",
  name: "home",
  contents() {
    return `
      <div>
        <div>
          <div>Counter component below</div>
          <div lucid-component="Counter" lucid-key="0"></div>
          <div>Counter component above</div>
          <span style="color: red;">Lucid is great!</span>
        </div>
      </div>
    `;
  },
  hooks: {
    created: function () { console.log("Page created!"); },
    connected: function () { console.log("Page connected!"); },
    disconnected: function () { console.log("Page disconnected!"); },
    updated: function () { console.log("Page updated!"); }
  }
});
/* --- PAGES --- */

const app = Lucid.createApp({
  page: HomePage,
  components: { Counter }
});
app.run("app");