# Séquence E-mail Influenceur - Afroé

Cette séquence complète pour les influenceurs (ROLE = "influencer") inclut **5 emails** alignés avec le branding Afroé et le Referral Contest.

---

## 📧 Email #1 - Welcome Influencer (Déjà existant)

**Template ID:** 101 (Welcome général avec conditions ROLE)
**Timing:** T0 (inscription immédiate)

---

## 📧 Email #2 - Follow-up Influencer Collaboration (T+24h ou T+48h)

**Template ID:** 110
**Sujet:** Tu veux collaborer avec Afroé ? Parlons concret ✨
**Timing:** 24-48h après inscription
**Segment:** `ROLE == "influencer"`

### Version Texte

```
Bonjour {{ contact.FIRSTNAME | default:"créateur·rice" }},

Merci encore pour ton inscription sur Afroé ✨

Tu fais partie des créateurs et créatrices de contenus qui donnent de la visibilité à la beauté afro-européenne — et on veut collaborer avec les talents qui comprennent vraiment cette culture.

👉 Voici ce que tu peux faire dès maintenant pour aller plus loin avec Afroé :

1️⃣ Présente-toi brièvement :
→ ton style de contenu, ta plateforme principale, ton audience, ton lien IG/TikTok/YouTube

2️⃣ Envoie ton mini-portfolio / quelques liens
→ vidéos, stories, photos, tout ce qui montre ton univers

3️⃣ Dis-nous si tu veux être invité·e à notre "Afroé Creator Test Day"
→ un moment privé pour découvrir Afroé, tester les features, co-créer du contenu et accéder avant tout le monde à la plateforme

Nous sélectionnons nos partenaires comme nos prestataires :
avec soin, cohérence de style, vraie affinité Afro-Beauty.

🎁 Et pour info :
Les influenceurs validés auront accès à :

• des codes promo uniques pour leur audience
• des collaborations rémunérées (selon campagne)
• une visibilité croisée sur Afroé
• un accès VIP aux événements Pro & Creator

Si tu veux avancer :
👉 Réponds à ce mail avec tes infos, ton style, et ton portfolio.

Et n'oublie pas :
Ton lien personnel t'attend ici → {{ contact.REF_LINK }}
Plus tu le partages maintenant, plus tu montes dans le classement des Glow Leaders ✨

À très vite,
— L'équipe Afroé 🖤
« Créateurs, culture, communauté. »
```

