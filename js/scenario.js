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
            message: "Le client envoie une requête HTTP POST avec les détails de la commande (produits, quantités, adresse de livraison)",
            position: { x: 50, y: 14 }
          }
        },
        { 
          description: "L'API Gateway authentifie la requête", 
          connections: ["gateway-auth"],
          services: ["gateway", "auth"],
          dataPackets: [
            { from: "gateway", to: "auth", type: "request" },
            { from: "auth", to: "gateway", type: "response" }
          ],
          logs: [
            { service: "API Gateway", message: "Vérification du token JWT", type: "process" },
            { service: "Auth Service", message: "Validation du token et des permissions", type: "response" }
          ],
          popup: {
            title: "Authentification",
            message: "L'API Gateway vérifie que l'utilisateur est authentifié et autorisé à créer une commande",
            position: { x: 35, y: 60 }
          }
        },
        { 
          description: "L'API Gateway transmet la requête au service utilisateur", 
          connections: ["gateway-user"],
          services: ["gateway", "user"],
          dataPackets: [{ from: "gateway", to: "user", type: "request" }],
          logs: [
            { service: "API Gateway", message: "Transmission de la requête au User Service", type: "request" },
            { service: "User Service", message: "Récupération des informations utilisateur", type: "process" }
          ],
          popup: {
            title: "Vérification Utilisateur",
            message: "L'API Gateway transmet la requête au service utilisateur pour récupérer les informations complètes",
            position: { x: 45, y: 60 }
          }
        },
        { 
          description: "Le service utilisateur vérifie les données dans sa base", 
          connections: ["user-db"],
          services: ["user", "user-db"],
          dataPackets: [
            { from: "user", to: "user-db", type: "database" },
            { from: "user-db", to: "user", type: "response" }
          ],
          logs: [
            { service: "User Service", message: "SELECT * FROM users WHERE id = ?", type: "database" },
            { service: "User DB", message: "Retourne les données utilisateur", type: "response" }
          ],
          popup: {
            title: "Accès Base de Données",
            message: "Le service utilisateur interroge sa base de données pour vérifier l'existence et les informations de l'utilisateur",
            position: { x: 40, y: 250 }
          }
        },
        { 
          description: "Le service utilisateur transmet les données au service produit", 
          connections: ["user-product"],
          services: ["user", "product"],
          dataPackets: [{ from: "user", to: "product", type: "request" }],
          logs: [
            { service: "User Service", message: "Envoi des données au Product Service", type: "request" },
            { service: "Product Service", message: "Réception de la requête", type: "process" }
          ],
          popup: {
            title: "Communication Inter-Services",
            message: "Le service utilisateur transmet les données validées au service produit pour vérifier les produits commandés",
            position: { x: 50, y: 120 }
          }
        },
        { 
          description: "Le service produit vérifie la disponibilité des produits", 
          connections: ["product-db"],
          services: ["product", "product-db"],
          dataPackets: [
            { from: "product", to: "product-db", type: "database" },
            { from: "product-db", to: "product", type: "response" }
          ],
          logs: [
            { service: "Product Service", message: "SELECT * FROM products WHERE id IN (?)", type: "database" },
            { service: "Product DB", message: "Vérification du stock disponible", type: "process" },
            { service: "Product DB", message: "Retourne les données produits", type: "response" }
          ],
          popup: {
            title: "Vérification Stock",
            message: "Le service produit vérifie la disponibilité en stock des produits demandés dans la commande",
            position: { x: 60, y: 250 }
          }
        },
        { 
          description: "Le service produit confirme la disponibilité au service commande", 
          connections: ["product-order"],
          services: ["product", "order"],
          dataPackets: [{ from: "product", to: "order", type: "response" }],
          logs: [
            { service: "Product Service", message: "Confirmation de disponibilité", type: "response" },
            { service: "Order Service", message: "Réception de la confirmation", type: "process" }
          ],
          popup: {
            title: "Confirmation Disponibilité",
            message: "Le service produit confirme au service commande que les produits sont disponibles et peuvent être commandés",
            position: { x: 70, y: 120 }
          }
        },
        { 
          description: "Le service commande crée la commande dans sa base de données", 
          connections: ["order-db"],
          services: ["order", "order-db"],
          dataPackets: [
            { from: "order", to: "order-db", type: "database" },
            { from: "order-db", to: "order", type: "response" }
          ],
          logs: [
            { service: "Order Service", message: "INSERT INTO orders VALUES (?)", type: "database" },
            { service: "Order DB", message: "Commande enregistrée avec succès", type: "response" }
          ],
          popup: {
            title: "Création Commande",
            message: "Le service commande crée un nouvel enregistrement dans sa base de données avec toutes les informations de la commande",
            position: { x: 80, y: 250 }
          }
        },
        { 
          description: "Le service commande met à jour le stock des produits", 
          connections: ["order-product", "product-db"],
          services: ["order", "product", "product-db"],
          dataPackets: [
            { from: "order", to: "product", type: "request" },
            { from: "product", to: "product-db", type: "database" },
            { from: "product-db", to: "product", type: "response" }
          ],
          logs: [
            { service: "Order Service", message: "Demande de mise à jour du stock", type: "request" },
            { service: "Product Service", message: "UPDATE products SET stock = stock - ? WHERE id = ?", type: "database" },
            { service: "Product DB", message: "Stock mis à jour", type: "response" }
          ],
          popup: {
            title: "Mise à Jour Stock",
            message: "Le service commande demande au service produit de mettre à jour les quantités en stock pour les produits commandés",
            position: { x: 70, y: 180 }
          }
        },
        { 
          description: "Le service commande confirme la création à l'API Gateway", 
          connections: ["order-gateway"],
          services: ["order", "gateway"],
          dataPackets: [{ from: "order", to: "gateway", type: "response" }],
          logs: [
            { service: "Order Service", message: "Commande #12345 créée avec succès", type: "response" },
            { service: "API Gateway", message: "Réception de la confirmation", type: "process" }
          ],
          popup: {
            title: "Confirmation Commande",
            message: "Le service commande confirme à l'API Gateway que la commande a été créée avec succès",
            position: { x: 65, y: 60 }
          }
        },
        { 
          description: "L'API Gateway retourne la confirmation au client", 
          connections: ["gateway-client"],
          services: ["gateway", "client"],
          dataPackets: [{ from: "gateway", to: "client", type: "response" }],
          logs: [
            { service: "API Gateway", message: "Retourne la réponse au client", type: "response" },
            { service: "Client", message: "Commande créée avec succès", type: "process" }
          ],
          popup: {
            title: "Réponse Client",
            message: "L'API Gateway retourne une réponse HTTP 201 Created avec les détails de la commande créée",
            position: { x: 50, y: 14 }
          }
        }
      ]
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
            position: { x: 50, y: 14 }
          }
        },
        { 
          description: "L'API Gateway authentifie la requête", 
          connections: ["gateway-auth"],
          services: ["gateway", "auth"],
          dataPackets: [
            { from: "gateway", to: "auth", type: "request" },
            { from: "auth", to: "gateway", type: "response" }
          ],
          logs: [
            { service: "API Gateway", message: "Vérification du token JWT", type: "process" },
            { service: "Auth Service", message: "Validation du token", type: "response" }
          ],
          popup: {
            title: "Authentification Légère",
            message: "L'API Gateway vérifie si l'utilisateur est authentifié, mais permet aussi les recherches anonymes",
            position: { x: 35, y: 60 }
          }
        },
        { 
          description: "L'API Gateway transmet la requête au service produit", 
          connections: ["gateway-product"],
          services: ["gateway", "product"],
          dataPackets: [{ from: "gateway", to: "product", type: "request" }],
          logs: [
            { service: "API Gateway", message: "Transmission de la requête au Product Service", type: "request" },
            { service: "Product Service", message: "Réception de la requête de recherche", type: "process" }
          ],
          popup: {
            title: "Routage Requête",
            message: "L'API Gateway transmet la requête de recherche au service produit qui est responsable du catalogue",
            position: { x: 55, y: 60 }
          }
        },
        { 
          description: "Le service produit interroge sa base de données", 
          connections: ["product-db"],
          services: ["product", "product-db"],
          dataPackets: [
            { from: "product", to: "product-db", type: "database" },
            { from: "product-db", to: "product", type: "response" }
          ],
          logs: [
            { service: "Product Service", message: "SELECT * FROM products WHERE name LIKE '%smartphone%'", type: "database" },
            { service: "Product DB", message: "Exécution de la requête", type: "process" },
            { service: "Product DB", message: "Retourne 15 résultats", type: "response" }
          ],
          popup: {
            title: "Recherche en Base",
            message: "Le service produit exécute une requête optimisée dans sa base de données, utilisant potentiellement un index de recherche",
            position: { x: 60, y: 250 }
          }
        },
        { 
          description: "Le service produit retourne les résultats à l'API Gateway", 
          connections: ["product-gateway"],
          services: ["product", "gateway"],
          dataPackets: [{ from: "product", to: "gateway", type: "response" }],
          logs: [
            { service: "Product Service", message: "Envoi des résultats de recherche", type: "response" },
            { service: "API Gateway", message: "Réception des résultats", type: "process" }
          ],
          popup: {
            title: "Résultats de Recherche",
            message: "Le service produit formate et retourne les résultats de recherche à l'API Gateway",
            position: { x: 55, y: 60 }
          }
        },
        { 
          description: "L'API Gateway retourne les résultats au client", 
          connections: ["gateway-client"],
          services: ["gateway", "client"],
          dataPackets: [{ from: "gateway", to: "client", type: "response" }],
          logs: [
            { service: "API Gateway", message: "Retourne la réponse au client", type: "response" },
            { service: "Client", message: "Affichage des résultats de recherche", type: "process" }
          ],
          popup: {
            title: "Affichage Résultats",
            message: "L'API Gateway retourne une réponse HTTP 200 avec les résultats de recherche au format JSON",
            position: { x: 50, y: 14 }
          }
        }
      ]
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
            position: { x: 50, y: 14 }
          }
        },
        { 
          description: "L'API Gateway transmet la requête au service d'authentification", 
          connections: ["gateway-auth"],
          services: ["gateway", "auth"],
          dataPackets: [{ from: "gateway", to: "auth", type: "request" }],
          logs: [
            { service: "API Gateway", message: "Transmission de la requête au Auth Service", type: "request" },
            { service: "Auth Service", message: "Réception des identifiants", type: "process" }
          ],
          popup: {
            title: "Routage Authentification",
            message: "L'API Gateway transmet la requête d'authentification au service spécialisé",
            position: { x: 35, y: 60 }
          }
        },
        { 
          description: "Le service d'authentification vérifie les identifiants avec le service utilisateur", 
          connections: ["auth-user"],
          services: ["auth", "user"],
          dataPackets: [{ from: "auth", to: "user", type: "request" }],
          logs: [
            { service: "Auth Service", message: "Demande de vérification des identifiants", type: "request" },
            { service: "User Service", message: "Réception de la demande", type: "process" }
          ],
          popup: {
            title: "Séparation des Responsabilités",
            message: "Le service d'authentification délègue la vérification des identifiants au service utilisateur qui gère les données utilisateurs",
            position: { x: 30, y: 120 }
          }
        },
        { 
          description: "Le service utilisateur vérifie les identifiants dans sa base", 
          connections: ["user-db"],
          services: ["user", "user-db"],
          dataPackets: [
            { from: "user", to: "user-db", type: "database" },
            { from: "user-db", to: "user", type: "response" }
          ],
          logs: [
            { service: "User Service", message: "SELECT * FROM users WHERE email = ?", type: "database" },
            { service: "User DB", message: "Vérification des identifiants", type: "process" },
            { service: "User DB", message: "Utilisateur trouvé", type: "response" }
          ],
          popup: {
            title: "Vérification Sécurisée",
            message: "Le service utilisateur vérifie l'email et compare le hash du mot de passe avec celui stocké en base de données",
            position: { x: 40, y: 250 }
          }
        },
        { 
          description: "Le service utilisateur confirme l'identité au service d'authentification", 
          connections: ["user-auth"],
          services: ["user", "auth"],
          dataPackets: [{ from: "user", to: "auth", type: "response" }],
          logs: [
            { service: "User Service", message: "Identifiants valides", type: "response" },
            { service: "Auth Service", message: "Génération du token JWT", type: "process" }
          ],
          popup: {
            title: "Confirmation Identité",
            message: "Le service utilisateur confirme que les identifiants sont valides et retourne les informations utilisateur",
            position: { x: 30, y: 120 }
          }
        },
        { 
          description: "Le service d'authentification retourne le token à l'API Gateway", 
          connections: ["auth-gateway"],
          services: ["auth", "gateway"],
          dataPackets: [{ from: "auth", to: "gateway", type: "response" }],
          logs: [
            { service: "Auth Service", message: "Token JWT généré avec succès", type: "response" },
            { service: "API Gateway", message: "Réception du token", type: "process" }
          ],
          popup: {
            title: "Génération Token",
            message: "Le service d'authentification génère un token JWT signé contenant les informations utilisateur et les permissions",
            position: { x: 35, y: 60 }
          }
        },
        { 
          description: "L'API Gateway retourne le token au client", 
          connections: ["gateway-client"],
          services: ["gateway", "client"],
          dataPackets: [{ from: "gateway", to: "client", type: "response" }],
          logs: [
            { service: "API Gateway", message: "Retourne le token au client", type: "response" },
            { service: "Client", message: "Authentification réussie, token stocké", type: "process" }
          ],
          popup: {
            title: "Authentification Réussie",
            message: "L'API Gateway retourne le token JWT au client qui le stockera pour les futures requêtes authentifiées",
            position: { x: 50, y: 14 }
          }
        }
      ]
    }
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
    config: { x: 10, y: 400 }
  };
  
  // Variables d'état
  let activeScenario = null;
  let activeStep = 0;
  let isAnimating = false;
  let animationSpeed = 1;
  let dataPackets = [];
  let darkMode = true;
  
  // Éléments DOM
  const themeToggle = document.getElementById('theme-toggle');
  const speedButtons = document.querySelectorAll('[data-speed]');
  const scenarioButtons = document.querySelectorAll('[id^="scenario-"]');
  const stepInfo = document.getElementById('step-info');
  const stepDescription = document.getElementById('step-description');
  const progressBar = document.getElementById('progress-bar');
  const stepCounter = document.getElementById('step-counter');
  const scenarioTitle = document.getElementById('scenario-title');
  const logsEmpty = document.getElementById('logs-empty');
  const logsList = document.getElementById('logs-list');
  const popup = document.getElementById('popup');
  const popupTitle = document.getElementById('popup-title');
  const popupMessage = document.getElementById('popup-message');
  const diagram = document.getElementById('diagram');
  const explanationEmpty = document.getElementById('explanation-empty');
  const explanationOrder = document.getElementById('explanation-orderCreation');
  const explanationProduct = document.getElementById('explanation-productSearch');
  const explanationAuth = document.getElementById('explanation-userAuthentication');
  
  // Initialiser les services avec leurs classes de couleur
  document.getElementById('service-client').classList.add('service-client');
  document.getElementById('service-gateway').classList.add('service-gateway');
  document.getElementById('service-auth').classList.add('service-auth');
  document.getElementById('service-user').classList.add('service-user');
  document.getElementById('service-product').classList.add('service-product');
  document.getElementById('service-order').classList.add('service-order');
  document.getElementById('service-config').classList.add('service-config');
  document.getElementById('service-user-db').classList.add('service-database');
  document.getElementById('service-product-db').classList.add('service-database');
  document.getElementById('service-order-db').classList.add('service-database');
  
  // Fonction pour basculer le thème
  themeToggle.addEventListener('click', () => {
    darkMode = !darkMode;
    document.body.classList.toggle('dark', darkMode);
    themeToggle.textContent = darkMode ? 'Mode Clair' : 'Mode Sombre';
  });
  
  // Fonction pour définir la vitesse d'animation
  speedButtons.forEach(button => {
    button.addEventListener('click', () => {
      animationSpeed = parseFloat(button.dataset.speed);
      speedButtons.forEach(btn => {
        btn.classList.remove('button-active');
      });
      button.classList.add('button-active');
    });
  });
  
  // Fonction pour démarrer un scénario
  scenarioButtons.forEach(button => {
    button.addEventListener('click', () => {
      const scenarioId = button.id.replace('scenario-', '');
      startScenario(scenarioId);
    });
  });
  
  // Fonction pour démarrer l'animation d'un scénario
  function startScenario(scenarioId) {
    if (isAnimating) return;
    
    // Réinitialiser l'état
    activeScenario = scenarioId;
    activeStep = 0;
    clearLogs();
    clearConnections();
    clearServices();
    clearDataPackets();
    isAnimating = true;
    
    // Mettre à jour l'interface
    scenarioButtons.forEach(btn => {
      btn.classList.remove('button-active');
      if (btn.id === `scenario-${scenarioId}`) {
        btn.classList.add('button-active');
      }
    });
    
    stepInfo.classList.remove('hidden');
    scenarioTitle.textContent = `Scénario: ${scenarios[scenarioId].name}`;
    
    // Afficher l'explication du scénario
    explanationEmpty.classList.add('hidden');
    explanationOrder.classList.add('hidden');
    explanationProduct.classList.add('hidden');
    explanationAuth.classList.add('hidden');
    
    if (scenarioId === 'orderCreation') {
      explanationOrder.classList.remove('hidden');
    } else if (scenarioId === 'productSearch') {
      explanationProduct.classList.remove('hidden');
    } else if (scenarioId === 'userAuthentication') {
      explanationAuth.classList.remove('hidden');
    }
    
    // Démarrer l'animation
    animateStep();
  }
  
  // Fonction pour animer une étape
  function animateStep() {
    if (!isAnimating || !activeScenario) return;
    
    const scenario = scenarios[activeScenario];
    const currentStep = scenario.steps[activeStep];
    
    if (!currentStep) {
      isAnimating = false;
      return;
    }
    
    // Mettre à jour l'interface
    stepDescription.textContent = currentStep.description;
    progressBar.style.width = `${(activeStep / scenario.steps.length) * 100}%`;
    stepCounter.textContent = `Étape ${activeStep + 1} / ${scenario.steps.length}`;
    
    // Mettre à jour les connexions actives
    clearConnections();
    currentStep.connections.forEach(connectionId => {
      const connection = document.getElementById(`connection-${connectionId}`);
      if (connection) {
        connection.classList.add('connection-active');
      }
    });
    
    // Mettre à jour les services actifs
    clearServices();
    currentStep.services.forEach(serviceId => {
      const service = document.getElementById(`service-${serviceId}`);
      if (service) {
        service.classList.add('service-active');
      }
    });
    
    // Afficher le popup d'explication
    if (currentStep.popup) {
      popupTitle.textContent = currentStep.popup.title;
      popupMessage.textContent = currentStep.popup.message;
      popup.style.left = `${currentStep.popup.position.x}%`;
      popup.style.top = `${currentStep.popup.position.y}px`;
      popup.classList.add('popup-visible');
    }
    
    // Ajouter les paquets de données
    if (currentStep.dataPackets) {
      currentStep.dataPackets.forEach((packet, index) => {
        setTimeout(() => {
          const packetId = `${packet.from}-${packet.to}-${Date.now()}`;
          createDataPacket(packetId, packet.from, packet.to, packet.type);
        }, index * 800 / animationSpeed);
      });
    }
    
    // Ajouter les logs de l'étape
    if (currentStep.logs) {
      logsEmpty.classList.add('hidden');
      logsList.classList.remove('hidden');
      
      currentStep.logs.forEach((log, index) => {
        setTimeout(() => {
          addLog(log);
        }, index * 800 / animationSpeed);
      });
    }
    
    // Passer à l'étape suivante après un délai
    const timer = setTimeout(() => {
      popup.classList.remove('popup-visible');
      activeStep++;
      animateStep();
    }, (currentStep.logs.length * 800 + 2500) / animationSpeed);
  }
  
  // Fonction pour créer un paquet de données
  function createDataPacket(id, from, to, type) {
    const fromPos = servicePositions[from];
    const toPos = servicePositions[to];
    
    if (!fromPos || !toPos) return;
    
    const packet = document.createElement('div');
    packet.id = id;
    packet.className = `data-packet data-packet-${type}`;
    packet.style.left = `${fromPos.x}%`;
    packet.style.top = `${fromPos.y}px`;
    diagram.appendChild(packet);
    
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
  
  // Fonction pour ajouter un log
  function addLog(log) {
    const timestamp = new Date().toLocaleTimeString();
    
    const logItem = document.createElement('div');
    logItem.className = `log-item log-${log.type}`;
    
    logItem.innerHTML = `
      <div class="flex items-center gap-2">
        <span class="font-semibold">${log.service}</span> 
        <span class="text-xs text-gray-500 dark:text-gray-400">${timestamp}</span>
        <span class="badge badge-${log.type}">${log.type}</span>
      </div>
      <div class="mt-1">${log.message}</div>
    `;
    
    logsList.appendChild(logItem);
    
    // Animation d'apparition
    setTimeout(() => {
      logItem.classList.add('log-item-visible');
    }, 10);
    
    // Scroll vers le bas
    logsList.scrollTop = logsList.scrollHeight;
  }
  
  // Fonction pour effacer les logs
  function clearLogs() {
    logsList.innerHTML = '';
    logsEmpty.classList.remove('hidden');
    logsList.classList.add('hidden');
  }
  
  // Fonction pour effacer les connexions actives
  function clearConnections() {
    document.querySelectorAll('.connection').forEach(connection => {
      connection.classList.remove('connection-active');
    });
  }
  
  // Fonction pour effacer les services actifs
  function clearServices() {
    document.querySelectorAll('.service').forEach(service => {
      service.classList.remove('service-active');
    });
  }
  
  // Fonction pour effacer les paquets de données
  function clearDataPackets() {
    document.querySelectorAll('.data-packet').forEach(packet => {
      packet.remove();
    });
  }
  
  // Initialiser l'interface
  document.addEventListener('DOMContentLoaded', function() {
    // Appliquer les couleurs initiales aux services
    document.querySelectorAll('.service').forEach(service => {
      if (service.id.includes('client')) service.classList.add('service-client');
      else if (service.id.includes('gateway')) service.classList.add('service-gateway');
      else if (service.id.includes('auth')) service.classList.add('service-auth');
      else if (service.id.includes('user') && !service.id.includes('db')) service.classList.add('service-user');
      else if (service.id.includes('product') && !service.id.includes('db')) service.classList.add('service-product');
      else if (service.id.includes('order') && !service.id.includes('db')) service.classList.add('service-order');
      else if (service.id.includes('config')) service.classList.add('service-config');
      else if (service.id.includes('db')) service.classList.add('service-database');
    });
  });