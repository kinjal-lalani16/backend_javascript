odoo.define('javascript.backend', function (require) {
"use strict";

var AbstractAction = require('web.AbstractAction');
var core = require('web.core');
var field_utils = require('web.field_utils');

var popup = AbstractAction.extend({
    contentTemplate: 'pop_up'
    });

core.action_registry.add('popup_id', popup);

return popup;

});