### Version HTML (Prête pour Brevo)

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Collaborons avec Afroé</title>
</head>
<body style="margin:0;padding:0;background-color:#0b0b10;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#f7f7ff;">
  <table width="100%" cellspacing="0" cellpadding="0" style="background-color:#0b0b10;padding:24px 0;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0"
               style="max-width:560px;background:linear-gradient(145deg,#0b0b10 0,#251b4d 45%,#0b0b10 100%);
                      border-radius:16px;padding:24px 22px 32px 22px;color:#f7f7ff;">

          <!-- Header -->
          <tr>
            <td align="center" style="padding-bottom:18px;">
              <div style="font-size:22px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#ffd966;">
                AFROÉ
              </div>
              <div style="font-size:11px;opacity:0.8;margin-top:4px;font-style:italic;">
                Créateurs, culture, communauté.
              </div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="font-size:15px;line-height:1.65;">

              <p style="margin:0 0 14px 0;">
                Bonjour <strong>{{ contact.FIRSTNAME | default:"créateur·rice" }}</strong>,
              </p>

              <p style="margin:0 0 14px 0;">
                Merci encore pour ton inscription sur Afroé ✨<br/>
                Tu fais partie de celles et ceux qui donnent de la visibilité à la beauté afro-européenne — et ça, on veut le valoriser.
              </p>

              <p style="margin:0 0 14px 0;">
                Si tu veux aller plus loin avec nous, voici comment te positionner pour une collaboration :
              </p>

              <ol style="margin:0 0 16px 20px;padding:0;line-height:1.8;">
                <li style="margin-bottom:8px;">
                  <strong>Présente-toi</strong> en quelques lignes (ton style, ton univers, ta plateforme principale)
                </li>
                <li style="margin-bottom:8px;">
                  Envoie ton <strong>mini-portfolio</strong> ou quelques liens (IG/TikTok/YouTube)
                </li>
                <li>
                  Dis-nous si tu veux rejoindre notre <strong style="color:#ffd966;">Afroé Creator Test Day</strong>
                </li>
              </ol>

              <p style="margin:0 0 14px 0;font-size:14px;opacity:0.9;">
                Nous sélectionnons nos partenaires comme nos prestataires : avec soin, cohérence visuelle et vraie affinité Afro-Beauty.
              </p>

              <!-- Avantages -->
              <div style="background:rgba(77,53,255,0.15);border-radius:8px;padding:14px;margin:18px 0;">
                <p style="margin:0 0 10px 0;font-weight:600;">🎁 Les avantages des créateurs validés :</p>
                <ul style="margin:0;padding-left:20px;line-height:1.7;font-size:14px;">
                  <li>Codes promo exclusifs pour ton audience</li>
                  <li>Possibilité de campagnes rémunérées</li>
                  <li>Visibilité croisée sur Afroé</li>
                  <li>Accès VIP aux événements Pro & Creator</li>
                </ul>
              </div>

              <p style="margin:16px 0 10px 0;font-size:14px;">
                💬 <strong>Réponds à ce mail</strong> avec tes infos, ton univers, et ton portfolio.
              </p>

              <!-- CTA Button -->
              <div style="text-align:center;margin:24px 0;">
                <a href="{{ contact.REF_LINK }}"
                   style="display:inline-block;padding:12px 24px;border-radius:999px;
                          background:#ffd966;color:#0b0b10;font-weight:700;font-size:15px;
                          text-decoration:none;box-shadow:0 4px 12px rgba(255,217,102,0.3);">
                  Mon lien de créateur Afroé
                </a>
              </div>

              <!-- Signature -->
              <p style="margin:24px 0 0 0;font-size:14px;opacity:0.85;line-height:1.5;">
                À très vite,<br/>
                — L'équipe Afroé 🖤<br/>
                <em style="color:#ffd966;">« Créateurs, culture, communauté. »</em>
              </p>

            </td>
          </tr>

        </table>

        <!-- Footer -->
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin-top:16px;">
          <tr>
            <td style="font-size:11px;color:#666;text-align:center;line-height:1.6;padding:0 20px;">
              Vous recevez cet email car vous vous êtes inscrit·e comme influenceur·euse sur Afroé.<br/>
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

## 📧 Email #3 - Progression Classement + Referral Contest (T+3 à T+7)

**Template ID:** 111
**Sujet:** Tu montes dans le classement… et tu restes en course pour les 3 500 € 💸
**Timing:** Quand POINTS augmente ou après 3-7 jours
**Segment:** `ROLE == "influencer"`

### Version Texte

```
Bonjour {{ contact.FIRSTNAME | default:"créateur·rice" }} ✨

Tu progresses dans le classement Afroé — continue !

Tu as maintenant {{ contact.POINTS }} points, ce qui signifie que :

✅ tu montes dans la Glow List 🔥
✅ tu te rapproches des récompenses créateurs Afroé
✅ tu restes 100 % éligible au Referral Contest

Oui, tu peux toujours gagner :

💰 3 500 € cash, ou
📱 l'iPhone 17 Pro

Chaque inscription via ton lien t'augmente dans le classement :
👉 {{ contact.REF_LINK }}

Continue, tu n'es pas loin du cercle des Influencers Glow.

— L'équipe Afroé 🖤
« Créateurs, culture, communauté. »
```

