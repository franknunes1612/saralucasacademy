import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Index from "./pages/Index";
import MyMeals from "./pages/MyMeals";
import HowItWorks from "./pages/HowItWorks";
import FitRecipes from "./pages/FitRecipes";
import NotFound from "./pages/NotFound";
import { NutritionistFAB } from "./components/NutritionistFAB";

const queryClient = new QueryClient();

// FAB wrapper that hides on certain routes/states
function NutritionistFABWrapper() {
  const location = useLocation();
  
  // Show on main screens: home (camera/result), meals, how-it-works, recipes
  const showOnRoutes = ["/", "/meals", "/how-it-works", "/recipes"];
  const shouldShow = showOnRoutes.includes(location.pathname);
  
  if (!shouldShow) return null;
  
  return <NutritionistFAB />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/meals" element={<MyMeals />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/recipes" element={<FitRecipes />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <NutritionistFABWrapper />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
