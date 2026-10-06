(function () {
  "use strict";

  const STORAGE_KEY = "chileenporcentaje:visited";
  const WISHLIST_STORAGE_KEY = "chileenporcentaje:wishlist";
  const PARK_STORAGE_KEY = "chileenporcentaje:parks-visited";
  const PARK_WISHLIST_STORAGE_KEY = "chileenporcentaje:parks-wishlist";
  const HOME_STORAGE_KEY = "chileenporcentaje:home";
  const THEME_STORAGE_KEY = "chileenporcentaje:theme";
  const SHOW_AIRPORTS_KEY = "chileenporcentaje:show-airports";
  const SHOW_PARKS_KEY = "chileenporcentaje:show-parks";
  const CIRCUMFERENCE = 2 * Math.PI * 52;

  // North-to-south display order for Chile's regions.
  const REGION_ORDER = [15, 1, 2, 3, 4, 5, 13, 6, 7, 16, 8, 9, 14, 10, 11, 12];

  const MAP_COLORS = {
    light: { border: "#f9f3e5", visited: "#52795a", wishlist: "#c9974d", unvisited: "#d9cca8", highlight: "#b3552f" },
    dark: { border: "#1c160f", visited: "#6fa377", wishlist: "#d9a95c", unvisited: "#4a4030", highlight: "#e0916a" },
  };

  // Chile's main commercial airports (IATA code, nearest city, approx. coordinates).
  const AIRPORTS = [
    { iata: "ARI", city: "Arica", lat: -18.3592, lng: -70.3355 },
    { iata: "IQQ", city: "Iquique", lat: -20.5352, lng: -70.1808 },
    { iata: "CJC", city: "Calama", lat: -22.4981, lng: -68.9036 },
    { iata: "ANF", city: "Antofagasta", lat: -23.4445, lng: -70.4451 },
    { iata: "CPO", city: "Copiapó", lat: -27.2611, lng: -70.7789 },
    { iata: "LSC", city: "La Serena", lat: -29.9162, lng: -71.1994 },
    { iata: "SCL", city: "Santiago", lat: -33.393, lng: -70.7858 },
    { iata: "CCP", city: "Concepción", lat: -36.7726, lng: -73.0631 },
    { iata: "ZCO", city: "Temuco", lat: -38.7668, lng: -72.637 },
    { iata: "ZAL", city: "Valdivia", lat: -39.65, lng: -73.086 },
    { iata: "ZOS", city: "Osorno", lat: -40.6111, lng: -73.0603 },
    { iata: "PMC", city: "Puerto Montt", lat: -41.4389, lng: -73.094 },
    { iata: "BBA", city: "Coyhaique/Balmaceda", lat: -45.916, lng: -71.689 },
    { iata: "PUQ", city: "Punta Arenas", lat: -53.0026, lng: -70.8546 },
    { iata: "WPU", city: "Puerto Williams", lat: -54.9331, lng: -67.6262 },
    { iata: "IPC", city: "Isla de Pascua", lat: -27.1648, lng: -109.4219 },
  ];

  // Curated list of well-known touristic comunas across all 16 regions, each tagged with
  // a category (for the "tipos de destino" breakdown) and a rough cost tier (1-3, general
  // approximation only — not a live price; real prices come from the flights link).
  const TOURIST_COMUNAS = [
    { name: "Arica", tag: "Playas y precordillera", cat: "playa", cost: 1 },
    { name: "Putre", tag: "Altiplano y volcanes", cat: "desierto", cost: 2 },
    { name: "Iquique", tag: "Playas y duna", cat: "playa", cost: 1 },
    { name: "Pica", tag: "Oasis y termas", cat: "desierto", cost: 2 },
    { name: "San Pedro de Atacama", tag: "Desierto y salares", cat: "desierto", cost: 3 },
    { name: "Antofagasta", tag: "Costa y La Portada", cat: "playa", cost: 1 },
    { name: "Calama", tag: "Puerta al desierto", cat: "desierto", cost: 1 },
    { name: "Caldera", tag: "Playas Bahía Inglesa", cat: "playa", cost: 1 },
    { name: "Vallenar", tag: "Valle del Huasco", cat: "desierto", cost: 1 },
    { name: "La Serena", tag: "Playas y observatorios", cat: "playa", cost: 1 },
    { name: "Coquimbo", tag: "Puerto y faro", cat: "playa", cost: 1 },
    { name: "Vicuña", tag: "Valle del Elqui", cat: "vino", cost: 2 },
    { name: "Ovalle", tag: "Parque Fray Jorge", cat: "desierto", cost: 1 },
    { name: "Andacollo", tag: "Patrimonio minero", cat: "patrimonio", cost: 1 },
    { name: "Valparaíso", tag: "Patrimonio UNESCO", cat: "patrimonio", cost: 2 },
    { name: "Viña del Mar", tag: "Playas y jardines", cat: "playa", cost: 2 },
    { name: "Zapallar", tag: "Playas y bosque", cat: "playa", cost: 3 },
    { name: "Isla de Pascua", tag: "Rapa Nui", cat: "isla", cost: 3 },
    { name: "Los Andes", tag: "Cordillera y ski", cat: "montana", cost: 2 },
    { name: "Santiago", tag: "Centro histórico", cat: "patrimonio", cost: 2 },
    { name: "San José de Maipo", tag: "Cajón del Maipo", cat: "montana", cost: 2 },
    { name: "Pirque", tag: "Viñas cordilleranas", cat: "vino", cost: 2 },
    { name: "Pichilemu", tag: "Surf", cat: "playa", cost: 1 },
    { name: "Santa Cruz", tag: "Valle de Colchagua", cat: "vino", cost: 2 },
    { name: "Curicó", tag: "Valle de vinos", cat: "vino", cost: 1 },
    { name: "Constitución", tag: "Costa del Maule", cat: "playa", cost: 1 },
    { name: "Vichuquén", tag: "Laguna y humedales", cat: "lagos", cost: 1 },
    { name: "Colbún", tag: "Lago Colbún", cat: "lagos", cost: 1 },
    { name: "Chillán", tag: "Termas y ski", cat: "montana", cost: 2 },
    { name: "Lota", tag: "Patrimonio minero", cat: "patrimonio", cost: 1 },
    { name: "Tomé", tag: "Playas del Biobío", cat: "playa", cost: 1 },
    { name: "Pucón", tag: "Volcán y lago", cat: "montana", cost: 2 },
    { name: "Villarrica", tag: "Lago Villarrica", cat: "lagos", cost: 2 },
    { name: "Curarrehue", tag: "Termas y araucarias", cat: "montana", cost: 1 },
    { name: "Melipeuco", tag: "Parque Conguillío", cat: "montana", cost: 1 },
    { name: "Valdivia", tag: "Ríos y patrimonio alemán", cat: "patrimonio", cost: 2 },
    { name: "Panguipulli", tag: "Siete lagos", cat: "lagos", cost: 1 },
    { name: "Futrono", tag: "Lago Ranco", cat: "lagos", cost: 1 },
    { name: "Puerto Varas", tag: "Lagos y volcanes", cat: "lagos", cost: 2 },
    { name: "Frutillar", tag: "Patrimonio alemán", cat: "patrimonio", cost: 2 },
    { name: "Puerto Montt", tag: "Puerta a Chiloé", cat: "patrimonio", cost: 2 },
    { name: "Castro", tag: "Palafitos de Chiloé", cat: "patrimonio", cost: 2 },
    { name: "Ancud", tag: "Pingüinos y fuerte", cat: "patrimonio", cost: 1 },
    { name: "Dalcahue", tag: "Feria costumbrista", cat: "patrimonio", cost: 1 },
    { name: "Quellón", tag: "Fin de la Ruta 5", cat: "patagonia", cost: 1 },
    { name: "Cochamó", tag: "Valle y trekking", cat: "montana", cost: 1 },
    { name: "Hualaihué", tag: "Fiordos de Hornopirén", cat: "patagonia", cost: 2 },
    { name: "Coyhaique", tag: "Puerta a la Patagonia", cat: "patagonia", cost: 2 },
    { name: "Aysén", tag: "Fiordos australes", cat: "patagonia", cost: 2 },
    { name: "Río Ibáñez", tag: "Catedral de Mármol", cat: "patagonia", cost: 2 },
    { name: "Chile Chico", tag: "Lago General Carrera", cat: "patagonia", cost: 2 },
    { name: "Cochrane", tag: "Patagonia profunda", cat: "patagonia", cost: 2 },
    { name: "Tortel", tag: "Pasarelas de madera", cat: "patagonia", cost: 3 },
    { name: "Punta Arenas", tag: "Estrecho de Magallanes", cat: "patagonia", cost: 2 },
    { name: "Natales", tag: "Torres del Paine", cat: "patagonia", cost: 3 },
    { name: "Porvenir", tag: "Tierra del Fuego", cat: "patagonia", cost: 2 },
    { name: "Cabo de Hornos", tag: "Fin del mundo", cat: "patagonia", cost: 3 },
  ];

  const CATEGORY_LABELS = {
    playa: "Playas",
    desierto: "Desierto y altiplano",
    montana: "Montaña y volcanes",
    patrimonio: "Patrimonio y cultura",
    lagos: "Lagos y ríos",
    vino: "Viñas",
    patagonia: "Patagonia",
    isla: "Islas",
  };

  const AREA_TYPE_META = {
    parque: { icon: "🌲", label: "Parque Nacional" },
    reserva: { icon: "🌳", label: "Reserva Nacional" },
    monumento: { icon: "🪨", label: "Monumento Natural" },
  };

  // Chile's protected wild areas (CONAF/SNASPE): national parks, plus a curated selection
  // of well-known national reserves and natural monuments. Each is pinned to the comuna
  // that hosts its main entrance/visitor access, reusing that comuna's centroid.
  const PROTECTED_AREAS = [
    { id: "vicente-perez-rosales", name: "Vicente Pérez Rosales", type: "parque", region: "Los Lagos", comuna: "Puerto Varas" },
    { id: "juan-fernandez", name: "Archipiélago de Juan Fernández", type: "parque", region: "Valparaíso", comuna: "Juan Fernández" },
    { id: "rapa-nui", name: "Rapa Nui", type: "parque", region: "Valparaíso", comuna: "Isla de Pascua" },
    { id: "tolhuaca", name: "Tolhuaca", type: "parque", region: "La Araucanía", comuna: "Curacautín" },
    { id: "nahuelbuta", name: "Nahuelbuta", type: "parque", region: "La Araucanía", comuna: "Angol" },
    { id: "villarrica", name: "Villarrica", type: "parque", region: "La Araucanía", comuna: "Pucón" },
    { id: "fray-jorge", name: "Bosque Fray Jorge", type: "parque", region: "Coquimbo", comuna: "Ovalle" },
    { id: "puyehue", name: "Puyehue", type: "parque", region: "Los Lagos", comuna: "Puyehue" },
    { id: "cabo-de-hornos", name: "Cabo de Hornos", type: "parque", region: "Magallanes", comuna: "Cabo de Hornos" },
    { id: "laguna-del-laja", name: "Laguna del Laja", type: "parque", region: "Biobío", comuna: "Antuco" },
    { id: "laguna-san-rafael", name: "Laguna San Rafael", type: "parque", region: "Aysén", comuna: "Aysén" },
    { id: "torres-del-paine", name: "Torres del Paine", type: "parque", region: "Magallanes", comuna: "Torres del Paine" },
    { id: "alberto-de-agostini", name: "Alberto de Agostini", type: "parque", region: "Magallanes", comuna: "Natales" },
    { id: "huerquehue", name: "Huerquehue", type: "parque", region: "La Araucanía", comuna: "Pucón" },
    { id: "isla-guamblin", name: "Isla Guamblin", type: "parque", region: "Aysén", comuna: "Guaitecas" },
    { id: "la-campana", name: "La Campana", type: "parque", region: "Valparaíso", comuna: "Olmué" },
    { id: "volcan-isluga", name: "Volcán Isluga", type: "parque", region: "Tarapacá", comuna: "Colchane" },
    { id: "bernardo-ohiggins", name: "Bernardo O'Higgins", type: "parque", region: "Aysén / Magallanes", comuna: "Tortel" },
    { id: "lauca", name: "Lauca", type: "parque", region: "Arica y Parinacota", comuna: "Putre" },
    { id: "cerro-castillo", name: "Cerro Castillo", type: "parque", region: "Aysén", comuna: "Río Ibáñez" },
    { id: "pali-aike", name: "Pali Aike", type: "parque", region: "Magallanes", comuna: "Punta Arenas" },
    { id: "radal-siete-tazas", name: "Radal Siete Tazas", type: "parque", region: "Maule", comuna: "Molina" },
    { id: "alerce-andino", name: "Alerce Andino", type: "parque", region: "Los Lagos", comuna: "Puerto Montt" },
    { id: "chiloe", name: "Chiloé", type: "parque", region: "Los Lagos", comuna: "Chonchi" },
    { id: "isla-magdalena", name: "Isla Magdalena", type: "parque", region: "Aysén", comuna: "Aysén" },
    { id: "queulat", name: "Queulat", type: "parque", region: "Aysén", comuna: "Cisnes" },
    { id: "pan-de-azucar", name: "Pan de Azúcar", type: "parque", region: "Atacama", comuna: "Chañaral" },
    { id: "conguillio", name: "Conguillío", type: "parque", region: "La Araucanía", comuna: "Melipeuco" },
    { id: "hornopiren", name: "Hornopirén", type: "parque", region: "Los Lagos", comuna: "Hualaihué" },
    { id: "cocalan", name: "Las Palmas de Cocalán", type: "parque", region: "O'Higgins", comuna: "Litueche" },
    { id: "llanos-de-challe", name: "Llanos de Challe", type: "parque", region: "Atacama", comuna: "Huasco" },
    { id: "nevado-tres-cruces", name: "Nevado Tres Cruces", type: "parque", region: "Atacama", comuna: "Copiapó" },
    { id: "llullaillaco", name: "Llullaillaco", type: "parque", region: "Antofagasta", comuna: "Antofagasta" },
    { id: "corcovado", name: "Corcovado", type: "parque", region: "Los Lagos", comuna: "Chaitén" },
    { id: "alerce-costero", name: "Alerce Costero", type: "parque", region: "Los Ríos", comuna: "Corral" },
    { id: "morro-moreno", name: "Morro Moreno", type: "parque", region: "Antofagasta", comuna: "Antofagasta" },
    { id: "yendegaia", name: "Yendegaia", type: "parque", region: "Magallanes", comuna: "Cabo de Hornos" },
    { id: "melimoyu", name: "Melimoyu", type: "parque", region: "Aysén", comuna: "Cisnes" },
    { id: "pumalin", name: "Pumalín Douglas Tompkins", type: "parque", region: "Los Lagos", comuna: "Chaitén" },
    { id: "patagonia", name: "Patagonia", type: "parque", region: "Aysén", comuna: "Cochrane" },
    { id: "kawesqar", name: "Kawésqar", type: "parque", region: "Magallanes", comuna: "Natales" },
    { id: "rio-clarillo", name: "Río Clarillo", type: "parque", region: "Metropolitana", comuna: "Pirque" },
    { id: "nonguen", name: "Nonguén", type: "parque", region: "Biobío", comuna: "Concepción" },
    { id: "salar-de-huasco", name: "Salar de Huasco", type: "parque", region: "Tarapacá", comuna: "Pica" },
    { id: "desierto-florido", name: "Desierto Florido", type: "parque", region: "Atacama", comuna: "Vallenar" },
    { id: "glaciares-de-santiago", name: "Glaciares de Santiago", type: "parque", region: "Metropolitana", comuna: "Lo Barnechea" },

    { id: "rn-rio-los-cipreses", name: "Río Los Cipreses", type: "reserva", region: "O'Higgins", comuna: "Machalí" },
    { id: "rn-las-vicunas", name: "Las Vicuñas", type: "reserva", region: "Arica y Parinacota", comuna: "Putre" },
    { id: "rn-los-flamencos", name: "Los Flamencos", type: "reserva", region: "Antofagasta", comuna: "San Pedro de Atacama" },
    { id: "rn-pampa-del-tamarugal", name: "Pampa del Tamarugal", type: "reserva", region: "Tarapacá", comuna: "Pozo Almonte" },
    { id: "rn-la-chimba", name: "La Chimba", type: "reserva", region: "Antofagasta", comuna: "Antofagasta" },
    { id: "rn-altos-de-lircay", name: "Altos de Lircay", type: "reserva", region: "Maule", comuna: "San Clemente" },
    { id: "rn-el-yali", name: "El Yali", type: "reserva", region: "Valparaíso", comuna: "Santo Domingo" },
    { id: "rn-lago-penuelas", name: "Lago Peñuelas", type: "reserva", region: "Valparaíso", comuna: "Valparaíso" },
    { id: "rn-malalcahuello", name: "Malalcahuello", type: "reserva", region: "La Araucanía", comuna: "Lonquimay" },
    { id: "rn-coyhaique", name: "Coyhaique", type: "reserva", region: "Aysén", comuna: "Coyhaique" },
    { id: "rn-magallanes", name: "Magallanes", type: "reserva", region: "Magallanes", comuna: "Punta Arenas" },
    { id: "rn-laguna-parrillar", name: "Laguna Parrillar", type: "reserva", region: "Magallanes", comuna: "Punta Arenas" },
    { id: "rn-rio-simpson", name: "Río Simpson", type: "reserva", region: "Aysén", comuna: "Coyhaique" },
    { id: "rn-futaleufu", name: "Futaleufú", type: "reserva", region: "Los Lagos", comuna: "Futaleufú" },
    { id: "rn-las-chinchillas", name: "Las Chinchillas", type: "reserva", region: "Coquimbo", comuna: "Illapel" },
    { id: "rn-robleria-cobre-loncha", name: "Roblería del Cobre de Loncha", type: "reserva", region: "Metropolitana", comuna: "Alhué" },
    { id: "rn-nuble", name: "Ñuble", type: "reserva", region: "Ñuble", comuna: "Pinto" },
    { id: "rn-pinguino-humboldt", name: "Pingüino de Humboldt", type: "reserva", region: "Coquimbo", comuna: "La Higuera" },
    { id: "rn-malleco", name: "Malleco", type: "reserva", region: "La Araucanía", comuna: "Collipulli" },
    { id: "rn-villarrica", name: "Villarrica (reserva)", type: "reserva", region: "La Araucanía", comuna: "Pucón" },

    { id: "mn-la-portada", name: "La Portada", type: "monumento", region: "Antofagasta", comuna: "Antofagasta" },
    { id: "mn-los-pinguinos", name: "Los Pingüinos", type: "monumento", region: "Magallanes", comuna: "Punta Arenas" },
    { id: "mn-cueva-del-milodon", name: "Cueva del Milodón", type: "monumento", region: "Magallanes", comuna: "Natales" },
    { id: "mn-el-morado", name: "El Morado", type: "monumento", region: "Metropolitana", comuna: "San José de Maipo" },
    { id: "mn-salar-de-surire", name: "Salar de Surire", type: "monumento", region: "Arica y Parinacota", comuna: "Putre" },
    { id: "mn-pichasca", name: "Pichasca", type: "monumento", region: "Coquimbo", comuna: "Río Hurtado" },
    { id: "mn-cerro-nielol", name: "Cerro Ñielol", type: "monumento", region: "La Araucanía", comuna: "Temuco" },
    { id: "mn-isla-cachagua", name: "Isla Cachagua", type: "monumento", region: "Valparaíso", comuna: "Zapallar" },
    { id: "mn-islotes-de-punihuil", name: "Islotes de Puñihuil", type: "monumento", region: "Los Lagos", comuna: "Ancud" },
    { id: "mn-lahuen-nadi", name: "Lahuen Ñadi", type: "monumento", region: "Los Lagos", comuna: "Puerto Montt" },
    { id: "mn-contulmo", name: "Contulmo", type: "monumento", region: "La Araucanía", comuna: "Contulmo" },
  ];

  const RECO_LIMIT = 8;
  const HOME_EXCLUSION_KM = 40;
  const WEATHER_CACHE_MS = 30 * 60 * 1000;

  const BADGES = [
    { id: "first", icon: "🚩", name: "Primer paso", check: (s) => s.visited.size >= 1 },
    { id: "explorer", icon: "🧭", name: "Explorador", check: (s) => s.visited.size >= 10 },
    { id: "wanderer", icon: "🎒", name: "Trotamundos", check: (s) => s.visited.size >= 50 },
    { id: "half", icon: "🌗", name: "Mitad del camino", check: (s) => s.comunas.length > 0 && s.visited.size / s.comunas.length >= 0.5 },
    { id: "complete", icon: "🏆", name: "Chile completo", check: (s) => s.comunas.length > 0 && s.visited.size >= s.comunas.length },
    {
      id: "regions16",
      icon: "🗺️",
      name: "Las 16 regiones",
      check: (s) => {
        const codes = new Set();
        for (const id of s.visited.keys()) {
          const c = s.byId.get(id);
          if (c) codes.add(c.regionCode);
        }
        return codes.size >= 16;
      },
    },
    {
      id: "extremes",
      icon: "↕️",
      name: "De extremo a extremo",
      check: (s) => {
        let north = false;
        let south = false;
        for (const id of s.visited.keys()) {
          const c = s.byId.get(id);
          if (!c) continue;
          if (c.regionCode === 15) north = true;
          if (c.regionCode === 12) south = true;
        }
        return north && south;
      },
    },
    {
      id: "rapanui",
      icon: "🗿",
      name: "Rapa Nui",
      check: (s) => {
        for (const id of s.visited.keys()) {
          const c = s.byId.get(id);
          if (c && c.name === "Isla de Pascua") return true;
        }
        return false;
      },
    },
    {
      id: "chronicler",
      icon: "📝",
      name: "Cronista",
      check: (s) => {
        let count = 0;
        for (const meta of s.visited.values()) if (meta.note) count++;
        return count >= 5;
      },
    },
    {
      id: "company",
      icon: "👥",
      name: "En buena compañía",
      check: (s) => {
        for (const meta of s.visited.values()) if (meta.companion) return true;
        return false;
      },
    },
    { id: "dreamer", icon: "✨", name: "Soñador", check: (s) => s.wishlist.size >= 5 },
    { id: "areas5", icon: "🌲", name: "Guardaparques", check: (s) => s.parkVisited.size >= 5 },
    { id: "areas15", icon: "🏕️", name: "Ruta silvestre", check: (s) => s.parkVisited.size >= 15 },
    { id: "areas40", icon: "🦅", name: "Guardián salvaje", check: (s) => s.parkVisited.size >= 40 },
    { id: "areasAll", icon: "🌳", name: "Todas las áreas protegidas", check: (s) => s.parkVisited.size >= PROTECTED_AREAS.length },
  ];

  const state = {
    visited: loadMetaMap(STORAGE_KEY, ["date", "companion", "note"]),
    wishlist: loadMetaMap(WISHLIST_STORAGE_KEY, ["note"]),
    parkVisited: loadMetaMap(PARK_STORAGE_KEY, ["date", "companion", "note"], true),
    parkWishlist: loadMetaMap(PARK_WISHLIST_STORAGE_KEY, ["note"], true),
    comunas: [],                   // flat list of {id, name, region, regionCode, provincia, centroid, airport}
    layerById: new Map(),          // id -> leaflet layer
    byId: new Map(),               // id -> comuna properties
    touristInfoById: new Map(),    // id -> { tag, cat, cost }
    parkById: new Map(),           // area id -> area properties (name, type, region, comuna, lat, lng)
    parkMarkerById: new Map(),     // area id -> leaflet marker
    home: loadHome(),              // id of the comuna the user lives in, or null
  };

  let loadedGeojson = null;
  const weatherCache = new Map(); // id -> { code, temp, fetchedAt }
  let modalKind = null;  // "comuna" | "park"
  let modalId = null;
  let modalDraft = null;
  let currentTheme = loadTheme();
  let liveLocation = null;
  let usingLiveLocation = false;
  let showingRoute = false;

  const el = {
    map: document.getElementById("map"),
    mapLoading: document.getElementById("map-loading"),
    percent: document.getElementById("stat-percent"),
    count: document.getElementById("stat-count"),
    ring: document.getElementById("ring-fg"),
    search: document.getElementById("search-input"),
    searchResults: document.getElementById("search-results"),
    searchClear: document.getElementById("search-clear"),
    regionsList: document.getElementById("regions-list"),
    categoriesList: document.getElementById("categories-list"),
    visitedList: document.getElementById("visited-list"),
    visitedEmptyHint: document.getElementById("visited-empty-hint"),
    wishlistList: document.getElementById("wishlist-list"),
    wishlistEmptyHint: document.getElementById("wishlist-empty-hint"),
    btnExport: document.getElementById("btn-export"),
    btnReset: document.getElementById("btn-reset"),
    btnShare: document.getElementById("btn-share"),
    btnTheme: document.getElementById("btn-theme"),
    btnCompare: document.getElementById("btn-compare"),
    btnTimeline: document.getElementById("btn-timeline"),
    btnGeolocate: document.getElementById("btn-geolocate"),
    btnWeekendRoute: document.getElementById("btn-weekend-route"),
    geolocateHint: document.getElementById("geolocate-hint"),
    inputImport: document.getElementById("input-import"),
    inputCompare: document.getElementById("input-compare"),
    recoList: document.getElementById("reco-list"),
    recoEmptyHint: document.getElementById("reco-empty-hint"),
    homeValue: document.getElementById("home-value"),
    homeEditBtn: document.getElementById("home-edit-btn"),
    homeSearchWrap: document.getElementById("home-search-wrap"),
    homeSearchInput: document.getElementById("home-search-input"),
    homeSearchResults: document.getElementById("home-search-results"),
    badgesGrid: document.getElementById("badges-grid"),
    badgesCount: document.getElementById("badges-count"),
    parksList: document.getElementById("parks-list"),
    parksCount: document.getElementById("parks-count"),
    modalOverlay: document.getElementById("comuna-modal"),
    modalTitle: document.getElementById("modal-title"),
    modalRegion: document.getElementById("modal-region"),
    modalWikiLoading: document.getElementById("modal-wiki-loading"),
    modalWiki: document.getElementById("modal-wiki"),
    modalWikiImg: document.getElementById("modal-wiki-img"),
    modalWikiText: document.getElementById("modal-wiki-text"),
    modalWikiLink: document.getElementById("modal-wiki-link"),
    modalClose: document.getElementById("modal-close"),
    modalFieldsVisited: document.getElementById("modal-fields-visited"),
    modalFieldsNote: document.getElementById("modal-fields-note"),
    modalDate: document.getElementById("modal-date"),
    modalCompanion: document.getElementById("modal-companion"),
    modalNote: document.getElementById("modal-note"),
    modalSave: document.getElementById("modal-save"),
    modalCancel: document.getElementById("modal-cancel"),
    shareModal: document.getElementById("share-modal"),
    sharePreview: document.getElementById("share-preview"),
    shareDownload: document.getElementById("share-download"),
    shareModalClose: document.getElementById("share-modal-close"),
    shareModalCancel: document.getElementById("share-modal-cancel"),
    toggleAirports: document.getElementById("toggle-airports"),
    toggleParks: document.getElementById("toggle-parks"),
    timelineModal: document.getElementById("timeline-modal"),
    timelineClose: document.getElementById("timeline-close"),
    timelineList: document.getElementById("timeline-list"),
    holidayBanner: document.getElementById("holiday-banner"),
    compareModal: document.getElementById("compare-modal"),
    compareClose: document.getElementById("compare-close"),
    compareCancel: document.getElementById("compare-cancel"),
    compareResults: document.getElementById("compare-results"),
  };

  const statusButtons = [...document.querySelectorAll(".status-btn")];

  // ---------- Storage ----------

  // Generic loader for id -> metadata maps. `idIsString` keeps park ids (slugs) as-is;
  // comuna ids are numeric INE codes.
  function loadMetaMap(key, fields, idIsString) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return new Map();
      const parsed = JSON.parse(raw);
      const map = new Map();
      for (const item of parsed) {
        if (!item || typeof item !== "object") continue;
        const id = idIsString ? item.id : typeof item.id === "number" ? item.id : null;
        if (id == null) continue;
        const meta = {};
        for (const f of fields) meta[f] = item[f] || null;
        map.set(id, meta);
      }
      return map;
    } catch (e) {
      return new Map();
    }
  }

  function saveMetaMap(key, map, fields) {
    const arr = [...map.entries()].map(([id, meta]) => {
      const out = { id };
      for (const f of fields) out[f] = meta[f] || null;
      return out;
    });
    localStorage.setItem(key, JSON.stringify(arr));
  }

  function saveVisited() {
    saveMetaMap(STORAGE_KEY, state.visited, ["date", "companion", "note"]);
  }
  function saveWishlist() {
    saveMetaMap(WISHLIST_STORAGE_KEY, state.wishlist, ["note"]);
  }
  function saveParkVisited() {
    saveMetaMap(PARK_STORAGE_KEY, state.parkVisited, ["date", "companion", "note"]);
  }
  function saveParkWishlist() {
    saveMetaMap(PARK_WISHLIST_STORAGE_KEY, state.parkWishlist, ["note"]);
  }

  function loadHome() {
    try {
      const raw = localStorage.getItem(HOME_STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function saveHome() {
    if (state.home == null) localStorage.removeItem(HOME_STORAGE_KEY);
    else localStorage.setItem(HOME_STORAGE_KEY, JSON.stringify(state.home));
  }

  function loadTheme() {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === "dark" || saved === "light") return saved;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function loadBoolPref(key, defaultValue) {
    const raw = localStorage.getItem(key);
    if (raw === null) return defaultValue;
    return raw === "1";
  }

  function saveBoolPref(key, value) {
    localStorage.setItem(key, value ? "1" : "0");
  }

  function normalize(str) {
    return str
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "");
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function formatDate(iso) {
    if (!iso) return "";
    const parts = iso.split("-");
    if (parts.length !== 3) return iso;
    const [y, m, d] = parts;
    return `${d}/${m}/${y}`;
  }

  function costLabel(tier) {
    if (tier === 1) return "💰 Económico";
    if (tier === 2) return "💰💰 Medio";
    return "💰💰💰 Alto";
  }

  // ---------- Geometry helpers (recommendations + nearest airport) ----------

  function bboxCenter(geometry) {
    let minLng = Infinity, minLat = Infinity, maxLng = -Infinity, maxLat = -Infinity;
    function scan(ring) {
      for (const [lng, lat] of ring) {
        if (lng < minLng) minLng = lng;
        if (lng > maxLng) maxLng = lng;
        if (lat < minLat) minLat = lat;
        if (lat > maxLat) maxLat = lat;
      }
    }
    if (geometry.type === "Polygon") {
      for (const ring of geometry.coordinates) scan(ring);
    } else if (geometry.type === "MultiPolygon") {
      for (const poly of geometry.coordinates) for (const ring of poly) scan(ring);
    }
    return { lat: (minLat + maxLat) / 2, lng: (minLng + maxLng) / 2 };
  }

  function haversineKm(a, b) {
    const R = 6371;
    const dLat = ((b.lat - a.lat) * Math.PI) / 180;
    const dLng = ((b.lng - a.lng) * Math.PI) / 180;
    const lat1 = (a.lat * Math.PI) / 180;
    const lat2 = (b.lat * Math.PI) / 180;
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
  }

  function nearestAirport(point) {
    let best = null;
    let bestDist = Infinity;
    for (const a of AIRPORTS) {
      const d = haversineKm(point, a);
      if (d < bestDist) {
        bestDist = d;
        best = a;
      }
    }
    return { airport: best, distanceKm: bestDist };
  }

  function flightsUrl(airport) {
    return `https://www.google.com/travel/flights?q=${encodeURIComponent("Flights to " + airport.iata)}`;
  }

  function computeRecommendations(limit) {
    const home = state.home != null ? state.byId.get(state.home) : null;

    let anchors;
    if (usingLiveLocation && liveLocation) {
      anchors = [{ point: liveLocation, label: "tu ubicación actual" }];
    } else {
      if (!state.visited.size) return [];
      anchors = [...state.visited.keys()]
        .map((id) => state.byId.get(id))
        .filter((c) => c && c.centroid)
        .map((c) => ({ point: c.centroid, label: c.name }));
    }

    const scored = [];
    for (const c of state.comunas) {
      if (state.visited.has(c.id) || state.wishlist.has(c.id) || !c.centroid) continue;
      if (!state.touristInfoById.has(c.id)) continue;
      if (home && home.centroid && haversineKm(c.centroid, home.centroid) < HOME_EXCLUSION_KM) continue;

      let bestDist = Infinity;
      let bestLabel = null;
      for (const a of anchors) {
        const d = haversineKm(c.centroid, a.point);
        if (d < bestDist) {
          bestDist = d;
          bestLabel = a.label;
        }
      }
      if (bestLabel) scored.push({ comuna: c, distanceKm: bestDist, fromLabel: bestLabel });
    }
    scored.sort((a, b) => a.distanceKm - b.distanceKm);
    return scored.slice(0, limit);
  }

  function generateWeekendRoute() {
    const home = state.home != null ? state.byId.get(state.home) : null;
    let startPoint = home && home.centroid ? home.centroid : null;
    if (!startPoint && state.visited.size) {
      const first = state.byId.get([...state.visited.keys()][0]);
      startPoint = first && first.centroid ? first.centroid : null;
    }
    if (!startPoint) return null;

    const candidates = state.comunas.filter(
      (c) => state.touristInfoById.has(c.id) && !state.visited.has(c.id) && !state.wishlist.has(c.id) && c.centroid
    );
    const used = new Set();
    const route = [];
    let current = startPoint;

    for (let i = 0; i < 3; i++) {
      let best = null;
      let bestDist = Infinity;
      for (const c of candidates) {
        if (used.has(c.id)) continue;
        const d = haversineKm(current, c.centroid);
        if (d < bestDist) {
          bestDist = d;
          best = c;
        }
      }
      if (!best) break;
      route.push({ comuna: best, distanceKm: bestDist });
      used.add(best.id);
      current = best.centroid;
    }
    return route.length ? route : null;
  }

  // ---------- Weather (Open-Meteo, no API key required) ----------

  function weatherEmoji(code) {
    if (code === 0) return "☀️";
    if (code === 1 || code === 2) return "🌤️";
    if (code === 3) return "☁️";
    if (code === 45 || code === 48) return "🌫️";
    if ([51, 53, 55, 56, 57].includes(code)) return "🌦️";
    if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "🌧️";
    if ([71, 73, 75, 77, 85, 86].includes(code)) return "🌨️";
    if ([95, 96, 99].includes(code)) return "⛈️";
    return "🌡️";
  }

  async function getWeather(point, cacheId) {
    const cached = weatherCache.get(cacheId);
    if (cached && Date.now() - cached.fetchedAt < WEATHER_CACHE_MS) return cached;
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${point.lat.toFixed(3)}&longitude=${point.lng.toFixed(3)}&current=temperature_2m,weather_code&timezone=auto`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("weather request failed");
    const data = await res.json();
    const result = {
      code: data.current.weather_code,
      temp: Math.round(data.current.temperature_2m),
      fetchedAt: Date.now(),
    };
    weatherCache.set(cacheId, result);
    return result;
  }

  // ---------- Wikipedia (short summary + photo for the detail modal) ----------

  const wikiCache = new Map(); // cacheKey -> { extract, thumbnail, pageUrl } | null

  async function fetchWikipediaSummary(cacheKey, searchQuery) {
    if (wikiCache.has(cacheKey)) return wikiCache.get(cacheKey);
    try {
      const searchUrl = `https://es.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(searchQuery)}&format=json&origin=*&srlimit=1`;
      const searchRes = await fetch(searchUrl);
      if (!searchRes.ok) throw new Error("wiki search failed");
      const searchData = await searchRes.json();
      const title = searchData?.query?.search?.[0]?.title;
      if (!title) {
        wikiCache.set(cacheKey, null);
        return null;
      }
      const summaryUrl = `https://es.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
      const summaryRes = await fetch(summaryUrl);
      if (!summaryRes.ok) throw new Error("wiki summary failed");
      const data = await summaryRes.json();
      if (!data.extract) {
        wikiCache.set(cacheKey, null);
        return null;
      }
      const result = {
        extract: data.extract,
        thumbnail: data.thumbnail && data.thumbnail.source,
        pageUrl: (data.content_urls && data.content_urls.desktop && data.content_urls.desktop.page) || null,
      };
      wikiCache.set(cacheKey, result);
      return result;
    } catch (e) {
      wikiCache.set(cacheKey, null);
      return null;
    }
  }

  function loadWikiInfo(kind, id, searchQuery) {
    el.modalWiki.hidden = true;
    el.modalWikiImg.hidden = true;
    el.modalWikiLoading.hidden = false;

    fetchWikipediaSummary(`${kind}:${id}`, searchQuery).then((info) => {
      // The user may have opened a different entity while this was in flight.
      if (modalKind !== kind || modalId !== id) return;
      el.modalWikiLoading.hidden = true;
      if (!info) {
        el.modalWiki.hidden = true;
        return;
      }
      el.modalWikiText.textContent = info.extract;
      el.modalWikiLink.href = info.pageUrl || "#";
      if (info.thumbnail) {
        el.modalWikiImg.src = info.thumbnail;
        el.modalWikiImg.hidden = false;
      } else {
        el.modalWikiImg.hidden = true;
      }
      el.modalWiki.hidden = false;
    });
  }

  // ---------- Theme ----------

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    el.btnTheme.textContent = theme === "dark" ? "☀️" : "🌙";
  }
  applyTheme(currentTheme);

  el.btnTheme.addEventListener("click", () => {
    currentTheme = currentTheme === "dark" ? "light" : "dark";
    localStorage.setItem(THEME_STORAGE_KEY, currentTheme);
    applyTheme(currentTheme);
    refreshMapColors();
  });

  function refreshMapColors() {
    for (const c of state.comunas) {
      const layer = state.layerById.get(c.id);
      if (layer) layer.setStyle(styleFor(c.id));
    }
    for (const p of PROTECTED_AREAS) {
      const marker = state.parkMarkerById.get(p.id);
      if (marker) marker.setIcon(parkIcon(p.id));
    }
  }

  // ---------- Map ----------

  const map = L.map(el.map, {
    zoomControl: false,
    worldCopyJump: false,
    attributionControl: false,
    zoomSnap: 0.25,
  });
  L.control.zoom({ position: "topright" }).addTo(map);

  // Mobile browsers resize the real viewport when their address bar hides/shows on
  // scroll, and the sidebar's own layout can also change the map's rendered size.
  // Leaflet caches its container size internally, so without telling it to recompute,
  // the map can end up blank or cut off after this happens. ResizeObserver catches any
  // size change to the map container itself, whatever the cause.
  let invalidateSizeRaf = null;
  function scheduleInvalidateSize() {
    if (invalidateSizeRaf) return;
    invalidateSizeRaf = requestAnimationFrame(() => {
      invalidateSizeRaf = null;
      map.invalidateSize();
    });
  }
  if (window.ResizeObserver) {
    new ResizeObserver(scheduleInvalidateSize).observe(el.map);
  }
  window.addEventListener("resize", scheduleInvalidateSize);
  window.addEventListener("orientationchange", scheduleInvalidateSize);
  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", scheduleInvalidateSize);
  }

  const airportLayer = L.layerGroup();
  const parkLayer = L.layerGroup();

  el.toggleAirports.checked = loadBoolPref(SHOW_AIRPORTS_KEY, true);
  el.toggleParks.checked = loadBoolPref(SHOW_PARKS_KEY, true);

  el.toggleAirports.addEventListener("change", () => {
    if (el.toggleAirports.checked) airportLayer.addTo(map);
    else map.removeLayer(airportLayer);
    saveBoolPref(SHOW_AIRPORTS_KEY, el.toggleAirports.checked);
  });

  el.toggleParks.addEventListener("change", () => {
    if (el.toggleParks.checked) parkLayer.addTo(map);
    else map.removeLayer(parkLayer);
    saveBoolPref(SHOW_PARKS_KEY, el.toggleParks.checked);
  });

  function styleFor(id) {
    const c = MAP_COLORS[currentTheme] || MAP_COLORS.light;
    if (state.visited.has(id)) {
      return { color: c.border, weight: 0.9, fillColor: c.visited, fillOpacity: 0.9 };
    }
    if (state.wishlist.has(id)) {
      return { color: c.border, weight: 1.1, fillColor: c.wishlist, fillOpacity: 0.75, dashArray: "4,3" };
    }
    return { color: c.border, weight: 0.9, fillColor: c.unvisited, fillOpacity: 0.85 };
  }

  function highlightStyle(id) {
    const c = MAP_COLORS[currentTheme] || MAP_COLORS.light;
    const base = styleFor(id);
    return Object.assign({}, base, { weight: 2.2, color: c.highlight });
  }

  function parkStatus(id) {
    if (state.parkVisited.has(id)) return "visited";
    if (state.parkWishlist.has(id)) return "wishlist";
    return "none";
  }

  function parkIcon(id) {
    const status = parkStatus(id);
    const area = state.parkById.get(id);
    const meta = AREA_TYPE_META[area && area.type] || AREA_TYPE_META.parque;
    return L.divIcon({
      className: "park-marker-wrap",
      html: `<div class="park-marker park-marker-${status}">${meta.icon}</div>`,
      iconSize: [22, 22],
      iconAnchor: [11, 11],
    });
  }

  fetch("data/comunas.json")
    .then((r) => r.json())
    .then((geojson) => {
      loadedGeojson = geojson;

      // The map container can still report a 0x0 size on first paint (fonts/layout not
      // settled yet). Creating the SVG vector layer while the container has no size
      // leaves it permanently blank even after a later resize, so we wait until the
      // container actually has real pixel dimensions before building anything on it.
      function whenMapSized(cb) {
        const size = map.getSize();
        if (size.x > 0 && size.y > 0) {
          cb();
          return;
        }
        requestAnimationFrame(() => whenMapSized(cb));
      }

      whenMapSized(() => buildMap(geojson));
    })
    .catch((err) => {
      console.error("No se pudo cargar data/comunas.json", err);
      el.mapLoading.innerHTML =
        '<p style="padding:24px;text-align:center;color:#b3552f">No se pudo cargar el mapa de comunas. Verifica que data/comunas.json exista y que estés sirviendo el sitio desde un servidor local (no file://).</p>';
    });

  function buildMap(geojson) {
      const geoLayer = L.geoJSON(geojson, {
        style: (feature) => styleFor(feature.properties.id),
        onEachFeature: (feature, layer) => {
          const p = feature.properties;
          p.centroid = bboxCenter(feature.geometry);
          p.airport = nearestAirport(p.centroid);
          state.comunas.push(p);
          state.byId.set(p.id, p);
          state.layerById.set(p.id, layer);

          layer.bindTooltip(
            `${p.name}<span class="region-name">${shortRegion(p.region)}</span>`,
            { className: "comuna-tooltip", sticky: true }
          );

          layer.on("mouseover", () => layer.setStyle(highlightStyle(p.id)));
          layer.on("mouseout", () => layer.setStyle(styleFor(p.id)));
          layer.on("click", () => openEntityModal("comuna", p.id));
        },
      }).addTo(map);

      const bounds = geoLayer.getBounds();
      map.invalidateSize();
      map.fitBounds(bounds, { padding: [10, 10] });
      map.setMinZoom(Math.max(map.getZoom() - 1, 0));
      map.setMaxBounds(bounds.pad(0.35));
      map.options.maxBoundsViscosity = 0.7;

      state.comunas.sort((a, b) => a.name.localeCompare(b.name, "es"));

      const nameIndex = new Map();
      for (const c of state.comunas) nameIndex.set(normalize(c.name), c.id);
      for (const t of TOURIST_COMUNAS) {
        const id = nameIndex.get(normalize(t.name));
        if (id != null) state.touristInfoById.set(id, { tag: t.tag, cat: t.cat, cost: t.cost });
      }

      // Drop any stored ids that no longer exist in the dataset.
      for (const id of [...state.visited.keys()]) if (!state.byId.has(id)) state.visited.delete(id);
      for (const id of [...state.wishlist.keys()]) if (!state.byId.has(id)) state.wishlist.delete(id);
      if (state.home != null && !state.byId.has(state.home)) state.home = null;

      for (const a of AIRPORTS) {
        L.marker([a.lat, a.lng], {
          icon: L.divIcon({
            className: "airport-marker-wrap",
            html: '<div class="airport-marker">✈</div>',
            iconSize: [20, 20],
            iconAnchor: [10, 10],
          }),
          keyboard: false,
        })
          .bindTooltip(`${a.city} <span class="region-name">${a.iata}</span>`, { className: "comuna-tooltip" })
          .addTo(airportLayer);
      }
      if (el.toggleAirports.checked) airportLayer.addTo(map);

      for (const p of PROTECTED_AREAS) {
        const comunaId = nameIndex.get(normalize(p.comuna));
        const comuna = comunaId != null ? state.byId.get(comunaId) : null;
        if (!comuna || !comuna.centroid) continue;
        p.lat = comuna.centroid.lat;
        p.lng = comuna.centroid.lng;
        state.parkById.set(p.id, p);

        const meta = AREA_TYPE_META[p.type] || AREA_TYPE_META.parque;
        const marker = L.marker([p.lat, p.lng], { icon: parkIcon(p.id), keyboard: false })
          .bindTooltip(`${p.name}<span class="region-name">${meta.label} · ${p.region}</span>`, { className: "comuna-tooltip" })
          .addTo(parkLayer);
        marker.on("click", () => openEntityModal("park", p.id));
        state.parkMarkerById.set(p.id, marker);
      }
      if (el.toggleParks.checked) parkLayer.addTo(map);

      // Drop any stored area ids that no longer exist (e.g. after edits to the curated list).
      for (const id of [...state.parkVisited.keys()]) if (!state.parkById.has(id)) state.parkVisited.delete(id);
      for (const id of [...state.parkWishlist.keys()]) if (!state.parkById.has(id)) state.parkWishlist.delete(id);

      renderAll();
      el.mapLoading.classList.add("hidden");
  }

  function shortRegion(name) {
    return name.replace(/^Regi[oó]n\s+(de\s+la\s+|de\s+los\s+|del\s+|de\s+)?/i, "");
  }

  // ---------- Status changes (visited / wishlist / none) ----------

  function applyStatus(kind, id, status, meta) {
    if (kind === "park") {
      state.parkVisited.delete(id);
      state.parkWishlist.delete(id);
      if (status === "visited") {
        state.parkVisited.set(id, {
          date: (meta && meta.date) || null,
          companion: (meta && meta.companion) || null,
          note: (meta && meta.note) || null,
        });
      } else if (status === "wishlist") {
        state.parkWishlist.set(id, { note: (meta && meta.note) || null });
      }
      saveParkVisited();
      saveParkWishlist();

      const marker = state.parkMarkerById.get(id);
      if (marker) marker.setIcon(parkIcon(id));
    } else {
      state.visited.delete(id);
      state.wishlist.delete(id);
      if (status === "visited") {
        state.visited.set(id, {
          date: (meta && meta.date) || null,
          companion: (meta && meta.companion) || null,
          note: (meta && meta.note) || null,
        });
      } else if (status === "wishlist") {
        state.wishlist.set(id, { note: (meta && meta.note) || null });
      }
      saveVisited();
      saveWishlist();

      const layer = state.layerById.get(id);
      if (layer) layer.setStyle(styleFor(id));
    }

    renderAll();
  }

  function renderAll() {
    renderStat();
    renderBadges();
    renderRegions();
    renderCategories();
    renderParks();
    renderWishlist();
    renderVisitedList();
    renderHome();
    renderRecommendations();
  }

  function renderStat() {
    const total = state.comunas.length;
    const visited = state.visited.size;
    const pct = total ? (visited / total) * 100 : 0;
    el.percent.textContent = `${pct.toFixed(1)}%`;
    el.count.textContent = `${visited} / ${total} comunas`;
    el.ring.style.strokeDashoffset = String(CIRCUMFERENCE * (1 - pct / 100));
  }

  function renderBadges() {
    el.badgesGrid.innerHTML = "";
    let unlockedCount = 0;
    for (const b of BADGES) {
      const unlocked = b.check(state);
      if (unlocked) unlockedCount++;
      const tile = document.createElement("div");
      tile.className = "badge" + (unlocked ? " unlocked" : "");
      tile.title = b.name;
      tile.innerHTML = `<span class="badge-icon">${b.icon}</span><span class="badge-name">${b.name}</span>`;
      el.badgesGrid.appendChild(tile);
    }
    el.badgesCount.textContent = `${unlockedCount}/${BADGES.length}`;
  }

  function renderRegions() {
    const groups = new Map(); // regionCode -> { name, total, visited }
    for (const c of state.comunas) {
      if (!groups.has(c.regionCode)) {
        groups.set(c.regionCode, { name: c.region, total: 0, visited: 0 });
      }
      const g = groups.get(c.regionCode);
      g.total++;
      if (state.visited.has(c.id)) g.visited++;
    }

    el.regionsList.innerHTML = "";
    for (const code of REGION_ORDER) {
      const g = groups.get(code);
      if (!g) continue;
      const pct = g.total ? (g.visited / g.total) * 100 : 0;

      const row = document.createElement("div");
      row.className = "region-row";
      row.title = "Ver esta región en el mapa";
      row.innerHTML = `
        <div class="region-row-top">
          <span>${shortRegion(g.name)}</span>
          <span class="region-pct">${g.visited}/${g.total}</span>
        </div>
        <div class="region-bar"><div class="region-bar-fill" style="width:${pct}%"></div></div>
      `;
      row.addEventListener("click", () => flyToRegion(code));
      el.regionsList.appendChild(row);
    }
  }

  function renderCategories() {
    const groups = new Map(); // cat -> { total, visited }
    const nameIndex = new Map();
    for (const c of state.comunas) nameIndex.set(normalize(c.name), c.id);

    for (const t of TOURIST_COMUNAS) {
      if (!groups.has(t.cat)) groups.set(t.cat, { total: 0, visited: 0 });
      const g = groups.get(t.cat);
      g.total++;
      const id = nameIndex.get(normalize(t.name));
      if (id != null && state.visited.has(id)) g.visited++;
    }

    el.categoriesList.innerHTML = "";
    const cats = [...groups.keys()].sort((a, b) => (CATEGORY_LABELS[a] || a).localeCompare(CATEGORY_LABELS[b] || b, "es"));
    for (const cat of cats) {
      const g = groups.get(cat);
      const pct = g.total ? (g.visited / g.total) * 100 : 0;
      const row = document.createElement("div");
      row.className = "region-row";
      row.innerHTML = `
        <div class="region-row-top">
          <span>${CATEGORY_LABELS[cat] || cat}</span>
          <span class="region-pct">${g.visited}/${g.total}</span>
        </div>
        <div class="region-bar"><div class="region-bar-fill" style="width:${pct}%"></div></div>
      `;
      el.categoriesList.appendChild(row);
    }
  }

  function flyToRegion(regionCode) {
    const bounds = [];
    for (const c of state.comunas) {
      if (c.regionCode !== regionCode) continue;
      const layer = state.layerById.get(c.id);
      if (layer && layer.getBounds) bounds.push(layer.getBounds());
    }
    if (!bounds.length) return;
    let combined = bounds[0];
    for (let i = 1; i < bounds.length; i++) combined = combined.extend(bounds[i]);
    map.flyToBounds(combined, { padding: [20, 20] });
  }

  function renderParks() {
    el.parksCount.textContent = `${state.parkVisited.size}/${PROTECTED_AREAS.length}`;
    el.parksList.innerHTML = "";
    const sorted = [...PROTECTED_AREAS].sort((a, b) => a.name.localeCompare(b.name, "es"));
    for (const p of sorted) {
      const status = parkStatus(p.id);
      const meta = AREA_TYPE_META[p.type] || AREA_TYPE_META.parque;
      const row = document.createElement("div");
      row.className = "park-row";
      row.title = "Ver en el mapa";
      row.innerHTML = `
        <span class="park-row-status park-row-status-${status}"></span>
        <span class="park-row-text">
          <span class="park-row-name">${meta.icon} ${p.name}</span>
          <span class="park-row-region">${meta.label} · ${p.region}</span>
        </span>
      `;
      row.addEventListener("click", () => {
        if (p.lat != null && p.lng != null) map.flyTo([p.lat, p.lng], 9);
        openEntityModal("park", p.id);
      });
      el.parksList.appendChild(row);
    }
  }

  function renderVisitedList() {
    const ids = [...state.visited.keys()].sort((a, b) => {
      const na = state.byId.get(a)?.name || "";
      const nb = state.byId.get(b)?.name || "";
      return na.localeCompare(nb, "es");
    });

    el.visitedEmptyHint.style.display = ids.length ? "none" : "inline";
    el.visitedList.innerHTML = "";
    for (const id of ids) {
      const p = state.byId.get(id);
      if (!p) continue;
      const meta = state.visited.get(id) || {};
      const metaBits = [];
      if (meta.date) metaBits.push(formatDate(meta.date));
      if (meta.companion) metaBits.push(escapeHtml(meta.companion));

      const chip = document.createElement("span");
      chip.className = "chip";
      if (meta.note) chip.title = meta.note;
      chip.innerHTML = `
        <span class="chip-name">${escapeHtml(p.name)}${metaBits.length ? ` <span class="chip-meta">· ${metaBits.join(" · ")}</span>` : ""}</span>
        <button title="Quitar">&times;</button>
      `;
      chip.querySelector(".chip-name").addEventListener("click", () => openEntityModal("comuna", id));
      chip.querySelector("button").addEventListener("click", () => applyStatus("comuna", id, "none"));
      el.visitedList.appendChild(chip);
    }
  }

  function renderWishlist() {
    const ids = [...state.wishlist.keys()].sort((a, b) => {
      const na = state.byId.get(a)?.name || "";
      const nb = state.byId.get(b)?.name || "";
      return na.localeCompare(nb, "es");
    });

    el.wishlistEmptyHint.style.display = ids.length ? "none" : "inline";
    el.wishlistList.innerHTML = "";
    for (const id of ids) {
      const p = state.byId.get(id);
      if (!p) continue;
      const meta = state.wishlist.get(id) || {};

      const chip = document.createElement("span");
      chip.className = "chip chip-wishlist";
      if (meta.note) chip.title = meta.note;
      chip.innerHTML = `
        <span class="chip-name">${escapeHtml(p.name)}</span>
        <button title="Quitar">&times;</button>
      `;
      chip.querySelector(".chip-name").addEventListener("click", () => openEntityModal("comuna", id));
      chip.querySelector("button").addEventListener("click", () => applyStatus("comuna", id, "none"));
      el.wishlistList.appendChild(chip);
    }
  }

  function flyAndHighlight(c) {
    const layer = state.layerById.get(c.id);
    if (!layer) return;
    if (layer.getBounds) map.flyToBounds(layer.getBounds(), { padding: [40, 40], maxZoom: 10 });
    layer.setStyle(highlightStyle(c.id));
    layer.openTooltip();
    setTimeout(() => layer.setStyle(styleFor(c.id)), 1400);
  }

  function buildRecoCard(c, distanceKm, fromLabel, indexPrefix) {
    const info = state.touristInfoById.get(c.id);
    const card = document.createElement("div");
    card.className = "reco-card";

    const flightHtml = c.airport && c.airport.airport
      ? `<a class="reco-flight" href="${flightsUrl(c.airport.airport)}" target="_blank" rel="noopener noreferrer" title="Buscar vuelos hacia ${c.airport.airport.city}">
           ✈ Vuelos vía ${c.airport.airport.city} <span class="reco-flight-km">(${Math.round(c.airport.distanceKm)} km)</span>
         </a>`
      : `<span class="reco-flight-none">Sin aeropuerto cercano</span>`;

    const costHtml = info && info.cost
      ? `<span class="reco-cost" title="Estimación general, no un precio real">${costLabel(info.cost)}</span>`
      : "";

    card.innerHTML = `
      <div class="reco-main">
        <span class="reco-name">${indexPrefix || ""}${c.name}${info && info.tag ? ` · <span class="reco-tag">${info.tag}</span>` : ""}</span>
        <span class="reco-meta">${shortRegion(c.region)} · a ${Math.round(distanceKm)} km de ${fromLabel}</span>
      </div>
      <div class="reco-actions">
        ${flightHtml}
        ${costHtml}
        <button type="button" class="reco-wish-btn">🎒 Quiero ir</button>
        <span class="reco-weather">⋯</span>
      </div>
    `;

    card.querySelector(".reco-main").addEventListener("click", () => flyAndHighlight(c));
    card.querySelector(".reco-wish-btn").addEventListener("click", () => {
      applyStatus("comuna", c.id, "wishlist", { note: null });
    });

    const weatherEl = card.querySelector(".reco-weather");
    getWeather(c.centroid, c.id)
      .then((w) => {
        weatherEl.textContent = `${weatherEmoji(w.code)} ${w.temp}°C`;
      })
      .catch(() => {
        weatherEl.textContent = "";
      });

    return card;
  }

  function renderRecommendations() {
    if (showingRoute) {
      renderRouteView();
      return;
    }

    const recos = computeRecommendations(RECO_LIMIT);

    if (!usingLiveLocation && !state.visited.size) {
      el.recoEmptyHint.textContent = "Marca al menos una comuna visitada para recibir recomendaciones.";
      el.recoEmptyHint.style.display = "block";
      el.recoList.style.display = "none";
      el.recoList.innerHTML = "";
      return;
    }

    if (!recos.length) {
      el.recoEmptyHint.textContent = "No encontramos más destinos turísticos cercanos que aún no hayas marcado. ¡Vas muy bien!";
      el.recoEmptyHint.style.display = "block";
      el.recoList.style.display = "none";
      el.recoList.innerHTML = "";
      return;
    }

    el.recoEmptyHint.style.display = "none";
    el.recoList.style.display = "flex";
    el.recoList.innerHTML = "";

    for (const r of recos) {
      el.recoList.appendChild(buildRecoCard(r.comuna, r.distanceKm, r.fromLabel));
    }
  }

  function renderRouteView() {
    const route = generateWeekendRoute();
    el.recoList.innerHTML = "";

    if (!route) {
      el.recoList.style.display = "none";
      el.recoEmptyHint.textContent = "Define tu comuna (📍 Vives en) o marca al menos una comuna visitada para generar una ruta.";
      el.recoEmptyHint.style.display = "block";
      return;
    }

    el.recoEmptyHint.style.display = "none";
    el.recoList.style.display = "flex";

    const totalKm = route.reduce((sum, r) => sum + r.distanceKm, 0);
    const header = document.createElement("p");
    header.className = "reco-empty";
    header.textContent = `🗺️ Ruta sugerida · ${Math.round(totalKm)} km en total · orden recomendado`;
    el.recoList.appendChild(header);

    route.forEach((r, i) => {
      const fromLabel = i === 0 ? (state.home != null ? state.byId.get(state.home)?.name || "tu casa" : "el punto de partida") : route[i - 1].comuna.name;
      el.recoList.appendChild(buildRecoCard(r.comuna, r.distanceKm, fromLabel, `${i + 1}. `));
    });
  }

  // ---------- Home comuna picker ----------

  function renderHome() {
    const home = state.home != null ? state.byId.get(state.home) : null;
    el.homeValue.textContent = home ? home.name : "sin definir";
    el.homeEditBtn.textContent = home ? "Cambiar" : "Elegir";
  }

  el.homeEditBtn.addEventListener("click", () => {
    const opening = el.homeSearchWrap.hidden;
    el.homeSearchWrap.hidden = !opening;
    if (opening) {
      el.homeSearchInput.value = "";
      el.homeSearchResults.innerHTML = "";
      el.homeSearchResults.classList.remove("open");
      el.homeSearchInput.focus();
    }
  });

  el.homeSearchInput.addEventListener("input", () => {
    const q = normalize(el.homeSearchInput.value.trim());
    el.homeSearchResults.innerHTML = "";
    if (!q) {
      el.homeSearchResults.classList.remove("open");
      return;
    }
    const matches = state.comunas.filter((c) => normalize(c.name).includes(q)).slice(0, 30);
    if (!matches.length) {
      el.homeSearchResults.innerHTML = `<div class="search-item"><span class="name">Sin resultados</span></div>`;
    } else {
      for (const c of matches) {
        const item = document.createElement("div");
        item.className = "search-item";
        item.innerHTML = `
          <span>
            <span class="name">${c.name}</span><br>
            <span class="region">${shortRegion(c.region)}</span>
          </span>
        `;
        item.addEventListener("click", () => {
          state.home = c.id;
          saveHome();
          el.homeSearchWrap.hidden = true;
          renderHome();
          renderRecommendations();
        });
        el.homeSearchResults.appendChild(item);
      }
    }
    el.homeSearchResults.classList.add("open");
  });

  // ---------- Geolocation ("cerca de mí ahora") ----------

  el.btnGeolocate.addEventListener("click", () => {
    if (usingLiveLocation) {
      usingLiveLocation = false;
      el.btnGeolocate.classList.remove("active");
      el.geolocateHint.hidden = true;
      renderRecommendations();
      return;
    }

    if (showingRoute) {
      showingRoute = false;
      el.btnWeekendRoute.classList.remove("active");
    }

    if (!navigator.geolocation) {
      el.geolocateHint.textContent = "Tu navegador no permite compartir tu ubicación.";
      el.geolocateHint.hidden = false;
      return;
    }

    el.geolocateHint.textContent = "Obteniendo tu ubicación…";
    el.geolocateHint.hidden = false;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        liveLocation = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        usingLiveLocation = true;
        el.btnGeolocate.classList.add("active");
        el.geolocateHint.hidden = true;
        renderRecommendations();
      },
      () => {
        el.geolocateHint.textContent = "No pudimos acceder a tu ubicación. Revisa los permisos del navegador.";
        el.geolocateHint.hidden = false;
      },
      { timeout: 10000 }
    );
  });

  el.btnWeekendRoute.addEventListener("click", () => {
    showingRoute = !showingRoute;
    el.btnWeekendRoute.classList.toggle("active", showingRoute);
    if (showingRoute && usingLiveLocation) {
      usingLiveLocation = false;
      el.btnGeolocate.classList.remove("active");
    }
    renderRecommendations();
  });

  // ---------- Holidays (long-weekend banner) ----------

  function computeLongWeekends(holidays) {
    const holidayDates = new Set(holidays.map((h) => h.date));
    function isNonWorking(date) {
      const dow = date.getDay();
      if (dow === 0 || dow === 6) return true;
      return holidayDates.has(date.toISOString().slice(0, 10));
    }

    const seenStarts = new Set();
    const blocks = [];
    for (const h of holidays) {
      let start = new Date(`${h.date}T00:00:00`);
      let end = new Date(start);
      for (let guard = 0; guard < 10; guard++) {
        const prev = new Date(start);
        prev.setDate(prev.getDate() - 1);
        if (!isNonWorking(prev)) break;
        start = prev;
      }
      for (let guard = 0; guard < 10; guard++) {
        const next = new Date(end);
        next.setDate(next.getDate() + 1);
        if (!isNonWorking(next)) break;
        end = next;
      }
      const key = start.toISOString().slice(0, 10);
      if (seenStarts.has(key)) continue;
      seenStarts.add(key);
      const days = Math.round((end - start) / 86400000) + 1;
      if (days >= 3) blocks.push({ start, end, days, title: h.title });
    }
    blocks.sort((a, b) => a.start - b.start);
    return blocks;
  }

  function formatShortDate(date) {
    return date.toLocaleDateString("es-CL", { day: "numeric", month: "short" });
  }

  async function initHolidayBanner() {
    try {
      const res = await fetch("https://api.boostr.cl/holidays.json");
      if (!res.ok) return;
      const data = await res.json();
      const holidays = Array.isArray(data.data) ? data.data : [];
      const blocks = computeLongWeekends(holidays);

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const upcoming = blocks.find((b) => b.end >= today);
      if (!upcoming) return;

      const daysUntil = Math.round((upcoming.start - today) / 86400000);
      const when = daysUntil <= 0 ? "¡Es ahora!" : daysUntil === 1 ? "Empieza mañana" : `En ${daysUntil} días`;

      el.holidayBanner.innerHTML = `🎉 <span>Próximo finde largo: <strong>${formatShortDate(upcoming.start)}–${formatShortDate(upcoming.end)}</strong> (${escapeHtml(upcoming.title)}) · ${when}. Toca para armar una ruta.</span>`;
      el.holidayBanner.hidden = false;
      el.holidayBanner.addEventListener("click", () => {
        if (!showingRoute) {
          showingRoute = true;
          el.btnWeekendRoute.classList.add("active");
          if (usingLiveLocation) {
            usingLiveLocation = false;
            el.btnGeolocate.classList.remove("active");
          }
          renderRecommendations();
        }
        el.recoList.scrollIntoView({ behavior: "smooth", block: "nearest" });
      });
    } catch (e) {
      /* holidays are a nice-to-have extra; fail silently if the feed is unreachable */
    }
  }
  initHolidayBanner();

  // ---------- Detail modal (comunas + protected areas) ----------

  function updateModalStatusUI() {
    for (const btn of statusButtons) {
      btn.classList.toggle("active", btn.dataset.status === modalDraft.status);
    }
    el.modalFieldsVisited.hidden = modalDraft.status !== "visited";
    el.modalFieldsNote.hidden = modalDraft.status === "none";
  }

  function openEntityModal(kind, id) {
    let title, regionLabel, visitedMeta, wishMeta, wikiQuery;

    if (kind === "park") {
      const p = state.parkById.get(id);
      if (!p) return;
      const meta = AREA_TYPE_META[p.type] || AREA_TYPE_META.parque;
      title = p.name;
      regionLabel = `${meta.label} · ${p.region}`;
      visitedMeta = state.parkVisited.get(id);
      wishMeta = state.parkWishlist.get(id);
      wikiQuery = `${p.name} ${meta.label} Chile`;
    } else {
      const c = state.byId.get(id);
      if (!c) return;
      title = c.name;
      regionLabel = shortRegion(c.region);
      visitedMeta = state.visited.get(id);
      wishMeta = state.wishlist.get(id);
      wikiQuery = `${c.name} comuna Chile`;
    }

    modalKind = kind;
    modalId = id;
    modalDraft = {
      status: visitedMeta ? "visited" : wishMeta ? "wishlist" : "none",
      date: (visitedMeta && visitedMeta.date) || "",
      companion: (visitedMeta && visitedMeta.companion) || "",
      note: (visitedMeta && visitedMeta.note) || (wishMeta && wishMeta.note) || "",
    };
    el.modalTitle.textContent = title;
    el.modalRegion.textContent = regionLabel;
    el.modalDate.value = modalDraft.date;
    el.modalCompanion.value = modalDraft.companion;
    el.modalNote.value = modalDraft.note;
    updateModalStatusUI();
    el.modalOverlay.hidden = false;
    loadWikiInfo(kind, id, wikiQuery);
  }

  function closeEntityModal() {
    el.modalOverlay.hidden = true;
    modalKind = null;
    modalId = null;
    modalDraft = null;
  }

  for (const btn of statusButtons) {
    btn.addEventListener("click", () => {
      if (!modalDraft) return;
      modalDraft.status = btn.dataset.status;
      if (modalDraft.status === "visited" && !el.modalDate.value) {
        el.modalDate.value = new Date().toISOString().slice(0, 10);
      }
      updateModalStatusUI();
    });
  }

  el.modalSave.addEventListener("click", () => {
    if (modalId == null || !modalDraft) return;
    applyStatus(modalKind, modalId, modalDraft.status, {
      date: el.modalDate.value || null,
      companion: el.modalCompanion.value.trim() || null,
      note: el.modalNote.value.trim() || null,
    });
    closeEntityModal();
  });

  el.modalCancel.addEventListener("click", closeEntityModal);
  el.modalClose.addEventListener("click", closeEntityModal);
  el.modalOverlay.addEventListener("click", (e) => {
    if (e.target === el.modalOverlay) closeEntityModal();
  });

  // ---------- Timeline ("bitácora de viajes") ----------

  function collectTimelineEntries() {
    const entries = [];
    for (const [id, meta] of state.visited.entries()) {
      const c = state.byId.get(id);
      if (!c) continue;
      entries.push({ icon: "📍", name: c.name, sub: shortRegion(c.region), date: meta.date, companion: meta.companion, note: meta.note });
    }
    for (const [id, meta] of state.parkVisited.entries()) {
      const p = state.parkById.get(id);
      if (!p) continue;
      const typeMeta = AREA_TYPE_META[p.type] || AREA_TYPE_META.parque;
      entries.push({ icon: typeMeta.icon, name: p.name, sub: `${typeMeta.label} · ${p.region}`, date: meta.date, companion: meta.companion, note: meta.note });
    }
    entries.sort((a, b) => {
      if (a.date && b.date) return b.date.localeCompare(a.date);
      if (a.date) return -1;
      if (b.date) return 1;
      return a.name.localeCompare(b.name, "es");
    });
    return entries;
  }

  function renderTimeline() {
    const entries = collectTimelineEntries();
    el.timelineList.innerHTML = "";
    if (!entries.length) {
      el.timelineList.innerHTML = `<p class="timeline-empty">Aún no tienes lugares visitados. ¡Marca el primero en el mapa!</p>`;
      return;
    }

    let printedNoDateLabel = false;
    for (const entry of entries) {
      if (!entry.date && !printedNoDateLabel) {
        const label = document.createElement("div");
        label.className = "timeline-section-label";
        label.textContent = "Sin fecha registrada";
        el.timelineList.appendChild(label);
        printedNoDateLabel = true;
      }

      const metaBits = [];
      if (entry.companion) metaBits.push(escapeHtml(entry.companion));

      const item = document.createElement("div");
      item.className = "timeline-item";
      item.innerHTML = `
        <span class="timeline-icon">${entry.icon}</span>
        <div class="timeline-body">
          ${entry.date ? `<div class="timeline-date">${formatDate(entry.date)}</div>` : ""}
          <div class="timeline-name">${escapeHtml(entry.name)}</div>
          <div class="timeline-meta">${escapeHtml(entry.sub)}${metaBits.length ? " · " + metaBits.join(" · ") : ""}</div>
          ${entry.note ? `<div class="timeline-note">${escapeHtml(entry.note)}</div>` : ""}
        </div>
      `;
      el.timelineList.appendChild(item);
    }
  }

  el.btnTimeline.addEventListener("click", () => {
    renderTimeline();
    el.timelineModal.hidden = false;
  });
  el.timelineClose.addEventListener("click", () => {
    el.timelineModal.hidden = true;
  });
  el.timelineModal.addEventListener("click", (e) => {
    if (e.target === el.timelineModal) el.timelineModal.hidden = true;
  });

  // ---------- Compare with a friend ----------

  el.btnCompare.addEventListener("click", () => {
    el.compareResults.innerHTML = "";
    el.compareModal.hidden = false;
  });
  el.compareClose.addEventListener("click", () => {
    el.compareModal.hidden = true;
  });
  el.compareCancel.addEventListener("click", () => {
    el.compareModal.hidden = true;
  });
  el.compareModal.addEventListener("click", (e) => {
    if (e.target === el.compareModal) el.compareModal.hidden = true;
  });

  el.inputCompare.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        const friendVisited = new Set();
        const arr = Array.isArray(data.visited) ? data.visited : [];
        for (const item of arr) {
          const id = typeof item === "number" ? item : item && typeof item.id === "number" ? item.id : null;
          if (id != null) friendVisited.add(id);
        }

        const mine = new Set(state.visited.keys());
        const both = [...mine].filter((id) => friendVisited.has(id));
        const onlyMine = [...mine].filter((id) => !friendVisited.has(id));
        const onlyFriend = [...friendVisited].filter((id) => !mine.has(id) && state.byId.has(id));

        const nameOf = (id) => state.byId.get(id)?.name || "?";
        const listOrFallback = (ids) =>
          ids.length ? ids.map(nameOf).sort((a, b) => a.localeCompare(b, "es")).join(", ") : "ninguna todavía";

        el.compareResults.innerHTML = `
          <div class="compare-stat"><span>Comunas que ambos visitaron</span><strong>${both.length}</strong></div>
          <div class="compare-stat"><span>Solo tú has visitado</span><strong>${onlyMine.length}</strong></div>
          <div class="compare-stat"><span>Solo tu amigo/a ha visitado</span><strong>${onlyFriend.length}</strong></div>
          <div class="compare-list"><strong>En común:</strong> ${listOrFallback(both)}</div>
          <div class="compare-list"><strong>Para que descubra:</strong> ${listOrFallback(onlyMine)}</div>
        `;
      } catch (err) {
        el.compareResults.innerHTML = `<p class="timeline-empty">El archivo no tiene un formato válido.</p>`;
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  });

  // ---------- Share card ----------

  function buildShareCard() {
    const W = 1080;
    const H = 1350;
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#efe4cd";
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = "#3a3024";
    ctx.font = "800 44px Inter, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("Chile en Porcentaje", 60, 96);

    const total = state.comunas.length;
    const visitedCount = state.visited.size;
    const pct = total ? (visitedCount / total) * 100 : 0;

    ctx.fillStyle = "#3a5c40";
    ctx.font = "800 120px Inter, sans-serif";
    ctx.fillText(`${pct.toFixed(1)}%`, 60, 240);

    ctx.fillStyle = "#8a7a63";
    ctx.font = "600 28px Inter, sans-serif";
    ctx.fillText(`${visitedCount} de ${total} comunas · ${state.parkVisited.size}/${PROTECTED_AREAS.length} áreas protegidas`, 60, 282);

    if (loadedGeojson) {
      const mapTop = 340;
      const mapBottom = 1150;
      const mapLeft = 60;
      const mapRight = W - 60;

      let minLng = Infinity, minLat = Infinity, maxLng = -Infinity, maxLat = -Infinity;
      for (const f of loadedGeojson.features) {
        const polys = f.geometry.type === "Polygon" ? [f.geometry.coordinates] : f.geometry.coordinates;
        for (const poly of polys) {
          for (const ring of poly) {
            for (const [lng, lat] of ring) {
              if (lng < minLng) minLng = lng;
              if (lng > maxLng) maxLng = lng;
              if (lat < minLat) minLat = lat;
              if (lat > maxLat) maxLat = lat;
            }
          }
        }
      }

      const mapW = mapRight - mapLeft;
      const mapH = mapBottom - mapTop;
      const scale = Math.min(mapW / (maxLng - minLng), mapH / (maxLat - minLat));
      const drawW = (maxLng - minLng) * scale;
      const drawH = (maxLat - minLat) * scale;
      const offsetX = mapLeft + (mapW - drawW) / 2;
      const offsetY = mapTop + (mapH - drawH) / 2;

      function project(lng, lat) {
        return [offsetX + (lng - minLng) * scale, offsetY + (maxLat - lat) * scale];
      }

      for (const f of loadedGeojson.features) {
        const id = f.properties.id;
        ctx.fillStyle = state.visited.has(id) ? "#52795a" : state.wishlist.has(id) ? "#c9974d" : "#d9cca8";
        const polys = f.geometry.type === "Polygon" ? [f.geometry.coordinates] : f.geometry.coordinates;
        for (const poly of polys) {
          ctx.beginPath();
          for (const ring of poly) {
            ring.forEach(([lng, lat], i) => {
              const [x, y] = project(lng, lat);
              if (i === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
            });
            ctx.closePath();
          }
          ctx.fill();
        }
      }

      for (const p of PROTECTED_AREAS) {
        if (p.lat == null || p.lng == null) continue;
        const [x, y] = project(p.lng, p.lat);
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fillStyle = parkStatus(p.id) === "visited" ? "#3a5c40" : "#efe4cd";
        ctx.fill();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = "#3a5c40";
        ctx.stroke();
      }
    }

    const unlocked = BADGES.filter((b) => b.check(state));
    ctx.font = "44px Inter, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(unlocked.length ? unlocked.map((b) => b.icon).join("  ") : "Aún sin logros desbloqueados", 60, 1235);

    ctx.fillStyle = "#8a7a63";
    ctx.font = "600 24px Inter, sans-serif";
    ctx.fillText("chileenporcentaje", 60, 1300);

    return canvas;
  }

  function closeShareModal() {
    el.shareModal.hidden = true;
  }

  el.btnShare.addEventListener("click", async () => {
    try {
      if (document.fonts && document.fonts.ready) await document.fonts.ready;
    } catch (e) {
      /* ignore font-loading errors, draw with fallback font */
    }
    const canvas = buildShareCard();
    const dataUrl = canvas.toDataURL("image/png");
    el.sharePreview.src = dataUrl;
    el.shareDownload.href = dataUrl;
    el.shareModal.hidden = false;
  });

  el.shareModalClose.addEventListener("click", closeShareModal);
  el.shareModalCancel.addEventListener("click", closeShareModal);
  el.shareModal.addEventListener("click", (e) => {
    if (e.target === el.shareModal) closeShareModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    closeEntityModal();
    closeShareModal();
    el.timelineModal.hidden = true;
    el.compareModal.hidden = true;
  });

  // ---------- Search ----------

  // Lives on top of the map so it's reachable on phones without scrolling the sidebar.
  // Matches comunas and protected areas; names that start with the query rank first.
  function searchEntities(q) {
    const results = [];
    for (const c of state.comunas) {
      const n = normalize(c.name);
      const pos = n.indexOf(q);
      if (pos === -1) continue;
      const status = state.visited.has(c.id) ? "✅ visitada" : state.wishlist.has(c.id) ? "🎒 en tu lista" : "";
      results.push({ kind: "comuna", id: c.id, name: c.name, sub: shortRegion(c.region), status, rank: pos === 0 ? 0 : 1 });
    }
    for (const p of state.parkById.values()) {
      const n = normalize(p.name);
      const pos = n.indexOf(q);
      if (pos === -1) continue;
      const meta = AREA_TYPE_META[p.type] || AREA_TYPE_META.parque;
      const st = parkStatus(p.id);
      const status = st === "visited" ? "✅ visitada" : st === "wishlist" ? "🎒 en tu lista" : "";
      // Park names usually begin with "Parque Nacional…", so also count a match at the start of any word.
      const rank = pos === 0 || n.includes(" " + q) ? 0 : 1;
      results.push({ kind: "park", id: p.id, name: `${meta.icon} ${p.name}`, sub: `${meta.label} · ${p.region}`, status, rank });
    }
    results.sort((a, b) => a.rank - b.rank || a.name.localeCompare(b.name, "es"));
    return results.slice(0, 30);
  }

  function closeSearchResults() {
    el.searchResults.classList.remove("open");
  }

  function selectSearchResult(r) {
    closeSearchResults();
    el.search.blur(); // hides the phone keyboard so the modal isn't covered
    if (r.kind === "park") {
      const p = state.parkById.get(r.id);
      if (p && p.lat != null) map.flyTo([p.lat, p.lng], 9);
    } else {
      const layer = state.layerById.get(r.id);
      if (layer && layer.getBounds) map.flyToBounds(layer.getBounds(), { padding: [40, 40], maxZoom: 10 });
    }
    openEntityModal(r.kind, r.id);
  }

  let searchMatches = [];

  function renderSearch() {
    const raw = el.search.value.trim();
    el.searchClear.hidden = !el.search.value;
    const q = normalize(raw);
    if (!q) {
      searchMatches = [];
      closeSearchResults();
      el.searchResults.innerHTML = "";
      return;
    }
    searchMatches = searchEntities(q);

    el.searchResults.innerHTML = "";
    if (!searchMatches.length) {
      el.searchResults.innerHTML = `<div class="search-item search-empty"><span class="name">Sin resultados</span></div>`;
    } else {
      for (const r of searchMatches) {
        const item = document.createElement("button");
        item.type = "button";
        item.className = "search-item";
        item.innerHTML = `
          <span>
            <span class="name">${escapeHtml(r.name)}</span><br>
            <span class="region">${escapeHtml(r.sub)}</span>
          </span>
          <span class="check">${r.status}</span>
        `;
        item.addEventListener("click", () => selectSearchResult(r));
        el.searchResults.appendChild(item);
      }
    }
    el.searchResults.scrollTop = 0;
    el.searchResults.classList.add("open");
  }

  el.search.addEventListener("input", renderSearch);
  el.search.addEventListener("focus", () => {
    if (el.search.value.trim()) renderSearch();
  });
  el.search.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && searchMatches.length) {
      e.preventDefault();
      selectSearchResult(searchMatches[0]);
    } else if (e.key === "Escape") {
      closeSearchResults();
      el.search.blur();
    }
  });
  el.searchClear.addEventListener("click", () => {
    el.search.value = "";
    renderSearch();
    el.search.focus();
  });

  document.addEventListener("click", (e) => {
    if (!el.searchResults.contains(e.target) && e.target !== el.search && e.target !== el.searchClear) {
      el.searchResults.classList.remove("open");
    }
    if (
      !el.homeSearchWrap.contains(e.target) &&
      e.target !== el.homeEditBtn &&
      !el.homeSearchWrap.hidden &&
      !el.homeSearchResults.contains(e.target)
    ) {
      el.homeSearchWrap.hidden = true;
    }
  });

  // ---------- Export / Import / Reset ----------

  el.btnExport.addEventListener("click", () => {
    const payload = {
      app: "chileenporcentaje",
      version: 3,
      exportedAt: new Date().toISOString(),
      home: state.home,
      visited: [...state.visited.entries()].map(([id, meta]) => ({ id, ...meta })),
      wishlist: [...state.wishlist.entries()].map(([id, meta]) => ({ id, ...meta })),
      parksVisited: [...state.parkVisited.entries()].map(([id, meta]) => ({ id, ...meta })),
      parksWishlist: [...state.parkWishlist.entries()].map(([id, meta]) => ({ id, ...meta })),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "chile-en-porcentaje.json";
    a.click();
    URL.revokeObjectURL(url);
  });

  el.inputImport.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);

        const newVisited = new Map();
        const visitedArr = Array.isArray(data.visited) ? data.visited : [];
        for (const item of visitedArr) {
          if (typeof item === "number") {
            if (state.byId.has(item)) newVisited.set(item, { date: null, companion: null, note: null });
          } else if (item && typeof item === "object" && state.byId.has(item.id)) {
            newVisited.set(item.id, { date: item.date || null, companion: item.companion || null, note: item.note || null });
          }
        }

        const newWishlist = new Map();
        const wishlistArr = Array.isArray(data.wishlist) ? data.wishlist : [];
        for (const item of wishlistArr) {
          if (item && typeof item === "object" && state.byId.has(item.id)) {
            newWishlist.set(item.id, { note: item.note || null });
          }
        }

        const newParkVisited = new Map();
        const parkVisitedArr = Array.isArray(data.parksVisited) ? data.parksVisited : [];
        for (const item of parkVisitedArr) {
          if (item && typeof item === "object" && state.parkById.has(item.id)) {
            newParkVisited.set(item.id, { date: item.date || null, companion: item.companion || null, note: item.note || null });
          }
        }

        const newParkWishlist = new Map();
        const parkWishlistArr = Array.isArray(data.parksWishlist) ? data.parksWishlist : [];
        for (const item of parkWishlistArr) {
          if (item && typeof item === "object" && state.parkById.has(item.id)) {
            newParkWishlist.set(item.id, { note: item.note || null });
          }
        }

        state.visited = newVisited;
        state.wishlist = newWishlist;
        state.parkVisited = newParkVisited;
        state.parkWishlist = newParkWishlist;
        if (data.home != null && state.byId.has(data.home)) state.home = data.home;

        saveVisited();
        saveWishlist();
        saveParkVisited();
        saveParkWishlist();
        saveHome();

        for (const c of state.comunas) {
          const layer = state.layerById.get(c.id);
          if (layer) layer.setStyle(styleFor(c.id));
        }
        for (const p of PROTECTED_AREAS) {
          const marker = state.parkMarkerById.get(p.id);
          if (marker) marker.setIcon(parkIcon(p.id));
        }
        renderAll();
      } catch (err) {
        alert("El archivo no tiene un formato válido.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  });

  el.btnReset.addEventListener("click", () => {
    const hasAnything = state.visited.size || state.wishlist.size || state.parkVisited.size || state.parkWishlist.size;
    if (!hasAnything) return;
    if (!confirm("¿Borrar todas tus comunas y áreas protegidas visitadas, y tu lista de deseos? Esta acción no se puede deshacer.")) return;
    state.visited.clear();
    state.wishlist.clear();
    state.parkVisited.clear();
    state.parkWishlist.clear();
    saveVisited();
    saveWishlist();
    saveParkVisited();
    saveParkWishlist();
    for (const c of state.comunas) {
      const layer = state.layerById.get(c.id);
      if (layer) layer.setStyle(styleFor(c.id));
    }
    for (const p of PROTECTED_AREAS) {
      const marker = state.parkMarkerById.get(p.id);
      if (marker) marker.setIcon(parkIcon(p.id));
    }
    renderAll();
  });
})();
