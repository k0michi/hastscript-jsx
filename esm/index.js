import * as propertyInformation from "property-information";
import { parse as spaces } from "space-separated-tokens";
import { parse as commas } from "comma-separated-tokens";

export const Fragment = Symbol("fragment");

export function createElement(type, props, ...children) {
  const properties = { ...props };

  if (properties.children != null) {
    if (children.length == 0) {
      children = properties.children;
    }

    delete properties.children;
  }

  if (typeof type == "function") {
    return type({ ...properties, children });
  } else if (typeof type == "symbol") {
    if (type == Fragment) {
      const fragment = {
        type: "root",
        children: []
      };
      appendChildren(fragment, children);
      return fragment;
    }
  } else if (typeof type == "string") {
    if (type == "template") {
      const element = {
        type: "element",
        tagName: "template",
        properties: {},
        content: {
          type: "root",
          children: []
        }
      };
      setProperties(element, properties);
      appendChildren(element.content, children);
      return element;
    } else {
      const element = {
        type: "element",
        tagName: type,
        properties: {},
        children: []
      };
      setProperties(element, properties);
      appendChildren(element, children);
      return element;
    }
  }
}

function setProperties(node, properties) {
  for (let [name, value] of Object.entries(properties)) {
    if (value != null) {
      const info = propertyInformation.find(propertyInformation.html, name);

      if (typeof value === "string") {
        if (info.spaceSeparated) {
          value = spaces(value);
        } else if (info.commaSeparated) {
          value = commas(value);
        } else if (info.commaOrSpaceSeparated) {
          value = spaces(commas(value).join(" "));
        }
      }

      if (name == "style") {
        setStyleProperties(node, value);
      } else {
        node.properties[info.property] = value;
      }
    }
  }
}

function setStyleProperties(node, properties) {
  if (typeof properties == "string") {
    node.properties["style"] = properties;
  } else {
    const styles = [];

    for (const [name, value] of Object.entries(properties)) {
      styles.push(`${name}:${value}`);
    }

    setStyleProperties(node, styles.join(";"));
  }
}

function appendChildren(node, children) {
  for (const child of children) {
    if (child != null) {
      append(node, child);
    }
  }
}

function append(node, child) {
  if (typeof child == "string" || typeof child == "number") {
    node.children.push({
      type: "text", value: String(child)
    });
  } else if (child instanceof Array) {
    appendChildren(node, child);
  } else if (child.type == "root") {
    appendChildren(node, child.children);
  } else {
    node.children.push(child);
  }
}