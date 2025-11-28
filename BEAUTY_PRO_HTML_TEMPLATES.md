# Templates HTML Beauty Pro - Prêts pour Brevo

Ces templates sont **prêts à copier-coller** directement dans Brevo. Les variables Brevo (`{{ contact.FIRSTNAME }}`, `{{ contact.REF_LINK }}`, etc.) seront automatiquement remplacées lors de l'envoi.

---

## 📧 Template #1 - Welcome Beauty Pro (ID: 107)

**Sujet:** Bienvenue dans la Glow List Pro ✨

**Copier ce code HTML dans Brevo :**

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Bienvenue sur Afroé</title>
</head>
<body style="margin:0;padding:0;background-color:#0b0b10;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#f7f7ff;">
  <table width="100%" cellspacing="0" cellpadding="0" style="background-color:#0b0b10;padding:24px 0;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:radial-gradient(circle at top,#4c35ff 0,#0b0b10 55%);border-radius:16px;padding:24px 22px 28px 22px;color:#f7f7ff;">
          <tr>
            <td align="center" style="padding-bottom:20px;">
              <!-- Logo Afroé -->
              <div style="font-size:24px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#ffd966;">
                AFROÉ
              </div>
              <div style="font-size:12px;opacity:0.85;margin-top:6px;font-style:italic;">
                Ton art, ta réussite, ton indépendance.
              </div>
            </td>
          </tr>

          <tr>
            <td style="font-size:15px;line-height:1.65;color:#f7f7ff;">
              <p style="margin:0 0 14px 0;font-size:16px;">
                Bonjour <strong>{{ contact.FIRSTNAME | default:"Beauty Pro" }}</strong> 🌸
              </p>

              <p style="margin:0 0 14px 0;">
                Bienvenue sur <strong>Afroé</strong>, la plateforme premium dédiée aux professionnel·le·s de la beauté afro-européenne.
              </p>

              <p style="margin:0 0 14px 0;">
                Ton inscription est bien enregistrée — nous sommes ravis de te compter parmi les talents qui façonnent la nouvelle génération de la beauté afro.
              </p>

              <!-- Mission -->
              <div style="background:rgba(255,255,255,0.05);border-left:3px solid #ffd966;padding:12px 14px;margin:18px 0;border-radius:4px;">
                <p style="margin:0;font-weight:600;color:#ffd966;">🎯 Notre mission</p>
                <p style="margin:6px 0 0 0;">
                  Rendre ton savoir-faire <strong>visible, rentable et reconnu</strong>.
                </p>
              </div>

              <p style="margin:0 0 14px 0;">
                🖤 <strong>Afroé n'est pas une simple appli : c'est un label de qualité.</strong>
              </p>

              <p style="margin:0 0 14px 0;">
                Avant toute mise en ligne, chaque prestataire est <strong>sélectionné et validé</strong> par notre équipe : portfolio, hygiène, qualité du rendu et expérience client.
              </p>

              <!-- Prochaine étape -->
              <div style="background:rgba(77,53,255,0.15);border-radius:8px;padding:14px;margin:20px 0;">
                <p style="margin:0 0 10px 0;font-weight:600;font-size:16px;">👉 Prochaine étape</p>
                <p style="margin:0 0 10px 0;">
                  <strong>Envoie-nous ton portfolio</strong> (3–5 photos / vidéos de tes réalisations) dès maintenant à
                  <a href="mailto:pro@afroe.com" style="color:#ffd966;text-decoration:none;font-weight:600;">pro@afroe.com</a>
                  ou via ton espace.
                </p>
                <p style="margin:0;font-size:14px;opacity:0.9;">
                  Si ton profil correspond à nos critères, tu recevras une <strong>invitation pour un test IRL</strong> avant validation finale.
                </p>
              </div>

              <!-- Parrainage -->
              <p style="margin:20px 0 8px 0;font-weight:600;">💼 Pendant ce temps, partage ton lien</p>
              <p style="margin:0 0 12px 0;font-size:14px;">
                Chaque Beauty Pro que tu invites = <strong style="color:#ffd966;">+25 pts</strong><br/>
                À 100 pts : <strong>Glow Kit + coaching + ticket Jackpot 3 500 €</strong>
              </p>

              <!-- CTA Button -->
              <div style="text-align:center;margin:24px 0 20px 0;">
                <a href="{{ contact.REF_LINK }}"
                   style="display:inline-block;padding:12px 24px;border-radius:999px;background:#ffd966;color:#0b0b10;font-weight:700;font-size:15px;text-decoration:none;box-shadow:0 4px 12px rgba(255,217,102,0.3);">
                  Copier mon lien &amp; partager
                </a>
              </div>

              <!-- Signature -->
              <p style="margin:24px 0 0 0;font-size:14px;opacity:0.85;line-height:1.5;">
                À très vite,<br/>
                — L'équipe Afroé 💫<br/>
                <em style="color:#ffd966;">« Ton art, ta réussite, ton indépendance. »</em>
              </p>
            </td>
          </tr>
        </table>

        <!-- Footer -->
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin-top:16px;">
          <tr>
            <td style="font-size:11px;color:#666;text-align:center;line-height:1.6;padding:0 20px;">
              Vous recevez cet email parce que vous vous êtes inscrit·e sur la liste d'attente Afroé Beauty Pro.<br/>
              <a href="{unsubscribe}" style="color:#888;text-decoration:underline;">Se désabonner</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## 📧 Template #2 - Activation Pro IRL Test (ID: 108)

