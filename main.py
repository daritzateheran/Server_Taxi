from flask import Flask, render_template, jsonify, g, request
from datetime import datetime

import socket, threading, pymysql, os, json
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
            dt=arr[4]+ " " +arr[3]
            cur.execute("INSERT INTO datos (Latitud, Longitud, Fhora) VALUES (%s,%s,%s)", (arr[1],arr[2],dt))
            conn.commit()
    except:
        pass

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/historial')
def historial():
    return render_template('Historial.html')


@app.route('/sqldata')
def get_data():
        conn, cur = get_conn()
        cur=conn.cursor()
        cur.execute("SELECT * FROM datos WHERE Id = (SELECT MAX(Id) FROM datos)")
        conn.commit() #si lo quito no sirve
        datos = cur.fetchall()
        cur.close()
        
        def datetime_handler(x):
            if isinstance(x, (datetime,datetime)):
                return x.isoformat()
            raise TypeError("Unknown type")
        var1 = json.dumps(datos, default=datetime_handler)
        
        return var1

#Request.arg.query
@app.route('/historicos')
def get_history():
    init_date = request.args.get("param1")
    final_date = request.args.get("param2")
    
    conn, cur = get_conn()
    cur=conn.cursor()
    
    cur.execute("SELECT * FROM taxiapp.datos WHERE FHora between '"+ init_date +"' AND '"+ final_date +"'")
    conn.commit() #si lo quito no sirve
    datos = cur.fetchall()
    return jsonify(datos)

@app.route('/changes', methods=["POST","GET"]) #git hub
def pull():
    os.system('cd /home/ubuntu/Server_Taxi && git reset --hard && git pull') #esta linea de codigo hace que sea automatico el cambio del codigo si todas las instancias estan prendidas
    return 'hello'

if __name__ == '__main__':
    server_udp = threading.Thread(target=udp, daemon=True)
    server_udp.start()
    app.run(host='0.0.0.0', debug=True, port=8888)
