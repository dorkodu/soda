import { JSX } from "./jsx";

export interface SodaElement {
  tag: string | ((attrs: SodaAttributes) => SodaElement),
  attrs: SodaAttributes;
  children: string | any[];
}

export interface SodaComponent {
  attrs: SodaAttributes,
  update: () => void,
  __dom: HTMLElement,
  __element: SodaElement,
  __children: number[],
  __hooks: any[],
  __hookId: number
}

export type SodaAttributes = { [key: string]: any };

class SodaClass {
  private components: { [key: number]: SodaComponent } = {};
  private currentComponent!: SodaComponent;
  private id: number = 0;

  private work: { cb: () => void, hookId: number }[] = [];

  state(value: any, cb?: (prev: any, next: any) => boolean) {
    const component = this.currentComponent;

    component.__hooks[component.__hookId] = component.__hooks[component.__hookId] || value;
    const id = component.__hookId;
    const setState = (state: any, dontUpdate?: boolean) => {
      const oldState = component.__hooks[id];
      component.__hooks[id] = state;

      if (!dontUpdate) {
        if (cb) {
          if (!cb(oldState, state)) component.update();
        }
        else {
          component.update();
        }
      }

      return state;
    };
    return [component.__hooks[component.__hookId++], setState];
  }

  effect(cb: () => (() => void) | void, deps: any[]) {
    const component = this.currentComponent;

    if (!component.__dom) {
      this.work.push({
        cb: () => { this.effect(cb, deps); },
        hookId: component.__hookId++
      });

      return;
    }

    const hookDeps = component.__hooks[component.__hookId];
    const changed = hookDeps?.deps ? !deps.every((dep, i) => dep === hookDeps.deps[i]) : true;

    if (!deps || changed) {
      // If a cleanup function exists, call it
      if (typeof component.__hooks[component.__hookId]?.cleanup === "function")
        component.__hooks[component.__hookId].cleanup();

      // Dependencies should be set before the callback is called
      component.__hooks[component.__hookId] = {};
      component.__hooks[component.__hookId].deps = deps;
      component.__hooks[component.__hookId].cleanup = cb();
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

  render(element: JSX.Element, dom: HTMLElement) {
    if (typeof element.tag === "function") {
      const component: SodaComponent = {
        attrs: element.attrs,
        update: () => {
          if (typeof element.tag === "function") {
            const previousComponent = this.currentComponent;
            this.currentComponent = component;

            component.__hookId = 0;
            const newElement = element.tag(component.attrs);
            this._update(component.__dom, newElement, component.__element, component)
            component.__element = newElement;

            this.currentComponent = previousComponent;
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
      this._render(dom, (component.__element = element.tag(component.attrs)), component, { svg: false, parent: true });

      // Work should be processed before current component is set back to previous component
      this.processWork();

      this.currentComponent = previousComponent;

      return id;
    }
  }

  private _render(dom: HTMLElement, element: SodaElement | SodaElement[], component: SodaComponent, options: { svg: boolean, parent: boolean }) {
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
        this.setDomAttribute(elem, key, element.attrs[key], undefined);
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

    const processed: { [key: string]: boolean } = {};

    for (let key in oldElement?.attrs) {
      if (key.startsWith("on")) {
        if (oldElement.attrs && oldElement.attrs[key]) {
          dom.removeEventListener(key.substring(2).toLowerCase(), oldElement.attrs[key], { capture: true });
        }
        if (element.attrs && element.attrs[key]) {
          processed[key] = true;
          dom.addEventListener(key.substring(2).toLowerCase(), element.attrs[key], { capture: true })
        }
      }
      else {
        if (element?.attrs[key]) {
          processed[key] = true;
          this.setDomAttribute(dom, key, element.attrs[key], oldElement.attrs[key]);
        } else {
          this.removeDomAttribute(dom, key);
        }
      }
    }

    for (let key in element?.attrs) {
      if (processed[key]) continue;

      if (key.startsWith("on")) {
        if (element.attrs && element.attrs[key]) {
          dom.addEventListener(key.substring(2).toLowerCase(), element.attrs[key], { capture: true })
        }
      }
      else {
        this.setDomAttribute(dom, key, element.attrs[key], undefined);
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
        component.__children.push(this.render(element.children[i], container) as number);

        if (dom.childNodes[i] === undefined) {
          dom.appendChild(container.firstChild as HTMLElement);
        }
        else {
          dom.replaceChild(container.firstChild as HTMLElement, dom.childNodes[i]);
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
            if (typeof newarr[newCursor].tag === "function") {
              this.components[component.__children[oldCursor]].attrs = newarr[newCursor].attrs;
              this.components[component.__children[oldCursor]].update();
            }
            else {
              let target: HTMLElement = current[oldarr[oldCursor].attrs.key];
              this._update(target, newarr[newCursor], oldarr[oldCursor], component);
            }

            ++oldCursor;
            ++newCursor;
          }
          else if (oldarr[oldCursor] && newarr[newCursor]) {
            let target: HTMLElement = current[oldarr[oldCursor].attrs.key];
            const container = document.createElement("div");
            if (typeof newarr[newCursor].tag === "function")
              component.__children.push(this.render(newarr[newCursor], container) as number);
            else
              this._render(container, newarr[newCursor], component, { svg: false, parent: false });

            dom.insertBefore(container.firstChild as HTMLElement, target);

            ++newCursor;
          }
          else if (!oldarr[oldCursor] && newarr[newCursor]) {
            const container = document.createElement("div");
            if (typeof newarr[newCursor].tag === "function")
              component.__children.push(this.render(newarr[newCursor], container) as number);
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

    this.removeChildren(component, false);
  }

  private removeChildren(component: SodaComponent, removeWithoutCheck: boolean) {
    for (let i = 0; i < component.__children.length; ++i) {
      // If DOM of the component doesn't have a parent, it's removed
      if (removeWithoutCheck || !this.components[component.__children[i]].__dom.parentNode) {
        this.removeChildren(this.components[component.__children[i]], true);
        delete this.components[component.__children[i]];
        component.__children.splice(i--, 1);
      }
    }
  }

  private setDomAttribute(dom: HTMLElement, key: string, value: any, oldValue: any) {
    switch (key) {
      case "key":
        break;
      case "ref":
        value.dom = dom;
        break;
      case "":
        break;
      case "style":
        for (const styleKey in value) {
          dom.style.setProperty(styleKey, value[styleKey]);
        }
        break;
      default:
        if (value !== oldValue)
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
      case "style":
        break;
      default:
        dom.removeAttribute(key);
        break;
    }
  }

  private processWork() {
    for (let i = 0; i < this.work.length; ++i) {
      this.currentComponent.__hookId = this.work[i].hookId;
      this.work[i].cb();
    }

    this.work = [];
  }
}

export const Soda = new SodaClass();