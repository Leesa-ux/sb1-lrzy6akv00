# Guide des SMS Templates Afroé

## Vue d'ensemble

Tous les messages SMS d'Afroé sont désormais centralisés dans `/lib/sms-templates.ts`. Ce système permet une gestion cohérente et facile à maintenir de tous les SMS envoyés par la plateforme.

## Structure

### Types de SMS disponibles

1. **OTP** - Code de vérification SMS
2. **Welcome** - Message de bienvenue (variations par rôle)
3. **Follow-up 1h** - Rappel 1 heure après inscription
4. **Activation 48h** - Relance après 48h d'inactivité
5. **Milestone** - Paliers atteints (10, 50, 100 pts)
6. **Glow Elite** - Palier 200+ points
7. **Reminder 5j** - Rappel après 5 jours d'inactivité
8. **Launch Day** - Message du jour J
9. **Welcome Beauty Pro** - Bienvenue spécifique aux pros
10. **Activation Pro IRL** - Activation IRL pour les pros

## Utilisation

### Import

```typescript
import { getSMSTemplate } from "@/lib/sms-templates";
```

### Exemples d'utilisation

#### SMS simple (sans variables)

```typescript
const message = getSMSTemplate("followup_1h");
await sendBrevoSMS({ phone: user.phone, message });
```

#### SMS avec variables

```typescript
const message = getSMSTemplate("milestone", undefined, {
  milestone: 50,
  points: 50,
});
await sendBrevoSMS({ phone: user.phone, message });
```

#### SMS avec variation par rôle

```typescript
const message = getSMSTemplate("welcome", "client", {
  refLink: "https://afroe.com/waitlist?ref=ABC123",
});
await sendBrevoSMS({ phone: user.phone, message });
```

## Script Jour J

Un script dédié est disponible pour envoyer le SMS du jour J à tous les utilisateurs :

### Exécution

```bash
npm run launch:sms
```

### Description

Le script `/scripts/send-launch-sms.ts` :
- Récupère tous les utilisateurs avec un numéro de téléphone
- Envoie le SMS Launch Day à chacun
- Affiche les statistiques d'envoi
- Gère les erreurs individuelles sans bloquer le processus

### Variables d'environnement requises

- `BREVO_API_KEY` - Clé API Brevo pour l'envoi SMS
- `DATABASE_URL` - URL de connexion PostgreSQL

## Modification des templates

Pour modifier un message SMS :

1. Ouvrir `/lib/sms-templates.ts`
2. Localiser le template concerné dans l'objet `SMS_TEMPLATES`
3. Modifier le texte en conservant la structure (fonction ou string)
4. Tester l'envoi avant déploiement

## Bonnes pratiques

1. **Longueur** - Garder les SMS sous 160 caractères quand possible
2. **Emojis** - Utiliser avec modération pour la clarté
3. **URLs** - Toujours raccourcir les liens longs
4. **Variables** - Valider que toutes les variables existent avant l'envoi
5. **Tests** - Tester sur un numéro de test avant envoi massif

## Migration

Tous les anciens appels directs de messages SMS ont été migrés vers ce système centralisé :

- ✅ `lib/automation-service.ts` - Tous les SMS automatiques
- ✅ `app/api/send-sms/route.ts` - SMS OTP
- ✅ `app/api/cron/launch-day/route.ts` - SMS Jour J
- ✅ `lib/brevo-types.ts` - Fonction getSMSByRole() refactorisée

## Support

Pour toute question sur les SMS templates, consulter :
- Ce guide
- `/lib/sms-templates.ts` pour les implémentations
- `/lib/brevo-client.ts` pour l'envoi
