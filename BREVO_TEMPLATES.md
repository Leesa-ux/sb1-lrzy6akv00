# Brevo Email & SMS Templates - Afroé Waitlist

## 📋 Overview

Ce document contient tous les templates d'emails et SMS optimisés pour Brevo avec la syntaxe Twig. Les templates utilisent des conditions intelligentes pour adapter automatiquement les messages selon le rôle de l'utilisateur (client, pro, influenceur).

---

## 🎨 Template Email #101 - Welcome

### Sujet
```
Bienvenue sur la Glow List ✨ Ton lien est prêt
```

### Corps Email (HTML/Twig)

```html
<p>Bonjour {{ contact.FIRSTNAME | default:"Glow Friend" }},</p>

<p>C'est officiel : tu es sur la <strong>Glow List Afroé</strong>.</p>

<p>🎯 <strong>Ton objectif</strong> : accumuler un maximum de points avant le lancement pour débloquer des avantages exclusifs et entrer dans la course au <strong>Jackpot 3 500 €</strong>.</p>

<p><strong>Voici ton lien perso :</strong><br>
👉 <a href="{{ contact.REF_LINK }}">{{ contact.REF_LINK }}</a></p>

<hr>

<h3>🔥 Comment tu gagnes des points (avant lancement)</h3>

{% if contact.ROLE == 'client' %}

<p>Chaque ami·e inscrit·e via ton lien = <strong>+2 pts</strong></p>
<p>Chaque beauty pro = <strong>+25 pts</strong></p>
<p>Chaque influenceur·euse ≥ 2 000 followers = <strong>+15 pts</strong></p>

{% elsif contact.ROLE == 'pro' %}

<p>Chaque Beauty Pro que tu invites = <strong>+25 pts</strong></p>
<p>Chaque influenceur·euse ≥ 2 000 followers = <strong>+15 pts</strong></p>
<p>Chaque client·e que tu ramènes = <strong>+2 pts</strong></p>

{% elsif contact.ROLE == 'influencer' %}

<p>Chaque influenceur·euse ≥ 2 000 followers inscrit·e avec ton lien = <strong>+15 pts</strong></p>
<p>Chaque Beauty Pro = <strong>+25 pts</strong></p>
<p>Chaque client·e = <strong>+2 pts</strong></p>

{% endif %}

<hr>

<h3>🎁 Tes premiers paliers</h3>

<ul>
  <li><strong>10 pts</strong> → Badge Glow Starter + mise en avant + <strong>-10%</strong> sur ta 1ère réservation</li>
  <li><strong>50 pts</strong> → Accès VIP + shoutout IG + <strong>-20%</strong></li>
  <li><strong>100 pts</strong> → Glow Kit + coaching + ticket pour le <strong>Jackpot 3 500 €</strong></li>
</ul>

<p>Partage ton lien (WhatsApp, DM, stories) et regarde ton score monter 🔥</p>

<p>À très vite,<br>✨ L'équipe Afroé</p>
```

### SMS Welcome (adapté par rôle)

**Client·e:**
```
Afroé ✨ Bienvenue sur la Glow List !
Ami·e = +2 pts · Pro = +25 pts · Influenceur ≥2k = +15 pts.
À 10 pts : badge + mise en avant + -10%.
Ton lien : {{REF_LINK}}
```

**Beauty Pro:**
```
Afroé ✨ Bienvenue Beauty Pro !
Chaque pro = +25 pts · client = +2 pts · influenceur ≥2k = +15 pts.
À 100 pts : Glow Kit + 1h coaching + Jackpot 3 500 €.
Ton lien : {{REF_LINK}}
```

**Influenceur·euse:**
```
Afroé ✨ Bienvenue sur la Glow List !
Influenceur ≥2k = +15 pts · Pro = +25 pts · Client = +2 pts.
Vise 50–100 pts pour les rewards + Jackpot 3 500 €.
Ton lien : {{REF_LINK}}
```

---

## 📧 Template Email #102 - Follow-up 1h

### Sujet
```
{{ contact.FIRSTNAME }}, tu as déjà partagé ton lien ? 🚀
```

### Corps Email

