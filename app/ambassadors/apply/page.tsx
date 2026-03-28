"use client";

import * as React from "react";

export default function AmbassadorApplyPage() {
  const [loading, setLoading] = React.useState(false);
  const [sent, setSent] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [form, setForm] = React.useState({
    first_name: "",
    last_name: "",
    email: "",
    platform: "instagram",
    handle: "",
    profile_url: "",
    followers_count: "",
    city: "",
    niche: "other",
    notes: "",
    consent: false,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.consent) return;
    try {
      setLoading(true);
      setError(null);
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, String(v)));
      const res = await fetch("/api/ambassadors/apply", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Erreur lors de l'envoi");
      setSent(true);
    } catch (err: any) {
      setError(err.message || "Erreur inattendue");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center p-8">
        <div className="max-w-xl w-full text-center">
          <div className="text-5xl mb-6">✅</div>
          <h1 className="text-3xl font-bold mb-4">Candidature envoyée !</h1>
          <p className="text-base opacity-70">
            Merci. L'équipe Afroé reviendra vers toi rapidement avec ton contrat.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-10">
          <p className="text-xs tracking-widest text-violet-400 uppercase mb-2">
            Cercle des Ambassadeur·ices
          </p>
          <h1 className="text-3xl font-bold mb-3">Programme Ambassadeur·ice Afroé</h1>
          <p className="text-sm text-white/60 leading-relaxed">
            Rejoins le cercle. Ton influence construit quelque chose avec nous.
            Remplis ce formulaire — notre équipe génère ton contrat de collaboration, tu signes en ligne.
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-white/50 mb-1">Prénom *</label>
              <input
                name="first_name"
                value={form.first_name}
                onChange={handleChange}
                required
                placeholder="Prénom"
                className="w-full rounded-lg p-3 bg-white/10 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-violet-500"
              />
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1">Nom *</label>
              <input
                name="last_name"
                value={form.last_name}
                onChange={handleChange}
                required
                placeholder="Nom"
                className="w-full rounded-lg p-3 bg-white/10 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-violet-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-white/50 mb-1">Email *</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="vous@email.com"
              className="w-full rounded-lg p-3 bg-white/10 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-violet-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-white/50 mb-1">Plateforme *</label>
              <select
                name="platform"
                value={form.platform}
                onChange={handleChange}
                className="w-full rounded-lg p-3 bg-white/10 border border-white/10 text-white focus:outline-none focus:border-violet-500"
              >
                <option value="instagram">Instagram</option>
                <option value="tiktok">TikTok</option>
                <option value="youtube">YouTube</option>
                <option value="other">Autre</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1">Pseudo</label>
              <input
                name="handle"
                value={form.handle}
                onChange={handleChange}
                placeholder="@votrepseudo"
                className="w-full rounded-lg p-3 bg-white/10 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-violet-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-white/50 mb-1">URL du profil *</label>
            <input
              name="profile_url"
              value={form.profile_url}
              onChange={handleChange}
              required
              placeholder="https://instagram.com/..."
              className="w-full rounded-lg p-3 bg-white/10 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-violet-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-white/50 mb-1">Nombre d'abonnés *</label>
              <input
                name="followers_count"
                type="number"
                value={form.followers_count}
                onChange={handleChange}
                required
                placeholder="2000"
                className="w-full rounded-lg p-3 bg-white/10 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-violet-500"
              />
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1">Niche</label>
              <select
                name="niche"
                value={form.niche}
                onChange={handleChange}
                className="w-full rounded-lg p-3 bg-white/10 border border-white/10 text-white focus:outline-none focus:border-violet-500"
              >
                <option value="hair">Cheveux</option>
                <option value="nails">Ongles</option>
                <option value="skincare">Soins de la peau</option>
                <option value="lifestyle">Style de vie</option>
                <option value="other">Autre</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs text-white/50 mb-1">Ville</label>
            <input
              name="city"
              value={form.city}
              onChange={handleChange}
              placeholder="Bruxelles / Anvers / ..."
              className="w-full rounded-lg p-3 bg-white/10 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-violet-500"
            />
          </div>

          <div>
            <label className="block text-xs text-white/50 mb-1">Notes</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={4}
              placeholder="Parlez-nous de votre activité, votre audience, vos collaborations passées..."
              className="w-full rounded-lg p-3 bg-white/10 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-violet-500 resize-none"
            />
          </div>

          <div className="flex items-start gap-3 pt-2">
            <input
              type="checkbox"
              name="consent"
              checked={form.consent}
              onChange={handleChange}
              className="mt-1 accent-violet-500"
            />
            <p className="text-sm text-white/70">
              J'accepte d'être contacté·e par Afroé concernant ce partenariat ambassadeur.{" "}
              <span className="text-white/40">(Requis)</span>
            </p>
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-500/10 rounded-lg px-4 py-3">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !form.consent}
            className="w-full rounded-lg p-4 bg-violet-600 hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm tracking-widest uppercase transition-colors"
          >
            {loading ? "Envoi en cours..." : "Demander mon contrat Afroé →"}
          </button>
        </form>
      </div>
    </main>
  );
}
