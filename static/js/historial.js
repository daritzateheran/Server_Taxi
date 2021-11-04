
var ruta = new Array()
var x = 1;
var customIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/4214/4214491.png',
    iconSize: [50, 50],
    iconAnchor: [25, 25]
});

var customIcon2 = new L.Icon({
    iconUrl: '../static/png/points.png',
    iconSize: [10, 10],
    iconAnchor: [10, 10]
});

const mymap = L.map('TaxiMap').setView([10.968638, -74.806644,], 14);
const attribution =
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
const tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

const tiles = L.tileLayer(tileUrl, { attribution });
tiles.addTo(mymap);


var inicio = new Object();
var ruta = new Object();
var markers = new Object();
var marker_ = new Object();
var marker_remove = new Object();
var polylines = new Object();
var temp = new Object();
var remove = new Object();
var rem_marker = new Object();
var rem_inicio = new Object();
var slider = new Object();
var rgt = new Object();



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


var s = document.querySelectorAll('.info')
var p = document.querySelectorAll("input[type=checkbox]");
for (var j = 0; j<p.length; j++){
    inicio[p[j].id]=null
    ruta[p[j].id]=new Array()
    markers[p[j].id]=null
    marker_[p[j].id]=null
    temp[p[j].id]=0;
    marker_remove[p[j].id]=new Array();
    remove[p[j].id]=new Array();
    rem_marker[p[j].id]=new Array();
    rem_inicio[p[j].id]=new Array();

    for(var i=0;i<s.length;i++){
        a=s[i].childNodes[7]
        if(a.id==p[j].id){
          slider[p[j].id]=s[i].childNodes[7]
        }
    }

    for(var i=0;i<s.length;i++){
        a=s[i].childNodes[4]
        if(a.id==p[j].id){
          rgt[p[j].id]=s[i].childNodes[4]
        }
    }
    
}







// SELECCIONAR ELEMENTOS DEL HTML
const historybutton = document.getElementById('requestbutton');

var initialdate = document.getElementById('initialdate');
var finaldate = document.getElementById('finaldate');

x = 1;
function enlazamientodefechas(fecha1) {
    finaldate.min = fecha1.value
}
function enlazamientodefechas1(fecha2) {
    initialdate.max = fecha2.value
}

//http request escuchando el boton del usuario, aquí pon la parte del boton
document.addEventListener('DOMContentLoaded', reset);
function reset() {
    var hoy = new moment()
    initialdate.value = hoy.format("YYYY-MM-DDTHH:mm")
    finaldate.value = hoy.format("YYYY-MM-DDTHH:mm")
    initialdate.max = hoy.format("YYYY-MM-DDTHH:mm")
    finaldate.max = hoy.format("YYYY-MM-DDTHH:mm")

}


historybutton.addEventListener('click', consulta);

function consulta() {
    console.log(temp)
    console.log(inicio)
    var param1 = initialdate.value
    var param2 = finaldate.value

    if (param1 > param2) {
        alert("La opción es inválida");
        x = 0;
    }

    var fecha = new Date();
    if (param2 > fecha.toISOString()) {
        alert("Fecha final es inválida");
        x = 0;
    }

    search.forEach((taxi) =>{
        const httpH = new XMLHttpRequest() // metodo de javascript, para hacer peticiones a una url
        httpH.open('GET', "/"+taxi+"/historicos?param1=" + param1 + "&param2=" + param2)
        httpH.onreadystatechange = function () {
            if (httpH.readyState == 4 && httpH.status == 200) {
                var rutahist = JSON.parse(httpH.responseText);
                console.log(taxi)
                ruta[taxi]=[]
                for (var i = 0; i < rutahist.length; i++) {
                    if (i == 0 && temp[taxi]==1) {
                            if(rem_inicio[taxi]){
                                for (var marker of rem_inicio[taxi]) {
                                    mymap.removeLayer(marker);
                                }
                            }
                            inicio[taxi] = L.marker([rutahist[i][1], rutahist[i][2]]).addTo(mymap).bindPopup(taxi)
                            rem_inicio[taxi].push(inicio[taxi])
                        
                    }
                    if (i == rutahist.length - 1 && temp[taxi]==1) {
                            markers[taxi]=L.marker([rutahist[i][1], rutahist[i][2]], { icon: customIcon }).addTo(mymap).bindPopup(taxi)
                            rem_marker[taxi].push(markers[taxi])
          
                    }
                    ruta[taxi].push([rutahist[i][1], rutahist[i][2]]);
                }

                polylines[taxi]=L.polyline(ruta[taxi], { color: 'blue' }).addTo(mymap)
                remove[taxi].push(polylines[taxi])
                x = 1;

                
                if (temp[taxi]==0){
                    for (var line of remove[taxi]) {
                        mymap.removeLayer(line);
                    }
                    for (var marker of rem_marker[taxi]) {
                        mymap.removeLayer(marker);
                    }
                    for (var marker of rem_inicio[taxi]) {
                        mymap.removeLayer(marker);
                    }
                    
                    remove[taxi]=[];
                    rem_marker[taxi]=[];
                    rem_inicio[taxi]=[];

                }
                //slider
                rgt[taxi].innerHTML = rutahist.length;
                slider[taxi].max = rutahist.length;
                console.log(rgt);
                console.log(slider);              
            }
            else {
                //console.log("Ready state", httpH.readyState);
                //console.log("Ready status", httpH.status);
            }


        }
        
        httpH.send(null);

    });
}
function update(p) {

    search.forEach((taxi) =>{
        const http = new XMLHttpRequest()
    var param1 = initialdate.value;
    var param2 = finaldate.value;
    http.open('GET', "/"+taxi+"/historicos?param1=" + param1 + "&param2=" + param2);
    http.onload =  () => {

        if (http.status == 200) {
            let data = JSON.parse(http.responseText);
           

            if (p == 0) {
                if (remove[taxi]) {
                    for (var line of remove[taxi]) {
                        mymap.removeLayer(line);
                    }
                }
                inicio[taxi] = L.marker([data[p][0], data[0][2]]).addTo(mymap).bindPopup('Comienzo del <br> recorrido');
            } else {
                console.log(p);
                if (marker_remove[taxi]) {
                    for (var mark of marker_remove[taxi]) {
                        mymap.removeLayer(mark);
                    }
                }
                text=taxi+": "+data[p][3]
                console.log(text)
                marker_remove[taxi]=[];
                marker_[taxi] = L.marker([data[p][1], data[p][2]], { icon: customIcon2 }).addTo(mymap).bindPopup(text).openPopup();
                marker_remove[taxi].push(marker_[taxi]);
            }
        }
        }
        
        http.send(null);

    });
}
    