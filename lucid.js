/**
 * @typedef {object} Component
 * @property {number} id
 * @property {() => any} attributes 
 * @property {() => any} state 
 * @property {Object<string, function>} methods 
 * @property {Hooks} hooks 
 * @property {Object<string, (oldValue: any, newValue: any) => any} watch 
 * @property {Skeleton} skeleton
 * @property {() => string} render 
 */

/**
 * @typedef {object} ComponentProperties
 * @property {() => any} attributes 
 * @property {() => any} state 
 * @property {Object<string, function>} methods 
 * @property {() => string} render 
 * @property {Hooks} hooks 
 * @property {Object<string, (oldValue: any, newValue: any) => any} watch 
 */

/**
 * @typedef {object} Hooks
 * @property {Function} [created]
 * @property {Function} [connected]
 * @property {Function} [disconnected] 
 * @property {Function} [updated]
 */

/**
 * @typedef {object} Skeleton
 * 
 * @property {string} tag
 * @property {Object.<string, string>} attrs
 * @property {Skeleton[]} children
 */

class Lucid {
  constructor() {
    const self = this;

    let components = {};
    let componentId = 0;
    let elements = [];

    /**
     * 
     * @param {ComponentProperties} props 
     * @returns 
     */
    this.component = function (props) {
      components[componentId] = {
        id: componentId,
        attributes: props.attributes,
        state: props.state,
        methods: props.methods,
        hooks: props.hooks,
        watch: props.watch,
        skeleton: undefined,
        render: props.render
      };

      // Initialize component in the elements array
      elements[componentId] = {};

      return components[componentId++];
    }

    /**
     * 
     * @param {HTMLElement} dom 
     * @param {Component} component 
     * @param {number} key 
     * @param {object} [attributes] 
     * @param {{first: boolean, last: boolean, index: number}} [settings] 
     */
    this.render = function (dom, component, key, attributes, settings) {
      // Check if component has it's skeleton created, if not, create it's skeleton
      if (!components[component.id].skeleton) {
        const elem = document.createElement("div");
        elem.innerHTML = sanitize(components[component.id].render());
        components[component.id].skeleton = createSkeleton(elem.firstElementChild);
      }

      elements[component.id][key] = {
        id: component.id,
        key: key,
        state: components[component.id].state && components[component.id].state(),
        attributes: components[component.id].attributes && components[component.id].attributes(),
        methods: {},
        watch: {},
        hooks: {},
        refs: {},
        children: [],
        dom: undefined,
        setState: function (value) {
          if (typeof value === "function")
            this.state = value(this.state);
          else if (typeof value === "object")
            this.state = value;

          updateComponent(this.dom, components[this.id].skeleton, this.id, this.key, true);

          // Call "updated" hook if exists
          elements[component.id][key].h_updated && elements[component.id][key].h_updated()
        }
      };

      for (const methodKey in components[component.id].methods) {
        elements[component.id][key]["m_" + methodKey] = components[component.id].methods[methodKey];
        elements[component.id][key].methods[methodKey] = (...args) => elements[component.id][key]["m_" + methodKey](...args);
      }
      for (const watchKey in components[component.id].watch) {
        elements[component.id][key]["w_" + watchKey] = components[component.id].watch[watchKey];
        elements[component.id][key].watch[watchKey] = (...args) => elements[component.id][key]["w_" + watchKey](...args);
      }
      for (const hooksKey in components[component.id].hooks) {
        elements[component.id][key]["h_" + hooksKey] = components[component.id].hooks[hooksKey];
        elements[component.id][key].hooks[hooksKey] = (...args) => elements[component.id][key]["h_" + hooksKey](...args);
      }

      // Find the parent of the current component that's being rendered
      let parentNode = dom;
      while (parentNode) {
        const parentId = dom.getAttribute("lucid-id");
        const parentKey = dom.getAttribute("lucid-key");
        if (parentId && parentKey) {
          elements[parentId][parentKey].children.push({ id: component.id, key: key });
          break;
        }
        parentNode = parentNode.parentElement;
      }

      // Over-write the default attributes if provided
      if (attributes) elements[component.id][key].attributes = attributes;

      // Call "created" hook if exists
      elements[component.id][key].h_created && elements[component.id][key].h_created();

      let elem = document.createElement("div");
      connectComponent(elem, components[component.id].skeleton, component.id, key, false);
      elem = elem.firstChild;

      // Render the component to the appropriate position
      if (!settings) {
        dom.appendChild(elem);
      } else {
        if (settings.first) {
          if (dom.firstChild) dom.insertBefore(elem, dom.firstChild);
          else dom.appendChild(elem);
        } else if (settings.index) {
          dom.insertBefore(elem, dom.children[settings.index])
        }
        else {
          dom.appendChild(elem)
        }
      }

      // Set 2 lucid attributes, "lucid-id" and "lucid-key"
      elem.setAttribute("lucid-id", component.id);
      elem.setAttribute("lucid-key", key);

      // Set the dom of the element, since it has been connected
      elements[component.id][key].dom = elem;

      // Call "connected" hook if exists
      elements[component.id][key].h_connected && elements[component.id][key].h_connected();
    }

    /**
     * 
     * @param {Component} component 
     * @param {number} key 
     */
    this.remove = function (component, key) {
      const id = component.id;
      const dom = elements[id][key].dom;

      // Remove the component from the DOM
      dom.parentNode.removeChild(dom);

      // Remove all children components
      const childrenCount = elements[id][key].children.length;
      for (let i = 0; i < childrenCount; ++i) {
        const child = elements[id][key].children[i];
        remove(child.id, child.key);
      }

      // Call "disconnected" hook if exists
      elements[id][key].h_disconnected && elements[id][key].h_disconnected();

      // Delete it from the elements
      delete elements[id][key];
    }

    /**
     * 
     * @param {HTMLElement} dom 
     * @param {Skeleton | string} skeleton 
     * @param {number} componentId 
     * @param {number} componentKey 
     * @returns 
     */
    function connectComponent(dom, skeleton, componentId, componentKey, isSvg) {
      // Get 2 lucid attributes, "lucid-id" and "lucid-key"
      const lucidId = typeof skeleton !== "string" && skeleton.attrs["lucid-id"];
      const lucidKey = typeof skeleton !== "string" && skeleton.attrs["lucid-key"];

      // If component id and key are present in the node, it's a lucid component
      if (lucidId && lucidKey) {
        // Render the component into a container
        const container = document.createElement("div");
        self.render(container, components[lucidId], lucidKey);

        // Key might be a variable(state, attributes or methods), so convert it's text to variable
        container.firstElementChild.setAttribute("lucid-key", convertTextVariables(lucidKey, componentId, componentKey));

        // Append the component in the container to the DOM
        dom.appendChild(container.firstElementChild);
        return;
      }

      // If skeleton is a string, it's a text node that is the only child
      if (typeof skeleton === "string") {
        const textNode = document.createTextNode(convertTextVariables(skeleton, componentId, componentKey, false));
        dom.appendChild(textNode);
        return;
      }

      /** @type {HTMLElement} */
      let elem;

      // Fix for svg's, they won't show up if not created with createElementNS
      if (isSvg || skeleton.tag === "svg") {
        elem = document.createElementNS("http://www.w3.org/2000/svg", skeleton.tag);
        isSvg = true;
      }
      else {
        elem = document.createElement(skeleton.tag);
      }

      for (const key in skeleton.attrs) {
        let result;

        if (key.startsWith("on")) {
          result = convertTextVariables(skeleton.attrs[key], componentId, componentKey, true);
          elem.addEventListener(key.substr(2), (ev) => { result(ev); });
        }
        else {
          result = convertTextVariables(skeleton.attrs[key], componentId, componentKey, false);
          elem.setAttribute(desanitize(key), result);
        }
      }

      for (let i = 0; i < skeleton.children.length; ++i)
        connectComponent(elem, skeleton.children[i], componentId, componentKey, isSvg);

      dom.appendChild(elem);

      // Get "lucid-ref" attribute, if exists, set the ref of the dom on the element
      const ref = elem.getAttribute("lucid-ref");
      if (ref) elements[componentId][componentKey].refs[ref] = elem;
    }

    /**
     * 
     * @param {HTMLElement} dom 
     * @param {Skeleton | string} skeleton 
     * @param {number} componentId 
     * @param {number} componentKey 
     * @returns 
     */
    function updateComponent(dom, skeleton, componentId, componentKey, isParent) {
      if (typeof skeleton === "string") {
        const result = convertTextVariables(skeleton, componentId, componentKey);
        if (result !== dom.nodeValue) dom.nodeValue = result;
        return;
      }

      for (const key in skeleton.attrs) {
        // Only change the attributes that are not functions,
        // because only {{state.*}} attributes can change
        if (!key.startsWith("on")) {
          const result = convertTextVariables(skeleton.attrs[key], componentId, componentKey);
          if (dom.getAttribute(key) !== result) dom.setAttribute(key, result);
        }
      }

      let childrenId = 0;
      const childNodes = Array.from(dom.childNodes);
      for (let i = 0, skeletonId = 0; i < childNodes.length; ++i, ++skeletonId) {
        if (childNodes[i].nodeType === document.ELEMENT_NODE) {
          if (!isParent && dom.children.length > childrenId
            && dom.children[childrenId].getAttribute("lucid-id")
            && dom.children[childrenId].getAttribute("lucid-key")) {
            skeletonId--;
            childrenId++;
            continue;
          }
          childrenId++;
        }

        // Check also if there is a skeleton for the dom child
        if (skeleton.children[skeletonId]) {
          updateComponent(childNodes[i], skeleton.children[skeletonId], componentId, componentKey, false);
        }
      }
    }

    /**
     * 
     * @param {Component} component 
     * @param {number} key 
     * @returns 
     */
    this.instance = function (component, key) {
      return {
        attribute: function (attribute, value) {
          if (value) {
            const oldValue = elements[component.id][key].attributes[attribute];
            elements[component.id][key].attributes[attribute] = value;

            // Call watch function of the attribute if exists
            elements[component.id][key]["w_" + attribute] && elements[component.id][key]["w_" + attribute](oldValue, value);
          } else {
            return elements[component.id][key].attributes[attribute];
          }
        }
      };
    }

    /**
     * 
     * @param {HTMLElement} child 
     * @returns 
     */
    function createSkeleton(child) {
      if (child.nodeType !== Node.ELEMENT_NODE) {
        const nodeValue = child.nodeValue.trim();

        if (nodeValue !== "")
          return nodeValue;

        return undefined;
      }

      const skeleton = {
        tag: child.tagName,
        attrs: {},
        children: []
      };

      // Set attributs of the html element
      for (let i = 0; i < child.attributes.length; ++i)
        skeleton.attrs[child.attributes[i].name] = child.attributes[i].value;

      // Loop through all child nodes of the html element, if not empty, add on to the children array
      const childNodes = Array.from(child.childNodes);
      for (let i = 0; i < childNodes.length; ++i) {
        const childSkeleton = createSkeleton(childNodes[i]);

        if (childSkeleton)
          skeleton.children.push(childSkeleton);
      }

      return skeleton;
    }

    /**
     * 
     * @param {string} text 
     * @param {number} id 
     * @param {number} key 
     * @param {boolean} isEvent 
     * @returns 
     */
    function convertTextVariables(text, id, key, isEvent) {
      let variables = [];

      let startIndex = text.indexOf("{{", 0);
      let endIndex = text.indexOf("}}", startIndex + 2);

      while (startIndex !== -1 && endIndex !== -1) {
        variables.push(text.substring(startIndex + 2, endIndex));

        startIndex = text.indexOf("{{", endIndex + 2);
        endIndex = text.indexOf("}}", startIndex + 2);
      }

      if (variables.length === 0) return text;

      for (let i = 0; i < variables.length; ++i) {
        const properties = variables[i].split(".");

        if (properties[0] === "attributes" || properties[0] === "state") {
          let tempObj = elements[id][key];
          for (let j = 0; j < properties.length; ++j)
            tempObj = tempObj[properties[j]];

          text = text.replace("{{" + variables[i] + "}}", tempObj);
        }
        else if (properties[0] === "methods") {
          if (isEvent)
            return elements[id][key]["m_" + properties[1]].bind(elements[id][key]);
          else
            return elements[id][key]["m_" + properties[1]]();
        }
      }

      return text;
    }

    /**
     * 
     * @param {string} string 
     * @returns 
     */
    function sanitize(string) {
      return string.replace("src=", "srcname=");
    }

    /**
     * 
     * @param {string} string 
     * @returns 
     */
    function desanitize(string) {
      return string.replace("srcname", "src");
    }
  }
}

export const lucid = new Lucid();