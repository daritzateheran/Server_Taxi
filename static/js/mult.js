
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
        if (item.checked){
            search.push(item.getAttribute("id"));
            console.log(search)
        }
        else{
            var temp = new Array();
            //var i = 0;
            for (var j = 0; j<search.length; j++){
                if (search[j] != item.getAttribute("id")){
                    temp.push(search[j]);
                }
            }
            search = temp;
            console.log(temp)
        }   
    }

    var x = new Object();
    var inicio = new Object();
    var ruta = new Object();
    var markers = new Object();
    var polylines = new Object();


    var p = document.querySelectorAll("input[type=checkbox]");
    for (var j = 0; j<p.length; j++){
        x[p[j].id]=1
        inicio[p[j].id]=L.marker([0, 0]).addTo(mymap)
        ruta[p[j].id]=new Array()
        markers[p[j].id]=L.marker([0, 0], { icon: customIcon }).addTo(mymap)
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

                    
                    

                    console.log("search");
                    console.log(taxi);
                    ruta[taxi].push([sqld[0][1], sqld[0][2]]);
                   
                    
                  
                    if(x[taxi]==1){
                        inicio[taxi].setLatLng([sqld[0][1], sqld[0][2]]).bindPopup('Comienzo del <br> recorrido');
                        x[taxi]=0;
                    }               
                    
                   
                    
                    polylines[taxi]=L.polyline(ruta[taxi], { color: 'blue' }).addTo(mymap)

                    console.log(polylines[taxi]);

                    markers[taxi].setLatLng([sqld[0][1], sqld[0][2]]).bindPopup(taxi);
                    markers[taxi].setOpacity(1);

                }
                else {
                    console.log("Ready state", http.readyState);
                    console.log("Ready status", http.status);
                }
            }
            http.send(null);

            });
        
    }