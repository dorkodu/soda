import { seekr } from "../seekr";
import { Soda } from "../../lib/index";

seekr.describe("State", () => {
  seekr.beforeEach(() => {
    while (document.body.firstChild)
      document.body.removeChild(document.body.firstChild)
  })



  seekr.it("basic state", () => {
    function App(component) {
      const [count, setCount] = Soda.state(1);
      return <div>Count: {count}</div>
    }

    Soda.render(<App />, document.body)

    return document.body.innerHTML === "<div>Count: 1</div>"
  })



  seekr.it("basic set state", () => {
    function App(component) {
      const [count, setCount] = Soda.state(1);
      return <div onClick={() => { setCount(count + 1) }}>Count: {count}</div>
    }

    Soda.render(<App />, document.body)

    // Should increase count by 1
    document.body.firstChild.click();

    return document.body.innerHTML === "<div>Count: 2</div>"
  })



  seekr.it("set state without update using dontUpdate=true", () => {
    function App(component) {
      const [count, setCount] = Soda.state(1);
      return <div onClick={() => { setCount(count + 1, true) }}>Count: {count}</div>
    }

    Soda.render(<App />, document.body)

    // Should increase count by 1
    document.body.firstChild.click();

    return document.body.innerHTML === "<div>Count: 1</div>"
  })



  seekr.it("set state with update using dontUpdate=false", () => {
    function App(component) {
      const [count, setCount] = Soda.state(1);
      return <div onClick={() => { setCount(count + 1, false) }}>Count: {count}</div>
    }

    Soda.render(<App />, document.body)

    // Should increase count by 1
    document.body.firstChild.click();

    return document.body.innerHTML === "<div>Count: 2</div>"
  })



  seekr.it("set state with update using equality callback", () => {
    function App(component) {
      const [count, setCount] = Soda.state(1, (prev, next) => prev === next);
      return <div onClick={() => { setCount(count + 1) }}>Count: {count}</div>
    }

    Soda.render(<App />, document.body)

    // Should increase count by 1
    document.body.firstChild.click();

    return document.body.innerHTML === "<div>Count: 2</div>"
  })



  seekr.it("set state without update using equality callback", () => {
    function App(component) {
      const [count, setCount] = Soda.state(1, (prev, next) => prev === next);
      return <div onClick={() => { setCount(count) }}>Count: {count}</div>
    }

    Soda.render(<App />, document.body)

    // Should increase count by 1
    document.body.firstChild.click();

    return document.body.innerHTML === "<div>Count: 1</div>"
  })



  seekr.it("set state return new state", () => {
    let output;

    function App(component) {
      const [count, setCount] = Soda.state(1);
      return <div onClick={() => { output = setCount(count + 1) }}></div>
    }

    Soda.render(<App />, document.body)

    // Should increase count by 1
    document.body.firstChild.click();

    return output === 2;
  })



  seekr.it("multiple states", () => {
    function App(component) {
      const [a, setA] = Soda.state("a");
      const [b, setB] = Soda.state("b");
      const [c, setC] = Soda.state("c");
      return <div>{a}{b}{c}</div>
    }

    Soda.render(<App />, document.body)

    return document.body.innerHTML === "<div>abc</div>"
  })



  seekr.it("multiple set states", () => {
    function App(component) {
      const [a, setA] = Soda.state("a");
      const [b, setB] = Soda.state("b");
      const [c, setC] = Soda.state("c");
      return <div onClick={() => { setA("A", true); setB("B", true); setC("C"); }}>{a}{b}{c}</div>
    }

    Soda.render(<App />, document.body)

    // Should increase count by 1
    document.body.firstChild.click();

    return document.body.innerHTML === "<div>ABC</div>"
  })



  seekr.it("set state 1 out of 3", () => {
    function App(component) {
      const [a, setA] = Soda.state("a");
      const [b, setB] = Soda.state("b");
      const [c, setC] = Soda.state("c");
      return <div onClick={() => { setB("B"); }}>{a}{b}{c}</div>
    }

    Soda.render(<App />, document.body)

    // Should increase count by 1
    document.body.firstChild.click();

    return document.body.innerHTML === "<div>aBc</div>"
  })



  seekr.it("set state 1 out of 3 multiple times", () => {
    function App(component) {
      const [a, setA] = Soda.state("a");
      const [b, setB] = Soda.state(1);
      const [c, setC] = Soda.state("c");
      return <div onClick={() => { setB(b + 1); }}>{a}{b}{c}</div>
    }

    Soda.render(<App />, document.body)

    // Should increase count by 3
    document.body.firstChild.click();
    document.body.firstChild.click();
    document.body.firstChild.click();

    return document.body.innerHTML === "<div>a4c</div>"
  })



  seekr.it("set state then remove child", () => {
    function App(component) {
      const [count, setCount] = Soda.state(1);

      if (count === 1)
        return (
          <div>
            <button onClick={() => { setCount(count + 1) }}></button>
            <div>Hi!</div>
          </div>
        )
      return <div>Hello!</div>
    }

    Soda.render(<App />, document.body)

    // Should increase count by 1
    document.body.firstChild.firstChild.click();

    return document.body.innerHTML === "<div>Hello!</div>"
  })
})