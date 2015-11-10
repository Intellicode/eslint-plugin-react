/**
 * @fileoverview Detects unused styles
 * @author Tom Hastjarjanto
 */
'use strict';

function StyleSheets() {
  this._styleSheets = {};
}

StyleSheets.prototype.add = function(styleSheetName, properties) {
  this._styleSheets[styleSheetName] = properties;
}

StyleSheets.prototype.contains = function(styleSheetName) {
  return Boolean(
    this._styleSheets[styleSheetName]
  );
}

StyleSheets.prototype.containsStyle = function(styleSheetName, property) {
  return Boolean(
    this._styleSheets[styleSheetName] &&
    this._styleSheets[styleSheetName].indexOf(property) > -1
  );
}

module.exports = function(context) {
  var sourceCode = context.getSourceCode();
  var styleSheets = new StyleSheets();

  function containsStyleSheetObject(node) {
    return Boolean(
      node &&
      node.init &&
      node.init.callee &&
      node.init.callee.object &&
      node.init.callee.object.name === 'StyleSheet'
    );
  }

  function containsCreateCall(node) {
    return Boolean(
      node &&
      node.init &&
      node.init.callee &&
      node.init.callee.property &&
      node.init.callee.property.name === 'create'
    );
  }

  function isStyleSheetDeclaration(node) {
    return Boolean(
      containsStyleSheetObject(node) &&
      containsCreateCall(node)
    );
  }

  function getStyleSheetName(node) {
    if (
      node &&
      node.id
    ) {
      return node.id.name;
    }
  }

  function getStyleDeclarations(node) {
    if (
      node &&
      node.init &&
      node.init.arguments &&
      node.init.arguments[0] &&
      node.init.arguments[0].properties
    ) {
      return node
        .init
        .arguments[0]
        .properties
        .map(function(property) {
          return property.key.name;
        });
    }

    return [];
  }

  return {
    VariableDeclarator: function(node) {
      if (isStyleSheetDeclaration(node)) {

        const styleSheetName = getStyleSheetName(node);
        const styles = getStyleDeclarations(node);

        styleSheets.add(styleSheetName, styles);
      }
    }
  };

};

module.exports.schema = [];
