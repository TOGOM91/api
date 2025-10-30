# Documentation des points d'accès API

Ce document détaille toutes les routes disponibles dans l'application, à la fois pour l'interface web et l'API REST.

## Routes d'authentification

### Interface Web

| Méthode | Route | Contrôleur | Description |
|---------|-------|------------|-------------|
| GET | `/register` | - | Affiche le formulaire d'inscription |
| POST | `/users` | `userController.createUser` | Crée un nouvel utilisateur |
| GET | `/login` | - | Affiche le formulaire de connexion |
| POST | `/users/login` | `userController.connectUser` | Authentifie un utilisateur |
| POST | `/users/logout` | `userController.logoutUser` | Déconnecte l'utilisateur |

### API REST

| Méthode | Route | Middleware | Contrôleur | Description |
|---------|-------|------------|------------|-------------|
| POST | `/api/auth` | - | - | Authentifie un utilisateur et renvoie un token JWT |

#### Détails de la route `/api/auth`

**Méthode**: POST

**Paramètres de la requête**:
```json
{
  "email": "utilisateur@exemple.com",
  "password": "motdepasse"
}
```

**Réponses**:
- **200 OK**:
```json
{
  "token": "jwt_token_here",
  "user": {
    "_id": "user_id",
    "name": "Nom Utilisateur",
    "username": "username",
    "email": "utilisateur@exemple.com",
    "role": "user",
    "wishlist": [],
    "profilPic": "/uploads/avatars/image.jpg"
  }
}
```
- **401 Unauthorized**: Email ou mot de passe incorrect
- **500 Internal Server Error**: Erreur serveur

## Routes utilisateurs

### Interface Web

| Méthode | Route | Middleware | Contrôleur | Description |
|---------|-------|------------|------------|-------------|
| GET | `/me` | `combinedAuth` | - | Affiche le profil de l'utilisateur connecté |
| GET | `/users` | - | `userController.getUsers` | Liste tous les utilisateurs |
| GET | `/users/:id` | - | `userController.getUserById` | Récupère un utilisateur par son ID |
| DELETE | `/users/:id` | - | `userController.deleteUser` | Supprime un utilisateur |

### API REST

| Méthode | Route | Middleware | Contrôleur | Description |
|---------|-------|------------|------------|-------------|
| GET | `/api/profile` | `verifyToken` | - | Récupère le profil de l'utilisateur connecté |

#### Détails de la route `/api/profile`

**Méthode**: GET

**En-têtes**:
```
Authorization: Bearer <jwt_token>
```

**Réponses**:
- **200 OK**:
```json
{
  "_id": "user_id",
  "name": "Nom Utilisateur",
  "username": "username",
  "email": "utilisateur@exemple.com",
  "role": "user",
  "wishlist": [],
  "profilPic": "/uploads/avatars/image.jpg"
}
```
- **401 Unauthorized**: Token manquant ou invalide
- **404 Not Found**: Utilisateur non trouvé
- **500 Internal Server Error**: Erreur serveur

## Routes produits

### Interface Web

| Méthode | Route | Middleware | Contrôleur | Description |
|---------|-------|------------|------------|-------------|
| GET | `/products/add` | `combinedAuth` | `productController.getProducts` | Affiche la page d'ajout de produit avec la liste des produits |
| POST | `/products/add` | `combinedAuth` | `productController.createProduct` | Crée un nouveau produit |
| DELETE | `/products/:id` | `combinedAuth` | `productController.deleteProduct` | Supprime un produit |

### API REST

| Méthode | Route | Middleware | Contrôleur | Description |
|---------|-------|------------|------------|-------------|
| GET | `/api/products` | `verifyToken` | - | Récupère tous les produits |
| GET | `/api/products/:id` | `verifyToken` | - | Récupère un produit par son ID |

#### Détails de la route `/api/products`

**Méthode**: GET

**En-têtes**:
```
Authorization: Bearer <jwt_token>
```

**Réponses**:
- **200 OK**:
```json
[
  {
    "_id": "product_id",
    "name": "Nom du produit",
    "description": "Description du produit",
    "price": 99.99,
    "image": "/uploads/products/image.jpg"
  },
  // autres produits...
]
```
- **401 Unauthorized**: Token manquant ou invalide
- **500 Internal Server Error**: Erreur serveur

#### Détails de la route `/api/products/:id`

**Méthode**: GET

**En-têtes**:
```
Authorization: Bearer <jwt_token>
```

**Réponses**:
- **200 OK**:
```json
{
  "_id": "product_id",
  "name": "Nom du produit",
  "description": "Description du produit",
  "price": 99.99,
  "image": "/uploads/products/image.jpg"
}
```
- **401 Unauthorized**: Token manquant ou invalide
- **404 Not Found**: Produit non trouvé
- **500 Internal Server Error**: Erreur serveur

## Routes liste de souhaits (wishlist)

| Méthode | Route | Middleware | Contrôleur | Description |
|---------|-------|------------|------------|-------------|
| POST | `/wishlist/:productId` | `combinedAuth` | `wishlistController.addToWishlist` | Ajoute un produit à la liste de souhaits |
| DELETE | `/wishlist/:productId` | - | `wishlistController.removeFromWishlist` | Supprime un produit de la liste de souhaits |

#### Détails de la route `/wishlist/:productId` (POST)

**Méthode**: POST

**Paramètres de l'URL**:
- `productId`: ID du produit à ajouter à la liste de souhaits

**Authentification**: Requiert une authentification (session ou JWT)

**Réponses**:
- **200 OK**:
```json
{
  "message": "Product added to wishlist"
}
```
- **400 Bad Request**: Produit déjà dans la liste de souhaits
- **401 Unauthorized**: Non authentifié
- **500 Internal Server Error**: Erreur serveur

#### Détails de la route `/wishlist/:productId` (DELETE)

**Méthode**: DELETE

**Paramètres de l'URL**:
- `productId`: ID du produit à supprimer de la liste de souhaits

**Réponses**:
- **200 OK**:
```json
{
  "message": "Produit bien retirer",
  "wishlist": [/* IDs des produits restants */]
}
```
- **404 Not Found**: Utilisateur non trouvé
- **500 Internal Server Error**: Erreur serveur

## À savoir / Conseils

- Toutes les routes API nécessitent une authentification par JWT, à l'exception de la route d'authentification (`/api/auth`).
- Les routes web utilisent principalement le middleware `combinedAuth` qui accepte à la fois l'authentification par session et par JWT.
- Les réponses d'erreur incluent généralement un message descriptif pour faciliter le débogage.
- Pour les routes API, assurez-vous d'inclure le token JWT dans l'en-tête `Authorization` au format `Bearer <token>`.
- Pour les routes web, l'authentification est gérée par les cookies de session.