**Sujet:** Ton profil Afroé en revue — place au test !

**Copier ce code HTML dans Brevo :**

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Ton profil Afroé en revue</title>
</head>
<body style="margin:0;padding:0;background-color:#0b0b10;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#f7f7ff;">
  <table width="100%" cellspacing="0" cellpadding="0" style="background-color:#0b0b10;padding:24px 0;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:linear-gradient(145deg,#0b0b10 0,#251b4d 40%,#0b0b10 100%);border-radius:16px;padding:24px 22px 28px 22px;color:#f7f7ff;box-shadow:0 8px 24px rgba(0,0,0,0.4);">
          <tr>
            <td align="center" style="padding-bottom:20px;">
              <!-- Logo Afroé -->
              <div style="font-size:24px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#ffd966;">
                AFROÉ
              </div>
              <div style="font-size:12px;opacity:0.85;margin-top:6px;font-style:italic;">
                Ton art, ta réussite, ton indépendance.
              </div>
            </td>
          </tr>

          <tr>
            <td style="font-size:15px;line-height:1.65;color:#f7f7ff;">
              <p style="margin:0 0 14px 0;font-size:16px;">
                Bonjour <strong>{{ contact.FIRSTNAME | default:"Beauty Pro" }}</strong>,
              </p>

              <p style="margin:0 0 14px 0;">
                Ton inscription est bien reçue et ton profil est <strong style="color:#ffd966;">en cours d'examen</strong>.
              </p>

              <!-- Label qualité -->
              <div style="background:rgba(255,255,255,0.05);border-left:3px solid #ffd966;padding:12px 14px;margin:18px 0;border-radius:4px;">
                <p style="margin:0;font-weight:600;">✨ Chez Afroé, nous sélectionnons personnellement nos prestataires</p>
                <p style="margin:6px 0 0 0;font-size:14px;">
                  Pour garantir un niveau de service premium.
                </p>
              </div>

              <!-- Étapes -->
              <p style="margin:20px 0 10px 0;font-weight:600;font-size:16px;">Pour finaliser ta candidature :</p>

              <ol style="margin:0 0 16px 0;padding-left:20px;line-height:1.8;">
                <li style="margin-bottom:8px;">
                  <strong>Envoie ou complète ton portfolio professionnel</strong> (3-5 photos / vidéos)<br/>
                  <a href="mailto:pro@afroe.com" style="color:#ffd966;text-decoration:none;font-weight:600;">→ pro@afroe.com</a>
                </li>
                <li style="margin-bottom:8px;">
                  <strong>Indique ta spécialité :</strong> locks, braids, make-up, barbering, nails…
                </li>
                <li>
                  <strong>Prépare-toi à une session test</strong> en présence avec notre équipe<br/>
                  <span style="opacity:0.8;font-size:14px;">(Bruxelles / Anvers / Paris selon ta zone)</span>
                </li>
              </ol>

              <p style="margin:0 0 14px 0;font-size:14px;opacity:0.9;">
                👉 S'il est validé, ton profil sera <strong>mis en avant sur Afroé</strong> et tu pourras commencer à recevoir des réservations dès le lancement.
              </p>

              <!-- Séparateur -->
              <hr style="border:none;border-top:1px solid rgba(255,255,255,0.15);margin:24px 0;" />

              <!-- Offre Pro -->
              <div style="background:rgba(77,53,255,0.2);border-radius:8px;padding:16px;margin:20px 0;">
                <p style="margin:0 0 12px 0;font-weight:700;font-size:17px;color:#ffd966;">💸 Notre offre</p>

                <ul style="margin:0;padding-left:20px;line-height:1.8;">
                  <li style="margin-bottom:8px;">
                    ✅ <strong>Aucune commission sur les 2 premiers mois</strong>
                  </li>
                  <li style="margin-bottom:8px;">
                    ✅ <strong>Abonnement Pro : 99 €/mois</strong><br/>
                    <span style="font-size:14px;opacity:0.9;">(administratif, visibilité, gestion, outils)</span>
                  </li>
                  <li>
                    ✅ <strong>Formation et support inclus</strong>
                  </li>
                </ul>
              </div>

              <!-- Parrainage -->
              <p style="margin:20px 0 10px 0;font-size:14px;">
                🔗 En attendant, continue de partager ton lien pour accumuler des points :<br/>
                Beauty Pro = <strong style="color:#ffd966;">+25 pts</strong> · Client = +2 pts · Influenceur = +15 pts
              </p>

              <!-- CTA Button -->
              <div style="text-align:center;margin:24px 0 20px 0;">
                <a href="{{ contact.REF_LINK }}"
                   style="display:inline-block;padding:12px 24px;border-radius:999px;background:#ffd966;color:#0b0b10;font-weight:700;font-size:15px;text-decoration:none;box-shadow:0 4px 12px rgba(255,217,102,0.3);">
                  Mettre à jour mon dossier
                </a>
              </div>

              <!-- Signature -->
              <p style="margin:24px 0 0 0;font-size:14px;opacity:0.85;line-height:1.5;">
                À très vite pour ton test,<br/>
                — L'équipe Afroé 🖤
              </p>
            </td>
          </tr>
        </table>

        <!-- Footer -->
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin-top:16px;">
          <tr>
            <td style="font-size:11px;color:#666;text-align:center;line-height:1.6;padding:0 20px;">
              Vous recevez cet email parce que vous vous êtes inscrit·e comme Beauty Pro sur Afroé.<br/>
              <a href="{unsubscribe}" style="color:#888;text-decoration:underline;">Se désabonner</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## 🎨 Personnalisation des Couleurs

