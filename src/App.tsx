import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AdminAuthGuard } from "@/components/admin/AdminAuthGuard";
import { BottomNav } from "@/components/navigation/BottomNav";
import { SplashScreen } from "@/components/SplashScreen";
import { Onboarding } from "@/components/Onboarding";

// Pages
import Home from "./pages/Home";
import Learn from "./pages/Learn";
import CourseDetail from "./pages/CourseDetail";
import Tools from "./pages/Tools";
import Profile from "./pages/Profile";
import Scanner from "./pages/Index"; // Renamed from Index - the scanner page
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
import AdminAcademy from "./pages/AdminAcademy";
import Premium from "./pages/Premium";
import PersonalizedPlan from "./pages/PersonalizedPlan";
import TrainingClasses from "./pages/TrainingClasses";
import Products from "./pages/Products";
import GiftPlan from "./pages/GiftPlan";
import NotFound from "./pages/NotFound";
import { NutritionistFAB } from "./components/NutritionistFAB";

const queryClient = new QueryClient();

// Storage keys
const ONBOARDING_COMPLETED_KEY = "sara-lucas-onboarding-completed";

// FAB wrapper that hides on certain routes/states
function NutritionistFABWrapper() {
  const location = useLocation();
  
  // Show on main screens
  const showOnRoutes = ["/", "/learn", "/tools", "/profile", "/meals", "/how-it-works", "/recipes"];
  const isRecipeDetail = location.pathname.startsWith("/recipes/");
  const shouldShow = showOnRoutes.includes(location.pathname) || isRecipeDetail;
  
  if (!shouldShow) return null;
  
  return <NutritionistFAB />;
}

// App entry flow manager
function AppEntryFlow({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Check if this is a direct scan access (skip splash/onboarding)
  const isDirectAccess = location.search.includes("direct=1");
  const isScanRoute = location.pathname === "/scan";

  useEffect(() => {
    // Skip splash for direct scan access
    if (isDirectAccess || isScanRoute) {
      setShowSplash(false);
      setShowOnboarding(false);
    }
  }, [isDirectAccess, isScanRoute]);

  const handleSplashComplete = () => {
    setShowSplash(false);
    
    // Check if onboarding was completed before
    const onboardingCompleted = localStorage.getItem(ONBOARDING_COMPLETED_KEY);
    if (!onboardingCompleted) {
      setShowOnboarding(true);
    }
  };

  const handleOnboardingComplete = () => {
    localStorage.setItem(ONBOARDING_COMPLETED_KEY, "true");
    setShowOnboarding(false);
  };

  // Skip entry flow for direct scan access
  if (isDirectAccess || (isScanRoute && !showSplash)) {
    return <>{children}</>;
  }

  // Show splash screen on every app launch
  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  // Show onboarding if not completed
  if (showOnboarding) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return <>{children}</>;
}

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppEntryFlow>
            <Routes>
              {/* Main navigation routes */}
              <Route path="/" element={<Home />} />
              <Route path="/learn" element={<Learn />} />
              <Route path="/learn/course/:courseId" element={<CourseDetail />} />
              <Route path="/tools" element={<Tools />} />
              <Route path="/profile" element={<Profile />} />
              
              {/* Scanner (was the old Index) */}
              <Route path="/scan" element={<Scanner />} />
              
              {/* Feature pages */}
              <Route path="/meals" element={<MyMeals />} />
              <Route path="/how-it-works" element={<HowItWorks />} />
              <Route path="/recipes" element={<FitRecipes />} />
              <Route path="/recipes/:recipeId" element={<RecipeDetail />} />
              
              {/* Premium (legacy - redirect to learn) */}
              <Route path="/premium" element={<Premium />} />
              <Route path="/premium/plans" element={<PersonalizedPlan />} />
              <Route path="/premium/training" element={<TrainingClasses />} />
              <Route path="/premium/products" element={<Products />} />
              <Route path="/premium/gift" element={<GiftPlan />} />
              
              {/* Admin routes */}
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
              <Route path="/admin/academy" element={
                <AdminAuthGuard>
                  <AdminAcademy />
                </AdminAuthGuard>
              } />
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <BottomNav />
            <NutritionistFABWrapper />
          </AppEntryFlow>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
