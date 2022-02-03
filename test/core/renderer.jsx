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
})