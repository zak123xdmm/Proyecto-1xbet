document.addEventListener('DOMContentLoaded', () => {

    // =========================================================
    // 1. LÓGICA PARA PARTIDOS.HTML (SELECCIÓN Y CUPÓN)
    // =========================================================

    // Elementos del DOM del Cupón
    const listaApuestas = document.getElementById('lista-apuestas');
    const textoVacio = document.getElementById('texto-vacio');
    const montoPersonalizadoInput = document.getElementById('monto-personalizado');
    const montoApuestaSpan = document.getElementById('monto-apuesta');
    const cuotaTotalSpan = document.getElementById('cuota-total'); 
    const gananciaSpan = document.getElementById('ganancia');
    const apostarBtn = document.getElementById('apostar-btn');

    // Selectores de botones de cuota y montos rápidos
    const cuotaBotones = document.querySelectorAll('.cuota');
    const montoBotones = document.querySelectorAll('.monto');

    let apuestasSeleccionadas = [];
    let montoSeleccionado = 0;

    // Solo ejecutar la lógica de apuestas si los elementos clave están presentes
    if (listaApuestas && apostarBtn && cuotaBotones.length > 0) { 
        
        // --- Funciones de Cupón y Cálculo ---

        function calcularGanancia() {
            // Si no hay apuestas, la cuota total es 1 (neutra)
            const cuotaTotal = apuestasSeleccionadas.reduce((total, ap) => total * parseFloat(ap.cuota), 1);

            const ganancia = montoSeleccionado * cuotaTotal;

            // Actualizar los SPANs
            if (cuotaTotalSpan) cuotaTotalSpan.textContent = cuotaTotal.toFixed(2);
            if (montoApuestaSpan) montoApuestaSpan.textContent = montoSeleccionado.toFixed(2);
            if (gananciaSpan) gananciaSpan.textContent = ganancia.toFixed(2);
            
            // Habilitar el botón si hay apuestas y monto
            apostarBtn.disabled = !(apuestasSeleccionadas.length > 0 && montoSeleccionado > 0);
        }

        function actualizarCupon() {
            // 1. Actualizar el estado de "Cupón Vacío"
            if (apuestasSeleccionadas.length === 0) {
                if (textoVacio) textoVacio.style.display = 'block';
                listaApuestas.innerHTML = "";
            } else {
                if (textoVacio) textoVacio.style.display = 'none';

                // 2. Renderizar la lista de apuestas en el DOM
                listaApuestas.innerHTML = apuestasSeleccionadas.map(ap => `
                    <div class="apuesta-item">
                        <span class="apuesta-cerrar" data-eventoid="${ap.eventoId}">❌</span>
                        <p><b>${ap.evento}</b></p>
                        <p>Selección: ${ap.seleccion} (cuota ${ap.cuota})</p>
                    </div>
                `).join("");
            }

            // 3. Recalcular
            calcularGanancia();
        }

        function handleSeleccionarCuota(event) {
            // MODIFICADO: Usar closest para asegurar que 'boton' es el elemento con la clase .cuota, 
            // incluso si se hizo clic en el <span> interno.
            const boton = event.target.closest('.cuota'); 
            if (!boton) return;
            
            const eventoNombre = boton.getAttribute('data-evento');
            // Creamos un ID único para esta selección: NombreEvento-Seleccion
            const seleccionKey = boton.getAttribute('data-seleccion'); 
            const eventoId = eventoNombre + '-' + seleccionKey; 
            
            const cuota = parseFloat(boton.getAttribute('data-cuota'));

            // 1. Desactivar y eliminar cualquier otra selección para el MISMO evento
            // Nota: Aquí se usa el eventoNombre, no el eventoId, para deseleccionar a los hermanos.
            document.querySelectorAll(`.cuota[data-evento="${eventoNombre}"].active`).forEach(btn => {
                btn.classList.remove('active');
            });
            
            // Filtra y elimina cualquier apuesta anterior para este evento
            apuestasSeleccionadas = apuestasSeleccionadas.filter(ap => ap.evento !== eventoNombre);

            // 2. Agregar la nueva cuota y activar el botón
            boton.classList.add('active');
            apuestasSeleccionadas.push({ eventoId, evento: eventoNombre, seleccion: seleccionKey, cuota });

            actualizarCupon();
        }

        function handleEliminarApuesta(event) {
            // Usamos event delegation en la listaApuestas
            if (event.target.classList.contains('apuesta-cerrar')) {
                const eventoId = event.target.getAttribute('data-eventoid');
                const eventoNombre = eventoId.split('-')[0]; // Extrae el nombre del evento

                // 1. Eliminar del array
                apuestasSeleccionadas = apuestasSeleccionadas.filter(ap => ap.eventoId !== eventoId);

                // 2. Desactivar el botón correspondiente en la lista de partidos
                document.querySelectorAll(`.cuota[data-evento="${eventoNombre}"]`).forEach(btn => {
                    // Quitamos la clase activa de todos los botones del evento
                    btn.classList.remove('active');
                });

                // 3. Actualizar
                actualizarCupon();
            }
        }

        function handleSeleccionarMonto(event) {
            montoBotones.forEach(btn => btn.classList.remove('active'));
            event.target.classList.add('active');
            
            montoSeleccionado = parseFloat(event.target.getAttribute('data-monto'));
            if (montoPersonalizadoInput) montoPersonalizadoInput.value = ''; 

            calcularGanancia();
        }

        function handleMontoPersonalizado() {
            montoBotones.forEach(btn => btn.classList.remove('active'));

            const valor = parseFloat(montoPersonalizadoInput.value);
            
            montoSeleccionado = (valor > 0) ? valor : 0;
            
            calcularGanancia();
        }


        // --- Lógica para Guardar (APOSTAR) ---
        function handleApostar() {
            if (apuestasSeleccionadas.length === 0 || montoSeleccionado <= 0) {
                alert("🚨 ¡Necesitas seleccionar al menos una cuota y un monto mayor a cero!");
                return;
            }
            
            // Usamos 1000.00 como saldo inicial si no existe
            let saldoActual = parseFloat(localStorage.getItem("saldo")) || 1000.00; 

            if (saldoActual < montoSeleccionado) {
                alert("❌ Saldo insuficiente. Tu saldo es: " + saldoActual.toFixed(2) + " Bs.");
                return;
            }

            // 1. Descontar saldo
            saldoActual -= montoSeleccionado;
            localStorage.setItem("saldo", saldoActual.toFixed(2));
            
            // 2. Crear y guardar el nuevo boleto
            const cuotaTotal = apuestasSeleccionadas.reduce((total, ap) => total * parseFloat(ap.cuota), 1);
            const ganancia = montoSeleccionado * cuotaTotal;
            
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

            alert("🎉 ¡Apuesta guardada! Ahora está en Mis Apuestas. Tu nuevo saldo es " + saldoActual.toFixed(2) + " Bs.");

            // 3. Resetear cupón
            apuestasSeleccionadas = [];
            montoSeleccionado = 0;
            if (montoPersonalizadoInput) montoPersonalizadoInput.value = '';
            
            // Resetear botones activos
            document.querySelectorAll('.cuota.active').forEach(btn => btn.classList.remove('active'));
            montoBotones.forEach(btn => btn.classList.remove('active'));
            
            actualizarCupon();
            
            // Llama a la función de Perfil para actualizar el saldo visible si existe
            if (typeof window.renderProfile === 'function') {
                window.renderProfile();
            }
        }


        // --- ASIGNACIÓN DE EVENTOS ---
        cuotaBotones.forEach(boton => {
            boton.addEventListener('click', handleSeleccionarCuota);
        });

        listaApuestas.addEventListener('click', handleEliminarApuesta);

        montoBotones.forEach(boton => {
            boton.addEventListener('click', handleSeleccionarMonto);
        });

        if (montoPersonalizadoInput) {
            montoPersonalizadoInput.addEventListener('input', handleMontoPersonalizado);
        }
        
        apostarBtn.addEventListener('click', handleApostar);
        
        // Inicialización
        actualizarCupon();

    } // Fin del bloque de lógica de partidos.html

    // =========================================================
    // 2. LÓGICA PARA MIS-APUESTAS.HTML (RENDERIZAR BOLETOS)
    // =========================================================
    const contenedorBoletos = document.getElementById('contenedor-boletos');

    if (contenedorBoletos) {
        
        function renderBoletos() {
            const boletos = JSON.parse(localStorage.getItem("boletos")) || [];

            if (boletos.length === 0) {
                contenedorBoletos.innerHTML = "<p>No tienes apuestas activas.</p>";
            } else {
                // Mostrar el más reciente primero
                contenedorBoletos.innerHTML = boletos.reverse().map(b => {
                    const shortId = String(b.id).slice(-4); 
                    
                    const listaApuestasHTML = b.apuestas.map(a => `
                        <li>
                            ${a.evento} → Gana **${a.seleccion}** (Cuota ${a.cuota})
                        </li>
                    `).join("");
                    
                    return `
                        <div class="boleto">
                            <h3>Boleto #${shortId}</h3>
                            <p><b>Fecha:</b> ${b.fecha}</p>
                            <p><b>Monto apostado:</b> ${parseFloat(b.monto).toFixed(2)} Bs</p>
                            <p><b>Ganancia posible:</b> <span style="color:var(--color-green); font-weight: 700;">${parseFloat(b.ganancia).toFixed(2)} Bs</span></p>

                            <h4 style="margin-top:0.8rem;">Apuestas Incluidas:</h4>
                            <ul>
                                ${listaApuestasHTML}
                            </ul>
                        </div>
                    `;
                }).join("");
            }
        }
        renderBoletos(); // Llamar al renderizado al inicio
    }

}); // Fin del DOMContentLoaded