### Version HTML

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Tu montes dans le classement</title>
</head>
<body style="margin:0;padding:0;background-color:#0b0b10;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#f7f7ff;">
  <table width="100%" cellspacing="0" cellpadding="0" style="background-color:#0b0b10;padding:24px 0;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0"
               style="max-width:560px;background:linear-gradient(145deg,#0b0b10 0,#3a2f74 40%,#0b0b10 100%);
                      border-radius:16px;padding:24px 22px 28px 22px;color:#f7f7ff;">

          <!-- Header -->
          <tr>
            <td align="center" style="padding-bottom:18px;">
              <div style="font-size:22px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#ffd966;">
                AFROÉ
              </div>
              <div style="font-size:11px;opacity:0.8;margin-top:4px;">
                Glow Influence
              </div>
            </td>
          </tr>

          <tr>
            <td style="font-size:15px;line-height:1.65;">

              <p style="margin:0 0 14px 0;">
                Bonjour <strong>{{ contact.FIRSTNAME | default:"créateur·rice" }}</strong> ✨
              </p>

              <p style="margin:0 0 14px 0;">
                Bonne nouvelle : <strong>tu viens de monter dans le classement Afroé !</strong>
              </p>

              <!-- Points Display -->
              <div style="text-align:center;background:rgba(255,217,102,0.1);border:2px solid #ffd966;border-radius:12px;padding:16px;margin:20px 0;">
                <p style="margin:0;font-size:14px;opacity:0.9;">Tes points actuels</p>
                <p style="margin:8px 0 0 0;font-size:32px;font-weight:700;color:#ffd966;">{{ contact.POINTS }} pts 🔥</p>
              </div>

              <p style="margin:16px 0 10px 0;">Ce qui signifie que :</p>

              <ul style="margin:0 0 16px 20px;padding:0;line-height:1.8;">
                <li>✅ Tu montes dans la Glow List</li>
                <li>✅ Tu te rapproches des récompenses créateurs</li>
                <li>✅ Tu restes <strong style="color:#ffd966;">100% éligible au Referral Contest</strong></li>
              </ul>

              <!-- Contest Prizes -->
              <div style="background:rgba(77,53,255,0.2);border-radius:8px;padding:16px;margin:20px 0;">
                <p style="margin:0 0 12px 0;font-weight:700;font-size:16px;color:#ffd966;">🏆 Tu peux encore gagner :</p>
                <p style="margin:0;font-size:15px;line-height:1.6;">
                  💰 <strong>3 500 € cash</strong>, ou<br/>
                  📱 <strong>l'iPhone 17 Pro</strong>
                </p>
              </div>

              <p style="margin:16px 0 10px 0;font-size:14px;">
                Chaque inscription via ton lien te rapproche du cercle des <strong>Influencers Glow</strong>.
              </p>

              <!-- CTA Button -->
              <div style="text-align:center;margin:24px 0;">
                <a href="{{ contact.REF_LINK }}"
                   style="display:inline-block;padding:12px 24px;border-radius:999px;
                          background:#ffd966;color:#0b0b10;font-weight:700;font-size:15px;
                          text-decoration:none;box-shadow:0 4px 12px rgba(255,217,102,0.3);">
                  Partager mon lien
                </a>
              </div>

              <p style="margin:24px 0 0 0;font-size:14px;opacity:0.85;">
                Continue comme ça — tu fais partie des talents qui font bouger la beauté afro-européenne.<br/><br/>
                — L'équipe Afroé 🖤
              </p>

            </td>
          </tr>
        </table>

        <!-- Footer -->
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin-top:16px;">
          <tr>
            <td style="font-size:11px;color:#666;text-align:center;line-height:1.6;padding:0 20px;">
              Tu progresses sur Afroé !<br/>
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

## 📧 Email #4 - Invitation Creator Test Day + Contest (Seuil atteint)

**Template ID:** 112
**Sujet:** Invitation officielle au Creator Test Day ✨ (et tu restes en course pour les 3 500 €)
**Timing:** Après validation portfolio ou seuil de points (ex: 50+ pts)
**Segment:** `ROLE == "influencer" AND validation manuelle`

### Version Texte

