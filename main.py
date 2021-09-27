from flask import Flask, render_template, jsonify, g, request

import socket, threading, pymysql, os, datetime
from jinja2.environment import create_cache 

app = Flask(__name__)


def get_conn():
    if "conn" not in g:
        g.conn = pymysql.connect(
            host=os.environ['FLASK_DATABASE_HOST'],
            user=os.environ['FLASK_DATABASE_USER'],
            password=os.environ['FLASK_DATABASE_PASSWORD'],
            database=os.environ['FLASK_DATABASE']
        )
        g.cur=g.conn.cursor()
    return g.conn, g.cur

#comentario

def udp():
    conn = pymysql.connect(
            host=os.environ['FLASK_DATABASE_HOST'],
            user=os.environ['FLASK_DATABASE_USER'],
            password=os.environ['FLASK_DATABASE_PASSWORD'],
            database=os.environ['FLASK_DATABASE']
        )
    cur=conn.cursor()
    try:
        server_udp = socket.socket(family=socket.AF_INET, type=socket.SOCK_DGRAM)
        server_udp.bind(('0.0.0.0', 8051)) #cualquier cliente de la app, puede mandar datos
        print("Servidor UDP funcionando...")
        while True:
            server_address = server_udp.recvfrom(1024)
            msg = server_address[0]
            
            msg = str(msg)
            msg = msg[1:]
            adrrs = server_address[1]
            print (f"La direccion IP del emisor: {adrrs}")
            print (f"El mensaje recibido es: {msg}")
            arr = msg.split(",")
            cur.execute("INSERT INTO datos (Latitud, Longitud, Fecha, Hora) VALUES (%s,%s,%s,%s)", (arr[1],arr[2],arr[3],arr[4]+arr[5]))
            conn.commit()   
    except:
        pass

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/sqldata')
def get_data():
        conn, cur = get_conn()
        cur=conn.cursor()
        cur.execute("SELECT * FROM datos WHERE Id = (SELECT MAX(Id) FROM datos)")
        conn.commit() #si lo quito no sirve
        datos = cur.fetchall()
        cur.close()
        print (datos)
        return jsonify(datos)


#Request.arg.query
"""@app.route('/historicos')
def get_history():
    init_date = request.args.get("param1")
    final_date = request.args.get("param2")
    init_day = datetime.init_date
    fin_day = datetime.init_date
    init_hour = datetime.init_date
    fin_hour = datetime.init_date

    conn, cur = get_conn()
    cur=conn.cursor()
    
    cur.execute("SELECT * FROM datos WHERE Fecha BETWEEN '"+init_day+"' AND '"+fin_day+"' AND Hora BETWEEN '"+init_hour+"' AND '"+fin_hour+"'")
    conn.commit() #si lo quito no sirve
    datos = cur.fetchall()
    return jsonify(datos)"""





@app.route('/changes', methods=["POST","GET"]) #git hub
def pull():
    os.system('cd /home/ubuntu/Server_Taxi && git reset --hard && git pull')
    return 'hello'


if __name__ == '__main__':
    server_udp = threading.Thread(target=udp, daemon=True)
    server_udp.start()
    app.run(host='0.0.0.0', debug=True, port=8888)