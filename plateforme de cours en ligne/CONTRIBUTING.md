# 🤝 Guide de Contribution

Merci d'intéresser au projet! Ce guide explique comment contribuer à la plateforme de cours en ligne.

## 📋 Table des matières

- [Code de Conduite](#code-de-conduite)
- [Comment Commencer](#comment-commencer)
- [Processus de Contribution](#processus-de-contribution)
- [Conventions de Code](#conventions-de-code)
- [Git Workflow](#git-workflow)
- [Commit Messages](#commit-messages)
- [Pull Requests](#pull-requests)
- [Lignes Directrices de Codage](#lignes-directrices-de-codage)

## 📖 Code de Conduite

Nous nous engageons à créer un environnement accueillant et inclusif. Tous les contributeurs doivent:

- Être respectueux
- Inclure les personnes de tous les niveaux d'expérience
- Accepter les critiques constructives
- Se concentrer sur ce qui est le mieux pour la communauté

Tout comportement inapproprié peut résulter en exclusion du projet.

## 🚀 Comment Commencer

### Prérequis

- Node.js v16+
- npm ou yarn
- Git
- Connaissance de React.js et JavaScript ES6+

### Configuration de l'Environnement de Développement

1. **Forker le Repository**
   ```bash
   # Sur GitHub, cliquez sur "Fork"
   ```

2. **Cloner votre fork**
   ```bash
   git clone https://github.com/<votre-username>/plateforme-de-cours-en-ligne.git
   cd plateforme-de-cours-en-ligne
   ```

3. **Ajouter le Repository Upstream**
   ```bash
   git remote add upstream https://github.com/original-owner/plateforme-de-cours-en-ligne.git
   ```

4. **Installer les Dépendances**
   ```bash
   npm install
   ```

5. **Créer une Branche de Développement**
   ```bash
   git checkout -b feature/ma-nouvelle-feature
   ```

6. **Démarrer le Serveur de Développement**
   ```bash
   npm run dev
   ```

## 🔄 Processus de Contribution

### Types de Contributions

1. **🐛 Bug Fixes** - Correction de bugs
2. **✨ New Features** - Nouvelles fonctionnalités
3. **📚 Documentation** - Amélioration de la documentation
4. **♻️ Refactoring** - Amélioration du code existant
5. **🎨 Styling** - Améliorations CSS/UI
6. **🧪 Tests** - Ajout de tests

### Workflow

```
1. Créer une Issue (optionnel mais recommandé)
2. Créer une Branche Feature
3. Développer la Feature
4. Tester explicitement
5. Commit avec Messages Clairs
6. Push vers votre Fork
7. Créer une Pull Request
8. Attendre la Review
9. Merger après Approbation
```

## 📝 Conventions de Code

### Nomenclature

#### Fichiers

```javascript
// Composants React
✓ DashboardProf.jsx (PascalCase)
✗ dashboard-prof.jsx
✗ dashboardProf.jsx

// Fichiers JavaScript simples
✓ coursesData.js (camelCase)
✗ Courses-Data.js
✗ CoursesData.js

// Fichiers CSS
✓ global.css (kebab-case)
✗ globalCSS.css
✗ Global.css
```

#### Variables et Fonctions

```javascript
// Variables et fonctions
✓ const userProfile = { ... };
✓ function handleLoginClick() { ... }
✓ const isLoggedIn = true;
✗ const UserProfile = { ... };
✗ const user_profile = { ... };

// Constantes
✓ const API_BASE_URL = 'http://...';
✓ const MAX_FILE_SIZE = 5000000;
✗ const apiBaseUrl = 'http://...';
```

#### Composants React

```javascript
// Nominatif
✓ const MyComponent = () => { ... };
✓ export const ButtonAction = ({ ... }) => { ... };
✗ const myComponent = () => { ... };
✗ export const button_action = ({ ... }) => { ... };
```

### Formatage du Code

Le projet utilise **Prettier** pour le formatage automatique.

```bash
# Formater tous les fichiers
npm run format

# Ou utiliser Prettier directement
npx prettier --write src/
```

Configuration Prettier (déjà définie dans `.prettierrc`):
- Longueur de ligne: 100 caractères
- Tabulation: 2 espaces
- Guillemets simples pour JavaScript
- Guillemets doubles pour JSX
- Virgule finale (es5)

### Linting

```bash
# Vérifier les erreurs ESLint
npm run lint

# Corriger automatiquement
npm run lint -- --fix
```

## 🌳 Git Workflow

### Branches

```
main                    # Production
  └── develop          # Développement
        ├── feature/user-authentication
        ├── feature/course-management
        ├── bugfix/sidebar-active-state
        └── docs/update-readme
```

### Noms de Branches

```
feature/description-courte       # Nouvelles features
bugfix/description-courte        # Corrections de bugs
hotfix/description-courte        # Corrections urgentes
docs/description-courte          # Documentation
refactor/description-courte      # Refactoring
test/description-courte          # Tests
```

Exemples:
```
✓ feature/add-exam-submission
✓ bugfix/fix-sidebar-navigation
✓ docs/update-backend-setup
✗ new-feature
✗ bug-fix
✗ update
```

### Commandes Git

```bash
# Mettre à jour depuis upstream
git fetch upstream
git rebase upstream/develop

# Créer une nouvelle branche
git checkout -b feature/nom-de-la-feature

# Committer les changements
git add .
git commit -m "feat: ajouter la fonctionnalité X"

# Pousser vers votre fork
git push origin feature/nom-de-la-feature
```

## 💬 Commit Messages

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat:** Nouvelle fonctionnalité
- **fix:** Correction de bug
- **docs:** Documentation
- **style:** Formatage, manquant semi-colons, etc
- **refactor:** Refactoring du code sans changement fonctionnel
- **perf:** Amélioration de performance
- **test:** Ajout de tests
- **chore:** Tâches de build, dépendances, etc

### Exemples

```
✓ feat(exam): ajouter le système d'examens
✓ fix(sidebar): corriger l'état actif de la navigation
✓ docs(readme): mettre à jour les instructions d'installation
✓ style(css): formater les fichiers CSS globaux
✓ refactor(api): reorganiser les services API

✗ add exam feature
✗ fix bug
✗ update code
✗ fEaTuRe: AJOUTER EXAMENS
```

### Bonnes Pratiques

- Messages en anglais (ou français cohérent)
- Impératif: "ajouter" au lieu de "ajouté" ou "ajoute"
- Ne pas finir par un point
- Référencer les issues: `fix #123`

```
feat(course): ajouter la pagination des cours

Implements pagination pour la liste des cours avec:
- Boutons précédent/suivant
- Numéros de pages
- Sélection du nombre d'items par page

Closes #123
```

## 🔀 Pull Requests

### Avant de Créer une PR

1. **Mettez à jour depuis Upstream**
   ```bash
   git fetch upstream
   git rebase upstream/develop
   ```

2. **Testez Localement**
   ```bash
   npm run dev
   npm run lint
   npm run build
   ```

3. **Vérifiez les Changements**
   ```bash
   git diff
   ```

### Template PR

```markdown
## Description
Brief description of the changes made.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Related Issues
Closes #123

## How Has This Been Tested?
Description of the testing performed.

## Checklist
- [ ] Code follows the style guidelines
- [ ] I have performed a self-review
- [ ] I have commented my code
- [ ] I have updated the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix/feature works
- [ ] New and existing unit tests passed locally
```

### Critères d'Acceptation

✓ Code suit les conventions du projet
✓ Tests réussissent
✓ Pas de console errors/warnings
✓ Lint passe sans erreurs
✓ Documentation mise à jour
✓ Build réussit
✓ Rebase sur develop (pas de merge commits)

## 🎯 Lignes Directrices de Codage

### React Components

```javascript
// ✓ Bon
const DashboardProf = () => {
  const [courses, setCourses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Charger les cours
  }, []);

  const handleCreateCourse = async (data) => {
    // Logique...
  };

  return (
    <div className="dashboard">
      {/* JSX */}
    </div>
  );
};

export default DashboardProf;

// ✗ Mauvais
const DashboardProf = () => {
  const [state, setState] = useState(null);
  // Pas de useEffect
  // Pas de gestion d'erreurs
  // Code non organisé
};
```

### Gestion des Erreurs

```javascript
// ✓ Bon
try {
  const response = await courseService.getCourses();
  setCourses(response);
} catch (error) {
  console.error('Erreur lors du chargement:', error);
  setError('Impossible de charger les cours');
}

// ✗ Mauvais
const response = await courseService.getCourses();
setCourses(response); // Pas de gestion d'erreur
```

### Imports

```javascript
// ✓ Bon - Organisés et triés
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import courseService from '../services/courseService';
import DashboardCard from '../components/DashboardCard';

import '../styles/dashboard.css';

// ✗ Mauvais - Désorganisés
import courseService from '../services/courseService';
import React from 'react';
import '../styles/dashboard.css';
import { useState } from 'react';
```

### Commentaires

```javascript
// ✓ Bon - Utiles et clairs
// Charger les cours for l'instructeur au montage du composant
useEffect(() => {
  fetchInstructorCourses();
}, []);

// ✗ Mauvais - Évidents ou inexacts
// Déclarer une variable
const courses = [];
```

## 📚 Documentation

Mettez à jour la documentation pour:

- Nouvelles fonctionnalités
- Changements API
- Nouvelles directions
- Bugs corrigés importants

Fichiers de documentation:
- `README.md` - Vue d'ensemble
- `README_FRONTEND.md` - Documentation frontend
- `BACKEND_SETUP.md` - Guide backend
- `INSTALLATION.md` - Instructions d'installation
- JSDoc comments dans le code

## 🧪 Tests

Pour les éléments importants, ajoutez des tests:

```javascript
// Exemple de test
test('DashboardProf should display courses', () => {
  const { getByText } = render(<DashboardProf />);
  expect(getByText('Mes Cours')).toBeInTheDocument();
});
```

## ❓ Questions?

- **Ouvrir une Issue:** Pour les questions avant de coder
- **Discussions:** Pour les discussions générales
- **Email:** Pour les sujets sensibles

## 🙏 Merci!

Votre contribution est appréciée. Nous examinons toutes les PRs et fournirons un retour constructif.

---

**Heureux de contribuer! 🎉**