```
Bonjour {{ contact.FIRSTNAME | default:"créateur·rice" }} 🌟

Bonne nouvelle : ton profil nous a convaincus.

Tu es officiellement invité·e au Creator Test Day Afroé — une session privée pour tester l'app avant tout le monde et co-créer du contenu.

🎬 Au programme :
• tests exclusifs de l'app
• création de contenu (Reels, photos, teasers)
• networking entre créateurs afro-européens
• Glow Kit cadeau ✨

👉 Confirme ta présence en répondant simplement :
"Je confirme pour le Creator Test Day."

📍 Lieu : communiqué après confirmation
📅 Date : selon ta zone (Bruxelles / Anvers / Paris)

Et pendant que tu te prépares pour l'événement, rappelle-toi que tu es toujours dans le :

🏆 REFERRAL CONTEST OFFICIEL

Tu peux encore gagner :
💰 3 500 €, ou
📱 l'iPhone 17 Pro

Ton lien : {{ contact.REF_LINK }}

Plus tu partages, plus tu montes dans le classement final.

— L'équipe Afroé 🖤
```

### Version HTML

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Invitation Creator Test Day</title>
</head>
<body style="margin:0;padding:0;background-color:#0b0b10;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#f7f7ff;">
  <table width="100%" cellspacing="0" cellpadding="0" style="background-color:#0b0b10;padding:24px 0;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0"
               style="max-width:560px;background:linear-gradient(145deg,#0b0b10 0,#4c35ff 45%,#0b0b10 100%);
                      border-radius:16px;padding:24px 22px 28px 22px;color:#f7f7ff;box-shadow:0 8px 24px rgba(76,53,255,0.3);">

          <!-- Header -->
          <tr>
            <td align="center" style="padding-bottom:18px;">
              <div style="font-size:24px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#ffd966;">
                AFROÉ
              </div>
              <div style="font-size:12px;opacity:0.8;margin-top:6px;">
                Creator Test Day
              </div>
            </td>
          </tr>

          <tr>
            <td style="font-size:15px;line-height:1.65;">

              <p style="margin:0 0 14px 0;font-size:16px;">
                Bonjour <strong>{{ contact.FIRSTNAME | default:"créateur·rice" }}</strong> 🌟
              </p>

              <p style="margin:0 0 14px 0;">
                Nous avons une excellente nouvelle : <strong>ton profil nous a réellement convaincus</strong>.
              </p>

              <p style="margin:0 0 14px 0;">
                Tu es officiellement invité·e au <strong style="color:#ffd966;">Creator Test Day Afroé</strong> — une session privée et limitée pour tester l'app en avant-première et créer du contenu avec nous.
              </p>

              <!-- Programme -->
              <div style="background:rgba(255,255,255,0.05);border-left:3px solid #ffd966;padding:14px;margin:18px 0;border-radius:4px;">
                <p style="margin:0 0 10px 0;font-weight:600;">🎬 Au programme :</p>
                <ul style="margin:0;padding-left:20px;line-height:1.8;font-size:14px;">
                  <li>Présentation Afroé (vision + fonctionnalités)</li>
                  <li>Tests exclusifs de l'app</li>
                  <li>Création de contenu (Reels, photos, teasers)</li>
                  <li>Networking avec des créateurs afro-européens</li>
                  <li>Glow Kit cadeau ✨</li>
                </ul>
              </div>

              <p style="margin:16px 0 10px 0;">
                <strong>📍 Lieu :</strong> communiqué après confirmation<br/>
                <strong>📅 Date :</strong> selon ta zone (Bruxelles, Anvers ou Paris)
              </p>

              <p style="margin:16px 0 10px 0;font-size:15px;">
                👉 <strong>Pour confirmer ta présence</strong>, réponds à ce mail avec :<br/>
                <em>"Je confirme pour le Creator Test Day."</em>
              </p>

              <hr style="border:none;border-top:1px solid rgba(255,255,255,0.15);margin:24px 0;" />

              <!-- Contest Reminder -->
              <div style="background:rgba(255,217,102,0.1);border-radius:8px;padding:16px;margin:20px 0;">
                <p style="margin:0 0 10px 0;font-weight:700;font-size:16px;color:#ffd966;">🏆 Rappel : Tu es toujours en course !</p>
                <p style="margin:0 0 12px 0;font-size:14px;">
                  Tu participes au <strong>Referral Contest</strong> et tu peux gagner :
                </p>
                <p style="margin:0;font-size:15px;line-height:1.6;">
                  💰 <strong>3 500 € cash</strong><br/>
                  📱 <strong>iPhone 17 Pro</strong>
                </p>
              </div>

              <p style="margin:16px 0 10px 0;font-size:14px;">
                Continue de partager ton lien pour maximiser tes chances :
              </p>

              <!-- CTA Button -->
              <div style="text-align:center;margin:24px 0;">
                <a href="{{ contact.REF_LINK }}"
                   style="display:inline-block;padding:12px 24px;border-radius:999px;
                          background:#ffd966;color:#0b0b10;font-weight:700;font-size:15px;
                          text-decoration:none;box-shadow:0 4px 12px rgba(255,217,102,0.3);">
                  Partager mon lien
                </a>
              </div>

              <p style="margin:24px 0 0 0;font-size:14px;opacity:0.85;">
                On a hâte de collaborer avec toi — ton style apporte quelque chose d'important à Afroé.<br/><br/>
                — L'équipe Afroé 🖤
              </p>

            </td>
          </tr>
        </table>

        <!-- Footer -->
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin-top:16px;">
          <tr>
            <td style="font-size:11px;color:#666;text-align:center;line-height:1.6;padding:0 20px;">
              Invitation exclusive Afroé Creator Test Day<br/>
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

