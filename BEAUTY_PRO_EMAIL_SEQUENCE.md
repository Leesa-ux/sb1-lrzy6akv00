# Séquence E-mail Beauty Pro - Guide d'Implémentation

## 📋 Vue d'ensemble

Cette séquence e-mail est **spécialement conçue pour les Beauty Pros** (ROLE = "pro") et s'intègre parfaitement avec votre workflow d'automation Brevo existant.

---

## ✨ Les 2 Emails Beauty Pro

### 1️⃣ Email #107 - Welcome Beauty Pro (T0)

**Déclencheur:** Inscription immédiate
**Cible:** `contact.ROLE == "pro"`
**Sujet:** Bienvenue dans la Glow List Pro ✨

**Objectifs:**
- Valoriser le métier et le talent du Beauty Pro
- Expliquer le processus de sélection Afroé (label qualité)
- Demander l'envoi du portfolio à `pro@afroe.com`
- Mentionner le test IRL obligatoire avant validation
- Encourager à partager le lien de parrainage

**Messages clés:**
- "Afroé n'est pas une simple appli : c'est un label de qualité"
- "Chaque prestataire est sélectionné et validé par notre équipe"
- "Portfolio → Test IRL → Validation → Lancement"

---

### 2️⃣ Email #108 - Activation Pro IRL Test (T+48h)

**Déclencheur:** 48h après inscription
**Cible:** `contact.ROLE == "pro" AND contact.REF_COUNT == 0`
**Sujet:** Ton profil Afroé en revue — place au test !

**Objectifs:**
- Relancer les Beauty Pros inactifs (0 parrainage)
- Présenter l'offre commerciale Afroé Pro
- Inviter au test IRL (Bruxelles / Anvers / Paris)
- Encourager à compléter le portfolio

**Messages clés:**
- **Offre Pro:** 99 €/mois + 0% commission pendant 2 mois
- **Processus:** Portfolio → Spécialité → Test IRL → Validation
- **Avantages:** Formation, support, visibilité, outils pro

---

## 🔧 Configuration dans Brevo

### Étape 1: Créer les 2 Templates Email

Allez dans **Brevo → Campaigns → Email Templates**

#### Template #107 - Welcome Beauty Pro

**ID Template:** 107
**Nom:** Welcome Beauty Pro
**Type:** Transactionnel

**Variables utilisées:**
```twig
{{ contact.FIRSTNAME | default:"Beauty Pro" }}
{{ contact.REF_LINK }}
{{ contact.ROLE }}
{{ contact.POINTS }}
```

**Corps de l'email:** (voir BREVO_TEMPLATES.md lignes 434-487)

---

#### Template #108 - Activation Pro IRL

**ID Template:** 108
**Nom:** Activation Pro IRL Test
**Type:** Transactionnel

**Variables utilisées:**
```twig
{{ contact.FIRSTNAME | default:"Beauty Pro" }}
{{ contact.REF_LINK }}
{{ contact.ROLE }}
{{ contact.POINTS }}
{{ contact.REF_COUNT }}
```

**Corps de l'email:** (voir BREVO_TEMPLATES.md lignes 490-551)

---

### Étape 2: Créer les Workflows d'Automation

#### Workflow #1 : Welcome Beauty Pro (immédiat)

**Brevo → Automation → Créer un workflow**

1. **Nom:** Welcome Beauty Pro
2. **Déclencheur:** Contact ajouté OU attribut `REF_LINK` mis à jour
3. **Condition:** `contact.ROLE == "pro"`
4. **Action immédiate:**
   - Envoyer template #107 (Welcome Beauty Pro)
5. **SMS optionnel (si contact.SMS existe):**
   ```
   Afroé ✨ Bienvenue Beauty Pro !
   Prochaine étape : envoie ton portfolio à pro@afroe.com
   Chaque pro que tu invites = +25 pts.
   Ton lien : {{REF_LINK}}
   ```

---

#### Workflow #2 : Activation Pro IRL Test (T+48h)

**Brevo → Automation → Créer un workflow**

