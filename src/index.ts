interface SodaElement {
  tag: string | ((component: any) => SodaElement),
  attrs: { [key: string]: any };
  children: string | any[];
}

class Soda {
  private createElement(
    tag: string | ((component: any) => SodaElement),
    attrs: { [key: string]: any },
    ...children: any
  ): SodaElement {
    return { tag, attrs, children };
  }

  render(element: SodaElement, dom: HTMLElement) {
    if (typeof element.tag === "function") {
      const component = {
        attrs: element.attrs,
        update: () => {
          if (typeof element.tag === "function") {
            console.time("a")

            const newElement = element.tag(component);
            this._update(component.__dom, newElement, component.__element)
            component.__element = newElement;

            console.timeEnd("a")
          }
        },
        __dom: undefined as unknown as HTMLElement,
        __element: undefined as unknown as SodaElement
      };

      this._render(dom, (component.__element = element.tag(component)), component, { svg: false });
    }
  }

  private _render(dom: HTMLElement, element: SodaElement, component: any, options: { svg: boolean }) {
    if (Array.isArray(element)) {
      for (let i = 0; i < element.length; ++i) {
        if (typeof element[i].tag === "function") { this.render(element[i], dom); }
        else { this._render(dom, element[i], undefined, options); }
      }

      return;
    }

    let elem: HTMLElement;
    if (element.tag === "svg" || options.svg) {
      elem = document.createElementNS("http://www.w3.org/2000/svg", element.tag as string) as unknown as HTMLElement;
      options.svg = true;
    }
    else {
      elem = document.createElement(element.tag as string);
    }

    if (component) component.__dom = elem;

    for (let key in element.attrs) {
      if (key.startsWith("on")) {
        elem.addEventListener(key.substring(2).toLowerCase(), element.attrs[key], { capture: true })
      }
      else {
        if ((key = this.translate(key)) !== "")
          elem.setAttribute(key, element.attrs[key]);
      }
    }


    for (let i = 0; i < element.children.length; ++i) {
      if (typeof element.children[i].tag === "function") {
        this.render(element.children[i], elem);
      }
      else if (typeof element.children[i] === "object") {
        this._render(elem, element.children[i], undefined, options);
      }
      else {
        elem.appendChild(document.createTextNode(element.children[i]));
      }
    }

    dom.appendChild(elem);
  }

  private _update(dom: HTMLElement, element: SodaElement, oldElement: SodaElement) {
    if (dom.tagName.toLowerCase() !== element.tag) {
      const parent = dom.parentNode;
      parent?.removeChild(dom);
      dom = document.createElement(element.tag as string);
      parent?.appendChild(dom);
    }

    for (let key in oldElement?.attrs) {
      if (key.startsWith("on")) {
        if (oldElement.attrs && oldElement.attrs[key]) {
          dom.removeEventListener(key.substring(2).toLowerCase(), oldElement.attrs[key], { capture: true });
        }
      }
      else {
        if ((key = this.translate(key)) !== "")
          dom.removeAttribute(key);
      }
    }

    for (let key in element?.attrs) {
      if (key.startsWith("on")) {
        if (element.attrs && element.attrs[key]) {
          dom.addEventListener(key.substring(2).toLowerCase(), element.attrs[key], { capture: true })
        }
      }
      else {
        if ((key = this.translate(key)) !== "")
          dom.setAttribute(key, element.attrs[key]);
      }
    }

    for (let i = 0; i < element.children.length || i < dom.childNodes.length; ++i) {
      // Remove the excess amount of children
      if (element.children[i] === undefined) { dom.removeChild(dom.childNodes[i--]); continue; }

      if (typeof element.children[i].tag === "function") {
        const container = document.createElement("div");
        this.render(element.children[i], container);

        if (dom.childNodes[i] === undefined) {
          dom.appendChild(container.firstChild as HTMLElement);
        }
        else {
          dom.insertBefore(container.firstChild as HTMLElement, dom.childNodes[i]);
        }
      }
      else if (Array.isArray(element.children[i])) {
        const oldarr = oldElement.children[i];
        const newarr = element.children[i];

        let current: any = {};

        for (let index = 0; index < oldarr.length; ++index)
          current[oldarr[index].attrs.key] = dom.childNodes[index];

        for (let oldCursor = 0, newCursor = 0; oldCursor < oldarr.length || newCursor < newarr.length;) {
          if (oldarr[oldCursor]?.attrs.key === newarr[newCursor]?.attrs.key) {
            ++oldCursor;
            ++newCursor;
          }
          else if (oldarr[oldCursor] && newarr[newCursor]) {
            let target: HTMLElement = current[oldarr[oldCursor].attrs.key];
            const container = document.createElement("div");
            this.render(newarr[newCursor], container);

            dom.insertBefore(container.firstChild as HTMLElement, target);

            ++newCursor;
          }
          else if (!oldarr[oldCursor] && newarr[newCursor]) {
            const container = document.createElement("div");
            this.render(newarr[newCursor], container);
            dom.appendChild(container.firstChild as HTMLElement);

            ++newCursor;
          }
          else if (oldarr[oldCursor] && !newarr[newCursor]) {
            dom.removeChild(current[oldarr[oldCursor].attrs.key]);

            ++oldCursor;
            ++newCursor;
          }
          else {
            ++oldCursor;
            ++newCursor;
          }
        }

        break;
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
        else if (dom.childNodes[i].nodeType !== document.TEXT_NODE) {
          dom.insertBefore(document.createTextNode(element.children[i]), dom.childNodes[i]);
        }
        else if (dom.childNodes[i].nodeValue !== element.children[i]) {
          dom.childNodes[i].nodeValue = element.children[i];
        }
      }
    }
  }

  private translate(key: string) {
    if (key === "key") return "";
    return key;
  }
}

export const soda = new Soda();