## 📧 Email #5A - Collaboration Validée + Contest

**Template ID:** 113
**Sujet:** Bienvenue dans le cercle créateur Afroé ✨ (+ toujours en course pour les 3 500 €)
**Timing:** Après validation manuelle
**Segment:** `ROLE == "influencer" AND status == "approved"`

### Version Texte

```
Bonjour {{ contact.FIRSTNAME | default:"créateur·rice" }},

Félicitations 🎉

Nous validons ta candidature comme Créateur·rice Afroé.
Tu auras accès à nos campagnes, events, collaborations et contenus officiels.

👉 Dans quelques jours, tu recevras :

• ton code promo Afroé
• les guidelines de collaboration
• ton accès au Creator Hub

Et évidemment, tu restes 100 % en compétition dans le Referral Contest :

💰 3 500 € cash
📱 l'iPhone 17 Pro

Ton lien à partager : {{ contact.REF_LINK }}

Bravo — ton univers compte pour Afroé.

— L'équipe Afroé 🖤
```

### Version HTML

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Collaboration Afroé Validée</title>
</head>
<body style="margin:0;padding:0;background-color:#0b0b10;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#f7f7ff;">
  <table width="100%" cellspacing="0" cellpadding="0" style="background-color:#0b0b10;padding:24px 0;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0"
               style="max-width:560px;background:radial-gradient(circle at top,#4c35ff 0,#0b0b10 60%);
                      border-radius:16px;padding:24px 22px 28px 22px;color:#f7f7ff;">

          <!-- Header -->
          <tr>
            <td align="center" style="padding-bottom:20px;">
              <div style="font-size:40px;margin-bottom:8px;">🎉</div>
              <div style="font-size:24px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#ffd966;">
                AFROÉ
              </div>
              <div style="font-size:12px;opacity:0.8;margin-top:6px;">
                Creator Circle
              </div>
            </td>
          </tr>

          <tr>
            <td style="font-size:15px;line-height:1.65;">

              <p style="margin:0 0 14px 0;font-size:16px;">
                Bonjour <strong>{{ contact.FIRSTNAME | default:"créateur·rice" }}</strong>,
              </p>

              <p style="margin:0 0 14px 0;font-size:17px;font-weight:600;color:#ffd966;">
                Félicitations ! 🎉
              </p>

              <p style="margin:0 0 14px 0;">
                Nous validons ta candidature comme <strong>Créateur·rice Afroé</strong>.<br/>
                Tu auras accès à nos campagnes, events, collaborations et contenus officiels.
              </p>

              <!-- Prochaines étapes -->
              <div style="background:rgba(255,255,255,0.05);border-left:3px solid #ffd966;padding:14px;margin:18px 0;border-radius:4px;">
                <p style="margin:0 0 10px 0;font-weight:600;">👉 Dans quelques jours, tu recevras :</p>
                <ul style="margin:0;padding-left:20px;line-height:1.8;font-size:14px;">
                  <li>Ton code promo Afroé</li>
                  <li>Les guidelines de collaboration</li>
                  <li>Ton accès au Creator Hub</li>
                </ul>
              </div>

              <!-- Contest Reminder -->
              <div style="background:rgba(255,217,102,0.1);border-radius:8px;padding:16px;margin:20px 0;">
                <p style="margin:0 0 10px 0;font-weight:700;font-size:16px;color:#ffd966;">🏆 Tu restes en course pour le Referral Contest !</p>
                <p style="margin:0 0 8px 0;font-size:14px;">
                  Continue de partager ton lien pour gagner :
                </p>
                <p style="margin:0;font-size:15px;line-height:1.6;">
                  💰 <strong>3 500 € cash</strong><br/>
                  📱 <strong>iPhone 17 Pro</strong>
                </p>
              </div>

              <!-- CTA Button -->
              <div style="text-align:center;margin:24px 0;">
                <a href="{{ contact.REF_LINK }}"
                   style="display:inline-block;padding:12px 24px;border-radius:999px;
                          background:#ffd966;color:#0b0b10;font-weight:700;font-size:15px;
                          text-decoration:none;box-shadow:0 4px 12px rgba(255,217,102,0.3);">
                  Partager mon lien
                </a>
              </div>

              <p style="margin:24px 0 0 0;font-size:14px;opacity:0.85;line-height:1.6;">
                Bravo — ton univers compte pour Afroé.<br/><br/>
                — L'équipe Afroé 🖤
              </p>

            </td>
          </tr>
        </table>

        <!-- Footer -->
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin-top:16px;">
          <tr>
            <td style="font-size:11px;color:#666;text-align:center;line-height:1.6;padding:0 20px;">
              Bienvenue dans le cercle créateur Afroé !<br/>
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

