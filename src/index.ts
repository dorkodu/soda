import { translate } from "./translation";

interface Component extends ComponentProperties {
  id: number;
}

interface InternalComponent {
  id: number;
  key: number | string;

  state?: () => any;
  attributes?: () => any;

  methods?: { [key: string]: (...args: any[]) => any };
  hooks?: Hooks;
  watch?: { [key: string]: (oldValue: any, newValue: any) => void };

  refs: { [key: string]: HTMLElement };
  children: { id: number; key: number | string }[];
  dom: HTMLElement;
  
  setState: (value: any | ((state: any) => any)) => void;
}

interface ComponentProperties {
  state?: () => any;
  attributes?: () => any;
  methods?: { [key: string]: (...args: any[]) => any };
  render: () => LucidElement;
  hooks?: Hooks;
  watch?: { [key: string]: (oldValue: any, newValue: any) => void };
}

interface LucidElement {
  tag: keyof HTMLElementTagNameMap;
  attrs: { [key: string]: any };
  children: string | any[];
}

interface Hooks {
  created?: () => void;
  connected?: () => void;
  disconnected?: () => void;
  updated?: () => void;
}

class Lucid {
  private components: Component[] = [];
  private instances: {[key: number | string]: InternalComponent}[] = [];
  private id: number = 0;

  createElement(
    tag: keyof HTMLElementTagNameMap,
    attrs: { [key: string]: any }, 
    ...children: any
  ): LucidElement {
    return { tag, attrs, children };
  } 

  component(props: ComponentProperties) {
    this.components[this.id] = { id: this.id, ...props }
    this.instances[this.id] = {};
    
    return this.components[this.id++];
  }

  render(
    dom: HTMLElement, 
    component: Component, 
    key: number | string, 
    attributes?: any, 
    options?: {first: boolean, last: boolean, index: number}
  ) {
    const self = this;
    
    this.instances[component.id][key] = {
      id: component.id,
      key: key,
      attributes: attributes || component.attributes && component.attributes(),
      state: component.state && component.state(),
      methods: {},
      watch: {},
      hooks: {},
      refs: {},
      children: [],
      dom: undefined as unknown as HTMLElement,
      setState: function (value) {
        if (typeof value === "function") 
          self.instances[component.id][key].state = value(self.instances[component.id][key]);
        else if (typeof value === "object")
          self.instances[component.id][key].state = value;
          
        self.updateComponent(this.dom, self.components[component.id].render.apply(self.instances[component.id][key]), component.id, key, {parent:true});

        // Call "updated" hook if exists
        const instance = self.instances[component.id][key] as any;
        instance.h_updated && instance.h_updated()
      }
    };

    const instance = this.instances[component.id][key] as any;
    const methods = this.components[component.id].methods as any;
    const watch = this.components[component.id].watch as any;
    const hooks = this.components[component.id].hooks as any;

    for (const methodKey in methods) {
      instance["m_" + methodKey] = methods[methodKey];
      instance.methods[methodKey] = (...args: any[]) => instance["m_" + methodKey](...args);
    }
    for (const watchKey in watch) {
      instance["w_" + watchKey] = watch[watchKey];
      instance.watch[watchKey] = (...args: any[]) => instance["w_" + watchKey](...args);
    }
    for (const hooksKey in hooks) {
      instance["h_" + hooksKey] = hooks[hooksKey];
      instance.hooks[hooksKey] = (...args: any[]) => instance["h_" + hooksKey](...args);
    }

     // Find the parent of the current component that's being rendered
    let parentNode: HTMLElement | null = dom;
    while (parentNode) {
      const parentId = dom.getAttribute("lucid-id") as number | null;
      const parentKey = dom.getAttribute("lucid-key");
      if (parentId && parentKey) {
        this.instances[parentId][parentKey].children.push({ id: component.id, key: key });
        break;
      }
      parentNode = parentNode.parentElement;
    }

     // Call "created" hook if exists
    instance.h_created && instance.h_created();

    let elem = document.createElement("div") as HTMLElement;
    this.connectComponent(elem, this.components[component.id].render.apply(this.instances[component.id][key]), component.id, key, {svg: false});
    elem = elem.firstChild as HTMLElement;

    // Render the component to the appropriate position
    if (!options) {
      dom.appendChild(elem);
    } else {
      if (options.first) {
        if (dom.firstChild) dom.insertBefore(elem, dom.firstChild);
        else dom.appendChild(elem);
      } else if (options.index) {
        dom.insertBefore(elem, dom.children[options.index])
      }
      else {
        dom.appendChild(elem)
      }
    }

    // Set 2 lucid attributes, "lucid-id" and "lucid-key"
    elem.setAttribute("lucid-id", component.id as unknown as string);
    elem.setAttribute("lucid-key", key as string);

    // Set the dom of the element, since it has been connected
    instance.dom = elem;

    // Call "connected" hook if exists
    instance.h_connected && instance.h_connected();
  }

