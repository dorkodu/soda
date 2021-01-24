export const Lucid = {
  createComponent: createComponent,
  createPage: createPage,
  createApp: createApp,
  /** @type {App} */
  app: {}
};

/**
 * @typedef {object} App
 * 
 * @property {Page} page
 * @property {Object.<string, Component>} components
 * @property {(containerId: string) => void} run
 */

/** 
 * @typedef {object} Page
 * 
 * @property {string} path
 * @property {string} name
 * @property {object} elements
 * @property {any} payload
 * @property {any} contents
 */

/**
 * @typedef {object} Component
 * 
 * @property {string} name
 * @property {object} state 
 * @property {Function} render 
 * @property {object} methods 
 * @property {any} hooks
 * @property {any} attributes 
 * @property {any} key
 * @property {any} watch 
 */

/**
 * Returns the component that's created from given name and properties.
 * @param {string} name HTML tag name 
 * @param {object} properties
 * @param {object} [properties.state] 
 * @param {object} [properties.methods] 
 * @param {() => string} properties.render
 * @param {any} [properties.hooks]
 * @param {any} [properties.attributes]
 * @param {any} [properties.watch]
 * 
 * @returns {Component} Component
 */
function createComponent(name, properties) {
  return {
    name: name,
    state: properties.state,
    methods: properties.methods,
    render: properties.render,
    hooks: properties.hooks,
    attributes: properties.attributes,
    watch: properties.watch
  };
}

/**
 * Returns the page that's created from given properties.
 * @param {object} properties
 * @param {string} properties.path
 * @param {string} properties.name
 * @param {any} [properties.payload]
 * @param {Function} properties.contents
 * 
 * @returns {Page} Page
 */
function createPage(properties) {
  return {
    path: properties.path,
    name: properties.name,
    elements: {},
    payload: properties.payload,
    contents: properties.contents
  };
}

/**
 * Returns the app that's created from given properties.
 * @param {object} properties 
 * @param {Page} properties.page 
 * @param {{string: Component}} [properties.components]
 * 
 * @returns {App} App
 */
function createApp(properties) {
  Lucid.app = {
    page: properties.page,
    components: properties.components,
    run: function (containerId) {
      // Get the element by id then insert the page contents into it
      this.container = document.getElementById(containerId);
      this.container.innerHTML = this.page.contents();

      // Search lucid components inside the container
      searchComponents(this.container);
    }
  };

  return Lucid.app;
}

/**
 * Searches for the lucid components in the given node's children,
 * if any lucid component with a key is found, saves it's state, methods and
 * DOM element. Renders it on to the screen and then registers any of it's 
 * @param {HTMLElement} node 
 */
function searchComponents(node) {
  node.childNodes.forEach((child) => {
    // "lucid-component" and "lucid-key" only work with HTML elements
    if (child.nodeType !== Node.ELEMENT_NODE)
      return;

    // Get 2 lucid attributes, "lucid-component" and "lucid-key"
    const componentName = child.getAttribute("lucid-component");
    const componentKey = child.getAttribute("lucid-key");

    // If component name and key isn't present in the node, search it's children
    if (!componentName || !componentKey) {
      searchComponents(child);
      return;
    }

    if (!Lucid.app.components[componentName].skeleton) {
      const elem = document.createElement("div");
      elem.innerHTML = Lucid.app.components[componentName].render();
      Lucid.app.components[componentName].skeleton = createSkeleton(elem.firstChild)
    }

    // Save component's state, methods and DOM into lucid for later use
    Lucid.app.page.elements[componentName + componentKey] = {
      state: Lucid.app.components[componentName].state,
      methods: Lucid.app.components[componentName].methods,
      dom: child
    };

    // Render the component then register it's attributes and replace it's text variables
    child.innerHTML = Lucid.app.components[componentName].render();
    registerDom(child, componentName, componentKey);
  });
}

/**
 * Registers a lucid component's attributes and replaces it's text variables
 * @param {HTMLElement} element 
 */
function registerDom(element, componentName, componentKey) {
  element.childNodes.forEach((child) => {
    // Only HTMLElement node's have attributes so if it's anything else, return
    if (child.nodeType !== Node.ELEMENT_NODE)
      return;

    for (let i = 0; i < child.attributes.length; ++i) {
      const attr = child.attributes[i];

      // Some old browsers loop all the attributes, even the empty ones, so check if attr is specified
      if (!attr.specified)
        return;

      // Get the value of the attribute then if it's a string variable, convert it.
      const attrValue = attr.value;
      const result = convertTextVariables(Lucid.app.page.elements[componentName + componentKey], attrValue);

      // If attribute starts with on, it's a event attribute so add it's event listener
      if (attr.name.startsWith("on")) {
        child.addEventListener(attr.name.substr(2),
          () => {
            result
              (
                Lucid.app.page.elements[componentName + componentKey].state,
                (newState) => {
                  // Save the new state
                  Lucid.app.page.elements[componentName + componentKey].state = newState;

                  // Re-render the element
                  const dom = Lucid.app.page.elements[componentName + componentKey].dom;
                  dom.innerHTML = Lucid.app.components[componentName].render();
                  registerDom(dom, componentName, componentKey);
                }
              )
          }
        );

        // Remove the inline attribute and decrease the attribute count by 1
        child.removeAttribute(attr.name);
        --i;
      }
      else {
        // It's a non-event attribute so just replace with the result
        attr.value = result;
      }
    }

    // Convert textContent variables and re-write to the element
    const result = convertTextVariables(Lucid.app.page.elements[componentName + componentKey], child.textContent);
    child.textContent = result;

    // Register all children recursively
    registerDom(child, componentName, componentKey);
  });
}

/**
 * 
 * @param {HTMLElement} child 
 */
function createSkeleton(child) {
  if (child.nodeType !== Node.ELEMENT_NODE) {
    const nodeValue = child.nodeValue.trim();
    if (nodeValue === "")
      return;

    return nodeValue;
  }

  const skeleton = {
    tag: child.tagName,
    attrs: {},
    children: []
  };

  for (let i = 0; i < child.attributes.length; ++i)
    if (child.attributes[i].specified)
      skeleton.attrs[child.attributes[i].name] = child.attributes[i].value;

  for (let i = 0; i < child.childNodes.length; ++i)
    skeleton.children.push(createSkeleton(child.childNodes[i]));

  return skeleton;
}

/**
 * Replaces text variables(e.g. {{state.count}}) with their correct value that's saved in either state or methods.
 * @param {object} obj 
 * @param {string} text
 *
 * @returns {string | Function} Text with the variables replaced or function converted from string variable
 */
function convertTextVariables(obj, text) {
  let startIndex = 0;
  let endIndex = 0;

  while (
    (startIndex = text.indexOf("{{", startIndex)) > -1 &&
    (endIndex = text.indexOf("}}", startIndex + 2))
  ) {
    let variable = text.substring(startIndex + 2, endIndex);

    let properties = variable.split(".");

    let tempObj = obj;
    for (let i = 0; i < properties.length; ++i)
      tempObj = tempObj[properties[i]];

    if (typeof tempObj === "function")
      return tempObj;
    else
      text = text.replace("{{" + variable + "}}", tempObj);

    startIndex = 0;
    endIndex = 0;
  }

  return text;
}