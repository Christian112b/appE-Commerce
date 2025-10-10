from flask import Blueprint, render_template, session, redirect, url_for

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/adminPanel')
def adminPanel():
    if session.get('admin') == 1:
        return render_template('admin/dashboard.html')
    return redirect(url_for('main.index'))
