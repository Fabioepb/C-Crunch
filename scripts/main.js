Regexp = {
    "DeclaracionVariable":"/^(int|float|double|bool|char) [A-Za-z]*;$/", 
    "DAVariable":"/^(int|float|double|bool|char) [a-zA-Z]+ \= ([a-zA-Z]+|\d)*;$/",
    "AsignacionVariable":"/^=$/",
    "FinInstruccion":"/^;$/",
    "Logica":"/^(\|\||&&|>=|<=|==|!=)$/",
}


function compile(){
    var fuente = document.getElementById("code-textarea");
    var lines = fuente.value.split("\n");
    for(var i=0; i<lines.length; i++){
        lines[i]
    }
}