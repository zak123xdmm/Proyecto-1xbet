// script.js

// Seleccionamos el botón hamburguesa y el menú
const hamburger = document.querySelector('.hamburger');
const nav = document.querySelector('.main-nav');

// Añadimos el evento click al botón
hamburger.addEventListener('click', () => {
    nav.classList.toggle('nav-active'); // Muestra u oculta el menú
    hamburger.classList.toggle('open'); // Animación del botón
});