Si tu veux changer les couleurs pour mieux matcher ton branding Afroé :

### Palette Actuelle
- **Background principal :** `#0b0b10` (noir profond)
- **Accent primaire :** `#ffd966` (doré/jaune)
- **Accent secondaire :** `#4c35ff` (violet/bleu)
- **Texte principal :** `#f7f7ff` (blanc cassé)

### Pour Changer les Couleurs

1. **Doré → Autre couleur :**
   - Chercher `#ffd966` et remplacer par ta couleur

2. **Violet → Autre couleur :**
   - Chercher `#4c35ff` et remplacer par ta couleur

3. **Background → Autre couleur :**
   - Chercher `#0b0b10` et remplacer par ta couleur

---

## 📸 Ajouter un Logo Image

Pour remplacer le texte "AFROÉ" par une vraie image de logo :

**Remplacer cette section :**
```html
<div style="font-size:24px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#ffd966;">
  AFROÉ
</div>
```

**Par :**
```html
<img src="https://votre-domaine.com/logo-afroe.png"
     alt="Afroé"
     style="max-width:180px;height:auto;" />
```

---

## ✅ Instructions pour Brevo

### Étape 1 : Créer le Template #107

1. Connectez-vous à **Brevo**
2. Allez dans **Campaigns** → **Email Templates**
3. Cliquez sur **Create a new template**
4. Choisissez **Rich text editor** (ou **Drag & drop**)
5. Cliquez sur **<> Source code** (icône en haut à droite)
6. **Collez tout le code HTML du Template #1**
7. Cliquez sur **Save**
8. Nommez le template : **"Welcome Beauty Pro"**
9. Notez l'ID du template (normalement 107)

### Étape 2 : Créer le Template #108

Répétez les mêmes étapes avec le **Template #2** (Activation Pro IRL Test)

### Étape 3 : Tester les Templates

1. Dans Brevo, allez dans **Contacts**
2. Créez un contact de test : `test-pro@votre-email.com`
3. Ajoutez les attributs :
   - `FIRSTNAME` : "Jean"
   - `ROLE` : "pro"
   - `REF_LINK` : "https://afroe.com/waitlist?ref=TEST123"
4. Envoyez un email de test depuis le template
5. Vérifiez que tout s'affiche correctement

### Étape 4 : Configurer les Workflows

Suivez les instructions dans `BEAUTY_PRO_EMAIL_SEQUENCE.md` section "Configuration des Workflows Beauty Pro dans Brevo"

---

## 📱 Responsive Design

Ces templates sont **responsive** et s'adaptent automatiquement :
- ✅ Desktop (Outlook, Gmail, Apple Mail)
- ✅ Mobile (iPhone, Android)
- ✅ Webmail (Gmail web, Outlook web)

---

## 🎯 Variables Brevo Utilisées

Ces variables sont **automatiquement remplacées** par Brevo lors de l'envoi :

| Variable | Exemple |
|----------|---------|
| `{{ contact.FIRSTNAME \| default:"Beauty Pro" }}` | Jean |
| `{{ contact.REF_LINK }}` | https://afroe.com/waitlist?ref=ABC123 |
| `{unsubscribe}` | Lien de désinscription Brevo |

---

## ✨ Templates Prêts à l'Emploi !

Copiez-collez ces templates HTML directement dans Brevo et ils fonctionneront immédiatement avec votre système d'automation existant ! 🚀
