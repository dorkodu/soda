import { seekr } from "../seekr";
import { Soda } from "../../lib/index";

seekr.describe("Effect", () => {
  seekr.beforeEach(() => {
    while (document.body.firstChild)
      document.body.removeChild(document.body.firstChild)
  })



  seekr.it("effect basic", () => {
    let output;

    function App(component) {
      Soda.effect(() => {
        output = "Soda"
      }, [])

      return <div>Hello, world!</div>
    }

    Soda.render(<App />, document.body)

    return output === "Soda"
  })



  seekr.it("effect run only once with [] as dependecy", () => {
    let count = 0;

    function App(component) {
      Soda.effect(() => {
        count++;
      }, [])

      return <div onclick={() => { component.update(); }}>Hello, world!</div>
    }

    Soda.render(<App />, document.body);

    document.body.firstChild.click();
    document.body.firstChild.click();
    document.body.firstChild.click();

    return count === 1;
  })



  seekr.it("effect run twice", () => {
    let count = 0;

    function App(component) {
      Soda.effect(() => {
        count++;
      })

      return <div onclick={() => { component.update(); }}>Hello, world!</div>
    }

    Soda.render(<App />, document.body);

    document.body.firstChild.click();

    return count === 2;
  })



  seekr.it("effect with 1 dependency", () => {
    let output;

    function App(component) {
      const [count, setCount] = Soda.state(1);
      Soda.effect(() => {
        output = count;
      }, [count])

      return <div onClick={() => { setCount(count + 1) }}>Hello, world!</div>
    }

    Soda.render(<App />, document.body)

    document.body.firstChild.click();

    return output === 2;
  })



  seekr.it("effect with multiple dependencies", () => {
    let output;

    function App(component) {
      const [a, setA] = Soda.state("a");
      const [b, setB] = Soda.state("b");
      const [c, setC] = Soda.state("c");

      Soda.effect(() => {
        output = a + b + c;
      }, [a, b, c])

      return <div onClick={() => { setB("B") }}>Hello, world!</div>
    }

    Soda.render(<App />, document.body)

    document.body.firstChild.click();

    return output === "aBc";
  })



  seekr.it("effect with one dependency but multiple states", () => {
    let output;

    function App(component) {
      const [a, setA] = Soda.state("a");
      const [b, setB] = Soda.state("b");
      const [c, setC] = Soda.state("c");

      Soda.effect(() => {
        output = a + b + c;
      }, [b])

      return <div onClick={() => { setB("B") }}>Hello, world!</div>
    }

    Soda.render(<App />, document.body)

    document.body.firstChild.click();

    return output === "aBc";
  })
})