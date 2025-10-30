# Système d'authentification

## Vue d'ensemble

L'application implémente un système d'authentification hybride qui combine deux approches :

1. **Authentification par session** : Utilisée principalement pour les utilisateurs du site web
2. **Authentification par JWT (JSON Web Token)** : Utilisée principalement pour les clients API

Cette approche hybride permet de servir à la fois un site web traditionnel et une API REST moderne avec le même backend.

## Composants du système d'authentification

### Middlewares d'authentification

#### `authMiddleware.js`

Middleware simple qui vérifie si l'utilisateur est authentifié via session.

```javascript
function isAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }
  res.redirect('/register');
}
```

Ce middleware :
- Vérifie l'existence d'un objet utilisateur dans la session
- Redirige vers la page d'inscription si l'utilisateur n'est pas authentifié

#### `jwtMiddleware.js`

Middleware qui vérifie l'authentification par token JWT.

```javascript
const verifyToken = (req, res, next) => {
  try {
    // Récupérer le token depuis l'en-tête Authorization ou depuis les cookies
    const authHeader = req.headers.authorization;
    let token;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({ message: 'Accès refusé. Token manquant.' });
    }

    // Vérifier le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Ajouter les informations utilisateur décodées à la requête
    req.user = decoded;
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expiré. Veuillez vous reconnecter.' });
    }
    return res.status(403).json({ message: 'Token invalide.' });
  }
};
```

Ce middleware :
- Récupère le token JWT depuis l'en-tête `Authorization` ou depuis les cookies
- Vérifie la validité du token avec la clé secrète
- Décode le token et ajoute les informations utilisateur à l'objet requête
- Renvoie des erreurs appropriées si le token est manquant, expiré ou invalide

#### `combinedAuthMiddleware.js`

Middleware hybride qui combine les deux approches d'authentification.

```javascript
function combinedAuth(req, res, next) {
  // Vérifier d'abord l'authentification par session
  if (req.session && req.session.user) {
    req.user = req.session.user;
    res.locals.user = req.session.user;
    return next();
  }
  
  // Si pas de session, vérifier le JWT
  try {
    // Récupérer et vérifier le token JWT
    // ...
    
    // Récupérer l'utilisateur depuis la base de données
    const User = require('../models/User');
    User.findById(decoded.id)
      .then(user => {
        if (!user) {
          return res.redirect('/login');
        }
        
        req.user = user;
        res.locals.user = user;
        next();
      })
      .catch(err => {
        return res.redirect('/login');
      });
  } catch (error) {
    return res.redirect('/login');
  }
}
```

Ce middleware :
- Vérifie d'abord si l'utilisateur est authentifié via session
- Si non, vérifie l'authentification par JWT
- Récupère l'utilisateur complet depuis la base de données si le JWT est valide
- Redirige vers la page de connexion si aucune méthode d'authentification ne réussit

### Configuration des sessions

La configuration des sessions est définie dans `app.js` :

```javascript
app.use(session({
  secret: process.env.SESSION_SECRET || 'monSecret',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 } // 1 heure
}));
```

Caractéristiques :
- Utilisation d'une clé secrète pour signer les cookies de session
- Sessions non sauvegardées automatiquement (`resave: false`)
- Pas de création de sessions vides (`saveUninitialized: