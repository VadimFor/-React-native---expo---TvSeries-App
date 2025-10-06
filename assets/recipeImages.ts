 //Se ha creado recipeImages porque resulta que dentro de los args de Image no se puede usar require con una variable dentro.
 export const recipeImages = {
   "green-curry.png": require("../assets/recipes/green-curry.png"),
   "onion-soup.png": require("../assets/recipes/onion-soup.png"),
   "carbonara.png": require("../assets/recipes/carbonara.png"),
   "bibimbap.png": require("../assets/recipes/bibimbap.png"),
   "chickpea-tagine.png": require("../assets/recipes/chickpea-tagine.png"),
   "ramen.png": require("../assets/recipes/ramen.png"),
   "butter-chicken.png": require("../assets/recipes/butter-chicken.png"),
   "avocado-toast.png": require("../assets/recipes/avocado-toast.png"),
   "chimichurri-steak.png": require("../assets/recipes/chimichurri-steak.png"),
   "ceviche.png": require("../assets/recipes/ceviche.png"),
   "moussaka.png": require("../assets/recipes/moussaka.png"),
   "pho.png": require("../assets/recipes/pho.png"),
   "street-tacos.png": require("../assets/recipes/street-tacos.png"),
   "quinoa-salad.png": require("../assets/recipes/quinoa-salad.png"),
 };
 export type RecipeImageKey = keyof typeof recipeImages;