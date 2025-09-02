import { Menu, Activity, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

interface NavbarProps {
  onMenuClick: () => void;
}

export const Navbar = ({ onMenuClick }: NavbarProps) => {
  const { theme, setTheme } = useTheme();
  const location = useLocation();

  const navItems = [
    { name: "About", path: "/about" },
    { name: "Docs", path: "/docs" },
    { name: "Status", path: "/status" },
  ];

  return (
    <motion.header 
      className="fixed top-0 left-0 right-0 z-50 glass-strong border-b border-border/50"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuClick}
            className="hover:bg-primary/10"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="relative">
              <Activity className="h-8 w-8 text-primary group-hover:scale-110 transition-transform duration-200" />
              <div className="absolute inset-0 animate-pulse-glow rounded-full opacity-50" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                BioSentinel
              </h1>
              <p className="text-xs text-muted-foreground -mt-1">
                ML-driven diagnosis & insights
              </p>
            </div>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                location.pathname === item.path
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Right Section */}
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="hover:bg-primary/10"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </motion.header>
  );
};