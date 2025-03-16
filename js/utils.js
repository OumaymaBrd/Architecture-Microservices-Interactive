// Déclaration des variables logsList et logsEmpty
const logsList = document.getElementById("logs-list")
const logsEmpty = document.getElementById("logs-empty")

// Fonction pour effacer les logs
function clearLogs() {
  logsList.innerHTML = ""
  logsEmpty.classList.remove("hidden")
  logsList.classList.add("hidden")
}

// Fonction pour effacer les connexions actives
function clearConnections() {
  document.querySelectorAll(".connection").forEach((connection) => {
    connection.classList.remove("connection-active")
  })
}

// Fonction pour effacer les services actifs
function clearServices() {
  document.querySelectorAll(".service").forEach((service) => {
    service.classList.remove("service-active")
  })
}

// Fonction pour effacer les paquets de données
function clearDataPackets() {
  document.querySelectorAll(".data-packet").forEach((packet) => {
    packet.remove()
  })
}

// Fonction pour ajouter un log
function addLog(log) {
  const timestamp = new Date().toLocaleTimeString()

  const logItem = document.createElement("div")
  logItem.className = `log-item log-${log.type}`

  logItem.innerHTML = `
    <div class="flex items-center gap-2">
      <span class="font-semibold">${log.service}</span> 
      <span class="text-xs text-gray-500 dark:text-gray-400">${timestamp}</span>
      <span class="badge badge-${log.type}">${log.type}</span>
    </div>
    <div class="mt-1">${log.message}</div>
  `

  logsList.appendChild(logItem)

  // Animation d'apparition
  setTimeout(() => {
    logItem.classList.add("log-item-visible")
  }, 10)

  // Scroll vers le bas
  logsList.scrollTop = logsList.scrollHeight
}

// Fonction pour initialiser les services avec leurs classes de couleur
function initializeServices() {
  document.getElementById("service-client").classList.add("service-client")
  document.getElementById("service-gateway").classList.add("service-gateway")
  document.getElementById("service-auth").classList.add("service-auth")
  document.getElementById("service-user").classList.add("service-user")
  document.getElementById("service-product").classList.add("service-product")
  document.getElementById("service-order").classList.add("service-order")
  document.getElementById("service-config").classList.add("service-config")
  document.getElementById("service-user-db").classList.add("service-database")
  document.getElementById("service-product-db").classList.add("service-database")
  document.getElementById("service-order-db").classList.add("service-database")
}

