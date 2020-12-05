# -*- coding: utf-8 -*-
{
    'name': "javascript",
    'summary': """This module is contain javascript""",
    'description': """TThis module is contain javascript""",
    'author': "Aktiv software",
    'website': "http://www.aktivesoftware.com",
    'category': 'Tools',
    'version': '13.0.1.0.0',
    'depends': ['base'],
    'data': [
        'security/ir.model.access.csv',
        'views/assets.xml',
        'views/menu_js_views.xml',
    ],
    'demo': [
        'demo/demo.xml',
    ],
    'qweb': [
        'static/src/xml/templates.xml'
    ]
}
