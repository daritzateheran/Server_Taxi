
    var customIcon = new L.Icon({
        iconUrl: 'https://cdn-icons-png.flaticon.com/512/4214/4214491.png',
        iconSize: [50, 50],
        iconAnchor: [25, 25]
    });
    const mymap = L.map('TaxiMap').setView([10.968638, -74.806644,], 14);
    const attribution =
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
    const tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

    const tiles = L.tileLayer(tileUrl, { attribution });
    tiles.addTo(mymap);
    
    var search = new Array();
   

    function myFunction(item){
        if (item.checked==true){
            search.push(item.getAttribute("id"));
            temp[item.getAttribute("id")] = 1;
        }
        else{
            for (var j = 0; j<search.length; j++){
                temp[item.getAttribute("id")] = 0;
            }
        }   
    }

    var x = new Object();
    var inicio = new Object();
    var ruta = new Object();
    var markers = new Object();
    var polylines = new Object();
    var temp = new Object();
    var remove = new Object();
    var changelat = new Object();
    var changelong = new Object();
    var changetime = new Object();
    var changehour = new Object();
    var changeRPM = new Object();







    var p = document.querySelectorAll("input[type=checkbox]");
    var lat = document.querySelectorAll(".info")


    for (var j = 0; j<p.length; j++){
        x[p[j].id]=1
        inicio[p[j].id]=L.marker([0, 0]).addTo(mymap)
        ruta[p[j].id]=new Array()
        markers[p[j].id]=L.marker([0, 0], { icon: customIcon }).addTo(mymap)
        temp[p[j].id]=4;
        remove[p[j].id]=new Array();

        for(var i=0;i<lat.length;i++){
            a=lat[i].childNodes[3]
            if(a.id==p[j].id){
                changelat[p[j].id]=lat[i].childNodes[9]
            } 
        }

        for(var i=0;i<lat.length;i++){
            a=lat[i].childNodes[9]
            if(a.id==p[j].id){
                changelong[p[j].id]=lat[i].childNodes[15]
            } 
        }

        for(var i=0;i<lat.length;i++){
            a=lat[i].childNodes[15]
            if(a.id==p[j].id){
                changehour[p[j].id]=lat[i].childNodes[21]
            } 
        }

        for(var i=0;i<lat.length;i++){
            a=lat[i].childNodes[21]
            console.log(lat[i].childNodes)
            if(a.id==p[j].id){
                changetime[p[j].id]=lat[i].childNodes[27]
            } 
        }

        for(var i=0;i<lat.length;i++){
            a=lat[i].childNodes[3]
            console.log(lat[i].childNodes)
            if(a.id==p[j].id){
                changeRPM[p[j].id]=lat[i].childNodes[3]
            } 
        }
    }
       

    setInterval('reload()', 1000);

    //no se debe ejecutar en mientras se consulta <=> otra ruta 

    function reload() {


        search.forEach((taxi) =>{
            const http = new XMLHttpRequest() // metodo de javascript, para hacer peticiones a una url
            http.open('GET', "/"+taxi+"/sqlplaca")
            http.onreadystatechange = function () {
                if (http.readyState == 4 && http.status == 200) {
                    var sqld = http.responseText;
                    sqld = JSON.parse(sqld);
                    Fdate = sqld[0][3].split("T")

                    ruta[taxi].push([sqld[0][1], sqld[0][2]]);

                    changelat[taxi].innerHTML = `${sqld[0][1]}`
                    changelong[taxi].innerHTML = `${sqld[0][2]}`
                    changetime[taxi].innerHTML = `${Fdate[1]}`
                    changehour[taxi].innerHTML = `${Fdate[0]}`
                    changeRPM[taxi].innerHTML = `${sqld[0][4]}`



                        
                  
                    if(x[taxi]==1){
                        inicio[taxi].setLatLng([sqld[0][1], sqld[0][2]]).bindPopup('Comienzo del <br> recorrido');
                        x[taxi]=0;
                    }       
                    
                    var polyColor = randomColor()
                    polylines[taxi]=L.polyline(ruta[taxi], { color: polyColor}).addTo(mymap)
                    remove[taxi].push(polylines[taxi])

                  
                    markers[taxi].setLatLng([sqld[0][1], sqld[0][2]]).bindPopup(taxi);
                    
                    if (temp[taxi]==0){
                        markers[taxi].setOpacity(0);
                        inicio[taxi].setOpacity(0);

                        
                        for (var line of remove[taxi]) {
                            mymap.removeLayer(line);
                        }
                        
                        remove[taxi]=[];

                    }
                    if(temp[taxi]==1){
                        markers[taxi].setOpacity(1);
                        inicio[taxi].setOpacity(1);
                    }
                        

                }
                else {
                    console.log("Ready state", http.readyState);
                    console.log("Ready status", http.status);
                }
            }
            http.send(null);

        });
        
    }

    function randomColor(){
        var letters = '0123456789ABCDEF';
        var color = '#';
        for (var i=0; i<6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }
        