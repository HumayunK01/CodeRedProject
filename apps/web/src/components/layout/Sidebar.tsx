import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Microscope,
  TrendingUp,
  FileText,
  Home,
  X,
  Activity,
  Brain,
  Zap,
  Database
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isMobile: boolean;
}

const sidebarItems = [
  {
    name: "Home",
    path: "/",
    icon: Home,
    description: "Welcome & overview"
  },
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
    description: "Main control center"
  },
  {
    name: "Diagnosis",
    path: "/diagnosis",
    icon: Microscope,
    description: "Malaria detection"
  },
  {
    name: "Forecast",
    path: "/forecast",
    icon: TrendingUp,
    description: "Outbreak predictions"
  },
  {
    name: "Reports",
    path: "/reports",
    icon: FileText,
    description: "History & exports"
  },
];

export const Sidebar = ({ isOpen, onClose, isMobile }: SidebarProps) => {
  const location = useLocation();

  const sidebarContent = (
    <div className="flex flex-col h-full relative">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-32 h-32 bg-primary/3 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-24 h-24 bg-accent/3 rounded-full blur-2xl animate-pulse delay-1000"></div>
      </div>

      {/* Enhanced Header */}
      <div className="relative p-6 border-b border-border/50 bg-gradient-to-r from-primary/8 via-background/50 to-accent/8 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <motion.div
            className="flex items-center space-x-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <motion.div
              className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30"
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <Activity className="w-5 h-5 text-primary" />
            </motion.div>
            <div>
              <motion.h2
                className="text-lg font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Navigation
              </motion.h2>
              <motion.p
                className="text-xs text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Medical Intelligence Hub
              </motion.p>
            </div>
          </motion.div>

          {isMobile && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Button variant="ghost" size="sm" onClick={onClose} className="hover:bg-primary/10">
                <X className="h-5 w-5" />
              </Button>
            </motion.div>
          )}
        </motion.div>

        {/* Decorative elements */}
        <motion.div
          className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-accent/10 to-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
        />
      </div>

      {/* Enhanced Navigation Items */}
      <nav className="flex-1 p-6 space-y-3 relative z-10">
        {sidebarItems.map((item, index) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <motion.div
              key={item.path}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link
                to={item.path}
                onClick={isMobile ? onClose : undefined}
                className={cn(
                  "relative flex items-start space-x-4 p-4 rounded-xl transition-all duration-300 group overflow-hidden",
                  "hover:shadow-medical-lg",
                  isActive
                    ? "bg-gradient-to-r from-primary via-primary to-accent text-primary-foreground shadow-medical border border-primary/30"
                    : "hover:bg-gradient-to-r hover:from-muted/50 hover:to-muted/30 border border-transparent hover:border-primary/20"
                )}
              >
                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-accent to-primary"
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                )}

                <motion.div
                  className={cn(
                    "p-2.5 rounded-lg transition-all duration-300 flex-shrink-0",
                    isActive
                      ? "bg-primary-foreground/20 shadow-sm"
                      : "bg-gradient-to-br from-primary/10 to-accent/10 group-hover:from-primary/20 group-hover:to-accent/20"
                  )}
                  whileHover={{
                    scale: isActive ? 1 : 1.1,
                    rotate: isActive ? 0 : 5
                  }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <Icon className={cn(
                    "h-5 w-5 transition-all duration-300",
                    isActive ? "text-primary-foreground" : "text-primary group-hover:text-accent"
                  )} />
                </motion.div>

                <div className="flex-1 min-w-0">
                  <motion.p
                    className={cn(
                      "font-semibold truncate transition-colors duration-300",
                      isActive ? "text-primary-foreground" : "text-foreground group-hover:text-primary"
                    )}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    {item.name}
                  </motion.p>
                  <motion.p
                    className={cn(
                      "text-sm truncate mt-1 transition-colors duration-300",
                      isActive ? "text-primary-foreground/80" : "text-muted-foreground group-hover:text-muted-foreground/80"
                    )}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    {item.description}
                  </motion.p>
                </div>

                {/* Hover indicator */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  initial={false}
                  animate={{ opacity: isActive ? 0.1 : 0 }}
                />
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* Enhanced Footer */}
      <div className="relative p-6 border-t border-border/50 bg-gradient-to-r from-background/80 via-background/90 to-background/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-3"
        >
          <div className="flex items-center space-x-2">
            <motion.div
              className="p-1.5 rounded-md bg-gradient-to-br from-primary/10 to-accent/10"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ repeat: Infinity, duration: 4 }}
            >
              <Brain className="h-3 w-3 text-primary" />
            </motion.div>
            <div>
              <p className="text-sm font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                OutbreakLens
              </p>
              <p className="text-xs text-muted-foreground">v1.0.0</p>
            </div>
          </div>

          <div className="text-xs text-muted-foreground space-y-1">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              Medical Decision Support
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="flex items-center space-x-1"
            >
              <div className="w-1.5 h-1.5 bg-success rounded-full animate-pulse"></div>
              <span>AI-Powered Healthcare</span>
            </motion.p>
          </div>
        </motion.div>

        {/* Decorative elements */}
        <motion.div
          className="absolute bottom-0 left-0 w-12 h-12 bg-gradient-to-tr from-primary/5 to-transparent rounded-full"
          animate={{ rotate: -360 }}
          transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
        />
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
              onClick={onClose}
            />

            {/* Sidebar */}
            <motion.aside
              initial={{ x: -320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -320, opacity: 0 }}
              transition={{
                duration: 0.3,
                ease: "easeOut",
                opacity: { duration: 0.2 }
              }}
              className="fixed left-0 top-16 bottom-0 w-80 bg-card/98 backdrop-blur-lg border-r border-border/50 shadow-2xl z-50 overflow-hidden"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          initial={{ x: -300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -300, opacity: 0 }}
          transition={{
            duration: 0.3,
            ease: "easeOut",
            scale: { type: "spring", stiffness: 300, damping: 30 }
          }}
          className="fixed left-0 top-16 bottom-0 w-72 bg-card/95 backdrop-blur-lg border-r border-border/50 shadow-xl z-40 overflow-hidden"
        >
          {sidebarContent}
        </motion.aside>
      )}
    </AnimatePresence>
  );
};