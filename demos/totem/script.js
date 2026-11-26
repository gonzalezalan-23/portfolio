
let serialPort = null;
let reader = null;

// Variables de tamaño dinámico
let width, height, centerX, centerY, baseScale;

const canvas = document.getElementById('faceCanvas');
const ctx = canvas.getContext('2d');
const statusOverlay = document.getElementById('statusOverlay');

// Variables para suavizar la animación de la boca (Lerp) - Se inicializan vacías
let animatedMouthWidth = 35;
let animatedMouthHeight = 15;
let targetMouthWidth = 35;
let targetMouthHeight = 15;
let targetIsLine = true;

function resizeCanvas() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    centerX = width / 2;
    centerY = height / 2;

    baseScale = Math.min(width, height) / 500;

    // Actualizamos los objetivos iniciales de la boca con la escala correcta
    animatedMouthWidth = 30 * baseScale;
    animatedMouthHeight = 12 * baseScale;
    targetMouthWidth = 30 * baseScale;
    targetMouthHeight = 12 * baseScale;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas(); // Llamada inicial (aquí ya se calcula baseScale con seguridad)


let currentMouthShape = 'X';
let isSpeaking = false;
let currentVisemes = [];
let audio = null;
let blinkTimer = 0;
let isBlinking = false;
let idleCounter = 0; 
let indiceAudioActual = 0;
const totalAudios = 20;

async function dispararAccionHablar() {
    if (isSpeaking) return;
    let numeroActual = indiceAudioActual + 1;
    let audioRuta = `audios/audio(${numeroActual}).wav`;
    let jsonRuta = `visemas/audio(${numeroActual}).json`;

    console.log(`Reproduciendo audio secuencial: audio_${numeroActual}`);
    await cargarVisemasYAudio(audioRuta, jsonRuta);

    if (audio) {
        isSpeaking = true;
        audio.play();
        indiceAudioActual = (indiceAudioActual + 1) % totalAudios;
    }
}

// Conexión limpia y directa
async function conectarArduino() {
    if (serialPort) return;

    try {
        serialPort = await navigator.serial.requestPort();
        await serialPort.open({ baudRate: 9600 });

        console.log("¡Arduino conectado con éxito!");
        statusOverlay.style.display = 'none';

        // Iniciamos la lectura de forma independiente
        leerPuertoSerieDirecto();
        return true;
    } catch (error) {
        console.log("Sin Arduino: se usa la demo local.", error.message);
        return false;
    }
}

/* En el portfolio no hace falta hardware: si no hay Arduino (o el navegador
   no permite el puerto serial), el clic reproduce las respuestas grabadas. */
window.addEventListener('click', async () => {
    const conectado = navigator.serial ? await conectarArduino() : false;
    if (!conectado) {
        statusOverlay.style.display = 'none';
        await dispararAccionHablar();
    }
});

// Lector ultra simplificado usando TextDecoder nativo directo
let keepReading = true;

async function leerPuertoSerieDirecto() {
    const decoder = new TextDecoder();
    let buffer = "";

    try {
        while (serialPort && serialPort.readable && keepReading) {
            reader = serialPort.readable.getReader();
            try {
                while (true) {
                    const { value, done } = await reader.read();
                    if (done) break;

                    if (value) {
                        // Decodificamos y acumulamos en el búfer para evitar cortes
                        let textoCrudo = decoder.decode(value, { stream: true });
                        buffer += textoCrudo;
                        let lines = buffer.split("\n");
                        buffer = lines.pop(); // Guarda el remanente incompleto para el siguiente paquete

                        for (let line of lines) {
                            let mensaje = line.trim();
                            if (mensaje.length > 0) {
                                console.log("Mensaje procesado:", mensaje);

                                if (mensaje.toUpperCase().includes("TRIGGER")) {
                                    console.log("¡TRIGGER DETECTADO!");
                                    dispararAccionHablar();
                                }
                            }
                        }
                    }
                }
            } catch (error) {
                console.error("Error en lectura:", error);
                break;
            } finally {
                reader.releaseLock();
            }
        }
    } catch (error) {
        console.error("Error crítico:", error);
    }
}

// Resto del código de renderizado y animación
async function cargarVisemasYAudio(audioSrc, jsonSrc) {
    try {
        const response = await fetch(jsonSrc);
        const textData = await response.text();

        // Convertimos el formato de texto plano de Rhubarb en un arreglo de objetos compatible
        currentVisemes = textData.trim().split('\n').map(line => {
            let partes = line.trim().split(/\s+/);
            return {
                start: parseFloat(partes[0]),
                value: partes[1]
            };
        });

        // Calculamos el 'end' de cada visema basándonos en el inicio del siguiente
        for (let i = 0; i < currentVisemes.length; i++) {
            if (i < currentVisemes.length - 1) {
                currentVisemes[i].end = currentVisemes[i + 1].start;
            } else {
                currentVisemes[i].end = currentVisemes[i].start + 0.2; // Duración por defecto para el último
            }
        }

        audio = new Audio(audioSrc);
    } catch (error) {
        console.error("Error al cargar los visemas o el audio:", error);
    }
}

