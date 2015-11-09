/**
 * @fileoverview No unused styles defined in javascript files
 * @author Tom Hastjarjanto
 */
'use strict';

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

var rule = require('../../../lib/rules/no-unused-styles');
var RuleTester = require('eslint').RuleTester;

require('babel-eslint');

// ------------------------------------------------------------------------------
// Tests
// ------------------------------------------------------------------------------

var ruleTester = new RuleTester();
ruleTester.run('no-unused-styles', rule, {

  valid: [{
    code: [
      'const styles = Stylesheet.create({',
      '  name: {}',
      '})',
      'const Hello = React.createClass({',
      '  render: function() {',
      '    return <View style={styles.name}>Hello {this.props.name}</View>;',
      '  }',
      '});'
    ].join('\n'),
    parser: 'babel-eslint',
    ecmaFeatures: {
      classes: true,
      jsx: true
    }
  }],

  invalid: [{
    code: [
      'const styles = Stylesheet.create({',
      '  name: {}',
      '})',
      'const Hello = React.createClass({',
      '  render: function() {',
      '    return <Text>Hello {this.props.name}</Text>;',
      '  }',
      '});'
    ].join('\n'),
    parser: 'babel-eslint',
    ecmaFeatures: {
      classes: true,
      jsx: true
    },
    errors: [{
      message: 'Component should use es6 class instead of createClass'
    }]
  }
]});
