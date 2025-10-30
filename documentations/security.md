# Mesures de sécurité

## Vue d'ensemble

Ce document détaille les mesures de sécurité implémentées dans l'application pour protéger les données des utilisateurs et prévenir les vulnérabilités courantes.

## Hachage des mots de passe

L'application utilise la bibliothèque **bcrypt** pour le hachage sécurisé des mots de passe :

```javascript
// Dans controllers/userController.js
const createUser = async (req, res) => {
  try{ 
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ ...req.body, password: hashedPassword });
    // ...
  } catch(err) {
    // ...
  }
};
```

Caractéristiques du hachage avec bcrypt :

- **Salage automatique** : Chaque mot de passe est automatiquement salé avec un sel unique
- **Facteur de coût** : Utilisation d'un facteur de coût de 10, ce qui représente un bon équilibre entre sécurité et performance
- **Résistance aux attaques par force brute** : Le hachage bcrypt est intentionnellement lent pour résister aux attaques par force brute
- **Comparaison sécurisée** : Utilisation de la méthode `bcrypt.compare()` pour vérifier les mots de passe sans les exposer

## Authentification et autorisation

### Système d'authentification hybride

L'application implémente un système d'authentification hybride qui combine :

1. **Sessions Express** pour l'interface web
2. **Tokens JWT** pour l'API REST

### Sécurité des sessions

```javascript
// Dans app.js
app.use(session({
  secret: process.env.SESSION_SECRET || 'monSecret',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 } // 1 heure
}));
```

Mesures de sécurité pour les sessions :

- **Clé secrète** : Utilisation d'une clé secrète stockée dans les variables d'environnement
- **Cookies non persistants** : Les cookies de session expirent après 1 heure d'inactivité
- **Pas de sessions vides** : Option `saveUninitialized: false` pour éviter de stocker des sessions vides
- **Middleware de vérification** : Utilisation de middlewares pour vérifier l'authentification sur les routes protégées

### Sécurité des tokens JWT

```javascript
// Dans routes/apiRouter.js
const token = jwt.sign(
  { id: user._id, email: user.email, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRES_IN }
);
```

Mesures de sécurité pour les tokens JWT :

- **Clé secrète** : Utilisation d'une clé secrète différente stockée dans les variables d'environnement
- **Expiration** : Les tokens ont une durée de validité limitée (1 jour par défaut)
- **Données limitées** : Seules les informations nécessaires sont incluses dans le payload du token
- **Vérification stricte** : Middleware `jwtMiddleware.js` qui vérifie la validité du token pour chaque requête API

## Protection des routes

L'application utilise plusieurs middlewares pour protéger les routes sensibles :

1. **authMiddleware.js** : Vérifie l'authentification par session
2. **jwtMiddleware.js** : Vérifie l'authentification par token JWT
3. **combinedAuthMiddleware.js** : Combine les deux approches pour une protection maximale

Exemple d'utilisation :

```javascript
// Dans routes/productRouter.js
router.post('/add', combinedAuth, productController.createProduct);
router.get('/add', combinedAuth, productController.getProducts);
router.delete('/:id', combinedAuth, productController.deleteProduct);
```

## Validation des entrées utilisateur

Bien que l'application n'utilise pas de bibliothèque de validation dédiée, elle implémente plusieurs validations :

1. **Validation côté modèle** : Les schémas Mongoose définissent des règles de validation pour les données

```javascript
// Dans models/User.js
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: [true, "Email already exists"],
  },
  // ...
});
```

2. **Validation des fichiers uploadés** : Le middleware Multer filtre les types de fichiers et limite leur taille

```javascript
// Dans middlewares/uploadMiddleware.js
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const mimetype = allowedTypes.test(file.mimetype);
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(new Error('Seules les images sont autorisées'));
  }
};
```

## Gestion des erreurs et messages

L'application utilise connect-flash pour afficher des messages d'erreur ou de succès sans exposer de détails techniques sensibles :

```javascript
// Dans app.js
app.use(flash());

app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success');
  res.locals.error_msg = req.flash('error');
  next();
});
```

Exemple d'utilisation dans un contrôleur :

```javascript
// Dans controllers/userController.js
if (!user) {
  req.flash('error', 'Utilisateur introuvable.');
  return res.status(404).redirect('/');
}
```

## Sécurité des fichiers uploadés

L'application implémente plusieurs mesures pour sécuriser l'upload de fichiers :

1. **Validation du type MIME** : Vérification du type MIME pour s'assurer que seules les images sont acceptées
2. **Validation de l'extension** : Double vérification de l'extension du fichier
3. **Limitation de taille** : Les fichiers sont limités à 2 Mo
4. **Renommage des fichiers** : Les noms de fichiers originaux sont remplacés par des timestamps pour éviter les conflits et les injections
5. **Stockage séparé** : Les fichiers sont stockés dans un dossier distinct des fichiers de l'application

## Variables d'environnement

Les informations sensibles sont stockées dans des variables d'environnement plutôt que directement dans le code :

```
// .env
MONGO_URI=mongodb://127.0.0.1:27017/monprojet
JWT_SECRET=machin
JWT_EXPIRES_IN=1d
```

Ces variables sont chargées avec la bibliothèque dotenv :

```javascript
// Dans plusieurs fichiers
require('dotenv').config();
```

## À savoir / Conseils

- **Amélioration de la validation** : L'application bénéficierait de l'ajout d'une bibliothèque de validation comme Joi ou express-validator pour une validation plus robuste des entrées utilisateur.

- **Protection CSRF** : Bien que l'application utilise des tokens JWT pour l'API, l'ajout d'une protection CSRF pour les formulaires web serait recommandé.

- **En-têtes de sécurité** : L'ajout de la bibliothèque Helmet.js permettrait de configurer automatiquement plusieurs en-têtes HTTP de sécurité.

- **Limitation de débit** : Implémenter un middleware de rate limiting pour prévenir les attaques par force brute sur les routes d'authentification.

- **Audit de sécurité** : Mettre en place un système d'audit pour tracer les actions sensibles comme les connexions, les modifications de profil, etc.

- **Mise à jour des dépendances** : Vérifier régulièrement les vulnérabilités dans les dépendances avec des outils comme npm audit et mettre à jour les packages en conséquence.