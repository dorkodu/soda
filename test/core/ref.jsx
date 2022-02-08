import { seekr } from "../seekr";
import { Soda } from "../../lib/index";

seekr.describe("Ref", () => {
  seekr.beforeEach(() => {
    while (document.body.firstChild)
      document.body.removeChild(document.body.firstChild)
  })



  seekr.it("basic ref", () => {
    let element;

    function App(component) {
      const div = Soda.ref();
      element = div;

      return <div ref={div}>Soda</div>
    }

    Soda.render(<App />, document.body);

    return element.dom.parentNode.innerHTML === "<div>Soda</div>";
  })



  seekr.it("ref inside child", () => {
    let element;

    function App(component) {
      const div = Soda.ref();
      element = div;

      return <div><div ref={div}>Soda</div></div>
    }

    Soda.render(<App />, document.body);

    return element.dom.parentNode.innerHTML === "<div>Soda</div>";
  })



  seekr.it("ref with input type=text", () => {
    let element;

    function App(component) {
      const input = Soda.ref();
      element = input;

      return <input type="text" ref={input} value="Soda" />
    }

    Soda.render(<App />, document.body);

    return element.dom.value === "Soda";
  })



  seekr.it("click to button and check innerHTML", () => {
    let element;

    function App(component) {
      const [count, setCount] = Soda.state(1);
      const button = Soda.ref();
      element = button;

      return <button onClick={() => { setCount(count + 1) }} ref={button}>{count}</button>
    }

    Soda.render(<App />, document.body);

    // Should increase count by 1
    element.dom.click();

    return element.dom.innerHTML === "2";
  })
})