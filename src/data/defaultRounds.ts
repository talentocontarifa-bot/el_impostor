import type { GameRoundResponse } from '../types/game';

export const DEFAULT_ROUNDS_NINOS: GameRoundResponse[] = [
  { categoria: "Historias Bíblicas", palabra_secreta: "Moisés", palabra_undercover: "Noé", comodin: "Mar Rojo" },
  { categoria: "Historias Bíblicas", palabra_secreta: "David", palabra_undercover: "Goliat", comodin: "Honda" },
  { categoria: "Historias Bíblicas", palabra_secreta: "Arca de Noé", palabra_undercover: "Torre de Babel", comodin: "Animales" },
  { categoria: "Historias Bíblicas", palabra_secreta: "Sansón", palabra_undercover: "Salomón", comodin: "Cabello" },
  { categoria: "Mascotas y Animales", palabra_secreta: "Perro", palabra_undercover: "Gato", comodin: "Ladrido" },
  { categoria: "Animales de la Selva", palabra_secreta: "León", palabra_undercover: "Tigre", comodin: "Melena" },
  { categoria: "Animales Marinos", palabra_secreta: "Delfín", palabra_undercover: "Ballena", comodin: "Aleta" },
  { categoria: "Superhéroes Famosos", palabra_secreta: "Spider-Man", palabra_undercover: "Batman", comodin: "Telaraña" },
  { categoria: "Superhéroes de Marvel", palabra_secreta: "Iron Man", palabra_undercover: "Capitán América", comodin: "Armadura" },
  { categoria: "Comidas Rápidas", palabra_secreta: "Pizza", palabra_undercover: "Hamburguesa", comodin: "Queso" },
  { categoria: "Comida Mexicana", palabra_secreta: "Tacos", palabra_undercover: "Quesadillas", comodin: "Tortilla" },
  { categoria: "Bebidas Dulces", palabra_secreta: "Jugo de Naranja", palabra_undercover: "Limonada", comodin: "Cítrico" },
  { categoria: "Películas Animadas", palabra_secreta: "Toy Story", palabra_undercover: "Monsters Inc", comodin: "Juguetes" },
  { categoria: "Películas de Princesas", palabra_secreta: "Frozen", palabra_undercover: "Enredados", comodin: "Hielo" },
  { categoria: "Películas Divertidas", palabra_secreta: "Shrek", palabra_undercover: "Kung Fu Panda", comodin: "Ogro" },
  { categoria: "Útiles Escolares", palabra_secreta: "Lápiz", palabra_undercover: "Pluma", comodin: "Grafito" },
  { categoria: "Deportes de Pelota", palabra_secreta: "Fútbol", palabra_undercover: "Básquetbol", comodin: "Gol" },
  { categoria: "Deportes Acuáticos", palabra_secreta: "Natación", palabra_undercover: "Surf", comodin: "Piscina" },
  { categoria: "Frutas Dulces", palabra_secreta: "Fresa", palabra_undercover: "Frambuesa", comodin: "Roja" },
  { categoria: "El Espacio Exterior", palabra_secreta: "La Luna", palabra_undercover: "El Sol", comodin: "Crater" }
];

export const DEFAULT_ROUNDS_ADULTOS: GameRoundResponse[] = [
  { categoria: "Personajes de la Biblia", palabra_secreta: "Moisés", palabra_undercover: "Abraham", comodin: "Tablas" },
  { categoria: "Personajes de la Biblia", palabra_secreta: "Rey David", palabra_undercover: "Rey Salomón", comodin: "Salmos" },
  { categoria: "Personajes de la Biblia", palabra_secreta: "Jesús", palabra_undercover: "Juan el Bautista", comodin: "Milagros" },
  { categoria: "Personajes de la Biblia", palabra_secreta: "Sansón", palabra_undercover: "Goliat", comodin: "Fuerza" },
  { categoria: "Bebidas Calientes", palabra_secreta: "Café", palabra_undercover: "Té", comodin: "Cafeína" },
  { categoria: "Bebidas Alcohólicas", palabra_secreta: "Cerveza", palabra_undercover: "Vino", comodin: "Espuma" },
  { categoria: "Películas de Ciencia Ficción", palabra_secreta: "Matrix", palabra_undercover: "Inception", comodin: "Pastilla" },
  { categoria: "Películas de Culto", palabra_secreta: "Pulp Fiction", palabra_undercover: "Reservoir Dogs", comodin: "Maletín" },
  { categoria: "Series Legendarias", palabra_secreta: "Breaking Bad", palabra_undercover: "Better Call Saul", comodin: "Química" },
  { categoria: "Gastronomía Internacional", palabra_secreta: "Sushi", palabra_undercover: "Ceviche", comodin: "Wasabi" },
  { categoria: "Monumentos de Europa", palabra_secreta: "Torre Eiffel", palabra_undercover: "Big Ben", comodin: "París" },
  { categoria: "Bandas de Rock Británicas", palabra_secreta: "Queen", palabra_undercover: "The Beatles", comodin: "Bohemia" },
  { categoria: "Filosofía Griega", palabra_secreta: "Sócrates", palabra_undercover: "Platón", comodin: "Cicuta" },
  { categoria: "Mitología Griega", palabra_secreta: "Minotauro", palabra_undercover: "Centauro", comodin: "Laberinto" },
  { categoria: "Videojuegos Populares", palabra_secreta: "Minecraft", palabra_undercover: "Roblox", comodin: "Bloques" }
];

export function getRandomFallbackRound(
  difficulty: string = "Niños",
  customCategory: string = "",
  playedWords: string[] = []
): GameRoundResponse {
  let pool = difficulty.toLowerCase().includes("niñ")
    ? [...DEFAULT_ROUNDS_NINOS]
    : [...DEFAULT_ROUNDS_ADULTOS];

  if (customCategory.trim()) {
    const q = customCategory.toLowerCase().trim();
    const matching = pool.filter(r => 
      r.categoria.toLowerCase().includes(q) ||
      q.includes(r.categoria.toLowerCase()) ||
      (q.includes("biblia") || q.includes("biblica") || q.includes("biblico") ? r.categoria.toLowerCase().includes("bibl") : false) ||
      (q.includes("marvel") || q.includes("hero") ? r.categoria.toLowerCase().includes("superhéro") : false) ||
      (q.includes("pelic") || q.includes("cine") ? r.categoria.toLowerCase().includes("pelíc") : false) ||
      (q.includes("comid") || q.includes("plat") ? r.categoria.toLowerCase().includes("comid") || r.categoria.toLowerCase().includes("gastr") : false)
    );
    if (matching.length > 0) {
      pool = matching;
    }
  }

  const unplayed = pool.filter(r => !playedWords.includes(r.palabra_secreta));
  const finalPool = unplayed.length > 0 ? unplayed : pool;

  const item = finalPool[Math.floor(Math.random() * finalPool.length)];
  return {
    categoria: item.categoria,
    palabra_secreta: item.palabra_secreta,
    palabra_undercover: item.palabra_undercover || item.palabra_secreta,
    comodin: item.comodin
  };
}
