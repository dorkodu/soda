import { seekr } from "../seekr";
import { soda } from "../../lib/index";

seekr.describe("Renderer", () => {
  seekr.beforeEach(() => {
    while (document.body.firstChild)
      document.body.removeChild(document.body.firstChild)
  })



  seekr.it("render basic", () => {
    function App(component) {
      return <div>Hello, world!</div>
    }

    soda.render(<App />, document.body)

    return document.body.innerHTML === "<div>Hello, world!</div>"
  })



  seekr.it("render with variables", () => {
    function App(component) {
      const count = 0;
      return <div>Count: {count}</div>
    }

    soda.render(<App />, document.body)

    return document.body.innerHTML === "<div>Count: 0</div>"
  })



  seekr.it("render by passing attributes", () => {
    function App(component) {
      return <div><Greeting message={"Hi!"} /></div>
    }

    function Greeting(component) {
      const message = component.attrs.message;
      return <div>{message}</div>
    }

    soda.render(<App />, document.body)

    return document.body.innerHTML === "<div><div>Hi!</div></div>"
  })



  seekr.it("store state and update", () => {
    function App(component) {
      component.state = component.state || { count: 0 }
      const increase = () => { component.state.count++; component.update(); }
      return <div onclick={increase}>Count: {component.state.count}</div>
    }

    soda.render(<App />, document.body)

    // Should increase count by 1
    document.body.firstChild.click();

    return document.body.innerHTML === "<div>Count: 1</div>"
  })



  seekr.it("render children", () => {
    function App(component) {
      return (
        <div>
          Hello, world!
          <div>
            Hello, world!
            <div>Hello, world!</div>
          </div>
        </div>
      )
    }

    soda.render(<App />, document.body)

    return document.body.innerHTML === "<div>Hello, world!<div>Hello, world!<div>Hello, world!</div></div></div>"
  })



  seekr.it("render component as children", () => {
    function App(component) {
      return <div><Greeting /></div>
    }

    function Greeting(component) {
      return <div>Hello, world!</div>
    }

    soda.render(<App />, document.body)

    return document.body.innerHTML === "<div><div>Hello, world!</div></div>"
  })



  seekr.it("render an array as children", () => {
    const letters = ["s", "o", "d", "a"]

    function App(component) {
      return (
        <div>
          {letters.map((letter) => <div>{letter}</div>)}
        </div>
      )
    }

    soda.render(<App />, document.body)

    return document.body.innerHTML === "<div><div>s</div><div>o</div><div>d</div><div>a</div></div>"
  })



  seekr.it("render an array of components as children", () => {
    const letters = ["s", "o", "d", "a"]

    function App(component) {
      return (
        <div>
          {letters.map((letter, index) => <Letter key={index} letter={letter} />)}
        </div>
      )
    }

    function Letter(component) {
      const letter = component.attrs.letter;
      return <div>{letter}</div>
    }

    soda.render(<App />, document.body)

    return document.body.innerHTML === "<div><div>s</div><div>o</div><div>d</div><div>a</div></div>"
  })



  seekr.it("render with a condition", () => {
    let count = 1;

    function App(component) {
      const increase = () => { count++; component.update(); }

      if (count === 1) return <button onclick={increase}>Increase!</button>
      return <div>Count is 2</div>
    }

    soda.render(<App />, document.body)

    // Should increase count by 1
    document.body.firstChild.click();

    return document.body.innerHTML === "<div>Count is 2</div>"
  })



  seekr.it("render children then add last", () => {
    const letters = ["s", "o", "d", "a"]

    function App(component) {
      const addLetter = () => {
        letters.push("!");
        component.update();
      }

      return (
        <div>
          <button onclick={addLetter}>Add!</button>
          {letters.map((letter, index) => <div key={index}>{letter}</div>)}
        </div>
      )
    }

    soda.render(<App />, document.body)

    // Should add a letter
    document.body.firstChild.firstChild.click();

    return document.body.innerHTML === "<div><button>Add!</button><div>s</div><div>o</div><div>d</div><div>a</div><div>!</div></div>"
  })



  seekr.it("render children as components then add last", () => {
    const letters = ["s", "o", "d", "a"]

    function App(component) {
      const addLetter = () => {
        letters.push("!");
        component.update();
      }

      return (
        <div>
          <button onclick={addLetter}>Add!</button>
          {letters.map((letter, index) => <Letter key={index} letter={letter} />)}
        </div>
      )
    }

    function Letter(component) {
      const letter = component.attrs.letter;
      return <div>{letter}</div>
    }

    soda.render(<App />, document.body)

    // Should add a letter
    document.body.firstChild.firstChild.click();

    return document.body.innerHTML === "<div><button>Add!</button><div>s</div><div>o</div><div>d</div><div>a</div><div>!</div></div>"
  })



  seekr.it("render children then remove last", () => {
    const letters = ["s", "o", "d", "a", "!"]

    function App(component) {
      const removeLetter = () => {
        letters.pop();
        component.update();
      }

      return (
        <div>
          <button onclick={removeLetter}>Remove!</button>
          <div>
            {letters.map((letter, index) => <div key={index}>{letter}</div>)}
          </div>
        </div>
      )
    }

    soda.render(<App />, document.body)

    // Should remove a letter
    document.body.firstChild.firstChild.click();

    return document.body.innerHTML === "<div><button>Remove!</button><div><div>s</div><div>o</div><div>d</div><div>a</div></div></div>"
  })



  seekr.it("render children as components then remove last", () => {
    const letters = ["s", "o", "d", "a", "!"]

    function App(component) {
      const removeLetter = () => {
        letters.pop();
        component.update();
      }

      return (
        <div>
          <button onclick={removeLetter}>Remove!</button>
          <div>
            {letters.map((letter, index) => <Letter key={index} letter={letter} />)}
          </div>
        </div>
      )
    }

    function Letter(component) {
      const letter = component.attrs.letter;
      return <div>{letter}</div>
    }

    soda.render(<App />, document.body)

    // Should remove a letter
    document.body.firstChild.firstChild.click();

    return document.body.innerHTML === "<div><button>Remove!</button><div><div>s</div><div>o</div><div>d</div><div>a</div></div></div>"
  })



  seekr.it("render children then add first", () => {
    const letters = [
      { id: 1, letter: "o" },
      { id: 2, letter: "d" },
      { id: 3, letter: "a" }
    ]

    function App(component) {
      const addLetter = () => {
        letters.splice(0, 0, { id: 0, letter: "s" });
        component.update();
      }

      return (
        <div>
          <button onclick={addLetter}>Add!</button>
          <div>
            {letters.map((letter) => <div key={letter.id}>{letter.letter}</div>)}
          </div>
        </div>
      )
    }

    soda.render(<App />, document.body)

    // Should add a letter
    document.body.firstChild.firstChild.click();

    return document.body.innerHTML === "<div><button>Add!</button><div><div>s</div><div>o</div><div>d</div><div>a</div></div></div>"
  })



  seekr.it("render children as components then add first", () => {
    const letters = [
      { id: 1, letter: "o" },
      { id: 2, letter: "d" },
      { id: 3, letter: "a" }
    ]

    function App(component) {
      const addLetter = () => {
        letters.splice(0, 0, { id: 0, letter: "s" });
        component.update();
      }

      return (
        <div>
          <button onclick={addLetter}>Add!</button>
          <div>
            {letters.map((letter) => <Letter key={letter.id} letter={letter.letter} />)}
          </div>
        </div>
      )
    }

    function Letter(component) {
      const letter = component.attrs.letter;
      return <div>{letter}</div>
    }

    soda.render(<App />, document.body)

    // Should add a letter
    document.body.firstChild.firstChild.click();

    return document.body.innerHTML === "<div><button>Add!</button><div><div>s</div><div>o</div><div>d</div><div>a</div></div></div>"
  })



  seekr.it("render children then remove first", () => {
    const letters = [
      { id: 0, letter: "!" },
      { id: 1, letter: "s" },
      { id: 2, letter: "o" },
      { id: 3, letter: "d" },
      { id: 4, letter: "a" }
    ]

    function App(component) {
      const removeLetter = () => {
        letters.splice(0, 1);
        component.update();
      }

      return (
        <div>
          <button onclick={removeLetter}>Remove!</button>
          <div>
            {letters.map((letter) => <div key={letter.id}>{letter.letter}</div>)}
          </div>
        </div>
      )
    }

    soda.render(<App />, document.body)

    // Should remove a letter
    document.body.firstChild.firstChild.click();

    return document.body.innerHTML === "<div><button>Remove!</button><div><div>s</div><div>o</div><div>d</div><div>a</div></div></div>"
  })



  seekr.it("render children as components then remove first", () => {
    const letters = [
      { id: 0, letter: "!" },
      { id: 1, letter: "s" },
      { id: 2, letter: "o" },
      { id: 3, letter: "d" },
      { id: 4, letter: "a" }
    ]

    function App(component) {
      const removeLetter = () => {
        letters.splice(0, 1);
        component.update();
      }

      return (
        <div>
          <button onclick={removeLetter}>Remove!</button>
          <div>
            {letters.map((letter) => <Letter key={letter.id} letter={letter.letter} />)}
          </div>
        </div>
      )
    }

    function Letter(component) {
      const letter = component.attrs.letter;
      return <div>{letter}</div>
    }

    soda.render(<App />, document.body)

    // Should remove a letter
    document.body.firstChild.firstChild.click();

    return document.body.innerHTML === "<div><button>Remove!</button><div><div>s</div><div>o</div><div>d</div><div>a</div></div></div>"
  })
})