1. **Nom:** Activation Pro 48h
2. **Déclencheur:** Contact ajouté avec `ROLE == "pro"`
3. **Délai:** 48 heures
4. **Conditions:**
   - `contact.ROLE == "pro"`
   - **ET** `contact.REF_COUNT == 0`
5. **Action:**
   - Envoyer template #108 (Activation Pro IRL Test)
6. **SMS optionnel (si contact.SMS existe):**
   ```
   Afroé 💼 Ton profil Beauty Pro est en revue !
   Prochaine étape : test IRL (Bruxelles/Anvers/Paris).
   Complète ton portfolio → pro@afroe.com
   99€/mois · 0% commission 2 mois
   ```

---

## 🔄 Synchronisation Automatique

### Intégration avec le Code Existant

Le système d'automation dans `lib/automation-service.ts` gère automatiquement :

✅ **À l'inscription d'un Beauty Pro:**
- Fonction `sendWelcomeBeautyProEmail(userId)` est appelée
- Email #107 envoyé immédiatement
- SMS envoyé si numéro de téléphone disponible
- Contact synchronisé avec Brevo (attributs ROLE, REF_LINK, etc.)

✅ **48h après inscription (si 0 parrainage):**
- Cron job vérifie les Beauty Pros inactifs
- Fonction `sendActivationProIRLEmail(userId)` est appelée
- Email #108 envoyé automatiquement
- SMS de rappel envoyé si disponible

---

## 📊 Variables Brevo pour Beauty Pro

Ces variables sont **automatiquement synchronisées** depuis MongoDB vers Brevo :

| Variable | Type | Description |
|----------|------|-------------|
| `FIRSTNAME` | string | Prénom du Beauty Pro |
| `ROLE` | string | Toujours "pro" pour cette séquence |
| `REF_LINK` | string | Lien de parrainage unique |
| `POINTS` | number | Points actuels (provisionalPoints ou finalPoints) |
| `RANK` | number | Position dans le classement |
| `REF_COUNT` | number | Nombre de parrainages effectués |
| `NEXT_MILESTONE` | number | Prochain palier (10/50/100/200) |
| `LAST_REF_AT` | date | Date du dernier parrainage |

---

## 🚀 Endpoints API Implémentés

### 1. Cron Job - Activation 48h

**Endpoint:** `/api/cron/activation-48h`
**Méthode:** GET
**Auth:** Bearer token (CRON_SECRET)

**Logique mise à jour:**
- Sépare les utilisateurs réguliers des Beauty Pros
- Envoie l'email standard pour clients/influenceurs
- Envoie l'email spécial IRL Test pour Beauty Pros
- Retourne des stats séparées pour chaque segment

**Exemple de réponse:**
```json
{
  "success": true,
  "regular": {
    "checked": 15,
    "sent": 14,
    "failed": 1
  },
  "beautyPros": {
    "checked": 8,
    "sent": 8,
    "failed": 0
  },
  "total": {
    "checked": 23,
    "sent": 22,
    "failed": 1
  }
}
```

---

## ✅ Checklist d'Implémentation

### Dans Brevo (Interface)

- [ ] Créer le template #107 (Welcome Beauty Pro)
- [ ] Créer le template #108 (Activation Pro IRL Test)
- [ ] Tester les templates avec un contact test (`test-pro@afroe.com`)
- [ ] Créer le workflow "Welcome Beauty Pro" (T0, condition ROLE == "pro")
- [ ] Créer le workflow "Activation Pro 48h" (T+48h, condition ROLE == "pro" AND REF_COUNT == 0)
- [ ] Configurer les SMS dans les workflows (optionnel)
- [ ] Vérifier que tous les attributs de contact existent (ROLE, REF_LINK, POINTS, etc.)

### Configuration Externe

- [ ] Créer l'adresse email `pro@afroe.com` (Gmail, Outlook, etc.)
- [ ] Configurer un système de réception/suivi des portfolios
- [ ] Mettre en place le processus de test IRL (Bruxelles/Anvers/Paris)
- [ ] Préparer les critères de sélection (portfolio, hygiène, qualité, etc.)

### Tests