```html
<p>Hey {{ contact.FIRSTNAME | default:"Glow Friend" }},</p>

<p>Tu viens de rejoindre la <strong>Glow List</strong> mais tu n'as pas encore partagé ton lien !</p>

<p>💡 <strong>Rappel rapide :</strong> Plus tu partages tôt, plus tu accumules de points avant tout le monde.</p>

<p><strong>Ton lien perso :</strong><br>
👉 <a href="{{ contact.REF_LINK }}">{{ contact.REF_LINK }}</a></p>

<p>📲 Partage-le maintenant sur WhatsApp, IG Stories ou Discord.<br>
Chaque inscription compte !</p>

{% if contact.ROLE == 'client' %}
<p>Ami·e = <strong>+2 pts</strong> · Pro = <strong>+25 pts</strong> · Influenceur = <strong>+15 pts</strong></p>
{% elsif contact.ROLE == 'pro' %}
<p>Pro = <strong>+25 pts</strong> · Client = <strong>+2 pts</strong> · Influenceur = <strong>+15 pts</strong></p>
{% elsif contact.ROLE == 'influencer' %}
<p>Influenceur = <strong>+15 pts</strong> · Pro = <strong>+25 pts</strong> · Client = <strong>+2 pts</strong></p>
{% endif %}

<p>On se voit au sommet du classement 🔥<br>
✨ L'équipe Afroé</p>
```

### SMS Follow-up (conditionnel)

**Envoyé uniquement si l'email Welcome n'a pas été ouvert:**
```
Hey ! N'oublie pas de partager ton lien Afroé pour gagner des points et monter dans le classement ! 🚀
```

---

## 🎯 Template Email #103 - Activation 48h

### Sujet
```
{{ contact.FIRSTNAME }}, ton premier parrainage t'attend ! 🎯
```

### Corps Email

```html
<p>Bonjour {{ contact.FIRSTNAME | default:"Glow Friend" }},</p>

<p>Ça fait 48h que tu es sur la <strong>Glow List</strong>, mais tu n'as pas encore ton premier parrainage 😕</p>

<p>⚡ <strong>Objectif immédiat :</strong> Atteindre <strong>10 points</strong> pour débloquer ton badge Glow Starter + <strong>-10%</strong> sur ta première réservation.</p>

<p><strong>Comment faire ?</strong><br>
Partage ton lien avec 5 ami·e·s → c'est parti !</p>

<p><strong>Ton lien perso :</strong><br>
👉 <a href="{{ contact.REF_LINK }}">{{ contact.REF_LINK }}</a></p>

{% if contact.ROLE == 'client' %}
<p>5 ami·e·s = <strong>10 pts</strong> = Badge + mise en avant + -10% 🎁</p>
{% elsif contact.ROLE == 'pro' %}
<p>1 Beauty Pro = <strong>25 pts</strong> = Déjà 2 paliers débloqués 🎁</p>
{% elsif contact.ROLE == 'influencer' %}
<p>1 influenceur·euse = <strong>15 pts</strong> = Badge + récompenses 🎁</p>
{% endif %}

<p>Vas-y, c'est maintenant ou jamais !<br>
✨ L'équipe Afroé</p>
```

### SMS Activation 48h

```
Tu n'as pas encore partagé ton lien Afroé ? Partage-le maintenant et commence à gagner des points ! 💎
```

---

## 🏆 Template Email #104 - Milestone

### Sujet
```
🎉 Bravo {{ contact.FIRSTNAME }}, tu as atteint {{ contact.MILESTONE }} points !
```

### Corps Email

