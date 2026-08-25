import type { GameRoundResponse } from '../types/game';

export const DEFAULT_ROUNDS_NINOS: GameRoundResponse[] = [
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
  { categoria: "Útiles Escolares", palabra_secreta: "Mochila", palabra_undercover: "Lonchera", comodin: "Libros" },
  { categoria: "Deportes de Pelota", palabra_secreta: "Fútbol", palabra_undercover: "Básquetbol", comodin: "Gol" },
  { categoria: "Deportes Acuáticos", palabra_secreta: "Natación", palabra_undercover: "Surf", comodin: "Piscina" },
  { categoria: "Frutas Dulces", palabra_secreta: "Fresa", palabra_undercover: "Frambuesa", comodin: "Roja" },
  { categoria: "Frutas de Verano", palabra_secreta: "Sandía", palabra_undercover: "Melón", comodin: "Semillas" },
  { categoria: "Cuentos Clásicos", palabra_secreta: "Pinocho", palabra_undercover: "Peter Pan", comodin: "Madera" },
  { categoria: "El Espacio Exterior", palabra_secreta: "La Luna", palabra_undercover: "El Sol", comodin: "Crater" },
  { categoria: "Instrumentos Musicales", palabra_secreta: "Guitarra", palabra_undercover: "Violín", comodin: "Cuerdas" }
];

export const DEFAULT_ROUNDS_ADULTOS: GameRoundResponse[] = [
  { categoria: "Bebidas Calientes", palabra_secreta: "Café", palabra_undercover: "Té", comodin: "Cafeína" },
  { categoria: "Bebidas Alcohólicas", palabra_secreta: "Cerveza", palabra_undercover: "Vino", comodin: "Espuma" },
  { categoria: "Películas de Ciencia Ficción", palabra_secreta: "Matrix", palabra_undercover: "Inception", comodin: "Pastilla" },
  { categoria: "Películas de Culto", palabra_secreta: "Pulp Fiction", palabra_undercover: "Reservoir Dogs", comodin: "Maletín" },
  { categoria: "Series Legendarias", palabra_secreta: "Breaking Bad", palabra_undercover: "Better Call Saul", comodin: "Química" },
  { categoria: "Series de Fantasía", palabra_secreta: "Game of Thrones", palabra_undercover: "Lord of the Rings", comodin: "Dragones" },
  { categoria: "Gastronomía Internacional", palabra_secreta: "Sushi", palabra_undercover: "Ceviche", comodin: "Wasabi" },
  { categoria: "Gastronomía Europea", palabra_secreta: "Paella", palabra_undercover: "Risotto", comodin: "Azafrán" },
  { categoria: "Inventos Tecnológicos", palabra_secreta: "Internet", palabra_undercover: "Smartphone", comodin: "Red" },
  { categoria: "Monumentos de Europa", palabra_secreta: "Torre Eiffel", palabra_undercover: "Big Ben", comodin: "París" },
  { categoria: "Monumentos Antiguos", palabra_secreta: "Coliseo Romano", palabra_undercover: "Pirámides de Egipto", comodin: "Gladiador" },
  { categoria: "Bandas de Rock Británicas", palabra_secreta: "Queen", palabra_undercover: "The Beatles", comodin: "Bohemia" },
  { categoria: "Bandas de Rock Progresivo", palabra_secreta: "Pink Floyd", palabra_undercover: "Led Zeppelin", comodin: "Prisma" },
  { categoria: "Filosofía Griega", palabra_secreta: "Sócrates", palabra_undercover: "Platón", comodin: "Cicuta" },
  { categoria: "Mitología Griega", palabra_secreta: "Minotauro", palabra_undercover: "Centauro", comodin: "Laberinto" },
  { categoria: "Guerra de Troya", palabra_secreta: "Caballo de Troya", palabra_undercover: "Aquiles", comodin: "Engaño" },
  { categoria: "Videojuegos de Aventura", palabra_secreta: "The Legend of Zelda", palabra_undercover: "Elden Ring", comodin: "Trifuerza" },
  { categoria: "Videojuegos Populares", palabra_secreta: "Minecraft", palabra_undercover: "Roblox", comodin: "Bloques" },
  { categoria: "Redes Sociales", palabra_secreta: "Instagram", palabra_undercover: "TikTok", comodin: "Fotos" }
];

export function getRandomFallbackRound(
  difficulty: string = "Niños",
  customCategory: string = "",
  playedWords: string[] = []
): GameRoundResponse {
  let pool = difficulty.toLowerCase().includes("niñ") || difficulty.toLowerCase().includes("kid")
    ? [...DEFAULT_ROUNDS_NINOS]
    : [...DEFAULT_ROUNDS_ADULTOS];

  if (customCategory.trim()) {
    const matching = pool.filter(r => r.categoria.toLowerCase().includes(customCategory.toLowerCase()));
    if (matching.length > 0) {
      pool = matching;
    }
  }

  const unplayed = pool.filter(r => !playedWords.includes(r.palabra_secreta));
  const finalPool = unplayed.length > 0 ? unplayed : pool;

  const item = finalPool[Math.floor(Math.random() * finalPool.length)];
  if (customCategory.trim() && !item.categoria.toLowerCase().includes(customCategory.toLowerCase())) {
    return {
      categoria: customCategory.trim(),
      palabra_secreta: item.palabra_secreta,
      palabra_undercover: item.palabra_undercover || item.palabra_secreta,
      comodin: item.comodin
    };
  }
  return item;
}