## 📧 Email #5B - Refus Doux + Contest (Reste Éligible)

**Template ID:** 114
**Sujet:** Merci pour ton intérêt ✨ (et tu restes en course pour 3 500 €)
**Timing:** Après analyse portfolio (refus)
**Segment:** `ROLE == "influencer" AND status == "declined"`

### Version Texte

```
Bonjour {{ contact.FIRSTNAME | default:"créateur·rice" }},

Merci pour ton portfolio.
Après analyse, ton univers ne correspond pas encore complètement à l'identité Afroé pour les collaborations créateurs.

Mais ce n'est pas un non définitif — ton style peut évoluer, et nous reviendrons vers toi si une campagne correspond à ton profil.

Et surtout :

✔️ Tu restes officiellement dans le Referral Contest
✔️ Tu peux toujours gagner 3 500 € ou l'iPhone 17 Pro

Ton lien : {{ contact.REF_LINK }}

Continue de partager ton lien — le classement compte toujours, et les récompenses sont bien réelles.

Merci pour ton travail et ton énergie.

— L'équipe Afroé 🖤
```

### Version HTML

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Merci pour ton intérêt</title>
</head>
<body style="margin:0;padding:0;background-color:#0b0b10;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#f7f7ff;">
  <table width="100%" cellspacing="0" cellpadding="0" style="background-color:#0b0b10;padding:24px 0;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0"
               style="max-width:560px;background:linear-gradient(145deg,#0b0b10 0,#251b4d 40%,#0b0b10 100%);
                      border-radius:16px;padding:24px 22px 28px 22px;color:#f7f7ff;">

          <!-- Header -->
          <tr>
            <td align="center" style="padding-bottom:18px;">
              <div style="font-size:22px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#ffd966;">
                AFROÉ
              </div>
              <div style="font-size:11px;opacity:0.8;margin-top:4px;">
                Merci pour ton intérêt
              </div>
            </td>
          </tr>

          <tr>
            <td style="font-size:15px;line-height:1.65;">

              <p style="margin:0 0 14px 0;">
                Bonjour <strong>{{ contact.FIRSTNAME | default:"créateur·rice" }}</strong>,
              </p>

              <p style="margin:0 0 14px 0;">
                Merci pour ton portfolio et ton inscription.
              </p>

              <p style="margin:0 0 14px 0;">
                Après analyse, ton univers ne correspond pas encore complètement à l'identité Afroé pour les collaborations créateurs en ce moment.
              </p>

              <p style="margin:0 0 14px 0;font-size:14px;opacity:0.9;">
                Ce n'est <strong>pas un non définitif</strong> — ton style peut évoluer, et nous reviendrons vers toi si une campagne future correspond mieux à ton profil.
              </p>

              <hr style="border:none;border-top:1px solid rgba(255,255,255,0.15);margin:24px 0;" />

              <!-- Contest Reminder -->
              <div style="background:rgba(255,217,102,0.1);border-radius:8px;padding:16px;margin:20px 0;">
                <p style="margin:0 0 10px 0;font-weight:700;font-size:16px;color:#ffd966;">✨ La bonne nouvelle :</p>
                <p style="margin:0 0 12px 0;font-size:14px;">
                  Tu restes <strong>100% éligible</strong> au Referral Contest !
                </p>
                <p style="margin:0;font-size:15px;line-height:1.6;">
                  💰 <strong>3 500 € cash</strong><br/>
                  📱 <strong>iPhone 17 Pro</strong>
                </p>
              </div>

              <p style="margin:16px 0 10px 0;font-size:14px;">
                Continue de partager ton lien — le classement compte toujours, et les récompenses sont bien réelles.
              </p>

              <!-- CTA Button -->
              <div style="text-align:center;margin:24px 0;">
                <a href="{{ contact.REF_LINK }}"
                   style="display:inline-block;padding:12px 24px;border-radius:999px;
                          background:#ffd966;color:#0b0b10;font-weight:700;font-size:15px;
                          text-decoration:none;box-shadow:0 4px 12px rgba(255,217,102,0.3);">
                  Mon lien de parrainage
                </a>
              </div>

              <p style="margin:24px 0 0 0;font-size:14px;opacity:0.85;">
                Merci pour ton travail et ton énergie.<br/><br/>
                — L'équipe Afroé 🖤
              </p>

            </td>
          </tr>
        </table>

        <!-- Footer -->
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin-top:16px;">
          <tr>
            <td style="font-size:11px;color:#666;text-align:center;line-height:1.6;padding:0 20px;">
              Tu restes dans le Referral Contest Afroé<br/>
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