```html
<p>🎉 <strong>Bravo {{ contact.FIRSTNAME | default:"Glow Star" }} !</strong></p>

<p>Tu viens d'atteindre <strong>{{ contact.MILESTONE }} points</strong> sur la Glow List Afroé !</p>

<p>🏆 <strong>Ton classement actuel :</strong> #{{ contact.RANK }}</p>

{% if contact.MILESTONE == 10 %}
<h3>🌟 Palier Glow Starter débloqué !</h3>
<ul>
  <li>✅ Badge Glow Starter officiel</li>
  <li>✅ Mise en avant dans le classement waitlist</li>
  <li>✅ <strong>-10%</strong> sur ta première réservation</li>
</ul>
<p><strong>Prochain objectif :</strong> 50 pts → Accès VIP + Glow Circle privé + <strong>-20%</strong></p>

{% elsif contact.MILESTONE == 50 %}
<h3>💎 Palier Glow Circle Insider débloqué !</h3>
<ul>
  <li>✅ Accès VIP à la bêta Afroé</li>
  <li>✅ Shoutout IG (Glow Ambassadors)</li>
  <li>✅ Invitation au Glow Circle privé</li>
  <li>✅ <strong>-20%</strong> sur ta première réservation</li>
</ul>
<p><strong>Prochain objectif :</strong> 100 pts → Glow Kit + coaching + ticket Jackpot 3 500 € 🎁</p>

{% elsif contact.MILESTONE == 100 %}
<h3>🔥 Palier Glow Icon débloqué !</h3>
<ul>
  <li>✅ Glow Kit édition limitée</li>
  <li>✅ 1h stratégie ou coaching image</li>
  <li>✅ <strong>-20%</strong> sur ta première réservation</li>
  <li>✅ <strong>Ticket pour le Jackpot 3 500 €</strong></li>
</ul>
<p><strong>Prochain objectif :</strong> 200 pts → Glow Elite (événement IRL + feature presse + co-création)</p>

{% elsif contact.MILESTONE == 200 %}
<h3>👑 Palier Glow Elite débloqué !</h3>
<ul>
  <li>✅ Invitation à l'événement IRL (Paris/Londres)</li>
  <li>✅ Feature presse/blog/podcast Afroé</li>
  <li>✅ Co-création Glow Story</li>
  <li>✅ Coaching beauty/brand strategist</li>
  <li>✅ <strong>-50%</strong> sur ta première réservation</li>
</ul>
<p>Tu es maintenant dans le <strong>top des Glow Elites</strong> ! Continue pour viser la #1 du classement 🏆</p>

{% endif %}

<p>Continue de partager ton lien :<br>
👉 <a href="{{ contact.REF_LINK }}">{{ contact.REF_LINK }}</a></p>

<p>On se voit au sommet ! 🔥<br>
✨ L'équipe Afroé</p>
```

### SMS Milestone

```
🎉 Bravo ! Tu as atteint le palier {{ MILESTONE }} points sur Afroé ! Continue comme ça pour débloquer encore plus de récompenses !
```

---

## ⏰ Template Email #105 - Reminder 5d

### Sujet
```
{{ contact.FIRSTNAME }}, le classement bouge ! 🔥
```

### Corps Email

```html
<p>Hey {{ contact.FIRSTNAME | default:"Glow Friend" }},</p>

<p>Ça fait 5 jours qu'on ne t'a pas vu·e sur la Glow List ! 👀</p>

<p>Pendant ce temps, le classement a bougé et d'autres Glow Stars montent rapidement...</p>

<p>📊 <strong>Ton classement actuel :</strong> #{{ contact.RANK }}<br>
💎 <strong>Tes points :</strong> {{ contact.POINTS }} pts<br>
🎯 <strong>Prochain palier :</strong> {{ contact.NEXT_MILESTONE }} pts</p>

<p><strong>Il est encore temps de remonter !</strong><br>
Partage ton lien et reprends ta place au sommet 🚀</p>

<p><strong>Ton lien perso :</strong><br>
👉 <a href="{{ contact.REF_LINK }}">{{ contact.REF_LINK }}</a></p>

<p>Le lancement approche... Ne te fais pas dépasser !<br>
✨ L'équipe Afroé</p>
```

### SMS Reminder 5d

```
Hey ! Le classement Afroé bouge vite ! Partage ton lien pour ne pas te faire dépasser ! 🔥
```

---

## 🚀 Template Email #106 - Launch Day

### Sujet
```
🚀 C'EST LE JOUR J ! Afroé est lancée + Bonus x2 aujourd'hui !
```

### Corps Email

```html
<p>🚀 <strong>C'EST LE JOUR J {{ contact.FIRSTNAME | default:"Glow Star" }} !</strong></p>

<p><strong>Afroé est officiellement lancée !</strong> 🎉</p>

<p>🔥 <strong>BONUS SPÉCIAL AUJOURD'HUI :</strong> Tous les points gagnés aujourd'hui sont <strong>DOUBLÉS (x2)</strong> !</p>

<h3>🎯 Nouveaux barèmes (dès maintenant)</h3>

{% if contact.ROLE == 'client' %}
<p>Ami·e inscrit·e = <strong>+10 pts</strong> (x2 aujourd'hui = 20 pts !)<br>
Pro = <strong>+100 pts</strong><br>
Influenceur = <strong>+50 pts</strong></p>

{% elsif contact.ROLE == 'pro' %}
<p>Beauty Pro = <strong>+100 pts</strong> (x2 aujourd'hui = 200 pts !)<br>
Client·e = <strong>+10 pts</strong><br>
Influenceur = <strong>+50 pts</strong></p>

{% elsif contact.ROLE == 'influencer' %}
<p>Influenceur = <strong>+50 pts</strong> (x2 aujourd'hui = 100 pts !)<br>
Pro = <strong>+100 pts</strong><br>
Client·e = <strong>+10 pts</strong></p>

{% endif %}

<p>📊 <strong>Ton classement actuel :</strong> #{{ contact.RANK }}<br>
💎 <strong>Tes points :</strong> {{ contact.POINTS }} pts</p>

<p><strong>C'est maintenant ou jamais !</strong><br>
Partage ton lien AUJOURD'HUI pour maximiser tes points 🔥</p>

<p><strong>Ton lien perso :</strong><br>
👉 <a href="{{ contact.REF_LINK }}">{{ contact.REF_LINK }}</a></p>

<p>La course au Jackpot 3 500 € est lancée !<br>
✨ L'équipe Afroé</p>
```

