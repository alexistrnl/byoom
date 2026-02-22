# 🌿 BYOOM — Pokédex Végétal Intelligent

**Version** : 1.0 — Février 2026  
**Domaine** : byoom.fr  
**Type** : PWA (Progressive Web App) SaaS  
**Stack** : React/Next.js + PocketBase + OpenAI Vision API

## 🚀 Démarrage rapide

### Prérequis

- Node.js 18+
- PocketBase (self-hosted)
- Clé API OpenAI

### Installation

1. **Cloner et installer les dépendances**
```bash
npm install
```

2. **Configurer les variables d'environnement**
```bash
cp .env.example .env
```

Remplir `.env` avec vos clés :
- `NEXT_PUBLIC_POCKETBASE_URL` : URL de votre instance PocketBase
- `OPENAI_API_KEY` : Votre clé API OpenAI
- `STRIPE_SECRET_KEY` et `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` : Pour les abonnements (optionnel)

3. **Configurer PocketBase**

Créer les collections suivantes dans PocketBase selon le schéma défini dans le cahier des charges :
- `users`
- `plants`
- `user_plants`
- `diagnoses`
- `compatibilities`
- `badges`
- `activity_log`

4. **Lancer le serveur de développement**
```bash
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000)

## 📁 Structure du projet

```
byoom/
├── src/
│   ├── app/
│   │   ├── (auth)/          # Pages d'authentification
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (app)/           # Pages principales (protégées)
│   │   │   ├── dashboard/
│   │   │   ├── identify/
│   │   │   ├── diagnose/
│   │   │   ├── my-plants/
│   │   │   └── pokedex/
│   │   ├── api/             # Routes API
│   │   │   ├── identify/
│   │   │   ├── diagnose/
│   │   │   ├── compatibility/
│   │   │   └── recipes/
│   │   └── page.tsx          # Page d'accueil
│   ├── components/
│   │   └── camera/           # Composant de capture photo
│   └── lib/
│       ├── pocketbase.ts     # Client PocketBase
│       ├── openai.ts         # Intégration OpenAI
│       ├── gamification.ts   # Système XP/Badges
│       └── types/            # Types TypeScript
├── public/
│   └── manifest.json         # Configuration PWA
└── .env                      # Variables d'environnement
```

## 🎮 Fonctionnalités

### MVP
- ✅ Authentification (PocketBase)
- ✅ Identification de plantes par IA (GPT-4o Vision)
- ✅ Diagnostic de santé des plantes
- ✅ Pokédex (catalogue de plantes)
- ✅ Système de gamification (XP, niveaux, badges)
- ✅ PWA installable

### À venir (V1)
- [ ] Compatibilité entre plantes
- [ ] Recettes pour plantes comestibles
- [ ] Conseils bonsaï
- [ ] Rappels d'arrosage (notifications push)
- [ ] Intégration Stripe (abonnements)
- [ ] Vitrine publique des utilisateurs

## 🔧 Configuration PocketBase

Voir le cahier des charges pour le schéma complet des collections.

## 📱 PWA

L'application est configurée comme PWA :
- Installable sur mobile et desktop
- Mode offline (fiches plantes en cache)
- Notifications push (à venir)

## 🎯 Système de points XP

| Action | XP |
|--------|-----|
| Identifier une nouvelle plante | +50 |
| Diagnostic santé (plante saine) | +30 |
| Diagnostic santé (problème trouvé) | +20 |
| Photo quotidienne | +10 |
| Streak 7 jours | +100 |
| Streak 30 jours | +500 |

## 📄 Licence

Propriétaire — byoom.fr
