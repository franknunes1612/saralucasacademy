export interface Recipe {
  id: string;
  name: { pt: string; en: string };
  description: { pt: string; en: string };
  category: "light" | "balanced" | "rich";
  calories: number;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
  };
  portion: { pt: string; en: string };
  prepTime: number; // minutes
  imageEmoji: string; // Using emoji as placeholder
  ingredients: { pt: string[]; en: string[] };
}

export const recipes: Recipe[] = [
  // Light recipes (under 400 kcal)
  {
    id: "greek-salad",
    name: { pt: "Salada Grega", en: "Greek Salad" },
    description: { pt: "Salada fresca com pepino, tomate e queijo feta", en: "Fresh salad with cucumber, tomato and feta cheese" },
    category: "light",
    calories: 280,
    macros: { protein: 12, carbs: 18, fat: 18 },
    portion: { pt: "1 tigela grande", en: "1 large bowl" },
    prepTime: 15,
    imageEmoji: "🥗",
    ingredients: {
      pt: ["Pepino", "Tomate", "Cebola roxa", "Azeitonas", "Queijo feta", "Azeite"],
      en: ["Cucumber", "Tomato", "Red onion", "Olives", "Feta cheese", "Olive oil"],
    },
  },
  {
    id: "fruit-yogurt-bowl",
    name: { pt: "Tigela de Iogurte com Frutas", en: "Fruit Yogurt Bowl" },
    description: { pt: "Iogurte natural com frutas frescas e granola", en: "Natural yogurt with fresh fruits and granola" },
    category: "light",
    calories: 320,
    macros: { protein: 15, carbs: 42, fat: 10 },
    portion: { pt: "1 tigela média", en: "1 medium bowl" },
    prepTime: 5,
    imageEmoji: "🍓",
    ingredients: {
      pt: ["Iogurte natural", "Morangos", "Banana", "Granola", "Mel"],
      en: ["Natural yogurt", "Strawberries", "Banana", "Granola", "Honey"],
    },
  },
  {
    id: "vegetable-soup",
    name: { pt: "Sopa de Legumes", en: "Vegetable Soup" },
    description: { pt: "Sopa nutritiva com legumes variados", en: "Nutritious soup with mixed vegetables" },
    category: "light",
    calories: 180,
    macros: { protein: 6, carbs: 28, fat: 5 },
    portion: { pt: "1 tigela grande", en: "1 large bowl" },
    prepTime: 30,
    imageEmoji: "🍲",
    ingredients: {
      pt: ["Cenoura", "Batata", "Cebola", "Abobrinha", "Feijão verde"],
      en: ["Carrot", "Potato", "Onion", "Zucchini", "Green beans"],
    },
  },
  {
    id: "avocado-toast",
    name: { pt: "Torrada de Abacate", en: "Avocado Toast" },
    description: { pt: "Pão integral com abacate e ovo", en: "Whole wheat bread with avocado and egg" },
    category: "light",
    calories: 350,
    macros: { protein: 14, carbs: 28, fat: 20 },
    portion: { pt: "2 fatias", en: "2 slices" },
    prepTime: 10,
    imageEmoji: "🥑",
    ingredients: {
      pt: ["Pão integral", "Abacate", "Ovo", "Limão", "Sal e pimenta"],
      en: ["Whole wheat bread", "Avocado", "Egg", "Lemon", "Salt and pepper"],
    },
  },

  // Balanced recipes (400-650 kcal)
  {
    id: "grilled-chicken-salad",
    name: { pt: "Salada com Frango Grelhado", en: "Grilled Chicken Salad" },
    description: { pt: "Salada completa com frango grelhado e legumes", en: "Complete salad with grilled chicken and vegetables" },
    category: "balanced",
    calories: 480,
    macros: { protein: 38, carbs: 24, fat: 26 },
    portion: { pt: "1 prato grande", en: "1 large plate" },
    prepTime: 25,
    imageEmoji: "🥗",
    ingredients: {
      pt: ["Peito de frango", "Alface", "Tomate", "Pepino", "Azeite", "Queijo parmesão"],
      en: ["Chicken breast", "Lettuce", "Tomato", "Cucumber", "Olive oil", "Parmesan cheese"],
    },
  },
  {
    id: "salmon-vegetables",
    name: { pt: "Salmão com Legumes", en: "Salmon with Vegetables" },
    description: { pt: "Salmão grelhado com legumes assados", en: "Grilled salmon with roasted vegetables" },
    category: "balanced",
    calories: 520,
    macros: { protein: 35, carbs: 22, fat: 32 },
    portion: { pt: "1 prato médio", en: "1 medium plate" },
    prepTime: 35,
    imageEmoji: "🐟",
    ingredients: {
      pt: ["Salmão", "Brócolis", "Cenoura", "Batata-doce", "Azeite", "Limão"],
      en: ["Salmon", "Broccoli", "Carrot", "Sweet potato", "Olive oil", "Lemon"],
    },
  },
  {
    id: "quinoa-bowl",
    name: { pt: "Bowl de Quinoa", en: "Quinoa Bowl" },
    description: { pt: "Quinoa com legumes e proteína vegetal", en: "Quinoa with vegetables and plant protein" },
    category: "balanced",
    calories: 450,
    macros: { protein: 18, carbs: 52, fat: 18 },
    portion: { pt: "1 tigela média", en: "1 medium bowl" },
    prepTime: 20,
    imageEmoji: "🍚",
    ingredients: {
      pt: ["Quinoa", "Grão-de-bico", "Espinafre", "Abacate", "Tomate seco"],
      en: ["Quinoa", "Chickpeas", "Spinach", "Avocado", "Sun-dried tomato"],
    },
  },
  {
    id: "turkey-wrap",
    name: { pt: "Wrap de Peru", en: "Turkey Wrap" },
    description: { pt: "Wrap integral com peru e vegetais frescos", en: "Whole wheat wrap with turkey and fresh vegetables" },
    category: "balanced",
    calories: 420,
    macros: { protein: 28, carbs: 38, fat: 16 },
    portion: { pt: "1 wrap grande", en: "1 large wrap" },
    prepTime: 10,
    imageEmoji: "🌯",
    ingredients: {
      pt: ["Tortilha integral", "Peito de peru", "Alface", "Tomate", "Mostarda"],
      en: ["Whole wheat tortilla", "Turkey breast", "Lettuce", "Tomato", "Mustard"],
    },
  },

  // Rich recipes (650-850 kcal)
  {
    id: "pasta-bolognese",
    name: { pt: "Massa à Bolonhesa", en: "Pasta Bolognese" },
    description: { pt: "Massa com molho de carne à bolonhesa", en: "Pasta with meat bolognese sauce" },
    category: "rich",
    calories: 720,
    macros: { protein: 32, carbs: 78, fat: 28 },
    portion: { pt: "1 prato grande", en: "1 large plate" },
    prepTime: 45,
    imageEmoji: "🍝",
    ingredients: {
      pt: ["Massa", "Carne moída", "Tomate", "Cebola", "Alho", "Queijo parmesão"],
      en: ["Pasta", "Ground beef", "Tomato", "Onion", "Garlic", "Parmesan cheese"],
    },
  },
  {
    id: "chicken-rice",
    name: { pt: "Frango com Arroz", en: "Chicken with Rice" },
    description: { pt: "Frango grelhado com arroz e feijão", en: "Grilled chicken with rice and beans" },
    category: "rich",
    calories: 680,
    macros: { protein: 42, carbs: 72, fat: 22 },
    portion: { pt: "1 prato grande", en: "1 large plate" },
    prepTime: 40,
    imageEmoji: "🍗",
    ingredients: {
      pt: ["Frango", "Arroz", "Feijão", "Salada", "Azeite"],
      en: ["Chicken", "Rice", "Beans", "Salad", "Olive oil"],
    },
  },
  {
    id: "fish-chips",
    name: { pt: "Peixe com Batatas", en: "Fish and Chips" },
    description: { pt: "Peixe empanado com batatas assadas", en: "Breaded fish with roasted potatoes" },
    category: "rich",
    calories: 780,
    macros: { protein: 35, carbs: 68, fat: 38 },
    portion: { pt: "1 prato grande", en: "1 large plate" },
    prepTime: 35,
    imageEmoji: "🐟",
    ingredients: {
      pt: ["Filé de peixe", "Batatas", "Farinha", "Ovo", "Limão"],
      en: ["Fish fillet", "Potatoes", "Flour", "Egg", "Lemon"],
    },
  },
  {
    id: "beef-steak",
    name: { pt: "Bife com Acompanhamentos", en: "Steak with Sides" },
    description: { pt: "Bife grelhado com batata e salada", en: "Grilled steak with potato and salad" },
    category: "rich",
    calories: 750,
    macros: { protein: 48, carbs: 42, fat: 42 },
    portion: { pt: "1 prato grande", en: "1 large plate" },
    prepTime: 30,
    imageEmoji: "🥩",
    ingredients: {
      pt: ["Bife de carne", "Batata", "Salada verde", "Azeite", "Alho"],
      en: ["Beef steak", "Potato", "Green salad", "Olive oil", "Garlic"],
    },
  },
];

export function getRecipesByCategory(category: "light" | "balanced" | "rich"): Recipe[] {
  return recipes.filter((r) => r.category === category);
}

export function getSuggestedRecipes(mealTone: "light" | "balanced" | "rich", limit: number = 3): Recipe[] {
  // Suggest complementary recipes
  let targetCategory: "light" | "balanced" | "rich";
  
  if (mealTone === "rich") {
    targetCategory = "light";
  } else if (mealTone === "light") {
    targetCategory = "balanced";
  } else {
    // For balanced meals, suggest a mix
    const lightRecipes = getRecipesByCategory("light").slice(0, 2);
    const richRecipes = getRecipesByCategory("rich").slice(0, 1);
    return [...lightRecipes, ...richRecipes].slice(0, limit);
  }
  
  return getRecipesByCategory(targetCategory).slice(0, limit);
}
