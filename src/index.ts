import { translate } from "./translation";

interface LucidElement {
  tag: keyof HTMLElementTagNameMap | ((props: { [key: string]: any }) => LucidElement);
  props: { [key: string]: any };
  children: string | any[];
}


class Lucid {
  private id: number = 1000000;
  private state: any;

  createElement(
    tag: keyof HTMLElementTagNameMap | ((props: { [key: string]: any }) => LucidElement),
    props: { [key: string]: any },
    ...children: any
  ): LucidElement {
    return { tag, props, children };
  }

  render(dom: HTMLElement, element: LucidElement) {
    this.state = new Proxy(element.props.state, {
      set: (target, prop, value) => {
        target[prop] = value;

        if (prop !== "length" && prop !== "_id" && prop !== "_dom") {
          console.log("Re-render");
          this._rerender(target["_dom"], target["_id"]({ state: target }));
        }

        return true;
      },
      deleteProperty: (target, prop) => {
        console.log("Re-render");
        delete target[prop];
        return true;
      }
    });
    element.props.state = this.state;

    this._render(dom, element);

    return this.state;
  }

  _render(dom: HTMLElement, element: LucidElement) {
    const state = element.props.state;

    if (typeof element.tag === "function") {
      state["_id"] = element.tag;
      element = element.tag(element.props);
    }
    else {

    }

    const elem = document.createElement(element.tag as keyof HTMLElementTagNameMap);
    state["_dom"] = elem;

    for (const key in element.props) {
      if (key.startsWith("on")) {
        elem.addEventListener(key.substring(2).toLocaleLowerCase(), (ev) => element.props[key](ev))
      }
      else {
        elem.setAttribute(translate(key), element.props[key]);
      }
    }

    for (let i = 0; i < element.children.length; ++i) {
      if (typeof element.children[i] === "object")
        this._render(elem, element.children[i]);
      else
        elem.appendChild(document.createTextNode(element.children[i]));
    }

    dom.appendChild(elem);
  }

  _rerender(dom: HTMLElement, element: LucidElement) {
    if (dom.tagName.toLowerCase() !== element.tag) {
      // TODO: Diff
      console.log("TODO: Diff");
    }

    // TODO: Property diff

    for (let i = 0; i < element.children.length; ++i) {
      if (typeof element.children[i] === "object")
        console.log("TODO: Handle element children re-render")
      else
        if (dom.childNodes[i].nodeValue !== element.children[i])
          dom.childNodes[i].nodeValue = element.children[i];
    }
  }
}

export const lucid = new Lucid();