var express = require('express');
var router = express.Router();
const wishlistController = require("../controllers/wishlistController");
const combinedAuth = require("../middlewares/combinedAuthMiddleware");

// GET wishlist (view user's wishlist)
router.get('/', combinedAuth, wishlistController.getWishlist);

// Add product to wishlist
router.post('/:productId', combinedAuth, wishlistController.addToWishlist);

// Remove product from wishlist
router.delete('/:productId', combinedAuth, wishlistController.removeFromWishlist);

module.exports = router;
