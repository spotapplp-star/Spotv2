export const COLORS = {
  navy: '#0D1B3E',
  yellow: '#F5C542',
  gold: '#C8A84B',
  beige: '#EDE8DF',
  beigeDark: '#E5DFD4',
  white: '#FFFFFF',
  textMain: '#111111',
  textSub: '#888888',
  textMuted: '#BBBBBB',
  red: '#FF4455',
  bgProfile: '#F2EDE4',
};

export const FONTS = {
  regular: { fontWeight: '500' as const },
  semiBold: { fontWeight: '600' as const },
  bold: { fontWeight: '700' as const },
  extraBold: { fontWeight: '800' as const },
  black: { fontWeight: '900' as const },
};

export const SIZES = {
  labelXs: 9,
  labelSm: 10,
  sub: 11,
  caption: 12,
  body: 13,
  bodyLg: 14,
  title: 17,
  titleLg: 20,
  hero: 22,
  heroLg: 28,
};

export const RADIUS = {
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  full: 50,
};

export const SHADOWS = {
  light: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 3,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 5,
  },
};

export const ACTIVITIES = [
  {
    id: '0', name: "The Game - Escape Room", arrondissement: "11e", address: "17 Rue de la Roquette, Paris",
    lat: 48.8542, lng: 2.3712, category: "Aventure", price: "28\u20ac/pers", priceUnit: 28, duration: "1h30",
    rating: 4.8, xp: 150, tags: ["Escape Game", "Groupe", "Immersif"],
    description: "L'escape game le mieux note de Paris. Scenarios inedits dans une ambiance immersive totale.",
    image: "https://images.unsplash.com/photo-1509909756405-be0199881695?w=600&q=80",
    schedule: [{ day: "Lun-Ven", hours: "14h-23h" }, { day: "Sam-Dim", hours: "10h-23h" }],
  },
  {
    id: '1', name: "Diner dans le Noir", arrondissement: "9e", address: "51 Rue Quincampoix, Paris",
    lat: 48.8749, lng: 2.3395, category: "Immersif", price: "55\u20ac/pers", priceUnit: 55, duration: "2h30",
    rating: 4.7, xp: 180, tags: ["Gastronomie", "Immersif", "Romantique"],
    description: "Un repas gastronomique en pleine obscurite totale. Tous vos sens en eveil.",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80",
    schedule: [{ day: "Mar-Dim", hours: "19h-23h" }, { day: "Lundi", hours: "Ferme", closed: true }],
  },
  {
    id: '2', name: "Atelier des Lumieres", arrondissement: "11e", address: "38 Rue Saint-Maur, Paris",
    lat: 48.8608, lng: 2.3794, category: "Culturel", price: "16\u20ac/pers", priceUnit: 16, duration: "1h30",
    rating: 4.6, xp: 130, tags: ["Art numerique", "Culturel", "Solo ok"],
    description: "Musee d'art numerique immersif installe dans une ancienne fonderie du XIXe siecle.",
    image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=600&q=80",
    schedule: [{ day: "Lun-Jeu", hours: "10h-18h" }, { day: "Ven-Dim", hours: "10h-22h" }],
  },
  {
    id: '3', name: "Le Perchoir Menilmontant", arrondissement: "11e", address: "14 Rue Crespin du Gast, Paris",
    lat: 48.8634, lng: 2.3810, category: "Festif", price: "Entree libre", priceUnit: 0, duration: "Soiree",
    rating: 4.5, xp: 120, tags: ["Rooftop", "Cocktails", "Vue panoramique"],
    description: "Le rooftop parisien par excellence. Vue 360 sur Paris, cocktails signatures et DJ set.",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80",
    schedule: [{ day: "Mar-Dim", hours: "18h-2h" }, { day: "Lundi", hours: "Ferme", closed: true }],
  },
  {
    id: '4', name: "Kayak Canal Saint-Martin", arrondissement: "10e", address: "Canal Saint-Martin, Paris",
    lat: 48.8760, lng: 2.3640, category: "Plein air", price: "22\u20ac/pers", priceUnit: 22, duration: "1h",
    rating: 4.8, xp: 160, tags: ["Sport", "Plein air", "Ete"],
    description: "Decouvrez Paris depuis l'eau en kayak sur le Canal Saint-Martin.",
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&q=80",
    schedule: [{ day: "Avr-Oct", hours: "9h-19h" }, { day: "Nov-Mars", hours: "Ferme", closed: true }],
  },
  {
    id: '5', name: "Block Out Escalade", arrondissement: "19e", address: "9 Rue Neuve Tolbiac, Paris",
    lat: 48.8826, lng: 2.3802, category: "Sport", price: "19\u20ac/pers", priceUnit: 19, duration: "2h",
    rating: 4.7, xp: 150, tags: ["Escalade", "Sport", "Debutant ok"],
    description: "La plus grande salle d'escalade de bloc de Paris. Debutants comme confirmes.",
    image: "https://images.unsplash.com/photo-1522163182402-834f871fd851?w=600&q=80",
    schedule: [{ day: "Lun-Ven", hours: "10h-23h" }, { day: "Sam-Dim", hours: "9h-20h" }],
  },
  {
    id: '6', name: "Cours de Mixologie", arrondissement: "8e", address: "23 Rue du Colisee, Paris",
    lat: 48.8740, lng: 2.3060, category: "Creatif", price: "45\u20ac/pers", priceUnit: 45, duration: "2h",
    rating: 4.8, xp: 190, tags: ["Cocktails", "Cours", "Festif"],
    description: "Apprenez a creer vos propres cocktails avec un bartender professionnel.",
    image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&q=80",
    schedule: [{ day: "Mer-Sam", hours: "18h-22h" }, { day: "Dim-Mar", hours: "Sur resa" }],
  },
];
