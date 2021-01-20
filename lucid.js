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
          dom: child
        };

        child.innerHTML = this.components[componentName].render();
        registerEvents(child, componentName, componentKey);
      });
    }
  };

  return Lucid.app;
}

/**
 * 
 * @param {HTMLElement} element 
 */
function registerEvents(element, componentName, componentKey) {
  element.childNodes.forEach((child) => {
    for (let i = 0; i < child.attributes.length; ++i) {
      const attrib = child.attributes[i];
      if (attrib.specified && attrib.name.startsWith("on")) {
        const methodName = child.attributes[i].value;
        child.addEventListener(attrib.name.substr(2),
          () => {
            Lucid.app.components[componentName].methods[methodName]
              (
                Lucid.app.currPage.elements[componentName + componentKey].state,
                (newState) => {
                  for (const key in newState) {
                    Lucid.app.currPage.elements[componentName + componentKey].state[key] = newState[key]
                  }
                }
              )
          }
        );
        child.removeAttribute(child.attributes[i].name);
      }
    }
  });
}