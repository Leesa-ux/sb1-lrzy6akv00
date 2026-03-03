"use client";

import { useState } from "react";
import { ArrowRight, FileText, Shield, GraduationCap, Sparkles } from "lucide-react";
import Image from "next/image";
import { ProApplicationMultiStepForm } from "@/src/components/pro/ProApplicationMultiStepForm";

export default function BeautyProApplyPage() {
  const [showForm, setShowForm] = useState(false);

  if (showForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-100">
        <header className="border-b bg-white/80 backdrop-blur-sm">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
                  Afroé PRO
                </h1>
                <p className="mt-1 text-sm text-neutral-600">
                  Rejoignez notre réseau de professionnels de la beauté
                </p>
              </div>
              <button
                onClick={() => setShowForm(false)}
                className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
              >
                ← Retour
              </button>
            </div>
          </div>
        </header>

        <main className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
                Devenez Professionnel Afroé
              </h2>
              <p className="mt-4 text-lg text-neutral-600 max-w-2xl mx-auto">
                Complétez ce formulaire en 3 étapes pour rejoindre notre plateforme.
                Nous recherchons des professionnels passionnés et qualifiés dans les domaines
                de la coiffure, l'esthétique, la manucure et le maquillage.
              </p>
            </div>

            <div className="mb-12 grid gap-6 md:grid-cols-3">
              <div className="rounded-xl border bg-white p-6 shadow-sm">
                <div className="mb-3 inline-flex rounded-lg bg-neutral-100 p-3">
                  <FileText className="h-6 w-6 text-neutral-900" />
                </div>
                <h3 className="font-semibold text-neutral-900">Dashboard Intégré</h3>
                <p className="mt-2 text-sm text-neutral-600">
                  Gérez votre compta et TVA en un clic
                </p>
              </div>

              <div className="rounded-xl border bg-white p-6 shadow-sm">
                <div className="mb-3 inline-flex rounded-lg bg-neutral-100 p-3">
                  <Shield className="h-6 w-6 text-neutral-900" />
                </div>
                <h3 className="font-semibold text-neutral-900">Support Juridique</h3>
                <p className="mt-2 text-sm text-neutral-600">
                  Développez votre business en toute sécurité
                </p>
              </div>

              <div className="rounded-xl border bg-white p-6 shadow-sm">
                <div className="mb-3 inline-flex rounded-lg bg-neutral-100 p-3">
                  <GraduationCap className="h-6 w-6 text-neutral-900" />
                </div>
                <h3 className="font-semibold text-neutral-900">Formations Academy</h3>
                <p className="mt-2 text-sm text-neutral-600">
                  Maîtrisez l'accueil de luxe et les nouvelles techniques
                </p>
              </div>
            </div>

            <ProApplicationMultiStepForm />

            <div className="mt-8 rounded-lg border bg-neutral-50 p-6 text-center">
              <p className="text-sm text-neutral-600">
                <span className="font-medium text-neutral-900">Confidentialité garantie.</span>{" "}
                Vos données sont traitées de manière sécurisée et confidentielle.
                Nous vous contacterons sous 48-72h après examen de votre candidature.
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-5 flex items-center justify-between">
          <div className="text-2xl font-light tracking-tight text-neutral-900">
            Afroé
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-2.5 bg-violet-600 text-white text-sm font-medium rounded-full hover:bg-violet-700 transition-colors"
          >
            Postuler maintenant
          </button>
        </div>
      </header>

      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/lucid_origin_hero_crew_beaut_afro__domicile_ultradetailed_edit_2.jpg"
            alt="Professionnels de la beauté en action"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50" />
        </div>

        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-light text-white mb-8 tracking-tight leading-tight">
            Rejoignez le réseau d'élite
            <br />
            <span className="font-normal">de la beauté Afro</span>
          </h1>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-neutral-900 text-base font-medium rounded-full hover:bg-neutral-100 transition-all hover:scale-105"
          >
            Postuler maintenant
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        <div className="absolute bottom-12 left-0 right-0 text-center">
          <div className="text-white/80 text-sm font-light uppercase tracking-widest mb-3">
            Partenaires de confiance
          </div>
        </div>
      </section>

      <section className="py-32 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <p className="text-sm uppercase tracking-widest text-neutral-500 mb-4">
              Les Avantages
            </p>
            <h2 className="text-4xl md:text-5xl font-light text-neutral-900 mb-6">
              Devenir un <span className="font-normal">Afroé Pro</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-12 lg:gap-16">
            <div className="text-center">
              <div className="mb-6 flex justify-center">
                <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center">
                  <FileText className="w-7 h-7 text-neutral-900" />
                </div>
              </div>
              <h3 className="text-xl font-medium text-neutral-900 mb-4">
                Dashboard Intégré
              </h3>
              <p className="text-neutral-600 leading-relaxed">
                Gérez votre compta et TVA en un clic. Tous vos outils administratifs centralisés sur une plateforme intuitive.
              </p>
            </div>

            <div className="text-center">
              <div className="mb-6 flex justify-center">
                <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center">
                  <Shield className="w-7 h-7 text-neutral-900" />
                </div>
              </div>
              <h3 className="text-xl font-medium text-neutral-900 mb-4">
                Support Juridique
              </h3>
              <p className="text-neutral-600 leading-relaxed">
                Développez votre business en toute sécurité avec l'accompagnement de nos experts juridiques et fiscaux.
              </p>
            </div>

            <div className="text-center">
              <div className="mb-6 flex justify-center">
                <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center">
                  <GraduationCap className="w-7 h-7 text-neutral-900" />
                </div>
              </div>
              <h3 className="text-xl font-medium text-neutral-900 mb-4">
                Formations Academy
              </h3>
              <p className="text-neutral-600 leading-relaxed">
                Maîtrisez l'accueil de luxe et les nouvelles techniques. Formation continue pour exceller dans votre art.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-32 px-6 bg-neutral-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <p className="text-sm uppercase tracking-widest text-neutral-500 mb-4">
              Le Processus
            </p>
            <h2 className="text-4xl md:text-5xl font-light text-neutral-900">
              Comment devenir <span className="font-normal">Afroé Pro</span>
            </h2>
          </div>

          <div className="space-y-24">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1">
                <div className="text-7xl font-light text-neutral-200 mb-4">01</div>
                <h3 className="text-3xl font-medium text-neutral-900 mb-6">
                  Candidature Digitale
                </h3>
                <p className="text-lg text-neutral-600 leading-relaxed mb-8">
                  Remplissez votre questionnaire en ligne et soumettez votre portfolio.
                  Un processus simple et rapide qui met en valeur votre talent et votre expérience.
                </p>
                <button
                  onClick={() => setShowForm(true)}
                  className="inline-flex items-center gap-2 text-violet-600 font-medium hover:gap-3 transition-all"
                >
                  Commencer ma candidature
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              <div className="order-1 md:order-2">
                <div className="aspect-[4/3] bg-neutral-200 rounded-2xl overflow-hidden">
                  <Image
                    src="/images/lucid_origin_hero_crew_beaut_afro__domicile_ultradetailed_edit_3.jpg"
                    alt="Candidature digitale"
                    width={800}
                    height={600}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="aspect-[4/3] bg-neutral-200 rounded-2xl overflow-hidden">
                  <Image
                    src="/images/Lucid_Origin_Core_Description_for_all_versionsA_cinematic_phot_1.jpg"
                    alt="Entretien de vision"
                    width={800}
                    height={600}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div>
                <div className="text-7xl font-light text-neutral-200 mb-4">02</div>
                <h3 className="text-3xl font-medium text-neutral-900 mb-6">
                  Entretien de Vision
                </h3>
                <p className="text-lg text-neutral-600 leading-relaxed">
                  Un échange de 20 minutes en visioconférence pour discuter de votre vision,
                  vos aspirations et comment Afroé peut vous aider à atteindre vos objectifs professionnels.
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1">
                <div className="text-7xl font-light text-neutral-200 mb-4">03</div>
                <h3 className="text-3xl font-medium text-neutral-900 mb-6">
                  Session Technique
                </h3>
                <p className="text-lg text-neutral-600 leading-relaxed">
                  Démontrez votre talent lors d'une session en conditions réelles à Bruxelles.
                  Une opportunité de montrer votre savoir-faire technique et votre approche client.
                </p>
              </div>
              <div className="order-1 md:order-2">
                <div className="aspect-[4/3] bg-neutral-200 rounded-2xl overflow-hidden">
                  <Image
                    src="/images/hero-desert-beauty.jpg"
                    alt="Session technique à Bruxelles"
                    width={800}
                    height={600}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-32 px-6 bg-neutral-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <Sparkles className="w-12 h-12 mx-auto mb-8 text-violet-400" />
          <h2 className="text-4xl md:text-5xl font-light mb-6">
            Prêt à rejoindre <span className="font-normal">l'élite</span> ?
          </h2>
          <p className="text-xl text-neutral-400 mb-12 leading-relaxed">
            Faites partie d'un réseau exclusif de professionnels de la beauté Afro
            qui redéfinissent les standards de l'excellence.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-8 py-4 bg-violet-600 text-white text-base font-medium rounded-full hover:bg-violet-700 transition-all hover:scale-105"
          >
            Postuler maintenant
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      <footer className="py-12 px-6 bg-white border-t border-neutral-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-2xl font-light tracking-tight text-neutral-900">
              Afroé
            </div>
            <div className="flex gap-8 text-sm text-neutral-600">
              <a href="/" className="hover:text-neutral-900 transition-colors">
                Accueil
              </a>
              <a href="/reglement" className="hover:text-neutral-900 transition-colors">
                Règlement
              </a>
              <button
                onClick={() => setShowForm(true)}
                className="hover:text-neutral-900 transition-colors"
              >
                Devenir Pro
              </button>
            </div>
          </div>
          <div className="mt-8 text-center text-xs text-neutral-500">
            © 2026 Afroé. Tous droits réservés.
          </div>
        </div>
      </footer>
    </div>
  );
}
