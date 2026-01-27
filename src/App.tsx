import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AdminAuthGuard } from "@/components/admin/AdminAuthGuard";
import Index from "./pages/Index";
import MyMeals from "./pages/MyMeals";
import HowItWorks from "./pages/HowItWorks";
import FitRecipes from "./pages/FitRecipes";
import RecipeDetail from "./pages/RecipeDetail";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminRecipes from "./pages/AdminRecipes";
import AdminCms from "./pages/AdminCms";
import AdminPremium from "./pages/AdminPremium";
import AdminStore from "./pages/AdminStore";
import AdminRecommendedProducts from "./pages/AdminRecommendedProducts";
import Premium from "./pages/Premium";
import PersonalizedPlan from "./pages/PersonalizedPlan";
import TrainingClasses from "./pages/TrainingClasses";
import Products from "./pages/Products";
import GiftPlan from "./pages/GiftPlan";
import NotFound from "./pages/NotFound";
import { NutritionistFAB } from "./components/NutritionistFAB";

const queryClient = new QueryClient();

// FAB wrapper that hides on certain routes/states
function NutritionistFABWrapper() {
  const location = useLocation();
  
  // Show on main screens: home (camera/result), meals, how-it-works, recipes
  const showOnRoutes = ["/", "/meals", "/how-it-works", "/recipes", "/premium"];
  const isRecipeDetail = location.pathname.startsWith("/recipes/");
  const shouldShow = showOnRoutes.includes(location.pathname) || isRecipeDetail;
  
  if (!shouldShow) return null;
  
  return <NutritionistFAB />;
}

const App = () => (
  <ErrorBoundary>
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
            <Route path="/recipes/:recipeId" element={<RecipeDetail />} />
            <Route path="/premium" element={<Premium />} />
            <Route path="/premium/plans" element={<PersonalizedPlan />} />
            <Route path="/premium/training" element={<TrainingClasses />} />
            <Route path="/premium/products" element={<Products />} />
            <Route path="/premium/gift" element={<GiftPlan />} />
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={
              <AdminAuthGuard>
                <AdminDashboard />
              </AdminAuthGuard>
            } />
            <Route path="/admin/recipes" element={
              <AdminAuthGuard>
                <AdminRecipes />
              </AdminAuthGuard>
            } />
            <Route path="/admin/premium" element={
              <AdminAuthGuard>
                <AdminPremium />
              </AdminAuthGuard>
            } />
            <Route path="/admin/store" element={
              <AdminAuthGuard>
                <AdminStore />
              </AdminAuthGuard>
            } />
            <Route path="/admin/cms" element={
              <AdminAuthGuard>
                <AdminCms />
              </AdminAuthGuard>
            } />
            <Route path="/admin/recommended-products" element={
              <AdminAuthGuard>
                <AdminRecommendedProducts />
              </AdminAuthGuard>
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <NutritionistFABWrapper />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
