import { seekr } from "../seekr";
import { soda } from "../../lib/index";

seekr.describe("Effect", () => {
  seekr.beforeEach(() => {
    while (document.body.firstChild)
      document.body.removeChild(document.body.firstChild)
  })



  seekr.it("effect basic", () => {
    let output;

    function App(component) {
      soda.effect(() => {
        output = "Soda"
      }, [])

      return <div>Hello, world!</div>
    }

    soda.render(<App />, document.body)

    return output === "Soda"
  })



  seekr.it("effect run only once with [] as dependecy", () => {
    let count = 0;

    function App(component) {
      soda.effect(() => {
        count++;
      }, [])

      return <div onclick={() => { component.update(); }}>Hello, world!</div>
    }

    soda.render(<App />, document.body);

    document.body.firstChild.click();

    return count === 1;
  })



  seekr.it("effect run twice", () => {
    let count = 0;

    function App(component) {
      soda.effect(() => {
        count++;
      })

      return <div onclick={() => { component.update(); }}>Hello, world!</div>
    }

    soda.render(<App />, document.body);

    document.body.firstChild.click();

    return count === 2;
  })



  seekr.it("effect with 1 dependency", () => {
    let output;

    function App(component) {
      const [count, setCount] = soda.state(1);
      soda.effect(() => {
        output = count;
      }, [count])

      return <div onClick={() => { setCount(count + 1) }}>Hello, world!</div>
    }

    soda.render(<App />, document.body)

    document.body.firstChild.click();

    return output === 2;
  })



  seekr.it("effect with multiple dependencies", () => {
    let output;

    function App(component) {
      const [a, setA] = soda.state("a");
      const [b, setB] = soda.state("b");
      const [c, setC] = soda.state("c");

      soda.effect(() => {
        output = a + b + c;
      }, [a, b, c])

      return <div onClick={() => { setB("B") }}>Hello, world!</div>
    }

    soda.render(<App />, document.body)

    document.body.firstChild.click();

    return output === "aBc";
  })
})