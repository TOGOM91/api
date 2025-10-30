require("dotenv").config(); 
var express = require('express');
var mongoose = require('mongoose');
var cors = require('cors');
const User = require("../models/User");
var router = express.Router();
const isAuthenticated = require("../middlewares/authMiddleware");
const combinedAuth = require("../middlewares/combinedAuthMiddleware");
const verifyToken = require("../middlewares/jwtMiddleware");
const Product = require("../models/Product");
const { getProducts } = require("../controllers/productController");



mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));


router.get('/', combinedAuth, function(req, res, next) {
  res.render('index', { user: req.session.user });
  
});
router.get('/register', function(req, res, next) {
  res.render('register', { title: 'Register' });
});

router.get('/me', combinedAuth, async (req, res, next) => {
  try {

    const currentUser = req.session.user;
    const users = await User.find({ _id: { $ne: currentUser._id } }); 
    res.render('index', { users, user: currentUser });
  } catch (err) {
    next(err);
  }
});

router.get('/login', function(req, res, next) {
  res.render('login', { title: 'Login' });
});

router.get('/addProduct', combinedAuth, getProducts, function(req, res, next) {
  res.render('addProduct', { title: 'Add Product' });
});



module.exports = router;
