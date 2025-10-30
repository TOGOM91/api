# Documentation du projet

Bienvenue dans la documentation complète du projet. Cette documentation vise à expliquer en détail l'architecture, les fonctionnalités et les aspects techniques de l'application.

## Table des matières

1. [Architecture globale](./architecture.md) - Description de l'architecture du projet, rôle des dossiers et logique de communication
2. [Points d'accès API](./api_endpoints.md) - Liste complète des routes disponibles (web et API REST)
3. [Système d'authentification](./auth_system.md) - Explication détaillée du système d'authentification hybride
4. [Système d'upload](./upload_system.md) - Fonctionnement de l'upload de fichiers avec Multer
5. [Modèles de données](./database.md) - Schémas Mongoose, champs, validations et relations
6. [Mesures de sécurité](./security.md) - Résumé des mesures de sécurité implémentées
7. [Améliorations possibles](./todo_or_improvements.md) - Propositions d'améliorations et pistes d'évolution

## Vue d'ensemble

Cette application est une plateforme web complète avec une interface utilisateur et une API REST. Elle permet la gestion d'utilisateurs, de produits et de listes de souhaits, avec un système d'authentification hybride supportant à la fois les sessions traditionnelles et les tokens JWT.

### Fonctionnalités principales

- **Système d'authentification hybride** : Sessions pour le web, JWT pour l'API
- **Gestion des utilisateurs** : Inscription, connexion, profil, suppression
- **Gestion des produits** : Ajout, affichage, suppression
- **Liste de souhaits** : Ajout/suppression de produits favoris
- **Upload de fichiers** : Gestion des avatars utilisateurs
- **API REST** : Points d'accès pour l'authentification, les produits et le profil utilisateur

### Technologies utilisées

- **Backend** : Node.js, Express.js
- **Base de données** : MongoDB avec Mongoose
- **Authentification** : Express-session, JWT (jsonwebtoken)
- **Sécurité** : Bcrypt pour le hachage des mots de passe
- **Upload de fichiers** : Multer
- **Templating** : Jade (Pug)
- **Autres** : Connect-flash (messages flash), Method-override (support PUT/DELETE)

## Comment utiliser cette documentation

Chaque fichier de documentation se concentre sur un aspect spécifique du projet. Vous pouvez naviguer entre les différents fichiers en utilisant les liens ci-dessus ou en parcourant directement les fichiers dans le dossier `/documentations`.

Pour une vue d'ensemble du projet, consultez le [README.md](../README.md) à la racine du projet.

## À savoir / Conseils

- Cette documentation est destinée à la fois aux développeurs qui travaillent sur le projet et aux nouveaux arrivants qui souhaitent comprendre sa structure.
- Les exemples de code sont fournis pour illustrer les concepts, mais référez-vous toujours au code source pour les détails d'implémentation les plus récents.
- Si vous identifiez des incohérences entre la documentation et le code, considérez la mise à jour de la documentation ou l'ouverture d'un ticket pour signaler le problème.