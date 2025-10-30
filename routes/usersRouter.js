var express = require('express');
var router = express.Router();
const userController = require("../controllers/userController");
const upload = require("../middlewares/uploadMiddleware");
const combinedAuth = require("../middlewares/combinedAuthMiddleware");




router.post('/', upload.single('profilPic'), userController.createUser);

router.get('/', userController.getUsers);

router.get('/:id', userController.getUserById);

router.delete('/:id', userController.deleteUser);

router.post('/login', userController.connectUser);

router.post('/logout', userController.logoutUser);

router.get('/edit/:id', combinedAuth, userController.getEditUser);

router.post('/edit/:id', combinedAuth, upload.single('profilPic'), userController.postEditUser);

module.exports = router;
