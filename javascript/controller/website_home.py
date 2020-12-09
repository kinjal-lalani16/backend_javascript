from odoo import http, models, fields, _
from odoo.http import request


class Website(http.Controller):

    @http.route('/website/home', type='http', auth="public", website=True)
    def home(self, **kw):
        print('\n\n---------hello------\n\n')
        return request.render('javascript.hello_world')
