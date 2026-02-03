import { useState, useEffect, useCallback } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AdminAuthGuard } from "@/components/admin/AdminAuthGuard";
import { BottomNav } from "@/components/navigation/BottomNav";
import { SplashScreen } from "@/components/SplashScreen";
import { Onboarding } from "@/components/Onboarding";
import { useCmsContent } from "@/hooks/useCmsContent";

// Pages
import Home from "./pages/Home";
import Learn from "./pages/Learn";
import CourseDetail from "./pages/CourseDetail";
import EbookViewer from "./pages/EbookViewer";
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
import AdminPurchases from "./pages/AdminPurchases";
import Premium from "./pages/Premium";
import PersonalizedPlan from "./pages/PersonalizedPlan";
import TrainingClasses from "./pages/TrainingClasses";
import Products from "./pages/Products";
import GiftPlan from "./pages/GiftPlan";
import TermsOfUse from "./pages/TermsOfUse";
import Support from "./pages/Support";
import AdminSupport from "./pages/AdminSupport";
import AdminOnboarding from "./pages/AdminOnboarding";
import AdminTestimonials from "./pages/AdminTestimonials";
import NotFound from "./pages/NotFound";
import OAuthReturn from "./pages/OAuthReturn";
import OAuthInitiate from "./pages/OAuthInitiate";
import AdminAuthLogs from "./pages/AdminAuthLogs";
import { NutritionistFAB } from "./components/NutritionistFAB";
import { Footer } from "./components/Footer";
import { logAuthDebugEvent } from "@/lib/authDebug";

const queryClient = new QueryClient();

// Storage keys
const ONBOARDING_COMPLETED_KEY = "sara-lucas-onboarding-completed";
const OAUTH_SKIP_ENTRY_FLOW_KEY = "sara-lucas-oauth-skip-entry-flow";
const SESSION_ENTRY_FLOW_DONE_KEY = "sara-lucas-entry-flow-done";

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

// Footer wrapper that hides on admin routes
function FooterWrapper() {
  const location = useLocation();
  
  // Hide on admin routes and scan
  const hideOnRoutes = location.pathname.startsWith("/admin") || location.pathname === "/scan";
  
  if (hideOnRoutes) return null;
  
  return <Footer />;
}

