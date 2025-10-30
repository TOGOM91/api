var express = require('express');
var router = express.Router();
const User = require("../models/User");
const Product = require("../models/Product");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const verifyToken = require("../middlewares/jwtMiddleware");

/**
 * Route pour l'authentification et l'obtention d'un token JWT
 * @route POST /api/auth
 * @param {string} email.body.required - Email de l'utilisateur
 * @param {string} password.body.required - Mot de passe de l'utilisateur
 * @returns {object} 200 - Token JWT et informations utilisateur
 * @returns {Error} 401 - Identifiants invalides
 */
router.post('/auth', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Vérifier si l'utilisateur existe
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }
    
    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }
    
    // Générer un token JWT
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    
    // Renvoyer le token et les informations utilisateur (sans le mot de passe)
    const userWithoutPassword = { ...user.toObject() };
    delete userWithoutPassword.password;
    
    res.status(200).json({
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Erreur d\'authentification API:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

/**
 * Route pour obtenir le profil de l'utilisateur connecté
 * @route GET /api/profile
 * @returns {object} 200 - Informations utilisateur
 * @returns {Error} 401 - Non authentifié
 */
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

/**
 * Route pour obtenir tous les produits
 * @route GET /api/products
 * @returns {Array} 200 - Liste des produits
 * @returns {Error} 401 - Non authentifié
 */
router.get('/products', verifyToken, async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    console.error('Erreur lors de la récupération des produits:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

/**
 * Route pour obtenir un produit par son ID
 * @route GET /api/products/:id
 * @returns {object} 200 - Détails du produit
 * @returns {Error} 401 - Non authentifié
 * @returns {Error} 404 - Produit non trouvé
 */
router.get('/products/:id', verifyToken, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Produit non trouvé' });
    }
    res.status(200).json(product);
  } catch (error) {
    console.error('Erreur lors de la récupération du produit:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;