const { render } = require("../app");
const User = require("../models/User");
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const getUsers = async (req, res) => {
  const users = await User.find();
  res.render('users', { users });
};

const createUser = async (req, res) => {
    
 
  try{ 
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ ...req.body, password: hashedPassword });


    if (req.file) {
      user.profilPic = '/uploads/avatars/' + req.file.filename;
    }

    await user.save();
    

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    
  
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 
    });
    
    req.session.user = user;
 res.redirect('/me');

  }catch(err){
 if (err.code === 11000) {
      const field = Object.keys(err.keyValue)[0]; 
      res.status(400).send(`Erreur : ${field} "${err.keyValue[field]}" est déjà utilisé !`);
    } else {
      res.status(500).send(err.message);
    }
    }
 
};

const getUserById = async (req, res) => {
  const user = await User.findById(req.params.id);
  res.json(user);
};

const uploadDir = path.join(__dirname, '..', 'uploads', 'avatars');

const deleteUser = async (req, res) => {
  try {

    const user = await User.findById(req.params.id);

    if (!user) {
      req.flash('error', 'Utilisateur introuvable.');
      return res.status(404).redirect('/');
    }

    if (user.profilPic) {
      const imagePath = path.join(__dirname, '..', user.profilPic);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
        console.log(`🗑️ Image supprimée : ${imagePath}`);
      }
    }


    await User.findByIdAndDelete(req.params.id);

    if (req.session.user && req.session.user._id.toString() === req.params.id) {
      req.session.destroy((err) => {
        if (err) {
          console.error('Erreur lors de la destruction de la session :', err);
        }
        res.clearCookie('connect.sid');
        res.clearCookie('token');
        return res.redirect('/register');
      });
    } else {
     
      req.flash('success', 'Utilisateur supprimé avec succès.');
      return res.redirect('/');
    }

  } catch (err) {
    console.error('Erreur lors de la suppression de l’utilisateur :', err);
    req.flash('error', 'Erreur lors de la suppression de l’utilisateur.');
    return res.status(500).redirect('/');
  }
};

const connectUser = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return req.flash('error', 'Email non trouvé'), res.redirect('/login');
  }
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return req.flash('error', 'Mot de passe incorrect'), res.redirect('/login');
  }

  // Générer un token JWT
  const token = jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
  
  // Stocker le token dans un cookie
  res.cookie('token', token, {
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 1 jour
  });

  req.session.user = user;
  req.flash('success', 'Connexion réussie');
  res.redirect('/me');
 
};

const updateUser = async (req, res) => {
  try{
    const userId = req.params.id;
    const user = await User.findById(userId);
    
    if (!user) {
      req.flash('error', 'Utilisateur non trouvé');
      return res.redirect('/me');
    }
    
  
    if (req.session.user && req.session.user._id.toString() !== userId) {
      req.flash('error', 'Vous ne pouvez pas modifier le profil d\'un autre utilisateur');
      return res.redirect('/me');
    }
    
    const updates = { ...req.body };
    

    if (updates.password && updates.password.trim() !== '') {
      updates.password = await bcrypt.hash(updates.password, 10);
    } else {
      delete updates.password; // Ne pas modifier le mot de passe
    }
    
    // Gestion de l'image de profil
    if (req.file) {
      // Supprimer l'ancienne image si elle existe
      if (user.profilPic) {
        const oldImagePath = path.join(__dirname, '..', user.profilPic);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
          console.log(`🗑️ Ancienne image supprimée : ${oldImagePath}`);
        }
      }
      
  
      updates.profilPic = '/uploads/avatars/' + req.file.filename;
    }
    
    const updatedUser = await User.findByIdAndUpdate(userId, updates, { new: true, runValidators: true });
    
    // Mettre à jour la session utilisateur
    req.session.user = updatedUser;
    
    req.flash('success', 'Profil mis à jour avec succès');
    res.redirect('/me');
  } catch(err) {
    console.error('Erreur lors de la mise à jour du profil :', err);
    req.flash('error', err.message);
    res.redirect('/edit');
  }
}

const logoutUser = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send('Error during logout');
    }
    res.clearCookie('connect.sid');
    res.clearCookie('token');  
    res.redirect('/register');
  });
};

const getEditUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      req.flash('error', 'Utilisateur non trouvé');
      return res.redirect('/me');
    }
    res.render('edit', { user });
  } catch (err) {
    req.flash('error', 'Erreur lors du chargement du profil');
    res.redirect('/me');
  }
};

const postEditUser = updateUser; // Utilise la fonction updateUser existante

module.exports = { getUsers, createUser, getUserById, deleteUser, connectUser, updateUser, logoutUser, getEditUser, 
  postEditUser };
