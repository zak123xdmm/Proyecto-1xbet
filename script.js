/* =========================================================
   MENÚ HAMBURGUESA
========================================================= */
const hamburger = document.getElementById("hamburger");
const nav = document.getElementById("nav");

hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("open");
    nav.classList.toggle("nav-active");
});

/* =========================================================
   VARIABLES DEL CUPÓN
========================================================= */

let apuestasSeleccionadas = [];
let montoSeleccionado = 0;

const listaApuestas = document.getElementById("lista-apuestas");
const textoVacio = document.getElementById("texto-vacio");
const montoSpan = document.getElementById("monto-apuesta");
const gananciaSpan = document.getElementById("ganancia");
const apostarBtn = document.getElementById("apostar-btn");

/* NUEVO: campo de monto personalizado */
const inputMonto = document.getElementById("monto-personalizado");

/* =========================================================
   SELECCIÓN DE CUOTAS
========================================================= */
document.querySelectorAll(".cuota").forEach(btn => {
    btn.addEventListener("click", () => {

        const evento = btn.dataset.evento;
        const seleccion = btn.dataset.seleccion;
        const cuota = parseFloat(btn.dataset.cuota);

        // Quitar selección previa
        document.querySelectorAll(`.cuota[data-evento="${evento}"]`)
            .forEach(b => b.classList.remove("active"));

        btn.classList.add("active");

        // actualizar o agregar apuesta
        const existente = apuestasSeleccionadas.find(a => a.evento === evento);

        if (existente) {
            existente.seleccion = seleccion;
            existente.cuota = cuota;
        } else {
            apuestasSeleccionadas.push({ evento, seleccion, cuota });
        }

        actualizarCupon();
    });
});

/* =========================================================
   SELECCIÓN DE MONTOS PREDEFINIDOS
========================================================= */
document.querySelectorAll(".monto").forEach(btn => {
    btn.addEventListener("click", () => {

        document.querySelectorAll(".monto").forEach(b => b.classList.remove("active"));

        btn.classList.add("active");

        montoSeleccionado = parseFloat(btn.dataset.monto);

        inputMonto.value = ""; // limpiar manual

        actualizarCupon();
    });
});

/* =========================================================
   MONTO ESCRITO MANUALMENTE
========================================================= */
inputMonto.addEventListener("input", () => {

    let valor = parseFloat(inputMonto.value);

    if (isNaN(valor) || valor <= 0) {
        montoSeleccionado = 0;
    } else {
        montoSeleccionado = valor;

        // desmarcar botones predefinidos
        document.querySelectorAll(".monto").forEach(b => b.classList.remove("active"));
    }

    actualizarCupon();
});

/* =========================================================
   ACTUALIZAR CUPÓN
========================================================= */
function actualizarCupon() {

    listaApuestas.innerHTML = "";

    if (apuestasSeleccionadas.length === 0) {
        textoVacio.style.display = "block";
    } else {
        textoVacio.style.display = "none";

        apuestasSeleccionadas.forEach(apuesta => {
            const div = document.createElement("div");
            div.className = "item-apuesta";

            div.innerHTML = `
                <p><b>${apuesta.evento}</b></p>
                <p>Opción: ${apuesta.seleccion} • Cuota: ${apuesta.cuota}</p>
                <button class="eliminar">✖</button>
            `;

            div.querySelector(".eliminar").onclick = () => {
                eliminarApuesta(apuesta.evento);
            };

            listaApuestas.appendChild(div);
        });
    }

    montoSpan.textContent = montoSeleccionado.toFixed(2);

    let multiplicador = apuestasSeleccionadas.reduce(
        (acc, ap) => acc * ap.cuota, 
        1
    );

    if (montoSeleccionado > 0 && apuestasSeleccionadas.length > 0) {
        gananciaSpan.textContent = (montoSeleccionado * multiplicador).toFixed(2);
    } else {
        gananciaSpan.textContent = "0";
    }
}

/* =========================================================
   ELIMINAR APUESTA
========================================================= */
function eliminarApuesta(evento) {
    apuestasSeleccionadas = apuestasSeleccionadas.filter(a => a.evento !== evento);

    document.querySelectorAll(`.cuota[data-evento="${evento}"]`)
        .forEach(b => b.classList.remove("active"));

    actualizarCupon();
}

/* =========================================================
   BOTÓN "REALIZAR APUESTA"
========================================================= */
apostarBtn.addEventListener("click", () => {

    if (apuestasSeleccionadas.length === 0) {
        alert("Debes seleccionar al menos una apuesta.");
        return;
    }

    if (montoSeleccionado <= 0) {
        alert("Ingresa un monto válido.");
        return;
    }

    const ganancia = gananciaSpan.textContent;

    alert(`
🎉 ¡Apuesta realizada!

Apuestas: ${apuestasSeleccionadas.length}
Monto: ${montoSeleccionado} Bs
Ganancia posible: ${ganancia} Bs
    `);

    // reset
    apuestasSeleccionadas = [];
    montoSeleccionado = 0;
    inputMonto.value = "";

    document.querySelectorAll(".cuota").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".monto").forEach(b => b.classList.remove("active"));

    actualizarCupon();
});
