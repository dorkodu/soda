import { translate } from "./translation";

interface LucidElement {
  tag: keyof HTMLElementTagNameMap | ((component: any) => LucidElement),
  attrs: { [key: string]: any };
  children: string | any[];
}

class Lucid {
  private component: any;

  local(value: any) {
    const component = this.component;

    return [
      component.state || value,
      (value: any) => { component.state = value; component.update(); }
    ]
  }

  private createElement(
    tag: keyof HTMLElementTagNameMap | ((component: any) => LucidElement),
    attrs: { [key: string]: any },
    ...children: any
  ): LucidElement {
    for (let i = 0; i < children.length; ++i) {
      if (Array.isArray(children[i]))
        children.splice(i, 1, ...children[i]);
    }
    return { tag, attrs, children };
  }

  render(dom: HTMLElement, element: LucidElement) {
    if (typeof element.tag === "function") {
      const component = {
        attrs: element.attrs,
        update: () => {
          if (typeof element.tag === "function") {
            console.time("a")

            const oldComponent = this.component;
            this.component = component;

            const newElement = element.tag(component);
            this._update(component.__dom, newElement, component.__element)
            component.__element = newElement;

            this.component = oldComponent;

            console.timeEnd("a")
          }
        },
        __dom: undefined as unknown as HTMLElement,
        __element: undefined as unknown as LucidElement
      };
      const oldComponent = this.component;
      this.component = component;

      this._render(dom, (component.__element = element.tag(component)), component);

      this.component = oldComponent;
    }
  }

  private _render(dom: HTMLElement, element: LucidElement, component: any) {
    const elem = document.createElement(element.tag as keyof HTMLElementTagNameMap);
    if (component) component.__dom = elem;

    for (const key in element.attrs) {
      if (key.startsWith("on")) {
        elem.addEventListener(key.substring(2).toLowerCase(), element.attrs[key], { capture: true })
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

  private _update(dom: HTMLElement, element: LucidElement, oldElement: LucidElement) {
    if (dom.tagName.toLowerCase() !== element.tag) {
      // TODO: Diff
      console.log("TODO: Diff");
    }

    for (let key in oldElement?.attrs) {
      if (key.startsWith("on")) {
        if (oldElement.attrs && oldElement.attrs[key]) {
          dom.removeEventListener(key.substring(2).toLowerCase(), oldElement.attrs[key], { capture: true });
        }
      }
      else {
        dom.removeAttribute(translate(key));
      }
    }

    for (let key in element?.attrs) {
      if (key.startsWith("on")) {
        if (element.attrs && element.attrs[key]) {
          dom.addEventListener(key.substring(2).toLowerCase(), element.attrs[key], { capture: true })
        }
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
        this._update(dom.childNodes[i] as HTMLElement, element.children[i], oldElement.children[i]);
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