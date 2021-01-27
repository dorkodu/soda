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
 * @property {Skeleton} skeleton
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
 * @property {Skeleton} skeleton
 */

/**
 * @typedef {object} Skeleton
 * 
 * @property {string} tag
 * @property {Object.<string, string>} attrs
 * @property {Skeleton[]} children
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
      // Get the container
      this.container = document.getElementById(containerId);

      const elem = document.createElement("div");
      elem.innerHTML = this.page.contents();

      // Create the skeleton out of the first element node
      for (let i = 0; i < elem.childNodes.length; ++i)
        if (elem.childNodes[i].nodeType === Node.ELEMENT_NODE) {
          this.page.skeleton = createSkeleton(elem.childNodes[i]);
          mountPage(this.container, this.page.skeleton);
          console.log(this.page.skeleton)
          break;
        }
    }
  };

  return Lucid.app;
}

/**
 * 
 * @param {HTMLElement} dom 
 * @param {Skeleton} skeleton 
 * @param {number} elementKey 
 */
function mountComponent(dom, skeleton, elementKey) {
  // If skeleton is a string, it's a text node that is the only child
  if (typeof skeleton === "string") {
    const textNode = document.createTextNode(convertTextVariables(elementKey, skeleton));
    dom.appendChild(textNode);
    return;
  }

  const elem = document.createElement(skeleton.tag);

  for (const key in skeleton.attrs) {
    const result = convertTextVariables(elementKey, skeleton.attrs[key])
    if (key.startsWith("on")) {
      elem.addEventListener(key.substr(2),
        () => {
          result
            (
              Lucid.app.page.elements[elementKey].state,
              (newState) => {
                // Save the new state
                Lucid.app.page.elements[elementKey].state = newState;

                // Re-render the element
                //const dom = Lucid.app.page.elements[componentName + componentKey].dom;
                //dom.innerHTML = Lucid.app.components[componentName].render();
                //registerDom(dom, componentName, componentKey);
              }
            )
        })
    }
    else {
      elem.setAttribute(key, result);
    }
  }

  for (let i = 0; i < skeleton.children.length; ++i)
    mountComponent(elem, skeleton.children[i], elementKey);

  dom.appendChild(elem);
}

/**
 * 
 * @param {HTMLElement} dom 
 * @param {Skeleton} skeleton 
 * @param {number} elementKey 
 */
function updateComponent(dom, skeleton, elementKey) {

}

/**
 * 
 * @param {HTMLElement} dom 
 * @param {Skeleton} skeleton 
 */
function mountPage(dom, skeleton) {
  // If skeleton is a string, it's a text node that is the only child
  if (typeof skeleton === "string") {
    const textNode = document.createTextNode(skeleton);
    dom.appendChild(textNode);
    return;
  }

  const elem = document.createElement(skeleton.tag);

  for (const key in skeleton.attrs)
    elem.setAttribute(key, skeleton.attrs[key]);

  // Get 2 lucid attributes, "lucid-component" and "lucid-key"
  const componentName = elem.getAttribute("lucid-component");
  const componentKey = elem.getAttribute("lucid-key");

  // If component name and key are present in the node, it's a lucid component
  if (componentName || componentKey) {
    if (!Lucid.app.components[componentName].skeleton) {
      const elem = document.createElement("div");
      elem.innerHTML = Lucid.app.components[componentName].render();

      // Create the skeleton out of the first element node
      for (let i = 0; i < elem.childNodes.length; ++i)
        if (elem.childNodes[i].nodeType === Node.ELEMENT_NODE) {
          Lucid.app.components[componentName].skeleton = createSkeleton(elem.childNodes[i]);
          break;
        }

      console.log(Lucid.app.components[componentName].skeleton)
    }

    const elementKey = componentName + componentKey;

    // Save component's state, methods and DOM into lucid for later use
    Lucid.app.page.elements[elementKey] = {
      state: Lucid.app.components[componentName].state,
      methods: Lucid.app.components[componentName].methods,
      dom: elem
    };

    mountComponent(Lucid.app.page.elements[elementKey].dom,
      Lucid.app.components[componentName].skeleton,
      elementKey);
  }

  for (let i = 0; i < skeleton.children.length; ++i)
    mountPage(elem, skeleton.children[i]);

  dom.appendChild(elem);
}

/**
 * 
 * @param {HTMLElement} child 
 * 
 * @returns {Skeleton} Skeleton
 */
function createSkeleton(child) {
  if (child.nodeType !== Node.ELEMENT_NODE) {
    const nodeValue = child.nodeValue.trim();
    if (nodeValue !== "") {
      return nodeValue;
    }

    return null;
  }

  const skeleton = {
    tag: child.tagName,
    attrs: {},
    children: []
  };

  for (let i = 0; i < child.attributes.length; ++i)
    if (child.attributes[i].specified)
      skeleton.attrs[child.attributes[i].name] = child.attributes[i].value;

  for (let i = 0; i < child.childNodes.length; ++i) {
    const childSkeleton = createSkeleton(child.childNodes[i]);

    if (childSkeleton)
      skeleton.children.push(childSkeleton);
  }

  return skeleton;
}

/**
 * Replaces text variables(e.g. {{state.count}}) with their correct value that's saved in either state or methods.
 * @param {string} elementKey 
 * @param {string} text
 *
 * @returns {string | Function} Text with the variables replaced or function converted from string variable
 */
function convertTextVariables(elementKey, text) {
  let startIndex = 0;
  let endIndex = 0;

  while (
    (startIndex = text.indexOf("{{", startIndex)) > -1 &&
    (endIndex = text.indexOf("}}", startIndex + 2))
  ) {
    let variable = text.substring(startIndex + 2, endIndex);

    let properties = variable.split(".");

    let tempObj = Lucid.app.page.elements[elementKey];
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