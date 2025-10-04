import { useState, useEffect } from "react";
import { Menu, Activity, Sun, Moon, Settings, FileText, TrendingUp, Microscope, Zap } from "lucide-react";
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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? "glass-strong border-b border-border/50 shadow-lg" 
          : "glass-strong border-b border-border/30"
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* Top gradient accent */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
      
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        {/* Left Section */}
        <div className="flex items-center space-x-3 lg:space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuClick}
            className="hover:bg-primary/10 transition-colors text-foreground hover:text-foreground"
            aria-label="Toggle menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="relative">
              <Activity className="h-8 w-8 text-primary group-hover:scale-110 group-hover:rotate-12 transition-all duration-300" />
              <motion.div 
                className="absolute inset-0 rounded-full opacity-50"
                animate={{
                  boxShadow: [
                    "0 0 10px hsl(var(--primary) / 0.3)",
                    "0 0 20px hsl(var(--primary) / 0.5)",
                    "0 0 10px hsl(var(--primary) / 0.3)"
                  ]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </div>
            <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent group-hover:tracking-wide transition-all duration-300 hidden sm:block">
              OutbreakLens
            </h1>
          </Link>
        </div>

        {/* Center Navigation - Desktop */}
        <nav className="hidden lg:flex items-center space-x-1">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <motion.div
                key={item.path}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Link
                  to={item.path}
                  className={`group relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  <Icon className={`h-4 w-4 transition-transform duration-200 ${
                    isActive ? "scale-110" : "group-hover:scale-110"
                  }`} />
                  <span>{item.name}</span>
                </Link>
              </motion.div>
            );
          })}
        </nav>

        {/* Right Section */}
        <div className="flex items-center space-x-1 lg:space-x-2">
          {/* Quick Actions Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="hover:bg-primary/10 transition-colors text-foreground hover:text-foreground"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="flex items-center space-x-2">
                <Zap className="h-4 w-4 text-primary" />
                <span>Quick Actions</span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <DropdownMenuItem key={action.path} asChild>
                    <Link to={action.path} className="flex items-center cursor-pointer">
                      <Icon className="h-4 w-4 mr-2" />
                      {action.name}
                    </Link>
                  </DropdownMenuItem>
                );
              })}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                Dashboard
                <DropdownMenuShortcut>⌘D</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/diagnosis")}>
                Diagnosis
                <DropdownMenuShortcut>⌘M</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="hover:bg-primary/10 transition-colors text-foreground hover:text-foreground"
            aria-label="Toggle theme"
          >
            <AnimatePresence mode="wait">
              {theme === "dark" ? (
                <motion.div
                  key="sun"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Sun className="h-4 w-4" />
                </motion.div>
              ) : (
                <motion.div
                  key="moon"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Moon className="h-4 w-4" />
                </motion.div>
              )}
            </AnimatePresence>
          </Button>

          {/* Clerk Authentication */}
          <SignedOut>
            <SignInButton mode="modal">
              <Button
                variant="ghost"
                size="sm"
                className="hover:bg-primary/10 transition-colors text-foreground hover:text-foreground"
              >
                Sign In
              </Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button
                size="sm"
                className="btn-medical hidden md:flex"
              >
                Sign Up
              </Button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <UserButton 
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "h-9 w-9"
                }
              }}
            />
          </SignedIn>
        </div>
      </div>
    </motion.header>
  );
};