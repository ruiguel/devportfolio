function showAlert(){
alert("Hello, World");
}

function utilizador(){
var nome = promt("Qual é o seu nome?");
alert("Olá, " + nome + "!");    
}

function Soma() {
    var num1 = parseInt (prompt("Digite o primeiro número:"));
    var num2 = parseInt (prompt("Digite o primeiro número:"));
    var operacao="soma";
    var resultado =num1 + num2;
    alert ("O resultado da soma de" + num1 + "e" + num2 + "=" + resultado);
    escreveDiv(num1,num2,operacao);
    }
function Subtracao() {
    var num1 = parseInt (prompt("Digite o primeiro número:"));
    var num2 = parseInt (prompt("Digite o primeiro número:"));
    var resultado="subtracao";
    var resultado =num1 - num2;
    alert ("O resultado da subtração de" + num1 + "e" + num2 + "=" + resultado);
     escreveDiv(num1,num2,operacao);
    }
    function Multiplicao() {
    var num1 = parseInt (prompt("Digite o primeiro número:"));
    var num2 = parseInt (prompt("Digite o primeiro número:"));
    var resultado="multiplicacao";
    var resultado =num1 * num2;
    alert ("O resultado da multiplicação de" + num1 + "e" + num2 + "=" + resultado);
     escreveDiv(num1,num2,operacao);
    }

    function Divisao() {
    var num1 = parseInt (prompt("Digite o primeiro número:"));
    var num2 = parseInt (prompt("Digite o primeiro número:"));
    var resultado="divisao";
    var resultado =num1 / num2;
    alert ("O resultado da divisão de" + num1 + "e" + num2 + "=" + resultado);
     escreveDiv(num1,num2,operacao);
    }
    function escreveDiv(a,b,c){
        var r,p =
        c === "soma"? (r=a+b,p="+"):
        c === "subtracao"?(r=a-b,p="-"):
        c === "multiplicacao"? (r=a*b,p="*"):
        c=== "divisao"?(r=a/b,p="/"):
        "ocorreu um eu";
        const div=document.getElementById("resultado");
        div.innerHTML="O resultado da "+ c +" de " +a+ p +b+ "=" +r;
    }
    