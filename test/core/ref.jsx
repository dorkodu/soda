import { seekr } from "../seekr";
import { soda } from "../../lib/index";

seekr.describe("Ref", () => {
  seekr.beforeEach(() => {
    while (document.body.firstChild)
      document.body.removeChild(document.body.firstChild)
  })



  seekr.it("basic ref", () => {
    let element;

    function App(component) {
      const div = soda.ref();
      element = div;

      return <div ref={div}>Soda</div>
    }

    soda.render(<App />, document.body);

    return element.dom.parentNode.innerHTML === "<div>Soda</div>";
  })



  seekr.it("ref inside child", () => {
    let element;

    function App(component) {
      const div = soda.ref();
      element = div;

      return <div><div ref={div}>Soda</div></div>
    }

    soda.render(<App />, document.body);

    return element.dom.parentNode.innerHTML === "<div>Soda</div>";
  })



  seekr.it("ref with input type=text", () => {
    let element;

    function App(component) {
      const input = soda.ref();
      element = input;

      return <input type="text" ref={input} value="Soda" />
    }

    soda.render(<App />, document.body);

    return element.dom.value === "Soda";
  })



  seekr.it("click to button and check innerHTML", () => {
    let element;

    function App(component) {
      const [count, setCount] = soda.state(1);
      const button = soda.ref();
      element = button;

      return <button onClick={() => { setCount(count + 1) }} ref={button}>{count}</button>
    }

    soda.render(<App />, document.body);

    // Should increase count by 1
    element.dom.click();

    return element.dom.innerHTML === "2";
  })
})