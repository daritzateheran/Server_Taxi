from flask import Flask, render_template, jsonify, g

import socket, threading, pymysql, os

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
        
        
if __name__ == '__main__':
    server_udp = threading.Thread(target=udp, daemon=True)
    server_udp.start()
    app.run(host='0.0.0.0', debug=True, port=8888)