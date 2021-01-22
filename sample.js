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
    return '<h1 onclick="{{methods.increment}}">Count: {{state.count}}</h1>';
  }
});
/* --- COMPONENTS --- */

/* --- PAGES --- */
const HomePage = Lucid.createPage({
  path: "/",
  name: "home",
  payload: {},
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
  currPage: HomePage,
  components: { Counter }
});
app.run("app");