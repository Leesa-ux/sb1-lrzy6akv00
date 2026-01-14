export const REWARDS_CONFIG = {
  headline:
    'Le/La #1 du classement remporte 3 500 €. Des récompenses sont débloquées à chaque étape.',
  tiers: [
    {
      name: 'Glow Starters',
      points: 10,
      condition: '2 parrainages validés',
      perks: [
        'Badge Glow Starter officiel',
        'Mise en avant dans le classement waitlist',
        '-10% sur la première réservation',
      ],
    },
    {
      name: 'Glow Circle Insiders',
      points: 50,
      perks: [
        'Accès VIP à la bêta Afroé',
        'Shoutout IG (Glow Ambassadors)',
        'Invitation au Glow Circle privé',
        '-20% sur la première réservation',
      ],
    },
    {
      name: 'Glow Icons',
      points: 100,
      perks: [
        'Glow Kit édition limitée',
        '1h stratégie ou coaching image',
        '-20% sur la première réservation',
      ],
    },
    {
      name: 'Glow Elites',
      points: 200,
      perks: [
        "Invitation à l'événement IRL (Paris/Londres)",
        'Feature presse/blog/podcast Afroé',
        'Co-création Glow Story',
        'Coaching beauty/brand strategist',
        '-50% sur la première réservation',
      ],
    },
  ],
  grandPrize: {
    iphone: 'iPhone 17 Pro pour le rang #1 au lancement',
    cashDraw: { amount: 3500, condition: 'Tirage au sort parmi tous les participants avec 100 pts ou plus' }
  },
  rules: {
    influencerMinFollowers: 2000,
    oneAccountPerPerson: true,
    fraudPolicy: 'Fraude = exclusion',
  },
} as const;