// App entry flow manager - now CMS-controlled
function AppEntryFlow({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const cms = useCmsContent();
  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isReady, setIsReady] = useState(false);

  // Check if this is a direct scan access or OAuth callback (skip splash/onboarding)
  const isDirectAccess = location.search.includes("direct=1");
  const isScanRoute = location.pathname === "/scan";
  const isAdminRoute = location.pathname.startsWith("/admin");
  // Some browsers/providers strip query params from the final redirect; keep a short-lived
  // session flag so we can still bypass the entry flow right after returning.
  const hasOAuthSkipFlag = sessionStorage.getItem(OAUTH_SKIP_ENTRY_FLOW_KEY) === "1";
  const isOAuthIntermediaryRoute = location.pathname.startsWith("/~oauth");
  const isOAuthCallback = location.search.includes("code=") || 
                          location.hash.includes("access_token=") ||
                          location.search.includes("access_token=");
  
  // Check if entry flow was already completed this session (prevents reset on internal navigation)
  const hasCompletedEntryFlow = sessionStorage.getItem(SESSION_ENTRY_FLOW_DONE_KEY) === "1";

  // Get CMS settings
  const splashEnabled = cms.isFeatureEnabled("app.splash.enabled");
  const onboardingEnabled = cms.isFeatureEnabled("app.onboarding.enabled");
  const showModeValue = cms.get("app.onboarding.showMode", { pt: "always", en: "always" });
  const showMode = showModeValue === "first-visit" ? "first-visit" : "always";

  // Initialize flow based on settings
  useEffect(() => {
    // Log OAuth callback detection for debugging Safari 404 issues
    if (isOAuthCallback || isOAuthIntermediaryRoute) {
      console.log("[OAuth Callback] Detected OAuth return", {
        pathname: location.pathname,
        search: location.search,
        hash: location.hash?.substring(0, 50), // Truncate for security
        hasCode: location.search.includes("code="),
        hasAccessToken: location.hash.includes("access_token=") || location.search.includes("access_token="),
        hasOAuthSkipFlag,
        isOAuthIntermediaryRoute,
      });

      void logAuthDebugEvent({
        stage: "app_oauth_detected",
        metadata: {
          pathname: location.pathname,
          search: location.search,
          hasCode: location.search.includes("code="),
          hasAccessToken:
            location.hash.includes("access_token=") ||
            location.search.includes("access_token="),
          isOAuthIntermediaryRoute,
        },
      });
    }

    // Skip for direct scan access, admin routes, OAuth callbacks, or if entry flow already done this session
    if (isDirectAccess || hasOAuthSkipFlag || isOAuthIntermediaryRoute || isScanRoute || isAdminRoute || isOAuthCallback || hasCompletedEntryFlow) {
      setShowSplash(false);
      setShowOnboarding(false);
      setIsReady(true);

      // Clear one-time OAuth bypass flag
      if (hasOAuthSkipFlag) {
        sessionStorage.removeItem(OAUTH_SKIP_ENTRY_FLOW_KEY);
      }
      return;
    }

    // Wait for CMS to be ready
    if (cms.isLoading) return;

    // Determine if we should show splash
    if (!splashEnabled) {
      setShowSplash(false);
      
      // Check onboarding next
      if (onboardingEnabled) {
        if (showMode === "always") {
          setShowOnboarding(true);
        } else {
          // first-visit mode
          const completed = localStorage.getItem(ONBOARDING_COMPLETED_KEY);
          setShowOnboarding(!completed);
        }
      }
    }

    setIsReady(true);
  }, [isDirectAccess, hasOAuthSkipFlag, isOAuthIntermediaryRoute, isScanRoute, isAdminRoute, isOAuthCallback, hasCompletedEntryFlow, cms.isLoading, splashEnabled, onboardingEnabled, showMode, location.pathname, location.search, location.hash]);

  const handleSplashComplete = useCallback(() => {
    setShowSplash(false);
    
    // Check if onboarding should be shown
    if (onboardingEnabled) {
      if (showMode === "always") {
        setShowOnboarding(true);
      } else {
        // first-visit mode - check localStorage
        const completed = localStorage.getItem(ONBOARDING_COMPLETED_KEY);
        if (!completed) {
          setShowOnboarding(true);
        } else {
          // No onboarding needed, mark entry flow as done
          sessionStorage.setItem(SESSION_ENTRY_FLOW_DONE_KEY, "1");
        }
      }
    } else {
      // No onboarding, mark entry flow as done
      sessionStorage.setItem(SESSION_ENTRY_FLOW_DONE_KEY, "1");
    }
  }, [onboardingEnabled, showMode]);

  const handleOnboardingComplete = useCallback(() => {
    // Save completion for first-visit mode
    if (showMode === "first-visit") {
      localStorage.setItem(ONBOARDING_COMPLETED_KEY, "true");
    }
    // Mark entry flow as done for this session
    sessionStorage.setItem(SESSION_ENTRY_FLOW_DONE_KEY, "1");
    setShowOnboarding(false);
    
    // CRITICAL: Always navigate to Home after onboarding completes
    // This ensures the user lands on the Main Menu, not whatever route was loaded
    // CMS key: app.onboarding.redirectPath - defaults to "/" (Home)
    const redirectPath = cms.get("app.onboarding.redirectPath", { pt: "/", en: "/" });
    navigate(redirectPath, { replace: true });
  }, [showMode, cms, navigate]);

  // Skip entry flow for direct scan access, admin routes, OAuth callbacks, or if already done this session
  if (isDirectAccess || hasOAuthSkipFlag || isOAuthIntermediaryRoute || (isScanRoute && !showSplash) || isAdminRoute || isOAuthCallback || hasCompletedEntryFlow) {
    return <>{children}</>;
  }

  // Wait for CMS to be ready
  if (!isReady || cms.isLoading) {
    return (
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{
          background: `linear-gradient(165deg, hsl(340 50% 78%) 0%, hsl(340 45% 72%) 40%, hsl(30 40% 75%) 100%)`,
        }}
      />
    );
  }

  // Show splash screen
  if (showSplash && splashEnabled) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  // Show onboarding
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
              <Route path="/learn/program/:programId" element={<CourseDetail />} />
              <Route path="/learn/ebook/:ebookId" element={<CourseDetail />} />
              <Route path="/learn/ebook/:ebookId/view" element={<EbookViewer />} />
              <Route path="/learn/bundle/:bundleId" element={<CourseDetail />} />
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
              <Route path="/terms" element={<TermsOfUse />} />
              <Route path="/support" element={<Support />} />
              
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
              <Route path="/admin/purchases" element={
                <AdminAuthGuard>
                  <AdminPurchases />
                </AdminAuthGuard>
              } />
              <Route path="/admin/support" element={
                <AdminAuthGuard>
                  <AdminSupport />
                </AdminAuthGuard>
              } />
              <Route path="/admin/auth-logs" element={
                <AdminAuthGuard>
                  <AdminAuthLogs />
                </AdminAuthGuard>
              } />
              <Route path="/admin/onboarding" element={<AdminOnboarding />} />
              <Route path="/admin/testimonials" element={
                <AdminAuthGuard>
                  <AdminTestimonials />
                </AdminAuthGuard>
              } />
              
              {/* OAuth intermediary routes (Lovable Cloud OAuth return) - must be above catch-all */}
              <Route path="/~oauth/initiate" element={<OAuthInitiate />} />
              <Route path="/~oauth" element={<OAuthReturn />} />
              <Route path="/~oauth/*" element={<OAuthReturn />} />
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <BottomNav />
            <FooterWrapper />
            <NutritionistFABWrapper />
          </AppEntryFlow>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
