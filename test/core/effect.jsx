import { seekr } from "../seekr";
import { soda } from "../../lib/index";

seekr.describe("Effect", () => {
  seekr.beforeEach(() => {
    while (document.body.firstChild)
      document.body.removeChild(document.body.firstChild)
  })
})