  remove(identifier: Component | number, key: number | string) {
    const id = typeof identifier === "number" ? identifier : identifier.id;
    const dom = this.instances[id][key].dom;

    // Remove the component from the DOM
    dom.parentNode!.removeChild(dom);

    // Remove all children components
    const childrenCount = this.instances[id][key].children.length;
    for (let i = 0; i < childrenCount; ++i) {
      const child = this.instances[id][key].children[i];
      this.remove(child.id, child.key);
    }

    // Call "disconnected" hook if exists
    const instance = this.instances[id][key] as any;
    instance.h_disconnected && instance.h_disconnected();

    // Delete it from the elements
    delete this.instances[id][key];
  }

  connectComponent(
    dom: HTMLElement, 
    element: LucidElement, 
    id: number, 
    key: number | string, 
    settigs: {svg: boolean}
  ) {
    // Get 2 lucid attributes, "lucid-id" and "lucid-key"
    const lucidId = element.attrs && element.attrs["lucid-id"];
    const lucidKey = element.attrs && element.attrs["lucid-key"];

    // If component id and key are present in the node, it's a lucid component
    if (lucidId && lucidKey) {
      // Render the component into a container
      const container = document.createElement("div") as HTMLElement;
      this.render(container, this.components[lucidId], lucidKey);

      // Key might be a variable(state, attributes or methods), so convert it's text to variable
      container.firstElementChild?.setAttribute("lucid-key", lucidKey);

      // Append the component in the container to the DOM
      dom.appendChild(container.firstElementChild as Node);
      return;
    }

    let elem: HTMLElement;

    // Fix for svg's, they won't show up if not created with createElementNS
    if (settigs.svg || element.tag as string === "svg") {
      elem = document.createElementNS("http://www.w3.org/2000/svg", element.tag) as unknown as HTMLElement;
      settigs.svg = true;
    }
    else {
      elem = document.createElement(element.tag);
    }

    for (const key in element.attrs) {
      if (key.startsWith("on")) {
        elem.addEventListener(key.substring(2).toLowerCase(), (ev) => { element.attrs[key](ev); });
      }
      else {
        elem.setAttribute(translate(key), element.attrs[key]);
      }
    }
    
    for (let i = 0; i < element.children.length; ++i) {
      if (typeof element.children[i] === "object") {
        this.connectComponent(elem, element.children[i], id, key, settigs);
      } 
      else {
        elem.appendChild(document.createTextNode(element.children[i]));
      }
    }

    dom.appendChild(elem);

    // Get "lucid-ref" attribute, if exists, set the ref of the dom on the element
    const ref = elem.getAttribute("lucid-ref");
    if (ref) this.instances[id][key].refs[ref] = elem;
  }

  updateComponent(
    dom: HTMLElement, 
    element: LucidElement, 
    id: number, 
    key: number | string, 
    options: {parent: boolean}
  ) {
    if (typeof element !== "object") {
      if (element !== dom.nodeValue) dom.nodeValue = element;
      return;
    }

    for (const key in element.attrs) {
      // Only change the attributes that are not functions,
      // because only {{state.*}} attributes can change
      if (!key.startsWith("on")) {
        const result = translate(key);
        if (dom.getAttribute(result) !== element.attrs[key] && element.attrs[key] !== "") 
          dom.setAttribute(result, element.attrs[key]);
      }
    }

    let childrenId = 0;
    const childNodes = Array.from(dom.childNodes);
    for (let i = 0, skeletonId = 0; i < childNodes.length; ++i, ++skeletonId) {
      if (childNodes[i].nodeType === document.ELEMENT_NODE) {
        if (!options.parent && dom.children.length > childrenId
          && dom.children[childrenId].getAttribute("lucid-id")
          && dom.children[childrenId].getAttribute("lucid-key")) {
          skeletonId--;
          childrenId++;
          continue;
        }
        childrenId++;
      }

      // Check also if there is a skeleton for the dom child
      if (element.children[skeletonId]) {
        this.updateComponent(childNodes[i] as HTMLElement, element.children[skeletonId], id, key, {parent: false});
      }
    }
  }
}

export const lucid = new Lucid();