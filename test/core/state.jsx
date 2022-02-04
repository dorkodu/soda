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



  seekr.it("set state without update using dontUpdate=true", () => {
    function App(component) {
      const [count, setCount] = soda.state(1);
      return <div onClick={() => { setCount(count + 1, true) }}>Count: {count}</div>
    }

    soda.render(<App />, document.body)

    // Should increase count by 1
    document.body.firstChild.click();

    return document.body.innerHTML === "<div>Count: 1</div>"
  })



  seekr.it("set state with update using dontUpdate=false", () => {
    function App(component) {
      const [count, setCount] = soda.state(1);
      return <div onClick={() => { setCount(count + 1, false) }}>Count: {count}</div>
    }

    soda.render(<App />, document.body)

    // Should increase count by 1
    document.body.firstChild.click();

    return document.body.innerHTML === "<div>Count: 2</div>"
  })



  seekr.it("set state with update using equality callback", () => {
    function App(component) {
      const [count, setCount] = soda.state(1, (prev, next) => prev === next);
      return <div onClick={() => { setCount(count + 1) }}>Count: {count}</div>
    }

    soda.render(<App />, document.body)

    // Should increase count by 1
    document.body.firstChild.click();

    return document.body.innerHTML === "<div>Count: 2</div>"
  })



  seekr.it("set state without update using equality callback", () => {
    function App(component) {
      const [count, setCount] = soda.state(1, (prev, next) => prev === next);
      return <div onClick={() => { setCount(count) }}>Count: {count}</div>
    }

    soda.render(<App />, document.body)

    // Should increase count by 1
    document.body.firstChild.click();

    return document.body.innerHTML === "<div>Count: 1</div>"
  })



  seekr.it("set state return new state", () => {
    let output;

    function App(component) {
      const [count, setCount] = soda.state(1);
      return <div onClick={() => { output = setCount(count + 1) }}></div>
    }

    soda.render(<App />, document.body)

    // Should increase count by 1
    document.body.firstChild.click();

    return output === 2;
  })



  seekr.it("multiple states", () => {
    function App(component) {
      const [a, setA] = soda.state("a");
      const [b, setB] = soda.state("b");
      const [c, setC] = soda.state("c");
      return <div>{a}{b}{c}</div>
    }

    soda.render(<App />, document.body)

    return document.body.innerHTML === "<div>abc</div>"
  })



  seekr.it("multiple set states", () => {
    function App(component) {
      const [a, setA] = soda.state("a");
      const [b, setB] = soda.state("b");
      const [c, setC] = soda.state("c");
      return <div onClick={() => { setA("A", true); setB("B", true); setC("C"); }}>{a}{b}{c}</div>
    }

    soda.render(<App />, document.body)

    // Should increase count by 1
    document.body.firstChild.click();

    return document.body.innerHTML === "<div>ABC</div>"
  })
})