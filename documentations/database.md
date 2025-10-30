# Documentation des modèles de données

Ce document détaille les modèles Mongoose utilisés dans l'application, leurs champs, validations et relations.

## Modèle User

### Schéma

```javascript
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
    },
    username: {
        type: String,
        required: [true, "Username is required"],
        unique: [true, "Username already exists"], 
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: [true, "Email already exists"],
    },
    password: {
        type: String,
        required: [true, "Password is required"],
    },
    role : {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    }, 
    wishlist: [{
        type: Schema.Types.ObjectId, 
        ref: 'Product' 
    }], 
    profilPic: {
        type: String, 
    }     
}, { timestamps: true });
```

### Champs

| Champ | Type | Description | Validation |
|-------|------|-------------|------------|
| `name` | String | Nom complet de l'utilisateur | Requis |
| `username` | String | Nom d'utilisateur | Requis, Unique |
| `email` | String | Adresse email | Requis, Unique |
| `password` | String | Mot de passe (haché) | Requis |
| `role` | String | Rôle de l'utilisateur | Enum: 'user', 'admin'; Défaut: 'user' |
| `wishlist` | Array | Liste des produits favoris | Références aux documents Product |
| `profilPic` | String | Chemin vers l'image de profil | Optionnel |
| `createdAt` | Date | Date de création | Automatique (timestamps) |
| `updatedAt` | Date | Date de dernière modification | Automatique (timestamps) |

### Relations

- **Wishlist** : Relation many-to-many avec le modèle `Product` via un tableau d'ObjectId référençant des produits.

## Modèle Product

### Schéma

```javascript
const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    image: {
        type: String,
        required: true
    }
});
```

### Champs

| Champ | Type | Description | Validation |
|-------|------|-------------|------------|
| `name` | String | Nom du produit | Requis |
| `description` | String | Description du produit | Requis |
| `price` | Number | Prix du produit | Requis |
| `image` | String | Chemin vers l'image du produit | Requis |

### Relations

- Référencé par le modèle `User` dans le champ `wishlist`
- Référencé par le modèle `Order` dans le champ `products.product`

## Modèle Order

### Schéma

```javascript
const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    products: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        quantity: {
            type: Number,
            required: true
        }
    }],
    totalAmount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'shipped', 'delivered'],
        default: 'pending'
    }
});
```

### Champs

| Champ | Type | Description | Validation |
|-------|------|-------------|------------|
| `user` | ObjectId | Utilisateur qui a passé la commande | Requis, Référence à User |
| `products` | Array | Liste des produits commandés | - |
| `products.product` | ObjectId | Référence au produit | Requis, Référence à Product |
| `products.quantity` | Number | Quantité commandée | Requis |
| `totalAmount` | Number | Montant total de la commande | Requis |
| `status` | String | État de la commande | Enum: 'pending', 'shipped', 'delivered'; Défaut: 'pending' |

### Relations

- **User** : Relation many-to-one avec le modèle `User` via le champ `user`
- **Products** : Relation many-to-many avec le modèle `Product` via le tableau `products`

## Diagramme des relations

```
+-------------+       +-------------+       +-------------+
|    User     |       |   Product   |       |    Order    |
+-------------+       +-------------+       +-------------+
| _id         |<----->| _id         |<----->| _id         |
| name        |       | name        |       | user        |
| username    |       | description |       | products    |
| email       |       | price       |       | totalAmount |
| password    |       | image       |       | status      |
| role        |       +-------------+       +-------------+
| wishlist    |
| profilPic   |
+-------------+
```

## À savoir / Conseils

- **Validation** : Les modèles utilisent la validation intégrée de Mongoose pour garantir l'intégrité des données.
- **Références** : Les relations entre modèles sont établies via des références d'ObjectId.
- **Timestamps** : Le modèle `User` utilise l'option `timestamps` pour suivre automatiquement les dates de création et de modification.
- **Indexation** : Les champs `unique` comme `email` et `username` sont automatiquement indexés par MongoDB.
- **Hachage** : Le champ `password` stocke le mot de passe haché (via bcrypt) et non en texte brut.
- **Énumérations** : Les champs comme `role` et `status` utilisent des énumérations pour limiter les valeurs possibles.
- **Population** : Lors de l'extraction des données, utilisez la méthode `populate()` de Mongoose pour charger les références (par exemple, pour charger les produits dans la wishlist d'un utilisateur).