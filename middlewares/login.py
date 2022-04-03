#@app.before_request

urls = []

def before(url, session, redirect): # url = request.path
    if not 'placa' in session and url != '/login' and url != "/registrar" or url != "/multiples" and not url.startswith("/static"):
        return redirect('/login')