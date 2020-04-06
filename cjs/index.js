"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createElement = createElement;
exports.Fragment = void 0;

var propertyInformation = _interopRequireWildcard(require("property-information"));

var _spaceSeparatedTokens = require("space-separated-tokens");

var _commaSeparatedTokens = require("comma-separated-tokens");

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

const Fragment = Symbol("fragment");
exports.Fragment = Fragment;

function createElement(type, props, ...children) {
  const properties = { ...props
  };

  if (properties.children != null) {
    if (children.length == 0) {
      children = properties.children;
    }

    delete properties.children;
  }

  if (typeof type == "function") {
    return type({ ...properties,
      children
    });
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
          value = (0, _spaceSeparatedTokens.parse)(value);
        } else if (info.commaSeparated) {
          value = (0, _commaSeparatedTokens.parse)(value);
        } else if (info.commaOrSpaceSeparated) {
          value = (0, _spaceSeparatedTokens.parse)((0, _commaSeparatedTokens.parse)(value).join(" "));
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
      type: "text",
      value: String(child)
    });
  } else if (child instanceof Array) {
    appendChildren(node, child);
  } else if (child.type == "root") {
    appendChildren(node, child.children);
  } else {
    node.children.push(child);
  }
}