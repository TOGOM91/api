const User = require("../models/User");

// Ajouter un produit à la wishlist
const addToWishlist = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const productId = req.params.productId;

    const user = await User.findById(userId);

    if (!user) {
      req.flash('error', 'Utilisateur introuvable.');
      return res.redirect('back');
    }

    if (user.wishlist.includes(productId)) {
      req.flash('info', 'Ce produit est déjà dans votre wishlist.');
      return res.redirect('back');
    }

    user.wishlist.push(productId);
    await user.save();

    req.flash('success', 'Produit ajouté à votre wishlist !');
    res.redirect('back'); // reste sur la même page
  } 
  catch (err) {
    console.error(err);
    req.flash('error', 'Une erreur est survenue lors de l’ajout à la wishlist.');
    res.redirect('back');
  }
};

// Retirer un produit de la wishlist
const removeFromWishlist = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const productId = req.params.productId;

    const user = await User.findById(userId);
    if (!user) {
      req.flash('error', 'Utilisateur introuvable.');
      return res.redirect('back');
    }

    user.wishlist = user.wishlist.filter(id => id.toString() !== productId);
    await user.save();

    req.flash('success', 'Produit retiré de votre wishlist.');
    res.redirect('back'); // on reste sur la page wishlist
  } 
  catch (err) {
    console.error(err);
    req.flash('error', 'Une erreur est survenue lors du retrait.');
    res.redirect('back');
  }
};

// Afficher la wishlist
const getWishlist = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const user = await User.findById(userId).populate('wishlist');

    if (!user) {
      req.flash('error', 'Utilisateur introuvable.');
      return res.redirect('/');
    }

    res.render('wishlist', { wishlistItems: user.wishlist });
  } 
  catch (err) {
    console.error(err);
    req.flash('error', 'Erreur lors du chargement de la wishlist.');
    res.redirect('/');
  }
};

module.exports = { addToWishlist, removeFromWishlist, getWishlist };
