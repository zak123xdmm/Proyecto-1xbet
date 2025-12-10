// =========================================================
// 1. Lógica General y de Navegación (para todas las páginas)
// =========================================================

const hamburger = document.getElementById("hamburger");
const navMenu = document.getElementById("nav");

if (hamburger && navMenu) {
    hamburger.addEventListener("click", () => {
        hamburger.classList.toggle("open");
        navMenu.classList.toggle("nav-active");
    });
}

// =========================================================
// 2. Lógica del Cupón de Apuestas (solo para partidos.html/index.html)
// =========================================================

const cuotaBtns = document.querySelectorAll(".cuota");
const montoBtns = document.querySelectorAll(".monto");
const montoInput = document.getElementById("monto-personalizado");
const apostarBtn = document.getElementById("apostar-btn");
const listaApuestasDiv = document.getElementById("lista-apuestas");
const textoVacioP = document.getElementById("texto-vacio");
const montoApuestaSpan = document.getElementById("monto-apuesta");
const gananciaSpan = document.getElementById("ganancia");

// Almacenamiento local del cupón
let apuestasSeleccionadas = JSON.parse(localStorage.getItem("cuponApuestas")) || [];
let montoSeleccionado = 0;

if (cuotaBtns.length > 0) {
    
    // --- Funciones de Utilidad ---

    const calcularGanancia = () => {
        if (apuestasSeleccionadas.length === 0) return 0;
        
        let multiplicador = apuestasSeleccionadas.reduce((acc, ap) => acc * parseFloat(ap.cuota), 1);
        return (multiplicador * montoSeleccionado).toFixed(2);
    };

    const actualizarCupón = () => {
        // Guardar en localStorage
        localStorage.setItem("cuponApuestas", JSON.stringify(apuestasSeleccionadas));

        // Actualizar DOM
        if (apuestasSeleccionadas.length > 0) {
            listaApuestasDiv.innerHTML = "";
            apuestasSeleccionadas.forEach(apuesta => {
                const item = document.createElement("div");
                item.className = "apuesta-item"; // Usaremos CSS para esto
                item.innerHTML = `
                    <p><b>${apuesta.evento}</b></p>
                    <p>Selección: ${apuesta.seleccion} @${apuesta.cuota}</p>
                    <button class="remover-apuesta" data-evento-id="${apuesta.eventoId}">X</button>
                    <hr>
                `;
                listaApuestasDiv.appendChild(item);
            });
            textoVacioP.style.display = 'none';
        } else {
            listaApuestasDiv.innerHTML = "";
            textoVacioP.style.display = 'block';
        }

        // Actualizar Monto y Ganancia
        montoApuestaSpan.textContent = montoSeleccionado;
        gananciaSpan.textContent = calcularGanancia();

        // Actualizar clase 'active' en los botones de cuota
        document.querySelectorAll(".cuota").forEach(btn => {
            const id = btn.dataset.evento + btn.dataset.seleccion;
            if (apuestasSeleccionadas.some(ap => ap.eventoId === id)) {
                btn.classList.add("active");
            } else {
                btn.classList.remove("active");
            }
        });
    };

    const removerApuesta = (eventoId) => {
        apuestasSeleccionadas = apuestasSeleccionadas.filter(ap => ap.eventoId !== eventoId);
        actualizarCupón();
    };


    // --- Event Listeners ---
    
    // 1. Selección de Cuota (Agregar/Quitar)
    cuotaBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const evento = btn.dataset.evento;
            const seleccion = btn.dataset.seleccion;
            const cuota = parseFloat(btn.dataset.cuota);
            const eventoId = evento + seleccion; // ID único para la apuesta
            
            // Si ya existe una apuesta para este evento (diferente selección), se quita.
            apuestasSeleccionadas = apuestasSeleccionadas.filter(ap => ap.evento !== evento);

            // Agregar la nueva selección
            apuestasSeleccionadas.push({ evento, seleccion, cuota, eventoId });

            actualizarCupón();
        });
    });

    // 2. Selección de Monto Rápido
    montoBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const monto = parseInt(btn.dataset.monto);
            montoSeleccionado = monto;
            montoInput.value = ""; // Limpiar input manual
            document.querySelectorAll(".monto").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            actualizarCupón();
        });
    });

    // 3. Selección de Monto Personalizado
    montoInput.addEventListener("input", (e) => {
        montoSeleccionado = parseFloat(e.target.value) || 0;
        document.querySelectorAll(".monto").forEach(b => b.classList.remove("active")); // Desactivar botones rápidos
        actualizarCupón();
    });

    // 4. Delegación para remover apuestas
    listaApuestasDiv.addEventListener("click", (e) => {
        if (e.target.classList.contains("remover-apuesta")) {
            removerApuesta(e.target.dataset.eventoId);
        }
    });

    // 5. Botón Realizar Apuesta
    apostarBtn.addEventListener("click", () => {

        if (apuestasSeleccionadas.length === 0) {
            alert("Debes seleccionar al menos una apuesta.");
            return;
        }

        if (montoSeleccionado <= 0) {
            alert("Ingresa un monto válido.");
            return;
        }

        const ganancia = calcularGanancia();

        // 🔥 Guardar boleto en localStorage
        const boleto = {
            id: Date.now(),
            apuestas: apuestasSeleccionadas,
            monto: montoSeleccionado,
            ganancia,
            fecha: new Date().toLocaleString()
        };

        const guardados = JSON.parse(localStorage.getItem("boletos")) || [];
        guardados.push(boleto);
        localStorage.setItem("boletos", JSON.stringify(guardados));

        alert(`🎉 ¡Apuesta realizada por ${montoSeleccionado} Bs! Ganancia posible: ${ganancia} Bs. Ahora está en Mis Apuestas.`);

        // Resetear cupón
        apuestasSeleccionadas = [];
        montoSeleccionado = 0;
        montoInput.value = "";
        document.querySelectorAll(".monto").forEach(b => b.classList.remove("active"));
        actualizarCupón();
    });

    // Cargar cupón al inicio si había datos guardados
    actualizarCupón(); 
}


// =========================================================
// 3. Lógica Carga de Apuestas Guardadas (solo para mis-apuestas.html)
// =========================================================

const contenedorBoletos = document.getElementById("contenedor-boletos");

if (contenedorBoletos) {
    const boletos = JSON.parse(localStorage.getItem("boletos")) || [];

    if (boletos.length === 0) {
        contenedorBoletos.innerHTML = "<p>No tienes apuestas activas.</p>";
    } else {
        boletos.forEach(b => {
            const box = document.createElement("div");
            box.className = "boleto";

            box.innerHTML = `
                <h3>Boleto #${b.id.toString().slice(-4)}</h3>
                <p><b>Fecha:</b> ${b.fecha}</p>
                <p><b>Monto:</b> ${b.monto} Bs</p>
                <p><b>Ganancia posible:</b> ${b.ganancia} Bs</p>

                <h4>Apuestas:</h4>
                <ul>
                    ${b.apuestas.map(a => `
                        <li>${a.evento} — **${a.seleccion}** (cuota ${a.cuota})</li>
                    `).join("")}
                </ul>

                <hr>
            `;

            contenedorBoletos.appendChild(box);
        });
    }
}