## 🔧 Configuration des Template IDs dans Brevo

### Nouveaux Templates à Créer

| ID | Nom | Timing | Cible |
|----|-----|--------|-------|
| **110** | Follow-up Influencer Collaboration | T+24-48h | ROLE == "influencer" |
| **111** | Progression Classement Influencer | T+3-7j | ROLE == "influencer" + POINTS augmente |
| **112** | Invitation Creator Test Day | Validation manuelle | ROLE == "influencer" + portfolio validé |
| **113** | Collaboration Validée | Validation manuelle | ROLE == "influencer" + approved |
| **114** | Refus Doux + Contest | Validation manuelle | ROLE == "influencer" + declined |

---

## ✅ Checklist d'Implémentation

### Dans Brevo
- [ ] Créer template #110 (Follow-up Collaboration)
- [ ] Créer template #111 (Progression + Contest)
- [ ] Créer template #112 (Invitation Test Day)
- [ ] Créer template #113 (Collaboration Validée)
- [ ] Créer template #114 (Refus Doux)
- [ ] Configurer workflow automation pour chaque template
- [ ] Tester avec contact test `ROLE = "influencer"`

### Dans le Code
- [ ] Ajouter les nouveaux template IDs dans `brevo-types.ts`
- [ ] Créer les fonctions d'envoi dans `automation-service.ts`
- [ ] Configurer les triggers appropriés
- [ ] Tester le build

---

## 🎯 Résultat Final

✅ **Séquence complète influenceur** (5 emails)
✅ **Referral Contest mentionné** dans tous les emails pertinents
✅ **3 500€ / iPhone 17 Pro** rappelé systématiquement
✅ **Design premium** aligné avec Afroé
✅ **Ton street chic** + professionnel
✅ **Templates HTML responsive** prêts pour Brevo

**La séquence influenceur est prête à déployer ! 🚀✨**
