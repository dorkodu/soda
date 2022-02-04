import { seekr } from "../seekr";
import { soda } from "../../lib/index";

seekr.describe("State", () => {
  seekr.beforeEach(() => {
    while (document.body.firstChild)
      document.body.removeChild(document.body.firstChild)
  })



  seekr.it("basic state", () => {
    function App(component) {
      const [count, setCount] = soda.state(1);
      return <div>Count: {count}</div>
    }

    soda.render(<App />, document.body)

    return document.body.innerHTML === "<div>Count: 1</div>"
  })



  seekr.it("basic set state", () => {
    function App(component) {
      const [count, setCount] = soda.state(1);
      return <div onClick={() => { setCount(count + 1) }}>Count: {count}</div>
    }

    soda.render(<App />, document.body)

    // Should increase count by 1
    document.body.firstChild.click();

    return document.body.innerHTML === "<div>Count: 2</div>"
  })
})