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
let marker;
let inicio;


// SELECCIONAR ELEMENTOS DEL HTML
const historybutton = document.getElementById('requestbutton');
//const centerm = document.getElementById('centermap');

var initialdate = document.getElementById('initialdate');
var finaldate = document.getElementById('finaldate');
var polilineas = new Array();
var marker_remove = new Array();

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


    const httpH = new XMLHttpRequest() // metodo de javascript, para hacer peticiones a una url
    httpH.open('GET', "/<placa>/historicos?param1=" + param1 + "&param2=" + param2)
    httpH.onreadystatechange = () => {
        if (httpH.readyState == 4 && httpH.status == 200) {
            var rutahist = JSON.parse(httpH.responseText);
            var ruta = new Array()
            for (var i = 0; i < rutahist.length; i++) {

                if (i == 0) {
                    inicio = L.marker([rutahist[i][1], rutahist[i][2]]).addTo(mymap).bindPopup('Comienzo del <br> recorrido').openPopup();

                }
                if (i == rutahist.length - 1) {
                    marker = L.marker([rutahist[i][1], rutahist[i][2]], { icon: customIcon }).addTo(mymap).bindPopup('Final del recorrido').openPopup();
                    mymap.setView([rutahist[i][1], rutahist[i][2]], 14);
                }

                //console.log(rutahist[i][1])
                ruta.push([rutahist[i][1], rutahist[i][2]]);
            }
            //eliminar la polilinea
            if (polilineas) {
                for (var line of polilineas) {
                    mymap.removeLayer(line);
                }
            }
            polilineas=[];

            //polilinea
            if (ruta == false && x != 0) {
                alert("No existe recorrido para este rango de fechas");
            }
            var polyline = L.polyline(ruta, { color: 'blue' }).addTo(mymap);
            polilineas.push(polyline);
            x = 1;

            // slider
            const slider = document.getElementById('slider');
            const tr = document.getElementById('rgt');

            tr.innerHTML = rutahist.length;
            slider.max = rutahist.length;

        } else {
            console.log("Ready state", httpH.readyState);
            console.log("Ready status", httpH.status);
        }
    }

    httpH.send(null);
}

function update(p) {

    const http = new XMLHttpRequest()
    var param1 = initialdate.value;
    var param2 = finaldate.value;
    http.open('GET', "/<placa>/historicos?param1=" + param1 + "&param2=" + param2);
    http.onload =  () => {
        if (http.status == 200) {
            let data = JSON.parse(http.responseText);
           

            if (p == 0) {
                if (polilineas) {
                    for (var line of polilineas) {
                        mymap.removeLayer(line);
                    }
                }
                inicio = L.marker([data[p][0], data[0][2]]).addTo(mymap).bindPopup('Comienzo del <br> recorrido').openPopup();
            } else {
                console.log(p);
                if (marker_remove) {
                    for (var mark of marker_remove) {
                        mymap.removeLayer(mark);
                    }
                }
                marker_remove=[];
                marker = L.marker([data[p][1], data[p][2]], { icon: customIcon2 }).addTo(mymap).bindPopup(data[p][3]).openPopup();
                mymap.setView([data[p][1], data[p][2]], 14);
                marker_remove.push(marker);
            }
        }
    }

    http.send();
}