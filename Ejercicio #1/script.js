const botonContacto = document.getElementById("botonContacto");
const contactos = document.getElementById("contactos");
const flecha = document.getElementById("flecha");

botonContacto.addEventListener("click", function () {
    contactos.classList.toggle("oculto");

    if (contactos.classList.contains("oculto")) {
        flecha.textContent = "⌄";
    } else {
        flecha.textContent = "⌃";
    }
});
