# -*- coding: utf-8 -*-

import re
from datetime import date

from dateutil.relativedelta import relativedelta

from odoo import api, fields, models

from odoo.exceptions import UserError, ValidationError


class StudentRecord(models.Model):

    _name = 'student.record'
    _rec_name = 'student_id'
    _description = 'student details'

    roll_no = fields.Char(string='Student Roll No', required=True, copy=False,
                          readonly=True, states={
                              'draft': [('readonly', False)]}, index=True,
                          default=lambda self: ('New'))

    student_id = fields.Many2one('res.partner', string='Name', required=True)
    last_name = fields.Char(string="Last Name", required=True)
    student_photo = fields.Binary(string="Photo")
    student_age = fields.Integer(string="Age", readonly=False)
    student_dob = fields.Date(string="Date of Birth", required=True)
    school_type = fields.Selection([('public', 'Public School'),
                                    ('private', 'Private School')])
    auto_rank = fields.Integer(compute="_auto_rank", string="Rank")
    student_gender = fields.Selection(
        [('m', 'Male'), ('f', 'Female'), ('o', 'Other')], string='Gender')
    student_blood_group = fields.Selection([('A+', 'A+ve'), ('B+', 'B+ve'), (
        'O+', 'O+ve'), ('AB+', 'AB+ve'), ('A-', 'A-ve'), ('B-', 'B-ve'),
        ('O-', 'O-ve'), ('AB-', 'AB-ve')], string='Blood Group')
    student_email = fields.Char(string='Student Email', required=True)
   # profesor_id = fields.Many2one('profesor.record', string="Profesor")
    # gender = fields.Selection(related="profesor_id.profesor_gender",
    #                           readonly=True)
   # subject_ids = fields.Many2many(
        # 'subject.record', 'subject_table', 'sub_id', 'sub_name')
    school_name = fields.Char(string='School')
    sale_id = fields.Many2one('sale.order', string="Sale Order")

    @api.model
    def student_rec(self):
        list_dic = {}
        list_student = self.env["student.record"].search([])
        for student in list_student:
            list_dic.update({
                'student_id': student.student_id.name,
                'student_gender': student.student_gender,
                'student_age': student.student_age,
                'student_dob': student.student_dob
            })
        print('\n\n-----list_dic-----\n\n', list_dic)
        return list_dic


    # onchange function to get age through entered dob
    @api.onchange('student_dob')
    def get_age(self):
        for record in self:
            if record.student_dob:
                date_record = record.student_dob
                current_date = date.today()
                result = relativedelta(current_date, date_record)
                age = int(result.years)
                record.student_age = age

    # constrain for not allowing user to enter current date or future date
    @api.constrains('student_dob')
    def validate_dob(self):
        if self.student_dob >= (date.today()):
            raise ValidationError("Date you have enter is not valid..!")

    @api.constrains('student_age')
    def check_age(self):
        if self.student_age > 20:
            raise ValidationError(
                'Can not ragister as a student..Age must be less than 20..!')
        if self.student_age < 5:
            raise ValidationError(
                'Can not ragister as a student..Age must be greater than 5..!')

    @api.constrains('student_email')
    def validate_mail(self):
        if self.student_email:
            match = re.match('^[a-z0-9]+[\._]?[a-z0-9]+[@]\w+[.]\w{2,3}$',
                             self.student_email)
            if match is None:
                raise ValidationError('Not a valid E-mail ID')

    @api.model
    # create method for genrating roll no
    def create(self, vals):
        if vals.get('roll_no', ('New')) == ('New'):
            vals['roll_no'] = self.env['ir.sequence'].next_by_code(
                'student.record') or ('New')
            vals['school_name'] = 'L.J School'

        result = super(StudentRecord, self).create(vals)

        return result

    # write method for email.
    def write(self, values):
        super(StudentRecord, self).write(values)
        if 'student_email' in values:
            raise UserError("You cannot change email of a student.")
        # unlink method
        unlink_record = self.env['student.record'].browse(27)
        unlink_record.unlink()

    # depends method for school type
    @api.depends('school_type')
    def _auto_rank(self):
        for r in self:
            if r.school_type == "private":
                r.auto_rank = 50
            elif r.school_type == "public":
                r.auto_rank = 100
            else:
                r.auto_rank == 0
