import { useEffect, useState } from "react";
import LocomotiveScroll from "locomotive-scroll";
import "locomotive-scroll/dist/locomotive-scroll.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { Preloader } from "@/components/ui/preloader";
import { DbUserProvider } from "@/components/providers/DbUserProvider";

// Pages
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Diagnosis from "./pages/Diagnosis";
import Forecast from "./pages/Forecast";
import Reports from "./pages/Reports";
import About from "./pages/About";
import Docs from "./pages/Docs";
import Status from "./pages/Status";
import Usecase from "./pages/Usecase";
import NotFound from "./pages/NotFound";

// Layout
import { MainLayout } from "./components/layout/MainLayout";

const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/diagnosis" element={<Diagnosis />} />
          <Route path="/forecast" element={<Forecast />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/about" element={<About />} />
          <Route path="/docs" element={<Docs />} />
          <Route path="/status" element={<Status />} />
          <Route path="/usecase" element={<Usecase />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
};

const App = () => {
  const [loading, setLoading] = useState(() => {
    if (typeof window !== 'undefined') {
      return !sessionStorage.getItem("preloader-seen");
    }
    return false;
  });

  useEffect(() => {
    if (loading) {
      sessionStorage.setItem("preloader-seen", "true");
      const timer = setTimeout(() => {
        setLoading(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  useEffect(() => {
    const scroll = new LocomotiveScroll({
      lenisOptions: {
        duration: 1.2,
        lerp: 0.1,
        smoothWheel: true,
        wheelMultiplier: 1,
      }
    });

    return () => {
      scroll.destroy();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" forcedTheme="light" enableSystem={false} storageKey="foresee-theme">
        <TooltipProvider>
          <AnimatePresence>
            {loading && <Preloader />}
          </AnimatePresence>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <DbUserProvider>
              <MainLayout>
                <AnimatedRoutes />
              </MainLayout>
            </DbUserProvider>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;