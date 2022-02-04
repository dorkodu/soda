interface SodaElement {
  tag: string | ((component: any) => SodaElement),
  attrs: SodaAttributes;
  children: string | any[];
}

interface SodaComponent {
  attrs: SodaAttributes,
  update: () => void,
  __dom: HTMLElement,
  __element: SodaElement,
  __children: number[],
  __hooks: any[],
  __hookId: number
}

type SodaAttributes = { [key: string]: any };

class Soda {
  private components: { [key: number]: SodaComponent } = {};
  private currentComponent!: SodaComponent;
  private id: number = 0;

  state(value: any) {
    const component = this.currentComponent;

    component.__hooks[component.__hookId] = component.__hooks[component.__hookId] || value;
    const id = component.__hookId;
    const setState = (state: any, dontUpdate?: boolean) => {
      component.__hooks[id] = state;
      if (!dontUpdate) component.update();
      return state;
    };
    return [component.__hooks[component.__hookId++], setState];
  }

  effect(cb: () => (() => void) | void, deps: any[]) {
    const component = this.currentComponent;

    const hookDeps = component.__hooks[component.__hookId];
    const changed = hookDeps ? !deps.every((dep, i) => dep === hookDeps[i]) : true;

    if (!deps || changed) {
      cb();
      component.__hooks[component.__hookId] = deps;
    }

    ++component.__hookId;
  }

  ref() {
    return this.state({ dom: undefined })[0];
  }

  private createElement(
    tag: string | ((component: any) => SodaElement),
    attrs: { [key: string]: any },
    ...children: any
  ): SodaElement {
    return { tag, attrs, children };
  }

  render(element: SodaElement, dom: HTMLElement) {
    if (typeof element.tag === "function") {
      const component: SodaComponent = {
        attrs: element.attrs,
        update: () => {
          if (typeof element.tag === "function") {
            //console.time("a")

            const previousComponent = this.currentComponent;
            this.currentComponent = component;

            component.__hookId = 0;
            const newElement = element.tag(component);
            this._update(component.__dom, newElement, component.__element, component)
            component.__element = newElement;

            this.currentComponent = previousComponent;

            //console.timeEnd("a")
          }
        },
        __dom: undefined as unknown as HTMLElement,
        __element: undefined as unknown as SodaElement,
        __children: [],
        __hooks: [],
        __hookId: 0
      };

      const previousComponent = this.currentComponent;
      this.currentComponent = component;

      const id = this.id++;
      this.components[id] = component;
      this._render(dom, (component.__element = element.tag(component)), component, { svg: false, parent: true });

      this.currentComponent = previousComponent;

      return id;
    }
  }

  private _render(dom: HTMLElement, element: SodaElement, component: SodaComponent, options: { svg: boolean, parent: boolean }) {
    if (Array.isArray(element)) {
      for (let i = 0; i < element.length; ++i) {
        if (typeof element[i].tag === "function") { component.__children.push(this.render(element[i], dom) as number); }
        else { this._render(dom, element[i], component, options); }
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

    if (options.parent) { component.__dom = elem; options.parent = false; }

    for (let key in element.attrs) {
      if (key.startsWith("on")) {
        elem.addEventListener(key.substring(2).toLowerCase(), element.attrs[key], { capture: true })
      }
      else {
        this.setDomAttribute(elem, key, element.attrs[key]);
      }
    }

    for (let i = 0; i < element.children.length; ++i) {
      if (typeof element.children[i].tag === "function") {
        component.__children.push(this.render(element.children[i], elem) as number);
      }
      else if (typeof element.children[i] === "object") {
        this._render(elem, element.children[i], component, options);
      }
      else {
        elem.appendChild(document.createTextNode(element.children[i]));
      }
    }

    dom.appendChild(elem);
  }

  private _update(dom: HTMLElement, element: SodaElement, oldElement: SodaElement, component: SodaComponent) {
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
        this.removeDomAttribute(dom, key);
      }
    }

    for (let key in element?.attrs) {
      if (key.startsWith("on")) {
        if (element.attrs && element.attrs[key]) {
          dom.addEventListener(key.substring(2).toLowerCase(), element.attrs[key], { capture: true })
        }
      }
      else {
        this.setDomAttribute(dom, key, element.attrs[key]);
      }
    }

    for (let i = 0; i < element.children.length || i < dom.childNodes.length; ++i) {
      // Remove the excess amount of children
      if (element.children[i] === undefined) {
        dom.removeChild(dom.childNodes[i--]);
        continue;
      }

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
            if (typeof newarr[newCursor].tag === "function")
              this.render(newarr[newCursor], container);
            else
              this._render(container, newarr[newCursor], component, { svg: false, parent: false });

            dom.insertBefore(container.firstChild as HTMLElement, target);

            ++newCursor;
          }
          else if (!oldarr[oldCursor] && newarr[newCursor]) {
            const container = document.createElement("div");
            if (typeof newarr[newCursor].tag === "function")
              this.render(newarr[newCursor], container);
            else
              this._render(container, newarr[newCursor], component, { svg: false, parent: false });
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

        this._update(dom.childNodes[i] as HTMLElement, element.children[i], oldElement.children[i], component);
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

    for (let i = 0; i < component.__children.length; ++i) {
      // If DOM of the component doesn't have a parent, it's removed
      if (!this.components[component.__children[i]].__dom.parentNode) {
        component.__children.splice(i--, 1);
        delete this.components[component.__children[i]];
      }
    }
  }

  private setDomAttribute(dom: HTMLElement, key: string, value: any) {
    switch (key) {
      case "key":
        break;
      case "ref":
        value.dom = dom;
        break;
      case "":
        break;
      default:
        dom.setAttribute(key, value);
        break;
    }
  }

  private removeDomAttribute(dom: HTMLElement, key: string) {
    switch (key) {
      case "key":
        break;
      case "ref":
        break;
      case "":
        break;
      default:
        dom.removeAttribute(key);
        break;
    }
  }
}

export const soda = new Soda();