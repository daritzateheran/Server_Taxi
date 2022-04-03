from flask import Flask, render_template, jsonify, request, session, url_for, redirect
from flask_sqlalchemy import SQLAlchemy
import os


# server config
app = Flask(__name__)
app.secret_key = str(os.urandom(256))

# database config
app.config['SQLALCHEMY_DATABASE_URL'] = 'sqlite:///db.sqlite3'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)


# 404 Page
@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404


# Index Page
@app.route('/')
def root():
    return render_template('index.html')


if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True, port=8888)
