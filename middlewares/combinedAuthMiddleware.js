const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * Middleware combiné qui vérifie à la fois l'authentification par session et par JWT
 * Permet une transition en douceur entre les deux systèmes d'authentification
 */
function combinedAuth(req, res, next) {
  // Vérifier d'abord l'authentification par session
  if (req.session && req.session.user) {
    // Définir req.user pour que les contrôleurs puissent y accéder
    req.user = req.session.user;
    res.locals.user = req.session.user;
  
    return next();
  }
  
  // Si pas de session, vérifier le JWT
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
      // Ni session ni token JWT, rediriger vers la page de connexion
      return res.redirect('/login');
    }

    // Vérifier le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Récupérer l'utilisateur depuis la base de données
    const User = require('../models/User');
    User.findById(decoded.id)
      .then(user => {
        if (!user) {
          return res.redirect('/login');
        }
        
        // Ajouter l'utilisateur à la requête
        req.user = user;
        res.locals.user = user;
        next();
      })
      .catch(err => {
        console.error('Erreur lors de la récupération de l\'utilisateur:', err);
        return res.redirect('/login');
      });
  } catch (error) {
    console.error('Erreur d\'authentification JWT:', error);
    return res.redirect('/login');
  }
}

module.exports = combinedAuth;