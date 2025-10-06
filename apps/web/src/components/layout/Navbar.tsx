import { useState, useEffect } from "react";
import { Menu, Activity, Sun, Moon, Settings, FileText, TrendingUp, Microscope, Zap, Brain, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton
} from "@clerk/clerk-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuShortcut
} from "@/components/ui/dropdown-menu";

interface NavbarProps {
  onMenuClick: () => void;
}

export const Navbar = ({ onMenuClick }: NavbarProps) => {
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + D for dashboard
      if ((e.metaKey || e.ctrlKey) && e.key === "d") {
        e.preventDefault();
        navigate("/dashboard");
      }
      // Cmd/Ctrl + M for diagnosis
      if ((e.metaKey || e.ctrlKey) && e.key === "m") {
        e.preventDefault();
        navigate("/diagnosis");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate]);

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: Activity, shortcut: "⌘D" },
    { name: "Diagnosis", path: "/diagnosis", icon: Microscope, shortcut: "⌘M" },
    { name: "Forecast", path: "/forecast", icon: TrendingUp },
    { name: "Reports", path: "/reports", icon: FileText },
  ];

  const quickActions = [
    { name: "About", path: "/about", icon: FileText },
    { name: "Documentation", path: "/docs", icon: FileText },
    { name: "System Status", path: "/status", icon: Activity },
  ];

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "glass-strong border-b border-border/50 shadow-medical-lg"
          : "glass-strong border-b border-border/30"
      }`}
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        duration: 0.6,
        ease: "easeOut",
        opacity: { duration: 0.4, delay: 0.2 }
      }}
    >
      {/* Enhanced animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-32 h-32 bg-primary/3 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute top-0 right-0 w-24 h-24 bg-accent/3 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <motion.div
          className="absolute top-0 left-1/2 transform -translate-x-1/2 w-96 h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
        />
      </div>

      <div className="flex items-center justify-between h-16 px-4 lg:px-6 relative z-10">
        {/* Enhanced Left Section */}
        <div className="flex items-center space-x-3 lg:space-x-4">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={onMenuClick}
              className="hover:bg-gradient-to-r hover:from-primary/10 hover:to-accent/10 transition-all duration-300 text-foreground hover:text-primary rounded-xl"
              aria-label="Toggle menu"
            >
              <motion.div
                whileHover={{ rotate: 90 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <Menu className="h-5 w-5" />
              </motion.div>
            </Button>
          </motion.div>

          <Link to="/" className="flex items-center space-x-3">
            <motion.div
              className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30"
              animate={{
                boxShadow: [
                  "0 0 10px hsl(var(--primary) / 0.2)",
                  "0 0 15px hsl(var(--primary) / 0.3)",
                  "0 0 10px hsl(var(--primary) / 0.2)"
                ]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Activity className="h-5 w-5 text-primary" />
              <motion.div
                className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10"
                animate={{
                  scale: [1, 1.15, 1],
                  opacity: [0.3, 0.6, 0.3]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center"
            >
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent transition-all duration-300 hidden sm:block">
                  OutbreakLens
                </h1>
                <motion.p
                  className="text-xs text-muted-foreground hidden lg:block"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  Medical Intelligence Platform
                </motion.p>
              </div>
            </motion.div>
          </Link>
        </div>

        {/* Enhanced Center Navigation - Desktop */}
        <nav className="hidden lg:flex items-center justify-center space-x-2 absolute left-1/2 transform -translate-x-1/2">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <motion.div
                key={item.path}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index, duration: 0.4 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to={item.path}
                  className={`group relative px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 flex items-center space-x-2 overflow-hidden ${
                    isActive
                      ? "bg-gradient-to-r from-primary/15 via-primary/10 to-accent/15 text-primary-foreground shadow-medical border border-primary/30"
                      : "text-muted-foreground hover:text-primary hover:bg-gradient-to-r hover:from-primary/8 hover:via-primary/5 hover:to-accent/8 border border-transparent hover:border-primary/30"
                  }`}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-accent"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}

                  <motion.div
                    className={`transition-all duration-300 ${
                      isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary"
                    }`}
                    whileHover={{ scale: 1.1, rotate: isActive ? 0 : 5 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <Icon className="h-4 w-4" />
                  </motion.div>

                  <motion.span
                    className={`transition-all duration-300 ${
                      isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary"
                    }`}
                    animate={{
                      color: isActive ? "hsl(var(--primary-foreground))" : "hsl(var(--muted-foreground))"
                    }}
                    whileHover={{
                      color: "hsl(var(--primary))",
                      x: 2
                    }}
                  >
                    {item.name}
                  </motion.span>

                  {/* Hover glow effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"
                    initial={false}
                  />
                </Link>
              </motion.div>
            );
          })}
        </nav>

        {/* Enhanced Right Section */}
        <div className="flex items-center space-x-2 lg:space-x-3">
          {/* Enhanced Quick Actions Dropdown */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="hover:bg-gradient-to-r hover:from-primary/10 hover:to-accent/10 transition-all duration-300 text-foreground hover:text-primary rounded-xl"
                >
                  <motion.div
                    whileHover={{ rotate: 90 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <Settings className="h-4 w-4" />
                  </motion.div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 p-2">
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center space-x-2 mb-3 px-2"
                >
                  <div className="p-1.5 rounded-md bg-gradient-to-br from-primary/10 to-accent/10">
                    <Zap className="h-4 w-4 text-primary" />
                  </div>
                  <span className="font-medium text-primary">Quick Actions</span>
                </motion.div>
                <DropdownMenuSeparator />
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <motion.div
                      key={action.path}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <DropdownMenuItem asChild>
                        <Link to={action.path} className="flex items-center cursor-pointer p-3 rounded-lg hover:bg-muted/50 transition-colors">
                          <Icon className="h-4 w-4 mr-3 text-muted-foreground" />
                          {action.name}
                        </Link>
                      </DropdownMenuItem>
                    </motion.div>
                  );
                })}
                <DropdownMenuSeparator />
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <DropdownMenuItem onClick={() => navigate("/dashboard")} className="p-3">
                    <Activity className="h-4 w-4 mr-3" />
                    Dashboard
                    <DropdownMenuShortcut className="ml-auto">⌘D</DropdownMenuShortcut>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/diagnosis")} className="p-3">
                    <Microscope className="h-4 w-4 mr-3" />
                    Diagnosis
                    <DropdownMenuShortcut className="ml-auto">⌘M</DropdownMenuShortcut>
                  </DropdownMenuItem>
                </motion.div>
              </DropdownMenuContent>
            </DropdownMenu>
          </motion.div>

          {/* Enhanced Theme Toggle */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="hover:bg-gradient-to-r hover:from-primary/10 hover:to-accent/10 transition-all duration-300 text-foreground hover:text-primary rounded-xl"
              aria-label="Toggle theme"
            >
              <AnimatePresence mode="wait">
                {theme === "dark" ? (
                  <motion.div
                    key="sun"
                    initial={{ rotate: -90, opacity: 0, scale: 0.8 }}
                    animate={{ rotate: 0, opacity: 1, scale: 1 }}
                    exit={{ rotate: 90, opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="relative"
                  >
                    <Sun className="h-4 w-4" />
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-warning/20 to-warning/10 rounded-full"
                      animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="moon"
                    initial={{ rotate: 90, opacity: 0, scale: 0.8 }}
                    animate={{ rotate: 0, opacity: 1, scale: 1 }}
                    exit={{ rotate: -90, opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="relative"
                  >
                    <Moon className="h-4 w-4" />
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-indigo/20 to-purple/10 rounded-full"
                      animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }}
                      transition={{ repeat: Infinity, duration: 2.5 }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
          </motion.div>

          {/* Enhanced Clerk Authentication */}
          <SignedOut>
            <motion.div
              className="flex items-center space-x-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <SignInButton mode="modal">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hover:bg-gradient-to-r hover:from-primary/10 hover:to-accent/10 transition-all duration-300 text-foreground hover:text-primary rounded-xl"
                  >
                    Sign In
                  </Button>
                </SignInButton>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <SignUpButton mode="modal">
                  <Button
                    size="sm"
                    className="btn-medical hidden md:flex shadow-medical hover:shadow-medical-lg transition-all duration-300"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Sign Up
                  </Button>
                </SignUpButton>
              </motion.div>
            </motion.div>
          </SignedOut>

          <SignedIn>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, type: "spring", stiffness: 300 }}
              whileHover={{ scale: 1.05 }}
            >
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "h-10 w-10 border-2 border-primary/20 hover:border-primary/40 transition-colors"
                  }
                }}
              />
            </motion.div>
          </SignedIn>
        </div>
      </div>
    </motion.header>
  );
};