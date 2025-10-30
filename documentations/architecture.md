# Architecture du projet

## Vue d'ensemble

Ce projet est une application web Node.js/Express avec une API REST intégrée. L'architecture suit le modèle MVC (Modèle-Vue-Contrôleur) et utilise MongoDB comme base de données avec Mongoose comme ORM.

L'application propose deux interfaces :
1. Une interface web traditionnelle avec des vues rendues côté serveur (utilisant Jade/Pug)
2. Une API REST pour les clients mobiles ou les applications frontend modernes

## Structure des dossiers

```
├── bin/                    # Scripts de démarrage
│   └── www                 # Point d'entrée de l'application
├── controllers/            # Logique métier
│   ├── orderController.js  # Gestion des commandes
│   ├── productController.js # Gestion des produits
│   ├── userController.js   # Gestion des utilisateurs
│   └── wishlistController.js # Gestion des listes de souhaits
├── middlewares/            # Middlewares Express
│   ├── authMiddleware.js   # Vérification d'authentification par session
│   ├── combinedAuthMiddleware.js # Authentification hybride (session + JWT)
│   ├── jwtMiddleware.js    # Vérification des tokens JWT
│   └── uploadMiddleware.js # Configuration de Multer pour l'upload
├── models/                 # Modèles Mongoose
│   ├── Order.js            # Modèle de commande
│   ├── Product.js          # Modèle de produit
│   └── User.js             # Modèle d'utilisateur
├── public/                 # Fichiers statiques
│   ├── images/             # Images publiques
│   ├── javascripts/        # Scripts client
│   └── stylesheets/        # Feuilles de style CSS
├── routes/                 # Définition des routes
│   ├── apiRouter.js        # Routes de l'API REST
│   ├── index.js            # Routes principales
│   ├── productRouter.js    # Routes des produits
│   ├── usersRouter.js      # Routes des utilisateurs
│   └── wishlistRouter.js   # Routes des listes de souhaits
├── uploads/                # Fichiers uploadés
│   └── avatars/            # Images de profil des utilisateurs
├── views/                  # Templates Jade/Pug
│   ├── addProduct.jade     # Page d'ajout de produit
│   ├── error.jade          # Page d'erreur
│   ├── index.jade          # Page d'accueil
│   ├── layout.jade         # Layout principal
│   ├── login.jade          # Page de connexion
│   └── register.jade       # Page d'inscription
├── .env                    # Variables d'environnement
├── app.js                  # Configuration de l'application Express
├── package.json            # Dépendances et scripts
└── README.md              # Documentation du projet
```

## Flux de données et communication

### Flux de requête typique

1. **Entrée de la requête** : Le client (navigateur ou application) envoie une requête HTTP à l'application.
2. **Middleware global** : La requête passe par les middlewares globaux configurés dans `app.js` (logger, parseur JSON, parseur URL, cookies, sessions, etc.).
3. **Routage** : La requête est dirigée vers le routeur approprié en fonction de son URL (`index.js`, `usersRouter.js`, `productRouter.js`, etc.).
4. **Middleware d'authentification** : Si la route nécessite une authentification, les middlewares `authMiddleware.js`, `jwtMiddleware.js` ou `combinedAuthMiddleware.js` vérifient les droits d'accès.
5. **Contrôleur** : La fonction du contrôleur approprié est appelée pour traiter la requête.
6. **Modèle** : Le contrôleur interagit avec les modèles Mongoose pour accéder à la base de données.
7. **Réponse** : Le contrôleur renvoie une réponse, soit en rendant une vue (pour l'interface web), soit en renvoyant des données JSON (pour l'API REST).

### Communication entre les composants

#### Routes → Contrôleurs

Les fichiers de routes définissent les points d'entrée de l'application et délèguent le traitement aux contrôleurs :

```javascript
// Exemple de routes/usersRouter.js
router.post('/', upload.single('profilPic'), userController.createUser);
router.get('/', userController.getUsers);
router.get('/:id', userController.getUserById);
```

Les routes peuvent également inclure des middlewares spécifiques comme `upload.single('profilPic')` pour gérer l'upload de fichiers.

#### Contrôleurs → Modèles

Les contrôleurs contiennent la logique métier et interagissent avec les modèles pour accéder à la base de données :

```javascript
// Exemple de controllers/userController.js
const createUser = async (req, res) => {
  try{ 
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ ...req.body, password: hashedPassword });
    
    if (req.file) {
      user.profilPic = '/uploads/avatars/' + req.file.filename;
    }

    await user.save();
    // ...
  } catch(err) {
    // Gestion des erreurs
  }
};
```

#### Modèles → Base de données

Les modèles définissent la structure des données et fournissent des méthodes pour interagir avec la base de données MongoDB :

```javascript
// Exemple de models/User.js
const userSchema = new mongoose.Schema({
  name: { type: String, required: [true, "Name is required"] },
  // ...
});

module.exports = mongoose.model('User', userSchema);
```

## Système d'authentification hybride

L'application utilise un système d'authentification hybride qui combine deux approches :

1. **Authentification par session** : Pour l'interface web traditionnelle
   - Configurée dans `app.js` avec `express-session`
   - Vérifiée par `authMiddleware.js`

2. **Authentification par JWT** : Pour l'API REST
   - Implémentée dans `jwtMiddleware.js`
   - Tokens générés lors de l'authentification API

3. **Middleware combiné** : `combinedAuthMiddleware.js` qui vérifie les deux types d'authentification

Cette approche permet de servir à la fois des clients web traditionnels et des applications modernes avec la même base de code.

## Gestion des fichiers uploadés

Les fichiers uploadés (comme les avatars utilisateurs) sont gérés par Multer, configuré dans `uploadMiddleware.js` :

- Les fichiers sont stockés dans le dossier `uploads/avatars/`
- Les noms de fichiers sont générés avec un timestamp pour éviter les collisions
- Seules les images sont acceptées (jpeg, jpg, png, webp)
- La taille est limitée à 2 Mo

## Rendu des vues

L'application utilise Jade (Pug) comme moteur de template pour rendre les vues HTML :

```javascript
// Configuration dans app.js
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
```

Les vues sont organisées dans le dossier `views/` avec un layout commun (`layout.jade`) et des templates spécifiques pour chaque page.

## API REST

L'API REST est définie dans `routes/apiRouter.js` et fournit des points d'accès pour :

- L'authentification (`/api/auth`)
- Le profil utilisateur (`/api/profile`)
- Les produits (`/api/products`)

Toutes les routes API (sauf l'authentification) nécessitent un token JWT valide.

## À savoir / Conseils

- **Séparation des préoccupations** : L'architecture MVC permet une séparation claire entre la logique métier (contrôleurs), les données (modèles) et la présentation (vues).

- **Middleware Express** : L'application utilise intensivement le système de middleware d'Express pour gérer l'authentification, les uploads, et d'autres fonctionnalités transversales.

- **Environnement de développement** : Les variables d'environnement dans `.env` permettent de configurer l'application pour différents environnements (développement, production).

- **Sécurité** : L'application implémente plusieurs mesures de sécurité, comme le hachage des mots de passe avec bcrypt et la validation des entrées utilisateur.

- **Extensibilité** : La structure modulaire du projet facilite l'ajout de nouvelles fonctionnalités ou la modification des fonctionnalités existantes.