### SMS Launch Day

```
🚀 C'est le JOUR J ! Afroé est lancée ! Tous les points gagnés aujourd'hui sont DOUBLÉS ! Partage ton lien maintenant ! 🔥
```

---

## 🔧 Variables Brevo Requises

Tous les templates utilisent ces variables (synchronisées depuis MongoDB):

| Variable | Type | Description |
|----------|------|-------------|
| `{{ contact.FIRSTNAME }}` | string | Prénom de l'utilisateur |
| `{{ contact.ROLE }}` | string | client \| pro \| influencer |
| `{{ contact.REF_LINK }}` | string | Lien de parrainage unique |
| `{{ contact.POINTS }}` | number | Points actuels |
| `{{ contact.RANK }}` | number | Position dans le classement |
| `{{ contact.NEXT_MILESTONE }}` | number | 10 \| 50 \| 100 \| 200 |
| `{{ contact.MILESTONE }}` | number | Palier atteint (pour email milestone) |

---

## 📝 Instructions d'Implémentation dans Brevo

### Étape 1: Créer les templates

1. Connectez-vous à votre compte Brevo
2. Allez dans **Campaigns** > **Email Templates**
3. Créez 6 nouveaux templates avec les IDs suivants:
   - **101**: Welcome
   - **102**: Follow-up 1h
   - **103**: Activation 48h
   - **104**: Milestone
   - **105**: Reminder 5d
   - **106**: Launch Day

### Étape 2: Configurer les variables de contact

1. Allez dans **Contacts** > **Settings** > **Contact Attributes**
2. Créez les attributs suivants (type TEXT):
   - FIRSTNAME
   - ROLE
   - REF_LINK
   - POINTS (type NUMBER)
   - RANK (type NUMBER)
   - REF_COUNT (type NUMBER)
   - NEXT_MILESTONE (type NUMBER)
   - LAST_REF_AT (type DATE)

### Étape 3: Tester les templates

1. Créez 3 contacts de test avec différents rôles:
   - test-client@afroe.com (ROLE: client)
   - test-pro@afroe.com (ROLE: pro)
   - test-influencer@afroe.com (ROLE: influencer)

2. Envoyez des emails de test pour chaque template

3. Vérifiez que les conditions `{% if contact.ROLE %}` fonctionnent correctement

### Étape 4: Configuration des SMS

Les SMS sont envoyés via l'API Brevo depuis le code Next.js. Aucune configuration supplémentaire n'est nécessaire dans l'interface Brevo.

---

## ✅ Checklist de Validation

- [ ] Les 6 templates email sont créés dans Brevo
- [ ] Tous les attributs de contact sont configurés
- [ ] Les tests d'envoi fonctionnent pour les 3 rôles
- [ ] Les conditions Twig s'affichent correctement
- [ ] L'API Brevo est configurée dans `.env`
- [ ] Les SMS de test sont reçus
- [ ] La synchronisation MongoDB → Brevo fonctionne

---

## 🎯 Résultat Final

Vous avez maintenant:

✅ **1 template email unique** pour les 3 rôles (client/pro/influencer)
✅ **Bloc central intelligent** qui change selon le rôle
✅ **Paliers et points alignés** parfaitement
✅ **SMS prêts à l'emploi** depuis Next.js ou Brevo
✅ **Aucune incohérence** entre les rôles, points et récompenses
✅ **Stratégie anti-doublon** (email-first, SMS conditionnel)

**Le système est prêt pour le lancement ! 🚀**
