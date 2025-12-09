
# 📘 Budget Manager – MVP (50/30/20)

## 🎯 Objectif

Créer une application simple qui remplace ton fichier Excel et te permet de :

* Gérer ton budget mensuel
* Saisir tes revenus
* Répartir automatiquement selon la règle **50% – 30% – 20%**
* Suivre tes dépenses dans trois grandes catégories
* Visualiser le solde final du mois
* Enregistrer chaque mois

---

# 🧰 Fonctionnalités du MVP

## 1. Entrées mensuelles

L’utilisateur saisit :

* Salaire
* Autres revenus
* Total des entrées (calcul automatique)

L’application calcule automatiquement les enveloppes :

* **Dépenses essentielles : 50%**
* **Épargne / investissements : 30%**
* **Loisirs / flex : 20%**

---

## 2. Dépenses essentielles (50%)

Formulaire basé sur ton fichier Excel :

* Loyer
* Électricité / Gaz / Eau / Pressing
* Internet
* Transport
* Alimentation
* Besoins maison

Fonctionnalités :

* Total automatique
* Comparaison avec l'enveloppe 50%
* Alerte si dépassement

---

## 3. Épargne & Investissements (30%)

Champs :

* Épargne mariage
* Épargne NSIA
* Épargne long terme (10 ans)
* Santé & imprévus
* Famille / Aide
* Projets divers (OMCG, BeLife, etc.)

Fonctionnalités :

* Total automatique
* Comparaison avec 30%
* Alerte si dépassement

---

## 4. Loisirs & Flexibles (20%)

Champs :

* Restaurants / Sorties
* Vêtements
* Achats divers
* Réserve flex

Fonctionnalités :

* Total automatique
* Comparaison avec 20%
* Alerte si dépassement

---

## 5. Résumé mensuel

Affiche :

* Revenus totaux
* Totaux par catégories
* % réellement utilisé vs budget
* Solde du mois
---

## 📝 Décisions techniques (9 décembre 2025)

### 1. Stack technique
- **Backend** : Laravel 12 + Inertia.js
- **Frontend** : React 19 + TypeScript
- **CSS** : Tailwind CSS 4 + shadcn/ui (Radix UI)
- **Animations** : GSAP (intégré dès le MVP)
- **Authentification** : Laravel Fortify (login, register, mot de passe oublié)

### 2. Base de données
- **Développement** : SQLite (flexibilité pour les modifications de schéma)
- **Production/Beta** : MySQL via Docker containers

### 3. Internationalisation
- Bilingue : Français (FR) et Anglais (EN)
- Utilisation de `useTranslation` (react-i18next)

### 4. Interface et UX
- Approche **mobile-first**
- Interface minimaliste avec animations GSAP au scroll
- Thème de couleurs à définir (minimaliste, neutre avec accents)

### 5. Historique et données
- Consultation des mois précédents
- Comparaison entre mois (détails à définir)
- Export JSON (optionnel dans le MVP)

### 6. Méthodologie
- Développement itératif écran par écran
- Priorités définies par l'utilisateur à chaque étape

---

## 7. Sauvegarde mensuelle

Le MVP permet :

* Enregistrement en base de données (SQLite/MySQL)
* Consultation des mois précédents (historique)
* Export JSON (optionnel)

---

# 🗂️ Modèle de données

```json
{
  "id": "2025-12",
  "month": "2025-12",
  "income": {
    "salaire": 610000,
    "autres": 40000,
    "total": 650000
  },
  "envelopes": {
    "essentials": 325000,
    "savings": 195000,
    "leisure": 130000
  },
  "expenses": {
    "essentials": {
      "loyer": 70000,
      "utilities": 15000,
      "internet": 15000,
      "transport": 46500,
      "food": 120000,
      "home": 5000,
      "total": 271500
    },
    "savings": {
      "mariage": 80000,
      "nsia": 20000,
      "long_term": 32000,
      "health": 30000,
      "family": 30000,
      "projects": 3000,
      "total": 195000
    },
    "leisure": {
      "sorties": 40000,
      "vetements": 40000,
      "divers": 30000,
      "flex": 20000,
      "total": 130000
    }
  },
  "summary": {
    "total_expenses": 596500,
    "solde": 53500
  }
}
```

---

# 🖼️ Screens du MVP

## Écran 1 — Tableau de bord

* Solde du mois
* Graphique 50/30/20
* Bouton "Configurer le mois"

---

## Écran 2 — Entrées

* Formulaire Salaire
* Formulaire Autres revenus
* Calcul total
* Display des enveloppes calculées 50/30/20

---

## Écran 3 — Dépenses essentielles

Formulaire + total + comparaison avec budget.

---

## Écran 4 — Épargne

Formulaire + total + dépassement éventuel.

---

## Écran 5 — Loisirs

Formulaire + total + comparaison.

---

## Écran 6 — Résumé

* Totaux
* Graphiques
* Solde
* Bouton : enregistrer le mois
* Option : export JSON

---

# 📅 Roadmap

## Phase 1 – MVP

* Saisie revenus
* Calcul 50/30/20
* 3 écrans de dépenses
* Résumé
* Sauvegarde locale

## Phase 2

* Graphiques avancés
* Exports PDF / Excel
* Catégories personnalisables
* Alerte budget dépassé

## Phase 3

* IA pour prévisions
* Import bancaire
* Multi-profil