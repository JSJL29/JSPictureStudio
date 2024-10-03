// Sélectionnez l'élément de la barre de navigation
const navbar = document.getElementById("navbar");
const links = document.querySelectorAll(".nav-link");
const sections = document.querySelectorAll(".section");

// Obtenez la position initiale de la barre
const sticky = navbar.offsetTop;

// Fonction qui ajoute ou retire la classe "sticky" selon la position du scroll
function stickyNavbar() {
    if (window.pageYOffset >= sticky) {
        navbar.classList.add("sticky");
    } else {
        navbar.classList.remove("sticky");
    }
}

// Ajoutez un événement de défilement à la fenêtre
window.onscroll = function() {
    stickyNavbar();
};

// Fonction pour afficher la section correspondante
function showSection(sectionId) {
    sections.forEach(section => {
        if (section.id === sectionId) {
            section.classList.add("active");
        } else {
            section.classList.remove("active");
        }
    });
}

// Événement pour gérer les clics sur les liens de navigation
links.forEach(link => {
    link.addEventListener("click", function(event) {
        event.preventDefault();
        const sectionId = this.getAttribute("data-section");
        showSection(sectionId);
    });
});

// Affichez la section d'accueil par défaut
showSection("accueil");
