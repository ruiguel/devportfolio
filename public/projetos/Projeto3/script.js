const clock= document.getElementById("relogio");
function updateClock() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2,'0');
  const minutes = String(now.getMinutes()).padStart(2,'0');
  const seconds = String(now.getSeconds()).padStart(2,'0');
  const year  =  String(now.getFullYear()).padStart(4, '2026');
  clock.innerHTML = `Horas ${hours}:${minutes}:${seconds}: Ano: ${year}`; 
  
}
updateClock();
setInterval(updateClock, 1000);