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
          if (typeof element.tag === "function") {
            console.time("a")
            // TODO: Remove this
            const newDOM = component.__dom.cloneNode(true);
            component.__dom.parentNode?.replaceChild(newDOM, component.__dom);
            component.__dom = newDOM as HTMLElement;
            this._update(component.__dom as unknown as HTMLElement, element.tag(component))
            console.timeEnd("a")
          }
        },
        __dom: undefined as unknown as HTMLElement
      };
      this._render(dom, element.tag(component), component);
    }
  }

  private _render(dom: HTMLElement, element: LucidElement, component: any) {
    const elem = document.createElement(element.tag as keyof HTMLElementTagNameMap);
    if (component) component.__dom = elem;

    for (const key in element.attrs) {
      if (key.startsWith("on")) {
        elem.addEventListener(key.substring(2).toLowerCase(), (ev) => element.attrs[key](ev))
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

    for (const key in element.attrs) {
      if (key.startsWith("on")) {
        dom.addEventListener(key.substring(2).toLowerCase(), (ev) => element.attrs[key](ev))
      }
      else {
        dom.setAttribute(translate(key), element.attrs[key]);
      }
    }

    for (let i = 0; i < element.children.length || i < dom.childNodes.length; ++i) {
      // Remove the excess amount of children
      if (element.children[i] === undefined) { dom.removeChild(dom.childNodes[i--]); continue; }

      if (typeof element.children[i].tag === "function") {
        const container = document.createElement("div");
        this.render(container, element.children[i]);

        if (dom.childNodes[i] === undefined) {
          dom.appendChild(container.firstChild as HTMLElement);
        }
        else {
          dom.insertBefore(container.firstChild as HTMLElement, dom.childNodes[i]);
        }
      }
      else if (typeof element.children[i] === "object") {
        if (dom.childNodes[i] === undefined) {
          dom.appendChild(document.createElement(element.children[i].tag));
        }
        else if (dom.childNodes[i].nodeType !== document.ELEMENT_NODE) {
          dom.insertBefore(document.createElement(element.children[i].tag), dom.childNodes[i]);
        }

        this._update(dom.childNodes[i] as HTMLElement, element.children[i]);
      }
      else {
        if (dom.childNodes[i] === undefined) {
          dom.appendChild(document.createTextNode(element.children[i]));
        }
        else if (dom.childNodes[i].nodeType !== document.TEXT_NODE)
          dom.insertBefore(document.createTextNode(element.children[i]), dom.childNodes[i]);
        else if (dom.childNodes[i].nodeValue !== element.children[i]) {
          dom.childNodes[i].nodeValue = element.children[i];
        }
      }
    }
  }
}

export const lucid = new Lucid();