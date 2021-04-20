export const Lucid = {
  createComponent: createComponent,
  createApp: createApp
};

const _Lucid = {
  /** @type {Object.<string, Component>} */
  components: {},
  /** @type {{state: object, attributes: object, dom: HTMLElement}} */
  elements: {},
  app: {
    getAttribute: getComponentAttribute,
    setAttribute: setComponentAttribute,
    render: renderComponent,
    remove: disconnectComponent,
    use: use,
    context: {},
    /** @type {HTMLElement} */
    container: null,
  }
};

/**
 * @typedef {object} Component
 * 
 * @property {string} name
 * @property {object} state 
 * @property {() => string} render 
 * @property {Object.<string, Function>} methods 
 * @property {Hooks} hooks
 * @property {object} attributes 
 * @property {Object.<string, Function>} watch 
 * @property {Skeleton} skeleton
 */

/**
 * @typedef {object} Hooks
 * 
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

/**
 * Returns the component that's created from given name and properties.
 * @param {string} name 
 * @param {object} properties
 * @param {object} [properties.state] 
 * @param {object} [properties.attributes]
 * @param {Object.<string, Function>} [properties.methods] 
 * @param {() => string} properties.render
 * @param {Hooks} [properties.hooks]
 * @param {Object.<string, Function>} [properties.watch]
 * 
 * @returns {Component} Component
 */
function createComponent(name, properties) {
  _Lucid.components[name] = {
    name: name,
    state: properties.state,
    methods: properties.methods,
    render: properties.render,
    hooks: properties.hooks,
    attributes: properties.attributes,
    watch: properties.watch,
    skeleton: null
  };

  return _Lucid.components[name];
}

/**
 * Returns the app
 * @param {string} containerId 
 * @returns 
 */
function createApp(containerId) {
  // Get the container
  _Lucid.app.container = document.getElementById(containerId);

  return _Lucid.app;
}

/**
 * 
 * @param {string} key 
 * @param {any} value 
 */
function use(key, value) {
  _Lucid.app.context[key] = value;
}

/**
 * 
 * @param {HTMLElement} dom 
 * @param {string} componentName 
 * @param {string | number} componentKey 
 * @param {object} [attributes] 
 * @param {boolean} [hasOwnContainer]
 */
function renderComponent(dom, componentName, componentKey, attributes, hasOwnContainer) {
  // If the component that is going to be rendered does not have a skeleton yet, create a skeleton for it
  if (!_Lucid.components[componentName].skeleton) {
    const elem = document.createElement("div");

    // Fix bug with src, if src is set, it will request the src and
    // will fail if it's a string variable (e.g. {{state.photoPath}})
    let elemHTML = _Lucid.components[componentName].render();
    elem.innerHTML = elemHTML.replace("src=", "srcName=");

    // Create the skeleton out of the first element node
    const childNodes = Array.from(elem.childNodes);
    for (let i = 0; i < childNodes.length; ++i)
      if (childNodes[i].nodeType === Node.ELEMENT_NODE) {
        _Lucid.components[componentName].skeleton = createSkeleton(childNodes[i], componentName);
        break;
      }
  }

  let elem;
  if (!hasOwnContainer) {
    elem = document.createElement("div");
    elem.setAttribute("lucid-component", componentName);
    elem.setAttribute("lucid-key", componentKey);
  } else {
    elem = dom;
  }

  // Save component's state and DOM into lucid for later use
  _Lucid.elements[componentName + componentKey] = {
    state: _Lucid.components[componentName].state,
    attributes: attributes,
    dom: elem
  };

  // Check if hooks exist, if exist, then call "created" function if exists
  _Lucid.components[componentName].hooks && _Lucid.components[componentName].hooks.created && _Lucid.components[componentName].hooks.created.call(getThisParameter(componentName, componentKey));

  connectComponent(elem, _Lucid.components[componentName].skeleton, componentName, componentKey);
  if (!hasOwnContainer) dom.appendChild(elem);

  // Check if hooks exist, if exist, then call "connected" function if exists
  _Lucid.components[componentName].hooks && _Lucid.components[componentName].hooks.connected && _Lucid.components[componentName].hooks.connected.call(getThisParameter(componentName, componentKey));
}

