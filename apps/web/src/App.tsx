import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import { ThemeProvider } from "next-themes";

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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} storageKey="outbreaklens-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <MainLayout>
            <AnimatedRoutes />
          </MainLayout>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;