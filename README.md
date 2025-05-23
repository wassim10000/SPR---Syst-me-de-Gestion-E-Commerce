# SPR - Système de Gestion E-Commerce

Ce projet est une application complète de gestion e-commerce comprenant un backend Spring Boot, un frontend React et une base de données PostgreSQL. L'application permet la gestion des utilisateurs, des produits, des catégories, des commandes et des paniers d'achat.

## Table des matières

- [Aperçu du projet](#aperçu-du-projet)
- [Fonctionnalités](#fonctionnalités)
- [Architecture technique](#architecture-technique)
- [Prérequis](#prérequis)
- [Installation et démarrage](#installation-et-démarrage)
- [Déploiement avec Docker](#déploiement-avec-docker)
- [Utilisation de l'application](#utilisation-de-lapplication)
- [Développement](#développement)
- [Maintenance](#maintenance)

## Aperçu du projet

SPR est une application e-commerce complète qui permet aux utilisateurs de parcourir des produits, de les ajouter à leur panier et de passer des commandes. Elle comprend également un système d'administration pour gérer les utilisateurs, les produits, les catégories et les commandes.

## Fonctionnalités

### Backend (Spring Boot)

1. **Gestion des utilisateurs**
   - Authentification par JWT (JSON Web Token)
   - Inscription et connexion des utilisateurs
   - Gestion des rôles et des permissions
   - Profils utilisateurs avec historique des commandes

2. **Gestion des produits**
   - CRUD complet pour les produits
   - Catégorisation des produits
   - Recherche et filtrage des produits

3. **Gestion des commandes**
   - Création et suivi des commandes
   - Historique des commandes par utilisateur
   - Statuts des commandes (en attente, expédiée, livrée, etc.)

4. **Panier d'achat**
   - Ajout/suppression d'articles
   - Mise à jour des quantités
   - Calcul automatique des totaux

5. **Sécurité**
   - Système de permissions granulaires (USER_READ, ROLE_UPDATE, etc.)
   - Protection des endpoints API
   - Journalisation des actions utilisateurs

### Frontend (React)

1. **Interface utilisateur**
   - Design responsive avec Material-UI
   - Navigation intuitive
   - Thème personnalisable

2. **Fonctionnalités utilisateur**
   - Inscription et connexion
   - Parcourir les produits par catégorie
   - Recherche de produits
   - Gestion du panier d'achat
   - Passage de commandes
   - Suivi des commandes

3. **Tableau de bord administrateur**
   - Gestion des utilisateurs
   - Gestion des produits et catégories
   - Suivi des commandes
   - Rapports et statistiques

## Architecture technique

### Backend

- **Framework**: Spring Boot 3.2.3
- **Sécurité**: Spring Security avec JWT
- **ORM**: Hibernate/JPA
- **Base de données**: PostgreSQL
- **API**: RESTful

### Frontend

- **Framework**: React 19
- **UI**: Material-UI 7
- **Routing**: React Router 7
- **État**: React Hooks
- **HTTP**: Axios
- **Build**: Vite

## Prérequis

- Java 17 ou supérieur
- Node.js 20 ou supérieur
- PostgreSQL 16 ou supérieur
- Docker et Docker Compose (pour le déploiement conteneurisé)

## Installation et démarrage

### Sans Docker (développement)

#### Backend

1. Naviguer vers le dossier backend:
   ```bash
   cd backend
   ```

2. Compiler le projet avec Maven:
   ```bash
   ./mvnw clean package
   ```
   ou sur Windows:
   ```bash
   mvnw.cmd clean package
   ```

3. Exécuter l'application:
   ```bash
   java -jar target/backend-0.0.1-SNAPSHOT.jar
   ```

Le backend sera accessible à l'adresse: http://localhost:8080

#### Frontend

1. Naviguer vers le dossier frontend:
   ```bash
   cd frontend
   ```

2. Installer les dépendances:
   ```bash
   npm install
   ```

3. Démarrer l'application en mode développement:
   ```bash
   npm run dev
   ```

Le frontend sera accessible à l'adresse: http://localhost:5173

## Déploiement avec Docker

Pour déployer l'application complète avec Docker:

```bash
# À la racine du projet
docker-compose up -d
```

Cette commande va:
1. Construire les images Docker pour le backend et le frontend
2. Démarrer la base de données PostgreSQL
3. Démarrer le backend une fois la base de données prête
4. Démarrer le frontend

### Accès à l'application déployée

- **Frontend**: http://localhost
- **Backend API**: http://localhost:8081/api
- **Base de données**: localhost:5432 (accessible avec les outils de base de données)

### Variables d'environnement

Vous pouvez personnaliser le déploiement en modifiant les variables d'environnement dans le fichier `docker-compose.yml` ou en créant un fichier `.env` à la racine du projet.

Variables importantes:
- `JWT_SECRET`: Clé secrète pour la génération des tokens JWT
- `POSTGRES_PASSWORD`: Mot de passe de la base de données

### Arrêt des services

Pour arrêter tous les services:
```bash
docker-compose down
```

Pour arrêter et supprimer les volumes (y compris les données de la base de données):
```bash
docker-compose down -v
```

## Utilisation de l'application

### Comptes par défaut

L'application est préchargée avec les comptes suivants:

- **Administrateur**:
  - Email: admin@example.com
  - Mot de passe: admin123

- **Client**:
  - Email: client@example.com
  - Mot de passe: password

- **Vendeur**:
  - Email: vendeur@example.com
  - Mot de passe: password

### Fonctionnalités principales

1. **Parcourir les produits**
   - Accédez à la page d'accueil pour voir tous les produits
   - Utilisez les filtres de catégories pour affiner votre recherche
   - Cliquez sur un produit pour voir ses détails

2. **Gestion du panier**
   - Ajoutez des produits à votre panier depuis la page de détails
   - Modifiez les quantités ou supprimez des articles dans la page du panier
   - Procédez au paiement depuis la page du panier

3. **Commandes**
   - Consultez l'historique de vos commandes dans votre profil
   - Suivez l'état de vos commandes en cours

4. **Administration**
   - Accédez au tableau de bord d'administration (réservé aux administrateurs)
   - Gérez les utilisateurs, produits, catégories et commandes

## Développement

### Structure du projet

```
spr/
├── backend/                 # Application Spring Boot
│   ├── src/                 # Code source
│   │   ├── main/
│   │   │   ├── java/        # Code Java
│   │   │   └── resources/   # Fichiers de configuration
│   │   └── test/            # Tests
│   └── pom.xml              # Configuration Maven
├── frontend/                # Application React
│   ├── public/              # Ressources statiques
│   ├── src/                 # Code source
│   │   ├── components/      # Composants React
│   │   ├── pages/           # Pages de l'application
│   │   └── services/        # Services API
│   └── package.json         # Configuration npm
└── docker-compose.yml       # Configuration Docker Compose
```

### Ajout de fonctionnalités

1. **Backend**:
   - Créez de nouvelles entités dans `backend/src/main/java/com/example/backend/entity/`
   - Implémentez les repositories dans `backend/src/main/java/com/example/backend/repository/`
   - Ajoutez la logique métier dans `backend/src/main/java/com/example/backend/service/`
   - Exposez les API dans `backend/src/main/java/com/example/backend/controller/`

2. **Frontend**:
   - Créez de nouveaux composants dans `frontend/src/components/`
   - Ajoutez de nouvelles pages dans `frontend/src/pages/`
   - Implémentez les appels API dans `frontend/src/services/`

## Maintenance

### Logs

Pour voir les logs d'un service spécifique:

```bash
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db
```

### Redéploiement après modifications

Après avoir modifié le code source:

```bash
docker-compose up -d --build
```

Cette commande reconstruira les images et redémarrera les services.

### Sauvegarde de la base de données

Pour sauvegarder la base de données:

```bash
docker exec -t spr-db pg_dump -U postgres sprdb > backup.sql
```

Pour restaurer la base de données:

```bash
cat backup.sql | docker exec -i spr-db psql -U postgres -d sprdb
```
