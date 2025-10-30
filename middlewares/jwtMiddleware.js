const jwt = require('jsonwebtoken');
require('dotenv').config();


const verifyToken = (req, res, next) => {
  try {
    // Récupérer le token depuis l'en-tête Authorization ou depuis les cookies
    const authHeader = req.headers.authorization;
    let token;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      // Format: Bearer <token>
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      // Token dans un cookie
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

module.exports = verifyToken;