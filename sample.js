import { Lucid } from "./lucid.js";

/* --- COMPONENTS --- */
const Counter = Lucid.createComponent("Counter", {
  state: { count: 0 },
  methods: {
    increment: (state, setState) => {
      setState({ count: state.count + 1 });
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
    mounted: function () { console.log("Component mounted!"); },
    unmounted: function () { console.log("Component unmounted!"); },
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
  }
});
/* --- PAGES --- */

const app = Lucid.createApp({
  page: HomePage,
  components: { Counter }
});
app.run("app");