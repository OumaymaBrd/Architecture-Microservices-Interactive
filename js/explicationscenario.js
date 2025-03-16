// Définition des scénarios
const scenarios = {
    orderCreation: {
      name: "Création d'une commande",
      steps: [
        {
          description: "Le client envoie une requête pour créer une commande",
          connections: ["client-gateway"],
          services: ["client"],
          dataPackets: [{ from: "client", to: "gateway", type: "request" }],
          logs: [{ service: "Client", message: "POST /api/orders avec données de commande", type: "request" }],
          popup: {
            title: "Requête Client",
            message:
              "Le client envoie une requête HTTP POST avec les détails de la commande (produits, quantités, adresse de livraison)",
            position: { x: 50, y: 14 },
          },
        },
        {
          description: "L'API Gateway authentifie la requête",
          connections: ["gateway-auth"],
          services: ["gateway", "auth"],
          dataPackets: [
            { from: "gateway", to: "auth", type: "request" },
            { from: "auth", to: "gateway", type: "response" },
          ],
          logs: [
            { service: "API Gateway", message: "Vérification du token JWT", type: "process" },
            { service: "Auth Service", message: "Validation du token et des permissions", type: "response" },
          ],
          popup: {
            title: "Authentification",
            message: "L'API Gateway vérifie que l'utilisateur est authentifié et autorisé à créer une commande",
            position: { x: 35, y: 60 },
          },
        },
        {
          description: "L'API Gateway transmet la requête au service utilisateur",
          connections: ["gateway-user"],
          services: ["gateway", "user"],
          dataPackets: [{ from: "gateway", to: "user", type: "request" }],
          logs: [
            { service: "API Gateway", message: "Transmission de la requête au User Service", type: "request" },
            { service: "User Service", message: "Récupération des informations utilisateur", type: "process" },
          ],
          popup: {
            title: "Vérification Utilisateur",
            message: "L'API Gateway transmet la requête au service utilisateur pour récupérer les informations complètes",
            position: { x: 45, y: 60 },
          },
        },
        {
          description: "Le service utilisateur vérifie les données dans sa base",
          connections: ["user-db"],
          services: ["user", "user-db"],
          dataPackets: [
            { from: "user", to: "user-db", type: "database" },
            { from: "user-db", to: "user", type: "response" },
          ],
          logs: [
            { service: "User Service", message: "SELECT * FROM users WHERE id = ?", type: "database" },
            { service: "User DB", message: "Retourne les données utilisateur", type: "response" },
          ],
          popup: {
            title: "Accès Base de Données",
            message:
              "Le service utilisateur interroge sa base de données pour vérifier l'existence et les informations de l'utilisateur",
            position: { x: 40, y: 250 },
          },
        },
        {
          description: "Le service utilisateur transmet les données au service produit",
          connections: ["user-product"],
          services: ["user", "product"],
          dataPackets: [{ from: "user", to: "product", type: "request" }],
          logs: [
            { service: "User Service", message: "Envoi des données au Product Service", type: "request" },
            { service: "Product Service", message: "Réception de la requête", type: "process" },
          ],
          popup: {
            title: "Communication Inter-Services",
            message:
              "Le service utilisateur transmet les données validées au service produit pour vérifier les produits commandés",
            position: { x: 50, y: 120 },
          },
        },
        {
          description: "Le service produit vérifie la disponibilité des produits",
          connections: ["product-db"],
          services: ["product", "product-db"],
          dataPackets: [
            { from: "product", to: "product-db", type: "database" },
            { from: "product-db", to: "product", type: "response" },
          ],
          logs: [
            { service: "Product Service", message: "SELECT * FROM products WHERE id IN (?)", type: "database" },
            { service: "Product DB", message: "Vérification du stock disponible", type: "process" },
            { service: "Product DB", message: "Retourne les données produits", type: "response" },
          ],
          popup: {
            title: "Vérification Stock",
            message: "Le service produit vérifie la disponibilité en stock des produits demandés dans la commande",
            position: { x: 60, y: 250 },
          },
        },
        {
          description: "Le service produit confirme la disponibilité au service commande",
          connections: ["product-order"],
          services: ["product", "order"],
          dataPackets: [{ from: "product", to: "order", type: "response" }],
          logs: [
            { service: "Product Service", message: "Confirmation de disponibilité", type: "response" },
            { service: "Order Service", message: "Réception de la confirmation", type: "process" },
          ],
          popup: {
            title: "Confirmation Disponibilité",
            message:
              "Le service produit confirme au service commande que les produits sont disponibles et peuvent être commandés",
            position: { x: 70, y: 120 },
          },
        },
        {
          description: "Le service commande crée la commande dans sa base de données",
          connections: ["order-db"],
          services: ["order", "order-db"],
          dataPackets: [
            { from: "order", to: "order-db", type: "database" },
            { from: "order-db", to: "order", type: "response" },
          ],
          logs: [
            { service: "Order Service", message: "INSERT INTO orders VALUES (?)", type: "database" },
            { service: "Order DB", message: "Commande enregistrée avec succès", type: "response" },
          ],
          popup: {
            title: "Création Commande",
            message:
              "Le service commande crée un nouvel enregistrement dans sa base de données avec toutes les informations de la commande",
            position: { x: 80, y: 250 },
          },
        },
        {
          description: "Le service commande met à jour le stock des produits",
          connections: ["order-product", "product-db"],
          services: ["order", "product", "product-db"],
          dataPackets: [
            { from: "order", to: "product", type: "request" },
            { from: "product", to: "product-db", type: "database" },
            { from: "product-db", to: "product", type: "response" },
          ],
          logs: [
            { service: "Order Service", message: "Demande de mise à jour du stock", type: "request" },
            {
              service: "Product Service",
              message: "UPDATE products SET stock = stock - ? WHERE id = ?",
              type: "database",
            },
            { service: "Product DB", message: "Stock mis à jour", type: "response" },
          ],
          popup: {
            title: "Mise à Jour Stock",
            message:
              "Le service commande demande au service produit de mettre à jour les quantités en stock pour les produits commandés",
            position: { x: 70, y: 180 },
          },
        },
        {
          description: "Le service commande confirme la création à l'API Gateway",
          connections: ["order-gateway"],
          services: ["order", "gateway"],
          dataPackets: [{ from: "order", to: "gateway", type: "response" }],
          logs: [
            { service: "Order Service", message: "Commande #12345 créée avec succès", type: "response" },
            { service: "API Gateway", message: "Réception de la confirmation", type: "process" },
          ],
          popup: {
            title: "Confirmation Commande",
            message: "Le service commande confirme à l'API Gateway que la commande a été créée avec succès",
            position: { x: 65, y: 60 },
          },
        },
        {
          description: "L'API Gateway retourne la confirmation au client",
          connections: ["gateway-client"],
          services: ["gateway", "client"],
          dataPackets: [{ from: "gateway", to: "client", type: "response" }],
          logs: [
            { service: "API Gateway", message: "Retourne la réponse au client", type: "response" },
            { service: "Client", message: "Commande créée avec succès", type: "process" },
          ],
          popup: {
            title: "Réponse Client",
            message: "L'API Gateway retourne une réponse HTTP 201 Created avec les détails de la commande créée",
            position: { x: 50, y: 14 },
          },
        },
      ],
    },
    productSearch: {
      name: "Recherche de produits",
      steps: [
        {
          description: "Le client envoie une requête de recherche de produits",
          connections: ["client-gateway"],
          services: ["client"],
          dataPackets: [{ from: "client", to: "gateway", type: "request" }],
          logs: [{ service: "Client", message: "GET /api/products?query=smartphone", type: "request" }],
          popup: {
            title: "Requête de Recherche",
            message: "Le client envoie une requête HTTP GET avec des paramètres de recherche (mot-clé, filtres, tri)",
            position: { x: 50, y: 14 },
          },
        },
        {
          description: "L'API Gateway authentifie la requête",
          connections: ["gateway-auth"],
          services: ["gateway", "auth"],
          dataPackets: [
            { from: "gateway", to: "auth", type: "request" },
            { from: "auth", to: "gateway", type: "response" },
          ],
          logs: [
            { service: "API Gateway", message: "Vérification du token JWT", type: "process" },
            { service: "Auth Service", message: "Validation du token", type: "response" },
          ],
          popup: {
            title: "Authentification Légère",
            message: "L'API Gateway vérifie si l'utilisateur est authentifié, mais permet aussi les recherches anonymes",
            position: { x: 35, y: 60 },
          },
        },
        {
          description: "L'API Gateway transmet la requête au service produit",
          connections: ["gateway-product"],
          services: ["gateway", "product"],
          dataPackets: [{ from: "gateway", to: "product", type: "request" }],
          logs: [
            { service: "API Gateway", message: "Transmission de la requête au Product Service", type: "request" },
            { service: "Product Service", message: "Réception de la requête de recherche", type: "process" },
          ],
          popup: {
            title: "Routage Requête",
            message: "L'API Gateway transmet la requête de recherche au service produit qui est responsable du catalogue",
            position: { x: 55, y: 60 },
          },
        },
        {
          description: "Le service produit interroge sa base de données",
          connections: ["product-db"],
          services: ["product", "product-db"],
          dataPackets: [
            { from: "product", to: "product-db", type: "database" },
            { from: "product-db", to: "product", type: "response" },
          ],
          logs: [
            {
              service: "Product Service",
              message: "SELECT * FROM products WHERE name LIKE '%smartphone%'",
              type: "database",
            },
            { service: "Product DB", message: "Exécution de la requête", type: "process" },
            { service: "Product DB", message: "Retourne 15 résultats", type: "response" },
          ],
          popup: {
            title: "Recherche en Base",
            message:
              "Le service produit exécute une requête optimisée dans sa base de données, utilisant potentiellement un index de recherche",
            position: { x: 60, y: 250 },
          },
        },
        {
          description: "Le service produit retourne les résultats à l'API Gateway",
          connections: ["product-gateway"],
          services: ["product", "gateway"],
          dataPackets: [{ from: "product", to: "gateway", type: "response" }],
          logs: [
            { service: "Product Service", message: "Envoi des résultats de recherche", type: "response" },
            { service: "API Gateway", message: "Réception des résultats", type: "process" },
          ],
          popup: {
            title: "Résultats de Recherche",
            message: "Le service produit formate et retourne les résultats de recherche à l'API Gateway",
            position: { x: 55, y: 60 },
          },
        },
        {
          description: "L'API Gateway retourne les résultats au client",
          connections: ["gateway-client"],
          services: ["gateway", "client"],
          dataPackets: [{ from: "gateway", to: "client", type: "response" }],
          logs: [
            { service: "API Gateway", message: "Retourne la réponse au client", type: "response" },
            { service: "Client", message: "Affichage des résultats de recherche", type: "process" },
          ],
          popup: {
            title: "Affichage Résultats",
            message: "L'API Gateway retourne une réponse HTTP 200 avec les résultats de recherche au format JSON",
            position: { x: 50, y: 14 },
          },
        },
      ],
    },
    userAuthentication: {
      name: "Authentification utilisateur",
      steps: [
        {
          description: "Le client envoie ses identifiants",
          connections: ["client-gateway"],
          services: ["client"],
          dataPackets: [{ from: "client", to: "gateway", type: "request" }],
          logs: [{ service: "Client", message: "POST /api/auth/login avec identifiants", type: "request" }],
          popup: {
            title: "Envoi Identifiants",
            message: "Le client envoie ses identifiants (email/mot de passe) via une requête HTTP POST sécurisée (HTTPS)",
            position: { x: 50, y: 14 },
          },
        },
        {
          description: "L'API Gateway transmet la requête au service d'authentification",
          connections: ["gateway-auth"],
          services: ["gateway", "auth"],
          dataPackets: [{ from: "gateway", to: "auth", type: "request" }],
          logs: [
            { service: "API Gateway", message: "Transmission de la requête au Auth Service", type: "request" },
            { service: "Auth Service", message: "Réception des identifiants", type: "process" },
          ],
          popup: {
            title: "Routage Authentification",
            message: "L'API Gateway transmet la requête d'authentification au service spécialisé",
            position: { x: 35, y: 60 },
          },
        },
        {
          description: "Le service d'authentification vérifie les identifiants avec le service utilisateur",
          connections: ["auth-user"],
          services: ["auth", "user"],
          dataPackets: [{ from: "auth", to: "user", type: "request" }],
          logs: [
            { service: "Auth Service", message: "Demande de vérification des identifiants", type: "request" },
            { service: "User Service", message: "Réception de la demande", type: "process" },
          ],
          popup: {
            title: "Séparation des Responsabilités",
            message:
              "Le service d'authentification délègue la vérification des identifiants au service utilisateur qui gère les données utilisateurs",
            position: { x: 30, y: 120 },
          },
        },
        {
          description: "Le service utilisateur vérifie les identifiants dans sa base",
          connections: ["user-db"],
          services: ["user", "user-db"],
          dataPackets: [
            { from: "user", to: "user-db", type: "database" },
            { from: "user-db", to: "user", type: "response" },
          ],
          logs: [
            { service: "User Service", message: "SELECT * FROM users WHERE email = ?", type: "database" },
            { service: "User DB", message: "Vérification des identifiants", type: "process" },
            { service: "User DB", message: "Utilisateur trouvé", type: "response" },
          ],
          popup: {
            title: "Vérification Sécurisée",
            message:
              "Le service utilisateur vérifie l'email et compare le hash du mot de passe avec celui stocké en base de données",
            position: { x: 40, y: 250 },
          },
        },
        {
          description: "Le service utilisateur confirme l'identité au service d'authentification",
          connections: ["user-auth"],
          services: ["user", "auth"],
          dataPackets: [{ from: "user", to: "auth", type: "response" }],
          logs: [
            { service: "User Service", message: "Identifiants valides", type: "response" },
            { service: "Auth Service", message: "Génération du token JWT", type: "process" },
          ],
          popup: {
            title: "Confirmation Identité",
            message:
              "Le service utilisateur confirme que les identifiants sont valides et retourne les informations utilisateur",
            position: { x: 30, y: 120 },
          },
        },
        {
          description: "Le service d'authentification retourne le token à l'API Gateway",
          connections: ["auth-gateway"],
          services: ["auth", "gateway"],
          dataPackets: [{ from: "auth", to: "gateway", type: "response" }],
          logs: [
            { service: "Auth Service", message: "Token JWT généré avec succès", type: "response" },
            { service: "API Gateway", message: "Réception du token", type: "process" },
          ],
          popup: {
            title: "Génération Token",
            message:
              "Le service d'authentification génère un token JWT signé contenant les informations utilisateur et les permissions",
            position: { x: 35, y: 60 },
          },
        },
        {
          description: "L'API Gateway retourne le token au client",
          connections: ["gateway-client"],
          services: ["gateway", "client"],
          dataPackets: [{ from: "gateway", to: "client", type: "response" }],
          logs: [
            { service: "API Gateway", message: "Retourne le token au client", type: "response" },
            { service: "Client", message: "Authentification réussie, token stocké", type: "process" },
          ],
          popup: {
            title: "Authentification Réussie",
            message:
              "L'API Gateway retourne le token JWT au client qui le stockera pour les futures requêtes authentifiées",
            position: { x: 50, y: 14 },
          },
        },
      ],
    },
  };
  
  // Définition des positions des services pour les animations de paquets de données
  const servicePositions = {
    client: { x: 50, y: 30 },
    gateway: { x: 50, y: 120 },
    auth: { x: 20, y: 220 },
    user: { x: 40, y: 220 },
    product: { x: 60, y: 220 },
    order: { x: 80, y: 220 },
    "user-db": { x: 40, y: 500 },
    "product-db": { x: 60, y: 500 },
    "order-db": { x: 80, y: 500 },
    config: { x: 10, y: 400 },
  };
  
  // Variables d'état
  let activeScenario = null;
  let activeStep = 0;
  let isAnimating = false;
  let isPaused = false;
  let currentStepTimer = null;
  let animationSpeed = 1;
  let darkMode = true;
  
  // Fonction pour basculer le thème
  function toggleTheme() {
    darkMode = !darkMode;
    document.body.classList.toggle("dark", darkMode);
    document.getElementById("theme-toggle").textContent = darkMode ? "Mode Clair" : "Mode Sombre";
  }
  
  // Fonction pour définir la vitesse d'animation
  function setAnimationSpeed(speed) {
    animationSpeed = speed;
    document.querySelectorAll("[data-speed]").forEach((btn) => {
      btn.classList.remove("button-active");
    });
    document.querySelector(`[data-speed="${speed}"]`).classList.add("button-active");
  }
  
  // Fonction pour effacer les logs
  function clearLogs() {
    document.getElementById("logs-list").innerHTML = "";
    document.getElementById("logs-empty").classList.remove("hidden");
    document.getElementById("logs-list").classList.add("hidden");
  }
  
  // Fonction pour effacer les connexions actives
  function clearConnections() {
    document.querySelectorAll(".connection").forEach((connection) => {
      connection.classList.remove("connection-active");
    });
  }
  
  // Fonction pour effacer les services actifs
  function clearServices() {
    document.querySelectorAll(".service").forEach((service) => {
      service.classList.remove("service-active");
    });
  }
  
  // Fonction pour effacer les paquets de données
  function clearDataPackets() {
    document.querySelectorAll(".data-packet").forEach((packet) => {
      packet.remove();
    });
  }
  
  // Fonction pour ajouter un log
  function addLog(log) {
    const timestamp = new Date().toLocaleTimeString();
  
    const logItem = document.createElement("div");
    logItem.className = `log-item log-${log.type}`;
  
    logItem.innerHTML = `
      <div class="flex items-center gap-2">
        <span class="font-semibold">${log.service}</span> 
        <span class="text-xs text-gray-500 dark:text-gray-400">${timestamp}</span>
        <span class="badge badge-${log.type}">${log.type}</span>
      </div>
      <div class="mt-1">${log.message}</div>
    `;
  
    document.getElementById("logs-list").appendChild(logItem);
  
    // Animation d'apparition
    setTimeout(() => {
      logItem.classList.add("log-item-visible");
    }, 10);
  
    // Scroll vers le bas
    document.getElementById("logs-list").scrollTop = document.getElementById("logs-list").scrollHeight;
  }
  
  // Fonction pour initialiser les services avec leurs classes de couleur
  function initializeServices() {
    document.getElementById("service-client").classList.add("service-client");
    document.getElementById("service-gateway").classList.add("service-gateway");
    document.getElementById("service-auth").classList.add("service-auth");
    document.getElementById("service-user").classList.add("service-user");
    document.getElementById("service-product").classList.add("service-product");
    document.getElementById("service-order").classList.add("service-order");
    document.getElementById("service-config").classList.add("service-config");
    document.getElementById("service-user-db").classList.add("service-database");
    document.getElementById("service-product-db").classList.add("service-database");
    document.getElementById("service-order-db").classList.add("service-database");
  }
  
  // Fonction pour basculer entre pause et lecture
  function togglePausePlay() {
    isPaused = !isPaused;
    
    const pausePlayButton = document.getElementById('pause-play');
    
    if (isPaused) {
      pausePlayButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-1 h-4 w-4"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
        Reprendre
      `;
      
      // Si un timer est en cours, le nettoyer
      if (currentStepTimer) {
        clearTimeout(currentStepTimer);
        currentStepTimer = null;
      }
    } else {
      pausePlayButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-1 h-4 w-4"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
        Pause
      `;
      
      // Reprendre l'animation
      animateStep();
    }
  }
  
  // Fonction pour charger un scénario à une étape spécifique
  function loadScenario(scenarioId, stepIndex = 0) {
    // Réinitialiser l'état
    if (isAnimating && currentStepTimer) {
      clearTimeout(currentStepTimer);
      currentStepTimer = null;
    }
    
    activeScenario = scenarioId;
    activeStep = stepIndex;
    clearLogs();
    clearConnections();
    clearServices();
    clearDataPackets();
    isPaused = false;
    isAnimating = true;
    
    // Mettre à jour l'interface
    document.querySelectorAll('[id^="scenario-"]').forEach((btn) => {
      btn.classList.remove("button-active");
      if (btn.id === `scenario-${scenarioId}`) {
        btn.classList.add("button-active");
      }
    });
    
    document.getElementById('step-info').classList.remove('hidden');
    document.getElementById('scenario-title').textContent = `Scénario: ${scenarios[scenarioId].name}`;
    
    // Afficher l'explication du scénario
    document.getElementById('explanation-empty').classList.add('hidden');
    document.querySelectorAll('[id^="explanation-"]').forEach(el => {
      el.classList.add('hidden');
    });
    
    const explanationElement = document.getElementById(`explanation-${scenarioId}`);
    if (explanationElement) {
      explanationElement.classList.remove('hidden');
    }
    
    // Activer les boutons de contrôle
    document.getElementById('pause-play').disabled = false;
    document.getElementById('save-scenario').disabled = false;
    
    // Mettre à jour le bouton pause/play
    document.getElementById('pause-play').innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-1 h-4 w-4"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
      Pause
    `;
    
    // Démarrer l'animation
    animateStep();
  }
  
  // Fonction pour animer une étape
  function animateStep() {
    if (!isAnimating || !activeScenario) return;
    if (isPaused) return;
    
    const scenario = scenarios[activeScenario];
    const currentStep = scenario.steps[activeStep];
    
    if (!currentStep) {
      isAnimating = false;
      document.getElementById('pause-play').disabled = true;
      return;
    }
    
    // Mettre à jour l'interface
    document.getElementById('step-description').textContent = currentStep.description;
    document.getElementById('progress-bar').style.width = `${(activeStep / scenario.steps.length) * 100}%`;
    document.getElementById('step-counter').textContent = `Étape ${activeStep + 1} / ${scenario.steps.length}`;
    
    // Mettre à jour les connexions actives
    clearConnections();
    currentStep.connections.forEach((connectionId) => {
      const connection = document.getElementById(`connection-${connectionId}`);
      if (connection) {
        connection.classList.add("connection-active");
      }
    });
    
    // Mettre à jour les services actifs
    clearServices();
    currentStep.services.forEach((serviceId) => {
      const service = document.getElementById(`service-${serviceId}`);
      if (service) {
        service.classList.add("service-active");
      }
    });
    
    // Afficher le popup d'explication
    if (currentStep.popup) {
      document.getElementById('popup-title').textContent = currentStep.popup.title;
      document.getElementById('popup-message').textContent = currentStep.popup.message;
      document.getElementById('popup').style.left = `${currentStep.popup.position.x}%`;
      document.getElementById('popup').style.top = `${currentStep.popup.position.y}px`;
      document.getElementById('popup').classList.add("popup-visible");
    }
    
    // Ajouter les paquets de données
    if (currentStep.dataPackets) {
      currentStep.dataPackets.forEach((packet, index) => {
        setTimeout(
          () => {
            if (!isPaused) {
              const packetId = `${packet.from}-${packet.to}-${Date.now()}`;
              createDataPacket(packetId, packet.from, packet.to, packet.type);
            }
          },
          (index * 800) / animationSpeed,
        );
      });
    }
    
    // Ajouter les logs de l'étape
    if (currentStep.logs) {
      document.getElementById('logs-empty').classList.add('hidden');
      document.getElementById('logs-list').classList.remove('hidden');
      
      currentStep.logs.forEach((log, index) => {
        setTimeout(
          () => {
            if (!isPaused) {
              addLog(log);
            }
          },
          (index * 800) / animationSpeed,
        );
      });
    }
    
    // Passer à l'étape suivante après un délai
    const stepDelay = (currentStep.logs.length * 800 + 2500) / animationSpeed;
    
    currentStepTimer = setTimeout(
      () => {
        if (!isPaused) {
          document.getElementById('popup').classList.remove("popup-visible");
          activeStep++;
          animateStep();
        }
      },
      stepDelay,
    );
  }
  
  // Fonction pour créer un paquet de données
  function createDataPacket(id, from, to, type) {
    const fromPos = servicePositions[from];
    const toPos = servicePositions[to];
    
    if (!fromPos || !toPos) return;
    
    const packet = document.createElement("div");
    packet.id = id;
    packet.className = `data-packet data-packet-${type}`;
    packet.style.left = `${fromPos.x}%`;
    packet.style.top = `${fromPos.y}px`;
    document.getElementById("diagram").appendChild(packet);
    
    // Animation de progression du paquet
    let progress = 0;
    const animationInterval = setInterval(() => {
      progress += 5;
      
      if (progress >= 100) {
        clearInterval(animationInterval);
        setTimeout(() => {
          packet.remove();
        }, 500);
        return;
      }
      
      const x = fromPos.x + (toPos.x - fromPos.x) * (progress / 100);
      const y = fromPos.y + (toPos.y - fromPos.y) * (progress / 100);
      
      packet.style.left = `${x}%`;
      packet.style.top = `${y}px`;
    }, 50 / animationSpeed);
  }
  
  // Fonction pour sauvegarder l'état du scénario actuel
  function saveScenarioState(scenarioId, stepIndex) {
    // Récupérer les scénarios sauvegardés existants
    const savedScenarios = JSON.parse(localStorage.getItem('savedScenarios') || '[]');
    
    // Créer un nouvel objet pour le scénario sauvegardé
    const timestamp = new Date().toISOString();
    const scenarioName = scenarios[scenarioId].name;
    const savedScenario = {
      id: `${scenarioId}-${timestamp}`,
      scenarioId: scenarioId,
      name: scenarioName,
      step: stepIndex,
      timestamp: timestamp,
      displayName: `${scenarioName} (Étape ${stepIndex + 1}/${scenarios[scenarioId].steps.length})`
    };
    
    // Ajouter le nouveau scénario à la liste
    savedScenarios.push(savedScenario);
    
    // Sauvegarder la liste mise à jour
    localStorage.setItem('savedScenarios', JSON.stringify(savedScenarios));
    
    // Mettre à jour l'interface utilisateur
    updateSavedScenariosList();
    
    return savedScenario;
  }
  
  // Fonction pour charger un scénario sauvegardé
  function loadSavedScenario(savedId) {
    // Récupérer les scénarios sauvegardés
    const savedScenarios = JSON.parse(localStorage.getItem('savedScenarios') || '[]');
    
    // Trouver le scénario sauvegardé par son ID
    const savedScenario = savedScenarios.find(s => s.id === savedId);
    
    if (savedScenario) {
      // Charger le scénario et définir l'étape
      loadScenario(savedScenario.scenarioId, savedScenario.step);
      return true;
    }
    
    return false;
  }
  
  // Fonction pour supprimer un scénario sauvegardé
  function deleteSavedScenario(savedId) {
    // Récupérer les scénarios sauvegardés
    const savedScenarios = JSON.parse(localStorage.getItem('savedScenarios') || '[]');
    
    // Filtrer pour supprimer le scénario spécifié
    const updatedScenarios = savedScenarios.filter(s => s.id !== savedId);
    
    // Sauvegarder la liste mise à jour
    localStorage.setItem('savedScenarios', JSON.stringify(updatedScenarios));
    
    // Mettre à jour l'interface utilisateur
    updateSavedScenariosList();
  }
  
  // Fonction pour mettre à jour la liste des scénarios sauvegardés dans l'interface
  function updateSavedScenariosList() {
    const savedScenariosContainer = document.getElementById('saved-scenarios');
    const savedScenariosList = document.getElementById('saved-scenarios-list');
    
    // Récupérer les scénarios sauvegardés
    const savedScenarios = JSON.parse(localStorage.getItem('savedScenarios') || '[]');
    
    // Vider la liste actuelle
    savedScenariosList.innerHTML = '';
    
    // Afficher ou masquer le conteneur selon qu'il y a des scénarios sauvegardés
    if (savedScenarios.length === 0) {
      savedScenariosContainer.classList.add('hidden');
      return;
    }
    
    savedScenariosContainer.classList.remove('hidden');
    
    // Ajouter chaque scénario sauvegardé à la liste
    savedScenarios.forEach(scenario => {
      const scenarioItem = document.createElement('div');
      scenarioItem.className = 'flex items-center justify-between p-2 border rounded-md';
      
      const scenarioInfo = document.createElement('div');
      scenarioInfo.className = 'flex-1';
      
      const scenarioName = document.createElement('div');
      scenarioName.className = 'font-medium text-sm';
      scenarioName.textContent = scenario.displayName;
      
      const scenarioDate = document.createElement('div');
      scenarioDate.className = 'text-xs text-gray-500 dark:text-gray-400';
      scenarioDate.textContent = new Date(scenario.timestamp).toLocaleString();
      
      scenarioInfo.appendChild(scenarioName);
      scenarioInfo.appendChild(scenarioDate);
      
      const buttonsContainer = document.createElement('div');
      buttonsContainer.className = 'flex gap-2';
      
      const loadButton = document.createElement('button');
      loadButton.className = 'button button-outline py-1 px-2 text-xs';
      loadButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>';
      loadButton.title = 'Charger ce scénario';
      loadButton.onclick = () => loadSavedScenario(scenario.id);
      
      const deleteButton = document.createElement('button');
      deleteButton.className = 'button button-outline py-1 px-2 text-xs text-red-500 dark:text-red-400';
      deleteButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>';
      deleteButton.title = 'Supprimer ce scénario';
      deleteButton.onclick = () => deleteSavedScenario(scenario.id);
      
      buttonsContainer.appendChild(loadButton);
      buttonsContainer.appendChild(deleteButton);
      
      scenarioItem.appendChild(scenarioInfo);
      scenarioItem.appendChild(buttonsContainer);
      
      savedScenariosList.appendChild(scenarioItem);
    });
  }
  
  // Initialisation
  document.addEventListener("DOMContentLoaded", () => {
    // Initialiser les services avec leurs classes de couleur
    initializeServices();
    
    // Initialiser la liste des scénarios sauvegardés
    updateSavedScenariosList();
    
    // Gestionnaire pour le bouton thème
    document.getElementById("theme-toggle").addEventListener("click", toggleTheme);
    
    // Gestionnaires pour les boutons de vitesse
    document.querySelectorAll("[data-speed]").forEach((button) => {
      button.addEventListener("click", () => {
        setAnimationSpeed(Number.parseFloat(button.dataset.speed));
      });
    });
    
    // Gestionnaire pour le bouton pause/play
    document.getElementById('pause-play').addEventListener('click', () => {
      togglePausePlay();
    });
    
    // Gestionnaire pour le bouton de sauvegarde
    document.getElementById('save-scenario').addEventListener('click', () => {
      if (activeScenario && isAnimating) {
        const savedScenario = saveScenarioState(activeScenario, activeStep);
        
        // Afficher une notification de confirmation
        alert(`Scénario "${savedScenario.displayName}" sauvegardé avec succès!`);
      }
    });
    
    // Gestionnaires pour les boutons de scénario
    document.querySelectorAll('[id^="scenario-"]').forEach((button) => {
      button.addEventListener('click', () => {
        const scenarioId = button.id.replace("scenario-", "");
        loadScenario(scenarioId, 0);
      });
    });
  });