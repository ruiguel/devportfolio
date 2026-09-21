// ---------- Cumprimento personalizado ----------
function cumprimentar() {
  const input = document.getElementById("nome");
  const resultado = document.getElementById("resultado-nome");
  const nome = input.value.trim();

  if (!nome) {
    resultado.textContent = "Escreve o teu nome antes de cumprimentar.";
    resultado.classList.add("erro");
    return;
  }

  resultado.classList.remove("erro");
  resultado.textContent = `Olá, ${nome}! Bem-vindo(a).`;
}

// ---------- Calculadora ----------
const SIMBOLOS = {
  soma: "+",
  subtracao: "-",
  multiplicacao: "×",
  divisao: "÷",
};

function calcular() {
  const num1 = parseFloat(document.getElementById("num1").value);
  const num2 = parseFloat(document.getElementById("num2").value);
  const operacao = document.getElementById("operacao").value;
  const resultado = document.getElementById("resultado-calculo");

  if (Number.isNaN(num1) || Number.isNaN(num2)) {
    resultado.textContent = "Preenche os dois números antes de calcular.";
    resultado.classList.add("erro");
    return;
  }

  if (operacao === "divisao" && num2 === 0) {
    resultado.textContent = "Não é possível dividir por zero.";
    resultado.classList.add("erro");
    return;
  }

  let valor;
  switch (operacao) {
    case "soma":
      valor = num1 + num2;
      break;
    case "subtracao":
      valor = num1 - num2;
      break;
    case "multiplicacao":
      valor = num1 * num2;
      break;
    case "divisao":
      valor = num1 / num2;
      break;
  }

  resultado.classList.remove("erro");
  resultado.textContent = `${num1} ${SIMBOLOS[operacao]} ${num2} = ${valor}`;
}

// ---------- Ligações aos elementos ----------
document.getElementById("btn-cumprimentar").addEventListener("click", cumprimentar);
document.getElementById("nome").addEventListener("keydown", (e) => {
  if (e.key === "Enter") cumprimentar();
});

document.getElementById("btn-calcular").addEventListener("click", calcular);
["num1", "num2"].forEach((id) => {
  document.getElementById(id).addEventListener("keydown", (e) => {
    if (e.key === "Enter") calcular();
  });
});
