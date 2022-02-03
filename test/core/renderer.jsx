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
})