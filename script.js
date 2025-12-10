// =========================================================
// 1. Lógica Google Login (para perfil.html)
// DEBE SER GLOBAL PARA QUE GOOGLE PUEDA ACCEDER
// =========================================================

const perfilName = document.getElementById('perfil-name');
const perfilEmail = document.getElementById('perfil-email');
const perfilSaldo = document.getElementById('perfil-saldo');
const googleLoginContainer = document.getElementById('google-login-container');
const logoutBtn = document.getElementById('logout-btn');

const SALDO_INICIAL = 1000.00;

// Función JWT Decode (DEBE SER ACCESIBLE de forma global para la demostración)
window.jwt_decode = function(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error("Error al decodificar JWT:", e);
        return {};
    }
}

// 🔑 Esta función es llamada por Google al iniciar sesión (DEBE SER GLOBAL)
window.handleCredentialResponse = function(response) {
    // Usamos window.jwt_decode para asegurar el acceso global
    const data = window.jwt_decode(response.credential);
    
    if (Object.keys(data).length === 0) {
        alert("🚨 Error: No se pudo decodificar la respuesta de Google.");
        return;
    }

    // Guardar información en localStorage
    localStorage.setItem("user_name", data.name);
    localStorage.setItem("user_email", data.email);
    localStorage.setItem("logged_in", "true");
    
    // Si es el primer login, establece el saldo inicial
    if (localStorage.getItem("saldo") === null) {
        localStorage.setItem("saldo", SALDO_INICIAL.toFixed(2));
    }

    renderProfile();
};

function handleLogout() {
    localStorage.removeItem("user_name");
    localStorage.removeItem("user_email");
    localStorage.removeItem("logged_in");
    
    // Forzar el logout del SDK de Google 
    // Nota: GIS no tiene una función de logout simple, pero deshabilita la selección automática
    if (typeof google !== 'undefined' && google.accounts.id) {
        google.accounts.id.disableAutoSelect();
    }

    renderProfile();
    // Recargar la página de perfil para limpiar la UI después del logout
    if (window.location.pathname.includes('perfil.html')) {
        window.location.reload();
    }
}


// 🔄 Esta función actualiza la vista de perfil y el saldo (DEBE SER GLOBAL para otros archivos como apuestas.js)
window.renderProfile = function() {
    const isLoggedIn = localStorage.getItem("logged_in") === "true";
    const userName = localStorage.getItem("user_name") || "Usuario Invitado";
    const userEmail = localStorage.getItem("user_email") || "No logueado";
    // El saldo lo obtenemos de localStorage o usamos el inicial
    const userSaldo = parseFloat(localStorage.getItem("saldo")) || SALDO_INICIAL;
    
    if (perfilName) perfilName.textContent = userName;
    if (perfilEmail) perfilEmail.textContent = isLoggedIn ? userEmail : "No logueado";
    if (perfilSaldo) perfilSaldo.textContent = userSaldo.toFixed(2);

    if (googleLoginContainer) {
        // En perfil.html, ocultamos el botón de login si ya está logueado
        googleLoginContainer.style.display = isLoggedIn ? 'none' : 'block';
    }
    if (logoutBtn) {
        // Mostramos el botón de logout si está logueado
        logoutBtn.style.display = isLoggedIn ? 'block' : 'none';
    }
};

// =========================================================
// 2. Inicialización General y Menú Hamburguesa
// =========================================================

document.addEventListener('DOMContentLoaded', () => {

    // Lógica para el menú hamburguesa
    const hamburger = document.getElementById('hamburger');
    const nav = document.getElementById('nav');

    if (hamburger && nav) {
        hamburger.addEventListener('click', () => {
            nav.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
    }

    // Lógica de Perfil: Inicialización de la vista y eventos
    if (document.body.id === 'perfil-page') {
        window.renderProfile(); // Aseguramos que se llama la versión global
        if (logoutBtn) {
            logoutBtn.addEventListener('click', handleLogout); 
        }
    }
    
    // Asegurar que el saldo se inicializa en localStorage si no existe
    if (localStorage.getItem("saldo") === null) {
         localStorage.setItem("saldo", SALDO_INICIAL.toFixed(2));
    }
    
});