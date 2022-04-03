from flask import Blueprint

api = Blueprint('api', __name__, template_folder='templates')


@api.route('/placa/<placa>')
def index(placa: str = ''):
    return "Placa {}".format(placa)


@api.route('/placa/add')
def add():
    return "add"


@api.route('/placa/delete')
def delete():
    return "delete"