function drawFace() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!isSpeaking) {
        idleCounter += 0.04;
    }
    let breathingOffset = (isSpeaking ? 0 : Math.sin(idleCounter) * 4) * baseScale;
    let headRadius = 160 * baseScale;
    let eyeOffsetX = 65 * baseScale;
    let eyeOffsetY = -30 * baseScale;
    let eyeRadius = 20 * baseScale;
    let mouthOffsetY = 50 * baseScale;

    // Cabeza
    ctx.fillStyle = '#ffcc00';
    ctx.beginPath();
    ctx.arc(centerX, centerY + breathingOffset, headRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 5 * baseScale;
    ctx.strokeStyle = '#cca300';
    ctx.stroke();

    // Ojos
    blinkTimer++;
    if (blinkTimer > 190) {
        isBlinking = true;
        if (blinkTimer > 205) {
            isBlinking = false;
            blinkTimer = 0;
        }
    }

    ctx.fillStyle = '#333';
    if (!isBlinking) {
        ctx.beginPath();
        ctx.arc(centerX - eyeOffsetX, centerY + eyeOffsetY + breathingOffset, eyeRadius, 0, Math.PI * 2);
        ctx.arc(centerX + eyeOffsetX, centerY + eyeOffsetY + breathingOffset, eyeRadius, 0, Math.PI * 2);
        ctx.fill();
    } else {
        ctx.lineWidth = 5 * baseScale;
        ctx.strokeStyle = '#333';
        ctx.beginPath();
        ctx.moveTo(centerX - eyeOffsetX - (15 * baseScale), centerY + eyeOffsetY + breathingOffset);
        ctx.lineTo(centerX - eyeOffsetX + (15 * baseScale), centerY + eyeOffsetY + breathingOffset);
        ctx.moveTo(centerX + eyeOffsetX - (15 * baseScale), centerY + eyeOffsetY + breathingOffset);
        ctx.lineTo(centerX + eyeOffsetX + (15 * baseScale), centerY + eyeOffsetY + breathingOffset);
        ctx.stroke();
    }

// 4. BOCA SUAVIZADA (INTERPOLACIÓN / LERP)
if (currentMouthShape === 'X' || !isSpeaking) {
    targetIsLine = true;
    targetMouthWidth = 30 * baseScale;
    targetMouthHeight = 12 * baseScale; // Usado para la curvatura de reposo
} else {
    targetIsLine = false;
    if (currentMouthShape === 'A' || currentMouthShape === 'B') {
        // Vocales abiertas (vertical grande)
        targetMouthWidth = 26 * baseScale;
        targetMouthHeight = 35 * baseScale;
    } else if (currentMouthShape === 'C' || currentMouthShape === 'D' || currentMouthShape === 'E') {
        // Vocales medias / redondas
        targetMouthWidth = 22 * baseScale;
        targetMouthHeight = 22 * baseScale;
    } else {
        // Sonidos alargados o labiales (F, G, H)
        targetMouthWidth = 32 * baseScale;
        targetMouthHeight = 12 * baseScale;
    }
}

// Factor de suavizado (cuanto más chico, más lento y suave es el movimiento; ej: 0.2 o 0.25)
const easingFactor = 0.25; 

animatedMouthWidth += (targetMouthWidth - animatedMouthWidth) * easingFactor;
animatedMouthHeight += (targetMouthHeight - animatedMouthHeight) * easingFactor;

// Dibujado en pantalla con los valores interpolados
ctx.fillStyle = '#333';
ctx.strokeStyle = '#333';

if (targetIsLine && currentMouthShape === 'X') {
    ctx.lineWidth = 5 * baseScale;
    ctx.beginPath();
    ctx.moveTo(centerX - animatedMouthWidth, centerY + mouthOffsetY + breathingOffset);
    ctx.quadraticCurveTo(centerX, centerY + mouthOffsetY + animatedMouthHeight + breathingOffset, centerX + animatedMouthWidth, centerY + mouthOffsetY + breathingOffset);
    ctx.stroke();
} else {
    ctx.beginPath();
    ctx.ellipse(centerX, centerY + mouthOffsetY + breathingOffset, animatedMouthWidth, animatedMouthHeight, 0, 0, Math.PI * 2);
    ctx.fill();
}
}

function update() {
    if (isSpeaking && audio) {
        let elapsedTime = audio.currentTime;
        let activeCue = currentVisemes.find(cue => elapsedTime >= cue.start && elapsedTime <= cue.end);
        if (activeCue) {
            currentMouthShape = activeCue.value;
        }
        if (audio.ended) {
            isSpeaking = false;
            currentMouthShape = 'X';
        }
    }
    drawFace();
    requestAnimationFrame(update);
}

update();