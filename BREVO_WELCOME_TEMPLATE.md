# Template Email Welcome Brevo (ID 101)

Ce document décrit le contenu du template Welcome à créer dans Brevo pour les 3 rôles : Client, Influenceur, Beauty Pro.

## Configuration du Template

Dans Brevo, créez un template avec l'ID **101** (ou utilisez un ID existant et mettez à jour `EMAIL_TEMPLATE_IDS.WELCOME` dans `lib/brevo-types.ts`).

## Variables Disponibles

Le template reçoit automatiquement ces variables :

- `{{ params.FIRSTNAME }}` : Prénom de l'utilisateur
- `{{ params.ROLE }}` : client | influencer | pro
- `{{ params.REF_LINK }}` : Lien de parrainage unique
- `{{ params.RANK }}` : Position dans le classement
- `{{ params.POINTS }}` : Points actuels
- `{{ params.NEXT_MILESTONE }}` : Prochain palier à atteindre

## Structure du Template HTML

### 1. En-tête Commun

```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <p style="font-size: 18px;">Bonjour {{ params.FIRSTNAME }},</p>

  <p style="font-size: 16px;">Bienvenue sur la <strong>Glow List Afroé</strong> ✨</p>

  <p>Voici ton lien personnel :</p>
  <p style="background: #f3f4f6; padding: 12px; border-radius: 8px; word-break: break-all;">
    <a href="{{ params.REF_LINK }}" style="color: #A855F7; text-decoration: none;">{{ params.REF_LINK }}</a>
  </p>

  <p>Chaque inscription via ce lien te fait gagner des points et débloquer des récompenses par palier :</p>
  <ul style="line-height: 1.8;">
    <li><strong>10 pts</strong> → Glow Starters</li>
    <li><strong>50 pts</strong> → Glow Circle Insiders</li>
    <li><strong>100 pts</strong> → Glow Icons + ticket Grand Prix</li>
    <li><strong>200 pts+</strong> → Tier Secret (récompenses ultra-premium)</li>
  </ul>
</div>
```

### 2. Contenu Conditionnel par Rôle

```html
{% if params.ROLE == 'client' %}
  <div style="background: #fef3c7; padding: 16px; border-radius: 8px; margin: 20px 0;">
    <p style="font-size: 16px; margin: 0 0 12px 0;">🎯 <strong>En tant que cliente</strong> :</p>
    <ul style="margin: 0; line-height: 1.8;">
      <li><strong>+5 pts</strong> pour chaque ami·e qui s'inscrit via ton lien <strong>avant le lancement</strong></li>
      <li>À partir de l'app : <strong>+10 pts</strong> par téléchargement + compte utilisé</li>
    </ul>
    <p style="margin: 12px 0 0 0;">
      💡 <strong>Objectif rapide</strong> : vise 10 pts (2 parrainages validés) pour débloquer le badge Glow Starter et <strong>-10% sur ta 1ère réservation</strong>.
    </p>
  </div>

{% elsif params.ROLE == 'influencer' %}
  <div style="background: #ddd6fe; padding: 16px; border-radius: 8px; margin: 20px 0;">
    <p style="font-size: 16px; margin: 0 0 12px 0;">📸 <strong>En tant qu'influenceur·euse</strong> (&gt; 2k followers) :</p>
    <ul style="margin: 0; line-height: 1.8;">
      <li><strong>+15 pts</strong> pour chaque créateur·rice qui rejoint la Glow List via ton lien <strong>avant le lancement</strong></li>
      <li>Après le lancement : <strong>+50 pts</strong> par influenceur·euse actif·ve dans l'app</li>
    </ul>
    <p style="margin: 12px 0 0 0;">
      💡 <strong>Objectif rapide</strong> : vise 50 à 100 pts pour entrer dans le <strong>Glow Circle</strong>, débloquer visibilité, shoutouts et avantages premium.
    </p>
  </div>

{% elsif params.ROLE == 'pro' %}
  <div style="background: #fce7f3; padding: 16px; border-radius: 8px; margin: 20px 0;">
    <p style="font-size: 16px; margin: 0 0 12px 0;">💅 <strong>En tant que Beauty Pro</strong> :</p>
    <ul style="margin: 0; line-height: 1.8;">
      <li><strong>+25 pts</strong> pour chaque Beauty Pro qui rejoint la waitlist via ton lien <strong>avant le lancement</strong></li>
      <li>Après le lancement : <strong>+100 pts</strong> par Beauty Pro validé dans l'app</li>
    </ul>
    <p style="margin: 12px 0 0 0;">
      💡 <strong>Objectif rapide</strong> : 4 pros = 100 pts → <strong>Glow Kit, session stratégie & accès au Jackpot 3 500 €</strong>.
    </p>
  </div>

{% endif %}
```

### 3. Call-to-Action

```html
<div style="text-align: center; margin: 30px 0;">
  <a href="{{ params.REF_LINK }}"
     style="display: inline-block; background: #A855F7; color: #fff; padding: 14px 32px; border-radius: 999px; text-decoration: none; font-weight: 600; font-size: 16px;">
    Copier mon lien & commencer à gagner des points
  </a>
</div>

<div style="margin: 20px 0; padding: 16px; background: #f9fafb; border-radius: 8px;">
  <p style="margin: 0 0 8px 0; font-weight: 600;">📊 Tes stats actuelles :</p>
  <ul style="margin: 0; line-height: 1.8;">
    <li>Points : <strong>{{ params.POINTS }}</strong></li>
    <li>Prochain palier : <strong>{{ params.NEXT_MILESTONE }} pts</strong></li>
    <li>Classement : <strong>#{{ params.RANK }}</strong></li>
  </ul>
</div>
```

### 4. Pied de Page

```html
<div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 14px; color: #6b7280;">
  <p>À très bientôt,<br>
  L'équipe Afroé 💜</p>

  <p style="font-size: 12px; margin-top: 20px;">
    Tu reçois cet email car tu t'es inscrit sur la Glow List Afroé.<br>
    <a href="#" style="color: #A855F7;">Se désinscrire</a>
  </p>
</div>
</div>
```

## Résumé des Points par Rôle

### Avant le lancement (Waitlist)
- **Client** : +5 pts par inscription
- **Influenceur** : +15 pts par inscription
- **Beauty Pro** : +25 pts par inscription

### Après le lancement (App)
- **Client** : +10 pts par téléchargement + compte utilisé
- **Influenceur** : +50 pts par influenceur actif validé
- **Beauty Pro** : +100 pts par Beauty Pro validé

### Paliers (Tiers)
- **10 pts** → Glow Starters (badge + -10% 1ère réservation)
- **50 pts** → Glow Circle Insiders (visibilité, shoutouts)
- **100 pts** → Glow Icons (Glow Kit, session stratégie, ticket Jackpot 3 500 €)
- **200 pts+** → Tier Secret (récompenses ultra-premium)

## Test du Template

Après avoir créé le template dans Brevo :

1. Vérifiez que l'ID du template correspond bien à `EMAIL_TEMPLATE_IDS.WELCOME` (101)
2. Testez avec chaque rôle pour vérifier le contenu conditionnel
3. Vérifiez que toutes les variables s'affichent correctement
4. Testez le lien de parrainage

## Notes Importantes

- L'email est envoyé automatiquement après chaque inscription réussie
- L'email ne bloque PAS l'inscription si l'envoi échoue (erreur loggée uniquement)
- Le template utilise la même structure pour les 3 rôles avec du contenu conditionnel
- Les couleurs sont alignées avec la charte Afroé (violet #A855F7)
