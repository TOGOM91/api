var express = require('express');
var router = express.Router();
const productController = require("../controllers/productController");
const verifyToken = require("../middlewares/jwtMiddleware");
const combinedAuth = require("../middlewares/combinedAuthMiddleware");





router.post('/add', combinedAuth, productController.createProduct);

router.get('/add', combinedAuth, productController.getProducts);

router.delete('/:id', combinedAuth, productController.deleteProduct);



module.exports = router;
