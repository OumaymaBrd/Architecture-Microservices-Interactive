// Variables d'état
const activeScenario = null
const activeStep = 0
const isAnimating = false
let animationSpeed = 1
const dataPackets = []
let darkMode = true

// Éléments DOM
const themeToggle = document.getElementById("theme-toggle")
const speedButtons = document.querySelectorAll("[data-speed]")
const scenarioButtons = document.querySelectorAll('[id^="scenario-"]')
const stepInfo = document.getElementById("step-info")
const stepDescription = document.getElementById("step-description")
const progressBar = document.getElementById("progress-bar")
const stepCounter = document.getElementById("step-counter")
const scenarioTitle = document.getElementById("scenario-title")
const logsEmpty = document.getElementById("logs-empty")
const logsList = document.getElementById("logs-list")
const popup = document.getElementById("popup")
const popupTitle = document.getElementById("popup-title")
const popupMessage = document.getElementById("popup-message")
const diagram = document.getElementById("diagram")
const explanationEmpty = document.getElementById("explanation-empty")
const explanationOrder = document.getElementById("explanation-orderCreation")
const explanationProduct = document.getElementById("explanation-productSearch")
const explanationAuth = document.getElementById("explanation-userAuthentication")

// Déclaration de la fonction startScenario (exemple, à adapter selon l'implémentation réelle)
function startScenario(scenarioId) {
  console.log(`Démarrage du scénario : ${scenarioId}`)
  // Ajouter ici la logique de démarrage du scénario
}

// Déclaration de la fonction initializeServices (exemple, à adapter selon l'implémentation réelle)
function initializeServices() {
  console.log("Initialisation des services...")
  // Ajouter ici la logique d'initialisation des services
}

// Fonction pour basculer le thème
themeToggle.addEventListener("click", () => {
  darkMode = !darkMode
  document.body.classList.toggle("dark", darkMode)
  themeToggle.textContent = darkMode ? "Mode Clair" : "Mode Sombre"
})

// Fonction pour définir la vitesse d'animation
speedButtons.forEach((button) => {
  button.addEventListener("click", () => {
    animationSpeed = Number.parseFloat(button.dataset.speed)
    speedButtons.forEach((btn) => {
      btn.classList.remove("button-active")
    })
    button.classList.add("button-active")
  })
})

// Fonction pour démarrer un scénario
scenarioButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const scenarioId = button.id.replace("scenario-", "")
    startScenario(scenarioId)
  })
})

// Initialiser l'interface
document.addEventListener("DOMContentLoaded", () => {
  // Initialiser les services avec leurs classes de couleur
  initializeServices()
})

