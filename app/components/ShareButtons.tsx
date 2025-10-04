"use client";

import { useState } from "react";
import { Share2, Copy, Check } from "lucide-react";

interface ShareButtonsProps {
  referralLink: string;
  message?: string;
}

export default function ShareButtons({
  referralLink,
  message = "Rejoins Afroé, la plateforme beauté afro qui change le game ! 🔥"
}: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const encodedMessage = encodeURIComponent(message);
  const encodedLink = encodeURIComponent(referralLink);
  const fullMessage = encodeURIComponent(`${message} ${referralLink}`);

  const shareLinks = {
    whatsapp: `https://wa.me/?text=${fullMessage}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedLink}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedLink}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodedMessage}&url=${encodedLink}`,
    sms: `sms:?body=${fullMessage}`,
  };

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      alert("Erreur lors de la copie");
    }
  }

  function shareToInstagram() {
    alert("Instagram ne supporte pas le partage direct de liens. Copie ton lien et partage-le dans ta story ou bio !");
    copyToClipboard();
  }

  function shareToTikTok() {
    alert("TikTok ne supporte pas le partage direct de liens. Copie ton lien et ajoute-le à ta bio ou vidéo !");
    copyToClipboard();
  }

  function shareToSnapchat() {
    alert("Snapchat ne supporte pas le partage direct de liens web. Copie ton lien et partage-le dans ton story !");
    copyToClipboard();
  }

  const socialButtons = [
    { name: "WhatsApp", icon: "💬", color: "from-green-600 to-green-500", action: () => window.open(shareLinks.whatsapp, "_blank") },
    { name: "TikTok", icon: "🎵", color: "from-pink-600 to-cyan-500", action: shareToTikTok },
    { name: "Instagram", icon: "📷", color: "from-purple-600 to-pink-500", action: shareToInstagram },
    { name: "Snapchat", icon: "👻", color: "from-yellow-400 to-yellow-300", action: shareToSnapchat },
    { name: "Facebook", icon: "👍", color: "from-blue-600 to-blue-500", action: () => window.open(shareLinks.facebook, "_blank") },
    { name: "LinkedIn", icon: "💼", color: "from-blue-700 to-blue-600", action: () => window.open(shareLinks.linkedin, "_blank") },
    { name: "SMS", icon: "💬", color: "from-gray-600 to-gray-500", action: () => window.location.href = shareLinks.sms },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 p-3 rounded-xl border border-zinc-800 bg-zinc-900/50">
        <div className="flex-1 overflow-hidden">
          <p className="text-xs text-zinc-400 mb-1">Ton lien de parrainage</p>
          <p className="text-sm text-zinc-200 truncate font-mono">{referralLink}</p>
        </div>
        <button
          onClick={copyToClipboard}
          className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#8E58C7] via-[#1B9AA2] to-[#92D14F] text-black font-semibold text-sm transition-all hover:scale-105"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              Copié !
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              Copier
            </>
          )}
        </button>
      </div>

      <div>
        <p className="text-sm text-zinc-400 mb-3 flex items-center gap-2">
          <Share2 className="w-4 h-4" />
          Partage sur tes réseaux
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {socialButtons.map((btn) => (
            <button
              key={btn.name}
              onClick={btn.action}
              className={`flex flex-col items-center gap-2 p-3 rounded-xl border border-zinc-800 bg-gradient-to-br ${btn.color} hover:scale-105 transition-transform`}
            >
              <span className="text-2xl">{btn.icon}</span>
              <span className="text-xs font-semibold text-white">{btn.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
