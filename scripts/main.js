Expresiones = [
    {regex: /^(int|float|double|bool|char) [A-Za-z]+(,\s?[a-zA-Z]+)*\s?;$/, type: "Declaracion de variable"}, 
    {regex: /^[a-zA-Z]+\s?\=\s?(\"[a-zA-Z]+\"|\-?\d+\.?|true|false|\d(\>\=|\<\=|\=\=|\!\=|\<|\>)\s?|\d\s?(\>\=|\<\=|\=\=|\!\=|\<|\>)\s?\d\s?(\&\&|\|\|)\s?)+\s?;$/, type: "asignacion de variable" },
    {regex: /^=$/, type: "Asignacion"},
    {regex: /^;$/, type: "fin instruccion"},
    {regex: /(\|\||&&|>=|<=|==|!=)$/, type: "Comparacion logica"},
    {regex: /^(int|float|double|bool|char|if|else|and|or|long|true|false|this|switch|try|static|const|break|case|delete|default|export|inline|private|public|protected)$/, type: "Reservada"}
]

function compile(){
    var fuente = document.getElementById("code-textarea");
    const variables = [];
    var lines = fuente.value.split("\n");
    var palabras = fuente.value.replace("\n"," ").replace(/;/g," ;").replace(/,/g," ,").split(" ");

    const matchPattern = (text) => {
        let result = null
        Expresiones.forEach(expresion => {
            const match = expresion.regex.test(text)
            if(match)
             result = expresion.type
        })
        return result
    }

    let flag = false;

    const codeLines = lines.map(line=>{
        let obj = { value: line, type: 'Null' }
        const match = matchPattern(line);

        if(match && !flag){
            obj.type = match;
            switch(obj.type){
                case 'Declaracion de variable':{
                    const [type, vars] = line.split(" ");
                    const nombreReservado = Expresiones[5].regex;
                    const varsParsed = vars.replace(/,/g, ' ').replace(/;/,'').split(" ");
                    let error=false;
                    varsParsed.forEach(variable =>{
                        if(nombreReservado.test(variable)){
                            flag=true;
                            error=true;
                            console.log(`La variable: ${variable} utiliza un nombre reservado`);
                        }/*else{
                            o: for (var i = 0, n = this.length; i < n; i++) {
                                for (var x = 0, y = varsParsed.length; x < y; x++) {
                                    if (varsParsed[x] == this[i]) {
                                        alert('this is a DUPE!');
                                        continue o;
                                    }
                                }
                                r[r.length] = this[i];
                            }
                            return r;
                            }*/
                    });
                    if(!error){
                        const curatedVars = varsParsed.map(key =>
                            ({
                                var: key,
                                type: type.trim(),
                                value: null
                            })
                        );
                        variables.push(...curatedVars);
                    }
                    break;
                }
                case 'asignacion de variable':{
                    const [variable, value] = line.replace(";","").split('=').map(e=> e.trim());
                    const index = variables.findIndex(e => e.var === variable)
                    if(!isNaN(index) && index >= 0){
                        if(variables[index].type == 'int'){
                            const parsedValue = parseInt(value);
                            if(!isNaN(parsedValue) && !(typeof(parsedValue) === "boolean"))
                                variables[index].value = parsedValue
                            else {
                                variables[index].value = null
                                console.log("Tipo incorrecto para la variable especificada, el valor ahora es NULL");
                            }
                        }
                        else if(variables[index].type == 'char'){
                            if(/^\"[^]+\"$/.test(value))
                                variables[index].value = value.replace(/\"/g, "");
                            else {
                                variables[index].value = null
                                console.log("Tipo incorrecto para la variable especificada, el valor ahora es NULL");
                            }
                        }
                        else if(variables[index].type == 'bool'){
                            try{
                                let newValue = line.replace(";","");
                                newValue = newValue.substring(newValue.indexOf('=') + 1);
                                console.log(newValue);
                                var actualValue = eval(newValue);
                            }catch(error){
                                console.log(error);
                                flag=true;
                            }
                            if(typeof(actualValue) === "boolean")
                                variables[index].value = actualValue;
                            else {
                                variables[index].value = null
                                console.log("Tipo incorrecto para la variable especificada, el valor ahora es NULL");
                            }
                        }
                        else if(variables[index].type == 'float'){
                            const parsedValue = parseFloat(value);
                            if(!isNaN(parsedValue) && !(typeof(parsedValue) === "boolean"))
                                variables[index].value = parsedValue;
                            else {
                                variables[index].value = null
                                console.log("Tipo incorrecto para la variable especificada, el valor ahora es NULL");
                            }
                        }
                        else
                            variables[index].value = value
                    }
                    else if(index === -1) {
                        console.log("Una variable utilizada no ha sido declarada!");
                    }
                    break
                }
            }
        }else{
            console.log(`la linea ${line} es no pudo ser compilada, hubo un error en el codigo.`);
            flag=true;
        }
        return obj;
    });
    console.log("Variables", variables);
    console.log("operaciones", codeLines);
}