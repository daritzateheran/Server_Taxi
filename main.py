from json import encoder
from flask import Flask, render_template, jsonify, g, request, session, url_for, redirect
from datetime import datetime
import socket, threading, pymysql, os, json


# server config
app = Flask(__name__)
app.secret_key = str(os.urandom(256))


def get_conn():
    if "conn" not in g:
        g.conn = pymysql.connect(
            host=os.getenv('FLASK_DATABASE_HOST'),
            user=os.getenv('FLASK_DATABASE_USER'),
            password=os.getenv('FLASK_DATABASE_PASSWORD'),
            database=os.getenv('FLASK_DATABASE')
        )
        g.cur=g.conn.cursor()
    return g.conn, g.cur


####

def udp():
    conn = pymysql.connect(
            host=os.getenv('FLASK_DATABASE_HOST'),
            user=os.getenv('FLASK_DATABASE_USER'),
            password=os.getenv('FLASK_DATABASE_PASSWORD'),
            database=os.getenv('FLASK_DATABASE')
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
            placa=arr[6]
            print (placa)
            cur.execute(f"INSERT INTO {placa} (Latitud, Longitud, Fhora) VALUES (%s,%s,%s)", (arr[1],arr[2],dt))
            conn.commit()          
    except:
        pass


# api

# login
"""@app.before_request
def before():
    url = request.path
    if not 'placa' in session and url != '/login' and url != "/registrar" or url != "/multiples" and not url.startswith("/static"):
        return redirect('/login')"""


@app.route('/<placa>/sqlplaca')
def get_placa(placa:str=""):
        print(placa)
        conn, cur = get_conn()
        cur=conn.cursor()
        cur.execute(f"SELECT * FROM {placa} WHERE Id = (SELECT MAX(Id) FROM {placa})")
        conn.commit() #si lo quito no sirve
        datos = cur.fetchall()
        cur.close()
        
        def datetime_handler(x):
            if isinstance(x, (datetime,datetime)):
                return x.isoformat()
            raise TypeError("Unknown type")
        var1 = json.dumps(datos, default=datetime_handler)
        return var1

@app.route('/<placa>/sqldata')
def get_data(placa:str=""):
        placa = session.get('placa', None)
        conn, cur = get_conn()
        cur=conn.cursor()
        cur.execute(f"SELECT * FROM {placa} WHERE Id = (SELECT MAX(Id) FROM {placa})")
        conn.commit() #si lo quito no sirve
        datos = cur.fetchall()
        cur.close()
        
        def datetime_handler(x):
            if isinstance(x, (datetime,datetime)):
                return x.isoformat()
            raise TypeError("Unknown type")
        var1 = json.dumps(datos, default=datetime_handler)
        return var1


@app.route('/<placa>/historicos')
def get_history(placa:str=""):
    placa = session.get('placa', None)
    init_date = request.args.get("param1")
    final_date = request.args.get("param2")
    
    conn, cur = get_conn()
    cur=conn.cursor()
    
    cur.execute(f"SELECT * FROM  {placa} WHERE FHora between '"+ init_date +"' AND '"+ final_date +"'")
    conn.commit() #si lo quito no sirve
    datos = cur.fetchall()
    cur.close()
    return jsonify(datos)

#enviar datos a app
@app.route('/changes', methods=["POST","GET"]) #git hub
def pull():
    os.system('cd /home/ubuntu/Server_Taxi && git reset --hard && git pull') #esta linea de codigo hace que sea automatico el cambio del codigo si todas las instancias estan prendidas
    return 'hello'


# rutas

@app.route('/<placa>/historial')
def historial(placa:str=""):

    if  placa == session['placa']:
        return render_template('Historial.html', text="Cerrar sesión", url="logout", texto_1="Tiempo real", texto_2="")


# rutas principales

@app.route('/registrar', methods = ["POST","GET"])
def register():
    if request.method == 'POST':
        placa = request.form["placa"]
        conn, cur = get_conn()
        cur=conn.cursor()

        cur.execute("Show tables;")
        myresult = cur.fetchall()
        cur.close()
        
        for i in range(len(myresult)):
            if myresult[i][0] == placa:
                return render_template("signup.html")
        else: 
            sql = f"CREATE TABLE {placa} (id INT AUTO_INCREMENT PRIMARY KEY, Latitud VARCHAR(15), Longitud VARCHAR(15), FHora DATETIME)"
            conn, cur = get_conn()
            cur=conn.cursor()
            cur.execute(sql)
            conn.commit() #si lo quito no sirve
            cur.close()
            return redirect('/login')
    else:
        return render_template("signup.html")
        
@app.route('/multiples')
def multiples():
    return render_template("multiples.html",text="Inicio", url="logout")

@app.route('/logout')
def logout():
    session.pop("placa", None)
    return redirect("/login")

@app.route('/login', methods=['POST', 'GET'])
def login():
    if request.method == 'POST':
        placa  = request.form['placa']
        #print(request.form["placas"])
        conn, cur = get_conn()
        cur=conn.cursor()
        cur.execute("Show tables;")
        myresult = cur.fetchall()
        cur.close()
        
        for i in range(len(myresult)):
            if myresult[i][0] == placa:
                session['placa'] = placa
                return redirect(url_for("index", placa=placa))
        else:
            return render_template('buscar.html', text="Registrar")  
    else:
        conn, cur = get_conn()
        cur=conn.cursor()
        cur.execute("SELECT * FROM placas;")
        myresult = cur.fetchall()
        cur.close()
        #print(myresult)

        placas = [placa[1] for placa in myresult]
        
        #show tables 
        return render_template('buscar.html', text="Registrar", url="registrar", texto_1="", texto_2="", placas=placas)

#Enviar lista en vez de placa
@app.route('/')
@app.route('/<placa>')
def index(placa:str = ''):
    if placa == session['placa']:
        return render_template('index.html', text="Cerrar sesión", url="logout", texto_1="", texto_2="Historial")
    return "Placa invalida"
        
        



if __name__ == '__main__':
    server_udp = threading.Thread(target=udp, daemon=True)
    server_udp.start()
    app.run(host='0.0.0.0', debug=True, port=8888)
