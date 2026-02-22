# Configuration PocketBase pour Byoom

Ce guide vous aide à configurer PocketBase avec toutes les collections nécessaires pour Byoom.

## 1. Installation PocketBase

1. Télécharger PocketBase depuis [pocketbase.io](https://pocketbase.io/docs/)
2. Extraire l'exécutable
3. Lancer : `./pocketbase serve`

## 2. Création des Collections

### Collection `users` (Auth)

**Paramètres de base** :
- Type : Auth
- Email/Password activé

**Champs** :
```
- email (email, requis)
- username (text, requis, unique)
- avatar (file)
- display_name (text)
- points_total (number, défaut: 0)
- level (number, défaut: 1)
- badges (json, défaut: [])
- profile_public (bool, défaut: true)
- bio (text)
```

**Règles de validation** :
- `username` : min 3, max 20, unique
- `points_total` : min 0
- `level` : min 1

### Collection `plants`

**Champs** :
```
- common_name (text, requis)
- scientific_name (text, requis, unique)
- family (text)
- description (text)
- difficulty (number, min: 1, max: 5, défaut: 3)
- watering_frequency (text)
- light_needs (select: faible/moyen/fort/direct, défaut: moyen)
- humidity (select: faible/moyen/élevé, défaut: moyen)
- temperature_min (number, défaut: 15)
- temperature_max (number, défaut: 25)
- soil_type (text)
- toxic_to_pets (bool, défaut: false)
- toxic_to_humans (bool, défaut: false)
- edible (bool, défaut: false)
- recipes (json, défaut: [])
- pruning_advice (text)
- bonsai_compatible (bool, défaut: false)
- bonsai_tips (text)
- cover_image (file)
- tags (json, défaut: [])
- ai_generated (bool, défaut: false)
- verified (bool, défaut: false)
```

**Règles d'accès** :
- Liste : Public (lecture seule)
- Vue : Public (lecture seule)
- Créer : Authentifié
- Mettre à jour : Authentifié
- Supprimer : Admin uniquement

### Collection `user_plants`

**Champs** :
```
- user (relation → users, requis)
- plant (relation → plants, requis)
- nickname (text)
- acquisition_date (date, défaut: maintenant)
- location (text)
- photos (file[], multiple)
- notes (text)
- health_score (number, min: 0, max: 100, défaut: 100)
- last_watered (date)
- last_fertilized (date)
- last_repotted (date)
- public_visible (bool, défaut: true)
- points_earned (number, défaut: 0)
- streak_days (number, défaut: 0)
```

**Règles d'accès** :
- Liste : Propriétaire uniquement (ou public si `public_visible = true`)
- Vue : Propriétaire ou public si `public_visible = true`
- Créer : Authentifié
- Mettre à jour : Propriétaire uniquement
- Supprimer : Propriétaire uniquement

**Règle de filtre** :
```
@request.auth.id = user.id || public_visible = true
```

### Collection `diagnoses`

**Champs** :
```
- user_plant (relation → user_plants, requis)
- user (relation → users, requis)
- image (file)
- ai_analysis (text)
- health_status (select: saine/attention/malade/critique, défaut: saine)
- issues_detected (json, défaut: [])
- recommendations (json, défaut: [])
- points_awarded (number, défaut: 0)
```

**Règles d'accès** :
- Liste : Propriétaire uniquement
- Vue : Propriétaire uniquement
- Créer : Authentifié
- Mettre à jour : Propriétaire uniquement
- Supprimer : Propriétaire uniquement

### Collection `compatibilities`

**Champs** :
```
- plant_a (relation → plants, requis)
- plant_b (relation → plants, requis)
- compatible (bool, défaut: false)
- reason (text)
- ai_generated (bool, défaut: false)
```

**Règles d'accès** :
- Liste : Public (lecture seule)
- Vue : Public (lecture seule)
- Créer : Authentifié
- Mettre à jour : Admin uniquement
- Supprimer : Admin uniquement

### Collection `badges`

**Champs** :
```
- name (text, requis, unique)
- description (text)
- icon (file)
- condition_type (select: streak/collection/diagnosis/level/special, requis)
- condition_value (number, requis)
- xp_reward (number, défaut: 0)
```

**Règles d'accès** :
- Liste : Public (lecture seule)
- Vue : Public (lecture seule)
- Créer : Admin uniquement
- Mettre à jour : Admin uniquement
- Supprimer : Admin uniquement

### Collection `activity_log`

**Champs** :
```
- user (relation → users, requis)
- type (select: diagnosis/watering/photo/identification/streak, requis)
- user_plant (relation → user_plants)
- points (number, défaut: 0)
```

**Règles d'accès** :
- Liste : Propriétaire uniquement
- Vue : Propriétaire uniquement
- Créer : Authentifié (automatique via API)
- Mettre à jour : Admin uniquement
- Supprimer : Admin uniquement

## 3. Configuration des Relations

### Relations à configurer dans PocketBase Admin :

1. **user_plants.user** → `users` (relation)
2. **user_plants.plant** → `plants` (relation)
3. **diagnoses.user_plant** → `user_plants` (relation)
4. **diagnoses.user** → `users` (relation)
5. **compatibilities.plant_a** → `plants` (relation)
6. **compatibilities.plant_b** → `plants` (relation)
7. **activity_log.user** → `users` (relation)
8. **activity_log.user_plant** → `user_plants` (relation)

## 4. Badges Initiaux à Créer

Créer les badges suivants dans la collection `badges` :

1. **Première Pousse** (`first_plant`)
   - condition_type: `collection`
   - condition_value: `1`
   - xp_reward: `50`

2. **Détective Vert** (`detective`)
   - condition_type: `diagnosis`
   - condition_value: `1`
   - xp_reward: `20`

3. **Collectionneur** (`collector`)
   - condition_type: `collection`
   - condition_value: `10`
   - xp_reward: `100`

4. **Streak Master** (`streak_7`)
   - condition_type: `streak`
   - condition_value: `7`
   - xp_reward: `100`

5. **Photographe** (`photographer`)
   - condition_type: `special`
   - condition_value: `50`
   - xp_reward: `200`

## 5. Variables d'Environnement

Dans votre `.env` :
```
NEXT_PUBLIC_POCKETBASE_URL=http://127.0.0.1:8090
```

Pour la production, utiliser votre domaine :
```
NEXT_PUBLIC_POCKETBASE_URL=https://pb.byoom.fr
```

## 6. Test de Connexion

Après configuration, tester la connexion depuis votre app Next.js :
```typescript
import { getPocketBaseClient } from '@/lib/pocketbase';

const pb = getPocketBaseClient();
const plants = await pb.collection('plants').getList(1, 10);
console.log('Plantes:', plants);
```
