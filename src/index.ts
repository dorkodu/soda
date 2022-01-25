import { translate } from "./translation";

interface LucidElement {
  tag: keyof HTMLElementTagNameMap | ((props: { [key: string]: any }, state: any) => LucidElement),
  attrs: { [key: string]: any };
  children: string | any[];
}


class Lucid {
  createElement(
    tag: keyof HTMLElementTagNameMap | ((props: { [key: string]: any }, state: any) => LucidElement),
    attrs: { [key: string]: any },
    ...children: any
  ): LucidElement {
    return { tag, attrs, children };
  }

  render(dom: HTMLElement, element: LucidElement) {
    if (typeof element.tag === "function") {
      let proxy = undefined as any;
      const state = (value: any) => {
        if (proxy !== undefined) return proxy;
        proxy = new Proxy({ ...value } as any, {
          set: (target, prop, value) => {
            target[prop] = value;

            if (prop !== "length") {
              console.log("Re-render");
              if (typeof element.tag === "function")
                this._update(dom.firstChild as HTMLElement, element.tag(element.attrs, state));
            }

            return true;
          }
        })

        return proxy
      }
      this._render(dom, element.tag(element.attrs, state));
    }
  }

  _render(dom: HTMLElement, element: LucidElement) {
    const elem = document.createElement(element.tag as keyof HTMLElementTagNameMap);

    for (const key in element.attrs) {
      if (key.startsWith("on")) {
        elem.addEventListener(key.substring(2).toLocaleLowerCase(), (ev) => element.attrs[key](ev))
      }
      else {
        elem.setAttribute(translate(key), element.attrs[key]);
      }
    }

    for (let i = 0; i < element.children.length; ++i) {
      if (typeof element.children[i] === "object")
        this._render(elem, element.children[i]);
      else if (typeof element.tag === "function")
        this.render(elem, element.children[i]);
      else
        elem.appendChild(document.createTextNode(element.children[i]));
    }

    dom.appendChild(elem);
  }

  _update(dom: HTMLElement, element: LucidElement) {
    if (dom.tagName.toLowerCase() !== element.tag) {
      // TODO: Diff
      console.log("TODO: Diff");
    }

    // TODO: Property diff

    for (let i = 0; i < element.children.length; ++i) {
      if (typeof element.children[i] === "object")
        this._update(dom.children[i] as HTMLElement, element.children[i]);
      //console.log("TODO: Handle dom children re-render")
      else if (typeof element.children[i] === "function")
        console.log("TODO: Handle element children re-render")
      else
        if (dom.childNodes[i].nodeValue !== element.children[i])
          dom.childNodes[i].nodeValue = element.children[i];
    }
  }
}

export const lucid = new Lucid();