- [ ] Inscrire un Beauty Pro test et vérifier l'email #107
- [ ] Vérifier la synchronisation Brevo (attributs ROLE, REF_LINK)
- [ ] Attendre 48h (ou simuler) et vérifier l'email #108
- [ ] Tester avec un Beauty Pro qui a déjà des parrainages (ne doit PAS recevoir #108)
- [ ] Vérifier que les SMS sont envoyés correctement
- [ ] Tester le cron job manuellement : `GET /api/cron/activation-48h`

---

## 📧 Contenu des Templates (Résumé)

### Email #107 - Welcome Beauty Pro

**Ton:** Valorisant, professionnel, exclusif
**Structure:**
1. Accueil chaleureux
2. Mission Afroé (visible, rentable, reconnu)
3. Label qualité (sélection rigoureuse)
4. CTA : Envoyer portfolio à pro@afroe.com
5. Mention du test IRL
6. Lien de parrainage + système de points
7. Signature Afroé avec baseline

**Durée de lecture:** ~1 minute
**CTA principal:** Envoyer le portfolio

---

### Email #108 - Activation Pro IRL Test

**Ton:** Incitatif, informatif, commercial
**Structure:**
1. Rappel : inscription bien reçue, profil en revue
2. Processus de sélection Afroé (qualité premium)
3. 3 étapes pour finaliser : Portfolio → Spécialité → Test IRL
4. Offre commerciale (99€/mois, 0% commission 2 mois)
5. Avantages : formation, support, visibilité
6. CTA : Compléter le dossier
7. Rappel du système de points

**Durée de lecture:** ~1-2 minutes
**CTA principal:** Compléter le portfolio + préparer test IRL

---

## 💡 Bonnes Pratiques

### Communication avec les Beauty Pros

✅ **Toujours valoriser le talent et le métier**
✅ **Être transparent sur le processus de sélection**
✅ **Mettre en avant le label qualité Afroé**
✅ **Présenter l'offre commerciale clairement**
✅ **Proposer un accompagnement (formation, support)**

### Processus de Sélection

1. **Réception portfolio** → `pro@afroe.com`
2. **Revue critères** → Portfolio, spécialité, qualité
3. **Invitation test IRL** → Bruxelles / Anvers / Paris
4. **Validation finale** → Profil mis en ligne sur Afroé
5. **Lancement** → Début des réservations

### Suivi Post-Sélection

- Beauty Pro validé → Badge "Afroé Certified"
- Mise en avant sur la plateforme
- Accès aux outils pro (gestion, calendrier, paiements)
- Support prioritaire
- Formation continue

---

## 🎯 Résultats Attendus

### Objectifs de la Séquence

✅ **Recruter des Beauty Pros de qualité**
✅ **Filtrer via le processus portfolio + test IRL**
✅ **Positionner Afroé comme label premium**
✅ **Convertir les Beauty Pros en ambassadeurs actifs**
✅ **Créer un réseau de talents validés et engagés**

### KPIs à Suivre

- **Taux d'ouverture Email #107** (Welcome Beauty Pro)
- **Taux d'envoi de portfolio** (réponse à pro@afroe.com)
- **Taux de participation au test IRL**
- **Taux de validation finale**
- **Taux de parrainage** (Beauty Pros qui recrutent d'autres pros)

---

## 📞 Support

### Pour les Questions Techniques

- Consulter `BREVO_TEMPLATES.md` pour les templates complets
- Consulter `lib/automation-service.ts` pour la logique serveur
- Consulter `/api/cron/activation-48h/route.ts` pour le cron job

### Pour les Questions Business

- Processus de sélection Beauty Pro
- Critères de validation
- Organisation des tests IRL
- Tarification et conditions (99€/mois, 0% commission 2 mois)

---

## ✅ La Séquence Beauty Pro est Prête ! 💼✨

**Prochaines étapes:**
1. Créer les 2 templates dans Brevo (#107 et #108)
2. Configurer les 2 workflows d'automation
3. Créer l'adresse email `pro@afroe.com`
4. Tester avec un Beauty Pro de test
5. Lancer la campagne de recrutement !

---

**Bon recrutement de talents ! 🌟**
