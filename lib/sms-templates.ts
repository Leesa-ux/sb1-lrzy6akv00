export type SMSType =
  | "otp"
  | "welcome"
  | "followup_1h"
  | "activation_48h"
  | "milestone"
  | "glow_elite"
  | "reminder_5d"
  | "launch_day"
  | "welcome_beauty_pro"
  | "activation_pro_irl"
  | "welcome_with_glow_link";

export type Role = "client" | "influencer" | "pro";

interface SMSVariables {
  code?: string;
  ttl?: number;
  refLink?: string;
  myGlowLink?: string;
  firstName?: string;
  milestone?: number;
  points?: number;
  rank?: number;
}

export const SMS_TEMPLATES: Record<
  SMSType,
  string | ((vars: SMSVariables) => string) | Record<Role, string | ((vars: SMSVariables) => string)>
> = {
  otp: (vars: SMSVariables) =>
    `Afroe: ton code de vérification est ${vars.code}. Valable ${Math.floor((vars.ttl || 120) / 60)} min.`,

  welcome: {
    client: (vars: SMSVariables) =>
      `Afroé ✨ Bienvenue sur la Glow List !\nClient = +5 pts · Influenceur ≥2k = +15 pts · Pro = +25 pts (après vérification).\nÀ 10 pts : badge + mise en avant + -10%.\nTon lien : ${vars.refLink}`,

    influencer: (vars: SMSVariables) =>
      `Afroé ✨ Bienvenue sur la Glow List !\nClient = +5 pts · Influenceur ≥2k = +15 pts · Pro = +25 pts (après vérification).\nVise 50–100 pts pour les rewards + Jackpot 2 000 €.\nTon lien : ${vars.refLink}`,

    pro: (vars: SMSVariables) =>
      `Afroé ✨ Bienvenue Beauty Pro !\nPro = +25 pts · Client = +5 pts · Influenceur ≥2k = +15 pts (après vérification).\nÀ 100 pts : Glow Kit + 1h coaching + Jackpot 2 000 €.\nTon lien : ${vars.refLink}`,
  },

  followup_1h: `Hey ! N'oublie pas de partager ton lien Afroé pour gagner des points et monter dans le classement ! 🚀`,

  activation_48h: `Tu n'as pas encore partagé ton lien Afroé ? Partage-le maintenant et commence à gagner des points ! 💎`,

  milestone: (vars: SMSVariables) =>
    `🎉 Bravo ! Tu as atteint le palier ${vars.milestone} points sur Afroé ! Continue comme ça pour débloquer encore plus de récompenses !`,

  glow_elite: `🌟 FÉLICITATIONS ! Tu as atteint le palier Glow Elite (200 pts) ! Des récompenses exclusives t'attendent ! Continue de partager ton lien Afroé !`,

  reminder_5d: `Hey ! Le classement Afroé bouge vite ! Partage ton lien pour ne pas te faire dépasser ! 🔥`,

  launch_day: `🚀 C'est le JOUR J ! Afroé est lancée ! Tous les points gagnés aujourd'hui sont DOUBLÉS ! Partage ton lien maintenant ! 🔥`,

  welcome_with_glow_link: {
    client: (vars: SMSVariables) =>
      `Afroé ✨ Merci ${vars.firstName || ""}! Tu es sur la Glow List 🎉\nRetrouve ton lien perso ici : ${vars.myGlowLink}\n(Partage-le et grimpe dans le classement !)`,

    influencer: (vars: SMSVariables) =>
      `Afroé ✨ Merci ${vars.firstName || ""}! Tu es sur la Glow List 🎉\nRetrouve ton lien perso ici : ${vars.myGlowLink}\n(Vise 50–100 pts pour le Jackpot 2 000 € !)`,

    pro: (vars: SMSVariables) =>
      `Afroé ✨ Merci ${vars.firstName || ""} Beauty Pro ! Tu es sur la Glow List 🎉\nRetrouve ton lien perso ici : ${vars.myGlowLink}\n(À 100 pts : Glow Kit + coaching !)`,
  },

  welcome_beauty_pro: (vars: SMSVariables) =>
    `Afroé ✨ Bienvenue Beauty Pro !\nRetrouve ta page Glow : ${vars.myGlowLink || vars.refLink}\nProchaine étape : envoie ton portfolio à pro@afroe.com`,

  activation_pro_irl: `Afroé 💼 Ton profil Beauty Pro est en revue !\nProchaine étape : test IRL (Bruxelles/Anvers/Paris).\nComplète ton portfolio → pro@afroe.com\n99€/mois · 0% commission 2 mois`,
};

export function getSMSTemplate(
  type: SMSType,
  role?: Role,
  vars: SMSVariables = {}
): string {
  const template = SMS_TEMPLATES[type];

  if (typeof template === "string") {
    return template;
  }

  if (typeof template === "function") {
    return template(vars);
  }

  if (role && typeof template === "object" && role in template) {
    const roleTemplate = template[role];
    if (typeof roleTemplate === "function") {
      return roleTemplate(vars);
    }
    return roleTemplate;
  }

  return "";
}
