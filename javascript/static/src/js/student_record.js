 odoo.define('javascript.student_record', function (require) {
"use strict";


var AbstractAction = require('web.AbstractAction');
var core = require('web.core');
var QWeb = core.qweb;


var HelloWorld = AbstractAction.extend({
    contentTemplate: 'HelloWorldTemplate',

    events: {
        "click .button_clickable": function () {
            var self = this;
            console.log("Event is calling");
            var def = this._rpc({
                model: 'student.record',
                method: 'search_read',
                args: [
                    [],
                    ['student_id','student_gender','student_dob','student_email','student_age'],
                ],
            })
            .then(function (res) {
                console.log("This is student ",res);
                // var result = res;
                // $.each(result, function(obj,value) {
                //     console.log(value);
                // });
                self.$el.html(QWeb.render('ClickTemplate',{'student': res}));
            });
        },
    },

    start: function () {
        console.log("Jagte raho");
    },

});

core.action_registry.add('welcome_action', HelloWorld);

return HelloWorld;

});