/**
 * 
 * @param {HTMLElement} dom 
 * @param {Skeleton} skeleton 
 * @param {string} componentName 
 * @param {string | number} componentKey 
 */
function connectComponent(dom, skeleton, componentName, componentKey) {
  // If skeleton is a string, it's a text node that is the only child
  if (typeof skeleton === "string") {
    const textNode = document.createTextNode(convertTextVariables(skeleton, componentName, componentKey));
    dom.appendChild(textNode);
    return;
  }

  const elem = document.createElement(skeleton.tag);

  for (const key in skeleton.attrs) {
    if (key.startsWith("on")) {
      elem.addEventListener(key.substr(2), function () {
        skeleton.attrs[key].call(getThisParameter(componentName, componentKey));
      });
    }
    else {
      const result = convertTextVariables(skeleton.attrs[key], componentName, componentKey)

      // Fix bug with src, if src is set, it will request the src and
      // will fail if it's a string variable (e.g. {{state.photoPath}})
      elem.setAttribute(key === "srcname" ? "src" : key, result);
    }
  }

  for (let i = 0; i < skeleton.children.length; ++i)
    connectComponent(elem, skeleton.children[i], componentName, componentKey);

  dom.appendChild(elem);
}

/**
 * 
 * @param {string} componentName Name of the component. 
 * @param {string | number} componentKey Key of the component.
 */
function disconnectComponent(componentName, componentKey) {
  const elementKey = componentName + componentKey;
  const dom = _Lucid.elements[elementKey].dom;

  // Remove the component from the dom, then call "disconnected" hook
  dom.parentNode.removeChild(dom);

  // Check if hooks exist, if exist, then call "disconnected" function if exists
  _Lucid.components[componentName].hooks && _Lucid.components[componentName].hooks.disconnected && _Lucid.components[componentName].hooks.disconnected.call(getThisParameter(componentName, componentKey));

  delete _Lucid.elements[elementKey];
}

/**
 * 
 * @param {HTMLElement} dom 
 * @param {Skeleton} skeleton 
 * @param {number} elementKey 
 */
function updateComponent(dom, skeleton, componentName, componentKey) {
  if (typeof skeleton === "string") {
    dom.nodeValue = convertTextVariables(skeleton, componentName, componentKey);
    return;
  }

  for (const key in skeleton.attrs) {
    // Only change the attributes that are not functions,
    // because only {{state.*}} attributes can change
    if (typeof skeleton.attrs[key] !== "function") {
      const result = convertTextVariables(skeleton.attrs[key], componentName, componentKey);
      dom.setAttribute(key, result);
    }
  }

  const childNodes = Array.from(dom.childNodes);
  for (let i = 0; i < childNodes.length; ++i) {
    // Check also if there isa skeleton for the dom child
    if (skeleton.children[i]) {
      updateComponent(childNodes[i], skeleton.children[i], componentName, componentKey);
    }
  }
}

/**
 * 
 * @param {string} componentName 
 * @param {number} componentkey 
 * @param {string} attribute 
 * @returns 
 */
function getComponentAttribute(componentName, componentkey, attribute) {
  return _Lucid.elements[componentName + componentkey].attributes[attribute];
}

/**
 * 
 * @param {string} componentName 
 * @param {number} componentKey 
 * @param {string} attribute 
 * @param {any} value 
 */
function setComponentAttribute(componentName, componentKey, attribute, value) {
  const elementKey = componentName + componentKey;

  _Lucid.elements[elementKey].attributes[attribute] = value;

  // Check if watch exist, if exist, then call attribute's function if exists
  _Lucid.components[componentName].watch && _Lucid.components[componentName].watch[attribute] && _Lucid.components[componentName].watch[attribute].call(getThisParameter(componentName, componentKey));

  updateComponent(_Lucid.elements[elementKey].dom.firstChild,
    _Lucid.components[componentName].skeleton,
    componentName, componentKey);

  // Check if hooks exist, if exist, then call "updated" function if exists
  _Lucid.components[componentName].hooks && _Lucid.components[componentName].hooks.updated && _Lucid.components[componentName].hooks.updated.call(getThisParameter(componentName, componentKey));
}

