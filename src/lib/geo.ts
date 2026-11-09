export interface City {
  city: string;
  country: string;
  flag: string;
  lat: number;
  lon: number;
}

export const CITIES: City[] = [
  { city: "Tunis", country: "Tunisie", flag: "🇹🇳", lat: 36.8, lon: 10.18 },
  { city: "Sfax", country: "Tunisie", flag: "🇹🇳", lat: 34.74, lon: 10.76 },
  { city: "Sousse", country: "Tunisie", flag: "🇹🇳", lat: 35.83, lon: 10.64 },
  { city: "Bizerte", country: "Tunisie", flag: "🇹🇳", lat: 37.27, lon: 9.87 },
  { city: "Gabès", country: "Tunisie", flag: "🇹🇳", lat: 33.88, lon: 10.1 },
  { city: "Zarzis", country: "Tunisie", flag: "🇹🇳", lat: 33.5, lon: 11.1 },
  { city: "Ben Arous", country: "Tunisie", flag: "🇹🇳", lat: 36.75, lon: 10.23 },
  { city: "Paris", country: "France", flag: "🇫🇷", lat: 48.86, lon: 2.35 },
  { city: "Lyon", country: "France", flag: "🇫🇷", lat: 45.76, lon: 4.84 },
  { city: "Marseille", country: "France", flag: "🇫🇷", lat: 43.3, lon: 5.37 },
  { city: "Milan", country: "Italie", flag: "🇮🇹", lat: 45.46, lon: 9.19 },
  { city: "Rome", country: "Italie", flag: "🇮🇹", lat: 41.9, lon: 12.5 },
  { city: "Berlin", country: "Allemagne", flag: "🇩🇪", lat: 52.52, lon: 13.4 },
  { city: "Bruxelles", country: "Belgique", flag: "🇧🇪", lat: 50.85, lon: 4.35 },
  { city: "Londres", country: "Royaume-Uni", flag: "🇬🇧", lat: 51.5, lon: -0.12 },
  { city: "Genève", country: "Suisse", flag: "🇨🇭", lat: 46.2, lon: 6.14 },
  { city: "Montréal", country: "Canada", flag: "🇨🇦", lat: 45.5, lon: -73.57 },
  { city: "Doha", country: "Qatar", flag: "🇶🇦", lat: 25.29, lon: 51.53 },
  { city: "Dubaï", country: "Émirats arabes unis", flag: "🇦🇪", lat: 25.2, lon: 55.27 },
  { city: "Riyad", country: "Arabie saoudite", flag: "🇸🇦", lat: 24.7, lon: 46.7 },
  { city: "Tripoli", country: "Libye", flag: "🇱🇾", lat: 32.9, lon: 13.2 },
];

// Poids : plus de supporters depuis la Tunisie, puis la diaspora
export const CITY_WEIGHTS: Record<string, number> = {
  Tunis: 14, Sfax: 4, Sousse: 4, Bizerte: 3, Gabès: 2, Zarzis: 2, "Ben Arous": 3,
  Paris: 6, Lyon: 4, Marseille: 3, Milan: 3, Rome: 2, Berlin: 2, Bruxelles: 2, Londres: 1, Genève: 1,
  Montréal: 2, Doha: 3, Dubaï: 2, Riyad: 1, Tripoli: 1,
};

export function cityInfo(name: string): City | undefined {
  return CITIES.find((c) => c.city === name);
}

export function randomCity(): City {
  const total = Object.values(CITY_WEIGHTS).reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (const c of CITIES) {
    r -= CITY_WEIGHTS[c.city] ?? 1;
    if (r <= 0) return c;
  }
  return CITIES[0];
}

const FIRST = ["Aziz", "Rania", "Hamza", "Nour", "Skander", "Ines", "Mehdi", "Sarra", "Bilel", "Yosr", "Firas", "Amira", "Wassim", "Mariem", "Khalil", "Eya", "Ghassen", "Salma", "Anis", "Chaima"];
const SUFFIX = ["1919", "_Taraji", "_EST", "SangEtOr", "_Virage", "_Ultras", "_Mkachkha", "_DamDahbi", "", "_Bab_Souika"];

export function randomPseudo(): string {
  const f = FIRST[Math.floor(Math.random() * FIRST.length)];
  const s = SUFFIX[Math.floor(Math.random() * SUFFIX.length)];
  return `${f}${s}`;
}

export const CHEERS = ["Allez l'Espérance ! 🔴🟡", "Dima Taraji ❤️💛", "Mkachkha au cœur", "Depuis loin, toujours là", "Sang et or pour la vie", "On y croit !", "Taraji ya dawla", "Bravo les gars 👏", ""];

// Projection équirectangulaire sur la zone Amérique du Nord → Golfe
export const MAP = { lonMin: -80, lonMax: 60, latMin: 15, latMax: 58, w: 340, h: 150 };

export function project(lat: number, lon: number) {
  const x = ((lon - MAP.lonMin) / (MAP.lonMax - MAP.lonMin)) * MAP.w;
  const y = ((MAP.latMax - lat) / (MAP.latMax - MAP.latMin)) * MAP.h;
  return { x, y };
}
