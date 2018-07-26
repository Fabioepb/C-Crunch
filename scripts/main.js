Expresiones = [
    {regex: /^(int|float|double|bool|char) [A-Za-z]+(,\s?[a-zA-Z]+)*\s?;$/, type: "Declaracion de variable"}, 
    {regex: /^[a-zA-Z]+\s?\=\s?(\"[a-zA-Z]+\"|\-?\d+\.?|true|false|\d(\>\=|\<\=|\=\=|\!\=|\<|\>)\s?|\d\s?(\>\=|\<\=|\=\=|\!\=|\<|\>)\s?\d\s?(\&\&|\|\|)\s?)+\s?;$/, type: "asignacion de variable" },
    {regex: /^=$/, type: "Asignacion"},
    {regex: /^;$/, type: "fin instruccion"},
    {regex: /(\+|\-|\/|\*)$/, type: "operador"},
    {regex: /(\|\||&&|>=|<=|==|!=)$/, type: "Comparacion logica"},
    {regex: /^[a-zA-Z]+\s?\=\s?(\(((\s?\(\s?\d+(\.\d+)?\s?(\+|\-|\/|\*)\s?\d+(\.\d+)?\s?\))|(\s?\d+(\.\d+)?\s?(\+|\-|\/|\*)\s?\d+(\.\d+)?\s?)|(\s?(\+|\-|\/|\*)\s?\d+(\.\d+)?\s?)|(\s?(\+|\-|\/|\*)\s?\(\s?\d+(\.\d+)?(\+|\-|\/|\*)\s?\d+(\.\d+)?\)\s?))+\s?\)|(([-+*\/]? ?\s?(\d+|\(\g<1>\))\s?( ?[-+*\/] ?\g<1>)?))+)*;$/, type: "Operacion Aritmetica"},
    {regex: /^(int|float|double|bool|char|if|else|and|or|long|true|false|this|switch|try|static|const|break|case|delete|default|export|inline|private|public|protected)$/, type: "Reservada"},
    {regex: /^[a-zA-Z]+\s?\=\s?;$/, type: "Operacion Aritmetica"},
]

function compile(){
    var fuente = document.getElementById("code-textarea");
    const variables = [];
    var lines = fuente.value.split("\n");

    const matchPattern = (text) => {
        let result = null
        Expresiones.forEach(expresion => {
            const match = expresion.regex.test(text)
            if(match)
             result = expresion.type
        })
        return result
    }

    /*const toPostfix =(exp) =>{
        
        var tokens = exp.split(" ");
        var operadores = [];
        var stack = [];
        const checkOperador = Expresiones[4].regex;

        tokens.forEach(token =>{
                if(!checkOperador.test(token)){ 
                    numeros.push(token);
                    console.log("numeros", numeros)
                }else if (checkOperador.test(token)){
                    operadores.push(token);
                    console.log("operadores", operadores)
                }

        });

        while(numeros.length > 0 && operadores.length > 0){
            try{
                resultado.push(numeros.shift());
                resultado.push(numeros.shift());
                resultado.push(operadores.shift());
            }catch(error){
                console.log(error);
            }
        }
        return resultado.join(" ");
    }*/

    let flag = false;

    const codeLines = lines.map(line=>{
        let obj = { value: line, type: 'Null' }
        const match = matchPattern(line);

        if(match && !flag){
            obj.type = match;
            switch(obj.type){
                case 'Declaracion de variable':{
                    const [type, vars] = line.split(" ");
                    const nombreReservado = Expresiones[7].regex;
                    const varsParsed = vars.replace(/,/g, ' ').replace(/;/,'').split(" ");
                    let error=false;
                    varsParsed.forEach(variable =>{
                        if(nombreReservado.test(variable)){
                            flag=true;
                            error=true;
                            console.log(`La variable: ${variable} utiliza un nombre reservado`);
                        }else{
                            for(i=0;i<variables.length;i++){
                                if(variable == variables[i].var){
                                    error=true;
                                    flag =true;
                                    console.log(`La variable: ${variable} utiliza un nombre ya ocupado por otra variable`);
                                }
                            }
                        }
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
                        console.log(`la variable utilizada '${variable}' no ha sido declarada!`);
                    }
                    break
                }
                case 'Operacion Aritmetica':{
                    const [variable, value] = line.replace(";","").split('=').map(e=> e.trim());
                    const index = variables.findIndex(e => e.var === variable);
                    if(!isNaN(index) && index >= 0){
                        if(variables[index].type == 'int'){
                            try{
                                newValue = value.replace(";","");
                                var actualValue = parseInt(eval(newValue));
                                variables[index].value = actualValue;
                                console.log(ToPostfix(newValue));
                            }catch(error){
                                console.log(error);
                            }
                        }else if(variables[index].type == 'float'){
                            try{
                                newValue = value.replace(";","");
                                console.log(newValue);
                                var actualValue = eval(newValue);
                                console.log(actualValue);
                                variables[index].value = actualValue;
                            }catch(error){
                                console.log(error);
                            }
                        }else{
                            console.log("Tipo incorrecto para la variable especificada, el valor ahora es NULL")
                        }
                    }else{
                        console.log(`la variable utilizada '${variable}' no ha sido declarada!`)
                    }
                    break;
                }
            }
        }else{
            console.log(`la linea '${line}' es no pudo ser compilada, hubo un error en el codigo.`);
            flag=true;
        }
        return obj;
    });

    function isOperator(Character) {
        if(Character == '+' || Character == '-' || Character == '*' || Character == '/' || Character == '^'){
            return true;
        }
    }
    function leftAssoc(Character) {
        if(Character != '^'){
            return true;
        }
    }

    function priority(Character) {
        switch(Character){
            case '^':
                return 3;
            case ('^'||'/'):
                return 2;
            case '+':
                return 1;
            case '-':
                return 0
        }
    }

    function ToPostfix(expr) {
        var index = 0;
        var stack = [];
        var operadores = [];
        var token;

        nextToken = function() {
            while (index < expr.length && expr[index] == ' '){
                index++
            }if (index == expr.length){
                return '';
            }
            var b = '';
            while (index < expr.length && expr[index] != ' ' && expr[index] != '(' && expr[index] != ')' && !isOperator(expr[index])){
                b += expr[index++];
            } 
            if (b != ''){
                return b;
            }
            return expr[index++];
        }

        while ((token = nextToken()) != '') {
            if (token == '('){
                stack.push(token);
            }else if (token == ')') {
                while (stack.length > 0 && stack[stack.length - 1] != '(') 
                    operadores.push(stack.pop());
                if (stack.length == 0){
                    return 'Ha ocurrido un error, Falta un parentesis...';
                } 
                stack.pop()
            } else if (isOperator(token)) {
                while (stack.length > 0 && isOperator(stack[stack.length - 1]) && ((leftAssoc(token) && priority(token) <= priority(stack[stack.length - 1])) || (!leftAssoc(token) && priority(token) < priority(stack[stack.length - 1])))) {
                    operadores.push(stack.pop());
                }
                stack.push(token);
            } else {
                operadores.push(token);
            }
        }
        while (stack.length > 0) {
            if (!isOperator(stack[stack.length - 1])){
                return 'Ha ocurrido un error, Falta un parentesis...';
            }
            operadores.push(stack.pop())
        }

        if (operadores.length == 0){
            return 'La expresion ingresada no es una expresion valida..';
        }
        var resultado = ''
        for (var i = 0; i < operadores.length; i++) {
            if (i != 0){
                resultado += ' '
            }
            resultado += operadores[i]
        }
        return resultado;  
    }
    console.log("Variables", variables);
    console.log("operaciones", codeLines);
}