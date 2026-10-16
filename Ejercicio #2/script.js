const fecha = document.getElementById("date");
const hora = document.getElementById("hora");
const minuto = document.getElementById("minuto");
const segundo = document.getElementById("segundo");
const formato = document.getElementById("formato");

function Reloj_Digital() {
    const ahora = new Date();

    const dias = [
        "Domingo", "Lunes", "Martes", "Miércoles",
        "Jueves", "Viernes", "Sábado"
    ];

    const meses = [
        "Enero", "Febrero", "Marzo", "Abril",
        "Mayo", "Junio", "Julio", "Agosto",
        "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    fecha.textContent =
        dias[ahora.getDay()] + " " +
        ahora.getDate() + " de " +
        meses[ahora.getMonth()] + " de " +
        ahora.getFullYear();

    let horas = ahora.getHours();
    formato.textContent = horas >= 12 ? "PM" : "AM";

    horas = horas % 12 || 12;

    hora.textContent = String(horas).padStart(2, "0");
    minuto.textContent = String(ahora.getMinutes()).padStart(2, "0");
    segundo.textContent = String(ahora.getSeconds()).padStart(2, "0");
}

Reloj_Digital();
setInterval(Reloj_Digital, 1000);


// Registro de alarmas.
let alarmas = [];
let alarmaEditando = -1;
let audioContext = null;


let intervaloSonido = null;
let alarmaSonando = -1;
let oscilador = null;
let volumen = null;


function agregarAlarma() {
    const campoHora = document.getElementById("horaAlarma");
    const campoFormato = document.getElementById("formatoAlarma");

    const horaSeleccionada = campoHora.value;

    if (!horaSeleccionada) {
        alert("Selecciona una hora.");
        return;
    }

    const [horas, minutos] = horaSeleccionada.split(":").map(Number);
    const formatoAlarma = campoFormato.value;

    let hora24 = horas % 12;

    if (formatoAlarma === "PM") {
        hora24 += 12;
    }

    const horaFinal =
        String(hora24).padStart(2, "0") + ":" +
        String(minutos).padStart(2, "0");

    if (alarmaEditando !== -1) {
        alarmas[alarmaEditando].hora = horaFinal;
        alarmas[alarmaEditando].formato = formatoAlarma;
        alarmas[alarmaEditando].sonando = false;

        alarmaEditando = -1;

        document.querySelector(".alarmas > button").textContent =
            "Agregar alarma";
    } else {
        alarmas.push({
            hora: horaFinal,
            formato: formatoAlarma,
            activa: true,
            sonando: false
        });
    }

    campoHora.value = "";
    mostrarAlarmas();
}

function mostrarAlarmas() {
    const lista = document.getElementById("listaAlarmas");
    lista.innerHTML = "";

    alarmas.forEach((alarma, i) => {
        let horas = Number(alarma.hora.split(":")[0]);
        const minutos = alarma.hora.split(":")[1];

        horas = horas % 12 || 12;

        const horaMostrar =
            String(horas).padStart(2, "0") + ":" + minutos;

        const li = document.createElement("li");

        if (alarmaSonando === i) {
            li.classList.add("sonando");
        }

        const textoHora = document.createElement("strong");
        textoHora.textContent = horaMostrar + " " + alarma.formato;

        const editar = document.createElement("button");
        editar.textContent = "Editar";
        editar.className = "btn-editar";
        editar.onclick = () => editarAlarma(i);

        const eliminar = document.createElement("button");
        eliminar.textContent = "Eliminar";
        eliminar.className = "btn-eliminar";
        eliminar.onclick = () => eliminarAlarma(i);

        const estado = document.createElement("button");
        estado.textContent = alarma.activa ? "Desactivar" : "Activar";
        estado.className = "btn-estado";
        estado.onclick = () => alternarAlarma(i);

        li.append(textoHora, editar, eliminar, estado);

        if (alarmaSonando === i) {
            const detener = document.createElement("button");
            detener.textContent = "Detener sonido";
            detener.className = "btn-detener";
            detener.onclick = detenerAlarma;
            li.appendChild(detener);
        }

        lista.appendChild(li);
    });
}

function editarAlarma(i) {
    const alarma = alarmas[i];

    let horas = Number(alarma.hora.split(":")[0]);
    const minutos = alarma.hora.split(":")[1];

    horas = horas % 12 || 12;

    document.getElementById("horaAlarma").value =
        String(horas).padStart(2, "0") + ":" + minutos;

    document.getElementById("formatoAlarma").value = alarma.formato;

    alarmaEditando = i;

    document.querySelector(".alarmas > button").textContent =
        "Guardar cambios";
}

function eliminarAlarma(i) {
    alarmas.splice(i, 1);

    if (alarmaEditando === i) {
        alarmaEditando = -1;
        document.getElementById("horaAlarma").value = "";

        document.querySelector(".alarmas > button").textContent =
            "Agregar alarma";
    } else if (alarmaEditando > i) {
        alarmaEditando--;
    }

    mostrarAlarmas();
}

function alternarAlarma(i) {
    alarmas[i].activa = !alarmas[i].activa;
    alarmas[i].sonando = false;

    mostrarAlarmas();
}

function sonarAlarma(indice) {
    if (alarmaSonando !== -1) return;

    alarmaSonando = indice;
    mostrarAlarmas();

    if (!audioContext) {
        audioContext = new AudioContext();
    }

    audioContext.resume().then(() => {
        if (alarmaSonando !== indice) return;

        function emitirSonido() {
            if (alarmaSonando !== indice) return;

            const oscilador = audioContext.createOscillator();
            const volumen = audioContext.createGain();

            oscilador.type = "sine";
            oscilador.frequency.value = 880;
            volumen.gain.value = 0.3;

            oscilador.connect(volumen);
            volumen.connect(audioContext.destination);

            oscilador.start();
            oscilador.stop(audioContext.currentTime + 0.4);
        }

        emitirSonido();
        intervaloSonido = setInterval(emitirSonido, 800);
    });
}

function detenerAlarma() {
    if (intervaloSonido !== null) {
        clearInterval(intervaloSonido);
        intervaloSonido = null;
    }

    alarmaSonando = -1;
    mostrarAlarmas();
}

function revisarAlarmas() {
    const ahora = new Date();

    const horaActual =
        String(ahora.getHours()).padStart(2, "0") + ":" +
        String(ahora.getMinutes()).padStart(2, "0");

    alarmas.forEach((alarma, i) => {
        if (
            alarma.activa &&
            alarma.hora === horaActual &&
            !alarma.sonando
        ) {
            alarma.sonando = true;
            sonarAlarma(i);
        }

        if (alarma.hora !== horaActual) {
            alarma.sonando = false;
        }
    });
}

setInterval(revisarAlarmas, 1000);