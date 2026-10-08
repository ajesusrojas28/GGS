
const icono = document.querySelector("#icono-fuego");
const audioArchivo = document.querySelector("#sonido-extintor");

let contexto = null;

function desbloquearAudio() {
  if (!contexto) {
    contexto = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (contexto.state === "suspended") contexto.resume();
}

["pointerdown", "keydown"].forEach((evento) => {
  document.addEventListener(evento, desbloquearAudio, { once: true });
});

function sonidoExtintor() {
  desbloquearAudio();
  if (contexto.state !== "running") return;

  const duracion = 1.2; // segundos
  const muestras = contexto.sampleRate * duracion;
  const buffer = contexto.createBuffer(1, muestras, contexto.sampleRate);
  const datos = buffer.getChannelData(0);
  for (let i = 0; i < muestras; i++) datos[i] = Math.random() * 2 - 1;

  const ruido = contexto.createBufferSource();
  ruido.buffer = buffer;

  const filtro = contexto.createBiquadFilter();
  filtro.type = "bandpass";
  filtro.frequency.value = 3000;

  const volumen = contexto.createGain();
  const ahora = contexto.currentTime;
  volumen.gain.setValueAtTime(0.0001, ahora);
  volumen.gain.exponentialRampToValueAtTime(0.5, ahora + 0.1);
  volumen.gain.exponentialRampToValueAtTime(0.0001, ahora + duracion);

  ruido.connect(filtro).connect(volumen).connect(contexto.destination);
  ruido.start();
}

function reproducir() {
  if (audioArchivo) {
    audioArchivo.currentTime = 0;
    audioArchivo.play().catch(() => {}); // ignora el bloqueo si aún no hubo interacción
  } else {
    sonidoExtintor();
  }
}

icono.addEventListener("mouseenter", reproducir);
icono.addEventListener("touchstart", reproducir, { passive: true }); // celular
icono.addEventListener("focus", reproducir); // teclado (Tab)