

function agregar() {
        if (a < 3){
            var myDiv = document.getElementById("inputSeek");
            var seek = document.createElement('input');
        
            seek.setAttribute("class", "input");
            seek.setAttribute("type", "text");
            seek.setAttribute("required", "");
            seek.setAttribute("name", `placa${a}`);
            seek.setAttribute("id", a);
            seek.setAttribute("style", "margin-top: 10px; margin-bottom: 10px;");
            myDiv.appendChild(seek);   
            
            a = a + 1;
        
            document.getElementById("p_numeros").value = a;
        }
           
    }


function eliminar() {
    if (a!=1){
        var d = document.getElementById("inputSeek");
        var dchild = document.getElementById(a-1);
        console.log(a-1)
        console.log(dchild)
        d.removeChild(dchild);
        a=a-1;
        document.getElementById("p_numeros").value = a;
    }
}