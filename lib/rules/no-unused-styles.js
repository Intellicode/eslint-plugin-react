/**
 * @fileoverview Detects unused styles
 * @author Tom Hastjarjanto
 */
'use strict';
var util = require('util');
var Components = require('../util/Components');

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

module.exports =  Components.detect(function(context, components) {
  var sourceCode = context.getSourceCode();
  var styleSheets = new StyleSheets();
  var styleReferences = new Set();

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

  function isStyleAttribute(node) {
    return Boolean(
      node.type === 'JSXAttribute' &&
      node.name &&
      node.name.name === 'style'
    );
  }

  function collectStyleReferences(node) {
    if (hasArrayOfStyleReferences(node)) {
      return node
        .expression
        .elements
        .filter(isMemberExpression)
        .map(getStyleReference);
    } else {
      return [getStyleReference(node.expression)]
    }
  }

  function hasArrayOfStyleReferences(node) {
    return Boolean(
      node.type === 'JSXExpressionContainer' &&
      node.expression &&
      node.expression.type === 'ArrayExpression'
    );
  }

  function isMemberExpression(node) {
    return Boolean(
      node.type === 'MemberExpression'
    );
  }

  function getStyleReference(node) {
    var result = [];
    var name = getName(node);
    if (name) {
      result.push(name);
    }

    var property = getProperty(node);
    if (property) {
      result.push(property);
    }

    return result.join('.');
  }

  function getName(node) {
    if (
      node &&
      node.object &&
      node.object.name
    ) {
      return node.object.name;
    }
  }

  function getProperty(node) {
    if (
      node &&
      node.property &&
      node.property.name
    ) {
      return node.property.name;
    }
  }

  return {
    VariableDeclarator: function(node) {
      if (isStyleSheetDeclaration(node)) {
        const styleSheetName = getStyleSheetName(node);
        const styles = getStyleDeclarations(node);

        styleSheets.add(styleSheetName, styles);
      }
    },

    JSXAttribute: function(node) {
      if (isStyleAttribute(node)) {
        var styles = collectStyleReferences(node.value);
        styles.forEach(function(style) {
          styleReferences.add(style);
        });
      }
    },

    'Program:exit': function() {
      var list = components.list();
      if (Object.keys(list).length > 0) {
        console.log('TODO: report error here');
      }
    }
  };
});

module.exports.schema = [];
