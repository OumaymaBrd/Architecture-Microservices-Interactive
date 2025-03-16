// Déclaration des variables globales
let isAnimating = false
let activeScenario = null
let activeStep = 0

// Déclaration des variables manquantes
const scenarioButtons = document.querySelectorAll(".scenario-button") // Assurez-vous que vos boutons ont cette classe
const stepInfo = document.getElementById("step-info") // Assurez-vous d'avoir un élément avec cet ID
const scenarioTitle = document.getElementById("scenario-title") // Assurez-vous d'avoir un élément avec cet ID

// Déclaration des variables manquantes (explanations)
const explanationEmpty = document.getElementById("explanation-empty") // Assurez-vous d'avoir un élément avec cet ID
const explanationOrder = document.getElementById("explanation-order") // Assurez-vous d'avoir un élément avec cet ID
const explanationProduct = document.getElementById("explanation-product") // Assurez-vous d'avoir un élément avec cet ID
const explanationAuth = document.getElementById("explanation-auth") // Assurez-vous d'avoir un élément avec cet ID

// Déclaration de la variable scenarios (à remplacer par l'import si nécessaire)
const scenarios = {
  orderCreation: {
    name: "Création de commande",
    steps: [], // Remplacer par les étapes réelles
  },
  productSearch: {
    name: "Recherche de produit",
    steps: [], // Remplacer par les étapes réelles
  },
  userAuthentication: {
    name: "Authentification utilisateur",
    steps: [], // Remplacer par les étapes réelles
  },
}

// Fonction pour démarrer l'animation d'un scénario
function startScenario(scenarioId) {
  if (isAnimating) return

  // Réinitialiser l'état
  activeScenario = scenarioId
  activeStep = 0
  clearLogs()
  clearConnections()
  clearServices()
  clearDataPackets()
  isAnimating = true

  // Mettre à jour l'interface
  scenarioButtons.forEach((btn) => {
    btn.classList.remove("button-active")
    if (btn.id === `scenario-${scenarioId}`) {
      btn.classList.add("button-active")
    }
  })

  stepInfo.classList.remove("hidden")
  scenarioTitle.textContent = `Scénario: ${scenarios[scenarioId].name}`

  // Afficher l'explication du scénario
  explanationEmpty.classList.add("hidden")
  explanationOrder.classList.add("hidden")
  explanationProduct.classList.add("hidden")
  explanationAuth.classList.add("hidden")

  if (scenarioId === "orderCreation") {
    explanationOrder.classList.remove("hidden")
  } else if (scenarioId === "productSearch") {
    explanationProduct.classList.remove("hidden")
  } else if (scenarioId === "userAuthentication") {
    explanationAuth.classList.remove("hidden")
  }

  // Démarrer l'animation
  animateStep()
}

// Fonction pour animer une étape
function animateStep() {
  if (!isAnimating || !activeScenario) return

  const scenario = scenarios[activeScenario]
  const currentStep = scenario.steps[activeStep]

  if (!currentStep) {
    isAnimating = false
    return
  }

  // Mettre à jour l'interface
  stepDescription.textContent = currentStep.description
  progressBar.style.width = `${(activeStep / scenario.steps.length) * 100}%`
  stepCounter.textContent = `Étape ${activeStep + 1} / ${scenario.steps.length}`

  // Mettre à jour les connexions actives
  clearConnections()
  currentStep.connections.forEach((connectionId) => {
    const connection = document.getElementById(`connection-${connectionId}`)
    if (connection) {
      connection.classList.add("connection-active")
    }
  })

  // Mettre à jour les services actifs
  clearServices()
  currentStep.services.forEach((serviceId) => {
    const service = document.getElementById(`service-${serviceId}`)
    if (service) {
      service.classList.add("service-active")
    }
  })

  // Afficher le popup d'explication
  if (currentStep.popup) {
    popupTitle.textContent = currentStep.popup.title
    popupMessage.textContent = currentStep.popup.message
    popup.style.left = `${currentStep.popup.position.x}%`
    popup.style.top = `${currentStep.popup.position.y}px`
    popup.classList.add("popup-visible")
  }

  // Ajouter les paquets de données
  if (currentStep.dataPackets) {
    currentStep.dataPackets.forEach((packet, index) => {
      setTimeout(
        () => {
          const packetId = `${packet.from}-${packet.to}-${Date.now()}`
          createDataPacket(packetId, packet.from, packet.to, packet.type)
        },
        (index * 800) / animationSpeed,
      )
    })
  }

  // Ajouter les logs de l'étape
  if (currentStep.logs) {
    logsEmpty.classList.add("hidden")
    logsList.classList.remove("hidden")

    currentStep.logs.forEach((log, index) => {
      setTimeout(
        () => {
          addLog(log)
        },
        (index * 800) / animationSpeed,
      )
    })
  }

  // Passer à l'étape suivante après un délai
  const timer = setTimeout(
    () => {
      popup.classList.remove("popup-visible")
      activeStep++
      animateStep()
    },
    (currentStep.logs.length * 800 + 2500) / animationSpeed,
  )
}

// Fonction pour créer un paquet de données
function createDataPacket(id, from, to, type) {
  const fromPos = servicePositions[from]
  const toPos = servicePositions[to]

  if (!fromPos || !toPos) return

  const packet = document.createElement("div")
  packet.id = id
  packet.className = `data-packet data-packet-${type}`
  packet.style.left = `${fromPos.x}%`
  packet.style.top = `${fromPos.y}px`
  diagram.appendChild(packet)

  // Animation de progression du paquet
  let progress = 0
  const animationInterval = setInterval(() => {
    progress += 5

    if (progress >= 100) {
      clearInterval(animationInterval)
      setTimeout(() => {
        packet.remove()
      }, 500)
      return
    }

    const x = fromPos.x + (toPos.x - fromPos.x) * (progress / 100)
    const y = fromPos.y + (toPos.y - fromPos.y) * (progress / 100)

    packet.style.left = `${x}%`
    packet.style.top = `${y}px`
  }, 50 / animationSpeed)
}

