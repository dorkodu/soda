export const Lucid = {
  createComponent,
  createPage,
  createApp,
  app: {}
};

function createComponent(name, properties) {
  return {
    name: name,
    state: properties.state,
    render: properties.render,
    methods: properties.methods,
    hooks: properties.hooks,
    attributes: properties.attributes,
    key: null,
    watch: properties.watch
  };
}

function createPage(properties) {
  return {
    path: properties.path,
    name: properties.name,
    elements: {},
    payload: properties.payload,
    contents: properties.contents
  };
}

function createApp(properties) {
  Lucid.app = {
    currPage: properties.currPage,
    components: properties.components,
    run: function (containerId) {
      this.container = document.getElementById(containerId);
      this.container.innerHTML = this.currPage.contents();

      this.container.childNodes.forEach((child) => {
        const componentName = child.getAttribute("lucid-component");
        const componentKey = child.getAttribute("lucid-key");

        this.currPage.elements[componentName + componentKey] = {
          state: this.components[componentName].state,
          methods: this.components[componentName].methods,
          dom: child
        };

        child.innerHTML = this.components[componentName].render();
        registerDom(child, componentName, componentKey);
      });
    }
  };

  return Lucid.app;
}

/**
 * 
 * @param {HTMLElement} element 
 */
function registerDom(element, componentName, componentKey) {
  element.childNodes.forEach((child) => {
    for (let i = 0; i < child.attributes.length; ++i) {
      const attrib = child.attributes[i];

      if (!attrib.specified)
        return;

      const attribValue = attrib.value;
      const result = convertTextVariables(Lucid.app.currPage.elements[componentName + componentKey], attribValue);

      if (attrib.name.startsWith("on")) {
        child.addEventListener(attrib.name.substr(2),
          () => {
            result
              (
                Lucid.app.currPage.elements[componentName + componentKey].state,
                (newState) => {
                  Lucid.app.currPage.elements[componentName + componentKey].state = newState
                  console.log(newState);

                  // Re-render the element
                  const dom = Lucid.app.currPage.elements[componentName + componentKey].dom;
                  dom.innerHTML = Lucid.app.components[componentName].render();
                  registerDom(dom, componentName, componentKey);
                }
              )
          }
        );
        child.removeAttribute(attrib.name);
        --i;
      }
      else {
        attrib.value = result;
      }
    }

    // Convert textContent variables and re-write to the element
    const result = convertTextVariables(Lucid.app.currPage.elements[componentName + componentKey], child.textContent);
    child.textContent = result;
  });
}

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