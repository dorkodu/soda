import { translate } from "./translation";

interface LucidElement {
  tag: keyof HTMLElementTagNameMap | ((component: any) => LucidElement),
  attrs: { [key: string]: any };
  children: string | any[];
}

class Lucid {
  local(value: any, container: any, cb: any) {
    if (container.state) return container.state;
    const proxy = new Proxy(value, {
      set: (t, p, v) => {
        t[p] = v;
        if (p !== "length") cb();
        return true;
      }
    })
    container.state = proxy;
    return proxy;
  }

  private createElement(
    tag: keyof HTMLElementTagNameMap | ((component: any) => LucidElement),
    attrs: { [key: string]: any },
    ...children: any
  ): LucidElement {
    return { tag, attrs, children };
  }

  render(dom: HTMLElement, element: LucidElement) {
    if (typeof element.tag === "function") {
      const component = {
        attrs: element.attrs,
        update: () => {
          if (typeof element.tag === "function")
            this._update(component.__dom as unknown as HTMLElement, element.tag(component))
        },
        __dom: undefined
      };
      this._render(dom, element.tag(component), component);
    }
  }

  private _render(dom: HTMLElement, element: LucidElement, component: any) {
    const elem = document.createElement(element.tag as keyof HTMLElementTagNameMap);
    if (component) component.__dom = elem;

    for (const key in element.attrs) {
      if (key.startsWith("on")) {
        elem.addEventListener(key.substring(2).toLocaleLowerCase(), (ev) => element.attrs[key](ev))
      }
      else {
        elem.setAttribute(translate(key), element.attrs[key]);
      }
    }

    for (let i = 0; i < element.children.length; ++i) {
      if (typeof element.children[i].tag === "function")
        this.render(elem, element.children[i]);
      else if (typeof element.children[i] === "object")
        this._render(elem, element.children[i], undefined);
      else
        elem.appendChild(document.createTextNode(element.children[i]));
    }

    dom.appendChild(elem);
  }

  private _update(dom: HTMLElement, element: LucidElement) {
    if (dom.tagName.toLowerCase() !== element.tag) {
      // TODO: Diff
      console.log("TODO: Diff");
    }

    // TODO: Property diff

    for (let i = 0; i < element.children.length; ++i) {
      if (typeof element.children[i] === "object")
        this._update(dom.children[i] as HTMLElement, element.children[i]);
      else if (typeof element.children[i] === "function")
        console.log("TODO: Handle element children re-render")
      else
        if (dom.childNodes[i].nodeValue !== element.children[i])
          dom.childNodes[i].nodeValue = element.children[i];
    }
  }
}

export const lucid = new Lucid();