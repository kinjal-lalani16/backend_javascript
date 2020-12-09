# -*- coding: utf-8 -*-
{
    'name': "javascript",
    'summary': """This module is contain javascript""",
    'description': """TThis module is contain javascript""",
    'author': "Aktiv software",
    'website': "http://www.aktivesoftware.com",
    'category': 'Tools',
    'version': '13.0.1.0.0',
    'depends': ['base', 'website', 'web'],
    'data': [
        'security/ir.model.access.csv',
        'data/website_home.xml',

        'views/assets.xml',
        'views/menu_js_views.xml',
        'views/student_record_views.xml',
        'views/student_record_menu_js.xml',
        'views/website_home_template.xml',
    ],
    'demo': [
        'demo/demo.xml',
    ],
    'qweb': [
        'static/src/xml/templates.xml',
        'static/src/xml/student_record_template.xml',
    ]
}
