# Système d'upload de fichiers

## Vue d'ensemble

L'application implémente un système d'upload de fichiers basé sur Multer, une bibliothèque middleware pour Express qui facilite la gestion des fichiers multipart/form-data. Ce système est principalement utilisé pour permettre aux utilisateurs de télécharger leurs photos de profil.

## Configuration de Multer

La configuration de Multer est définie dans le fichier `middlewares/uploadMiddleware.js` :

```javascript
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = './uploads/avatars';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // On génère un nom unique temporaire (timestamp + extension)
    const ext = path.extname(file.originalname);
    const uniqueName = Date.now() + ext;
    cb(null, uniqueName);
  }
});

// Filtre pour accepter uniquement les images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const mimetype = allowedTypes.test(file.mimetype);
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(new Error('Seules les images sont autorisées'));
  }
};

// Limite la taille à 2 Mo
const limits = { fileSize: 2 * 1024 * 1024 };

const upload = multer({ storage, fileFilter, limits });

module.exports = upload;
```

## Caractéristiques principales

### Stockage des fichiers

- **Répertoire de destination** : Les fichiers uploadés sont stockés dans le dossier `uploads/avatars/`
- **Création automatique du répertoire** : Si le répertoire n'existe pas, il est créé automatiquement au démarrage de l'application
- **Nommage des fichiers** : Les fichiers sont renommés avec un timestamp (Date.now()) suivi de l'extension d'origine pour garantir l'unicité et éviter les collisions de noms

### Filtrage des fichiers

- **Types de fichiers acceptés** : Seules les images sont autorisées (jpeg, jpg, png, webp)
- **Double vérification** : Le type MIME et l'extension du fichier sont tous deux vérifiés pour une sécurité accrue
- **Gestion des erreurs** : Une erreur explicite est renvoyée si le fichier n'est pas une image

### Limites et sécurité

- **Taille maximale** : La taille des fichiers est limitée à 2 Mo
- **Validation du type** : Seuls les formats d'image spécifiés sont acceptés
- **Pas d'exécution de code** : Les fichiers uploadés sont stockés dans un répertoire distinct des fichiers de l'application

## Utilisation dans l'application

Le middleware d'upload est utilisé dans les routes qui nécessitent l'upload de fichiers, comme la création d'un utilisateur :

```javascript
// Dans routes/usersRouter.js
router.post('/', upload.single('profilPic'), userController.createUser);
```

La méthode `upload.single('profilPic')` indique que la route attend un seul fichier dans le champ de formulaire nommé 'profilPic'.

## Traitement des fichiers uploadés dans les contrôleurs

Une fois qu'un fichier a été uploadé via Multer, il est accessible dans l'objet `req.file` dans le contrôleur :

```javascript
// Dans controllers/userController.js
const createUser = async (req, res) => {
  try{ 
    // ...
    const user = new User({ ...req.body, password: hashedPassword });
  
    //stocker l'image dans le dossier uploads
    if (req.file) {
      user.profilPic = '/uploads/avatars/' + req.file.filename;
    }

    await user.save();
    // ...
  } catch(err) {
    // ...
  }
};
```

Le chemin du fichier est stocké dans la base de données (dans le champ `profilPic` du modèle User), ce qui permet de le récupérer facilement pour l'affichage.

## Suppression des anciens fichiers

Lors de la suppression d'un utilisateur, l'application supprime également son image de profil pour éviter d'accumuler des fichiers inutiles :

```javascript
// Dans controllers/userController.js
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
    // ...
  } catch (err) {
    // ...
  }
};
```

Cette approche garantit que les fichiers orphelins ne s'accumulent pas sur le serveur.

## Accès aux fichiers uploadés

Pour rendre les fichiers uploadés accessibles depuis le navigateur, l'application configure un middleware statique dans `app.js` :

```javascript
app.use('/uploads', express.static('uploads'));
```

Cela permet d'accéder aux fichiers uploadés via des URLs comme `/uploads/avatars/1234567890.jpg`.

## À savoir / Conseils

- **Sécurité** : Bien que le système filtre les types de fichiers, il est recommandé d'ajouter des validations supplémentaires comme la vérification du contenu réel des fichiers.
- **Optimisation des images** : Pour améliorer les performances, envisagez d'ajouter un traitement d'image pour redimensionner et optimiser les images uploadées.
- **Stockage cloud** : Pour une application en production, envisagez d'utiliser un service de stockage cloud (AWS S3, Google Cloud Storage, etc.) plutôt que le système de fichiers local.
- **Nettoyage périodique** : Mettez en place un système de nettoyage périodique pour supprimer les fichiers orphelins qui pourraient subsister après des erreurs ou des interruptions.
- **Mise à jour des fichiers** : Si vous permettez aux utilisateurs de mettre à jour leur image de profil, n'oubliez pas de supprimer l'ancienne image pour économiser de l'espace disque.