/**
 * 
 * @param {HTMLElement} child 
 * @param {string} componentName
 * 
 * @returns {Skeleton} Skeleton
 */
function createSkeleton(child, componentName) {
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

  for (let i = 0; i < child.attributes.length; ++i) {
    if (child.attributes[i].specified) {
      if (child.attributes[i].name.startsWith("on")) {
        const func = convertTextVariables(child.attributes[i].value, componentName);
        skeleton.attrs[child.attributes[i].name] = func;
      } else {
        skeleton.attrs[child.attributes[i].name] = child.attributes[i].value;
      }
    }
  }

  const childNodes = Array.from(child.childNodes);
  for (let i = 0; i < childNodes.length; ++i) {
    const childSkeleton = createSkeleton(childNodes[i], componentName);

    if (childSkeleton)
      skeleton.children.push(childSkeleton);
  }

  return skeleton;
}

/**
 * 
 * @param {string} componentName Name of the component.
 * @param {string | number} componentKey Key of the component.
 * 
 * @returns {{name: string, key: string, dom: HTMLElement, state: object, setState: (newState: object) => void}
 */
function getThisParameter(componentName, componentKey) {
  const elementKey = componentName + componentKey;

  return {
    name: componentName,
    key: componentKey,
    dom: _Lucid.elements[elementKey].dom.firstChild,
    state: _Lucid.elements[elementKey].state,
    attributes: _Lucid.elements[elementKey].attributes,
    methods: _Lucid.components[componentName].methods,
    setState: function (newState) {
      // Save the new state
      _Lucid.elements[elementKey].state = newState;

      // Re-render the element if it has a dom
      if (_Lucid.elements[elementKey].dom.firstChild) {
        updateComponent(_Lucid.elements[elementKey].dom.firstChild,
          _Lucid.components[componentName].skeleton,
          componentName, componentKey);
      }

      // Check if hooks exist, if exist, then call "updated" function if exists
      _Lucid.components[componentName].hooks && _Lucid.components[componentName].hooks.updated && _Lucid.components[componentName].hooks.updated.call(this);
    }
  };
}

/**
 * Replaces text variables(e.g. {{state.count}}) with their correct value that's saved in either state or methods.
 * @param {string} text 
 * @param {string} componentName Name of the component that the text variable belongs to.
 * @param {number} [componentKey] If key is provided, state will be used to convert the text, methods otherwise.
 * 
 * @returns {string | Function} Text with the variables replaced or function converted from string variable
 */
function convertTextVariables(text, componentName, componentKey) {
  // Convert key to string because if the key is 0, wrong things may happen
  if (componentKey != null)
    componentKey = componentKey.toString();

  let startIndex = text.indexOf("{{", 0);
  let endIndex = text.indexOf("}}", startIndex + 2);

  if (!componentKey) {
    const variable = text.substring(startIndex + 2, endIndex);
    const properties = variable.split(".");

    let tempObj = _Lucid.components[componentName];
    for (let i = 0; i < properties.length; ++i)
      tempObj = tempObj[properties[i]];

    return tempObj;
  } else {
    const elementKey = componentName + componentKey;

    while (startIndex > -1 && endIndex > -1) {
      const variable = text.substring(startIndex + 2, endIndex);
      const properties = variable.split(".");

      let tempObj = _Lucid.elements[elementKey];
      for (let i = 0; i < properties.length; ++i)
        tempObj = tempObj[properties[i]];

      text = text.replace("{{" + variable + "}}", tempObj);

      startIndex = text.indexOf("{{", 0);
      endIndex = text.indexOf("}}", startIndex + 2);
    }

    return text;
  }
}