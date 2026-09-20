
function operacao(botao) {
  var operacao = 
botao.id
;
  var num1 = parseFloat(prompt("Digite o primeiro número:"));
  var num2 = parseFloat(prompt("Digite o segundo número:"));

  if (isNaN(num1) || isNaN(num2)) {
    alert("Por favor, insira números válidos.");
    return;
  }

  var simbolo = operacao === "soma" ? "+"
    : operacao === "subtracao" ? "-"
    : operacao === "multiplicacao" ? "×"
    : operacao === "divisao" ? "/"
    : null;

  var resultado = operacao === "soma" ? num1 + num2
    : operacao === "subtracao" ? num1 - num2
    : operacao === "multiplicacao" ? num1 * num2
    : operacao === "divisao" ? num1 / num2
    : null;

  if (simbolo === null || resultado === null) {
    alert("Operação não reconhecida.");
    return;
  }

  escreveResultado(num1, num2, operacao, simbolo, resultado);
}

function escreveResultado(num1, num2, operacao, simbolo, resultado) {
  var div = document.getElementById("resultado");
  div.innerHTML =
    "Entrada 1º número -> " + num1 + "<br>" +
    "Entrada 2º número -> " + num2 + "<br>" +
    "Botão clicado -> " + operacao + "<br>" +
    "Operação -> " + num1 + " " + simbolo + " " + num2 + " = " + resultado;
}
