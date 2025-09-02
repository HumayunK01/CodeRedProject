import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, 
  Microscope, 
  TrendingUp, 
  FileText, 
  Home,
  X 
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
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/50">
        <h2 className="text-lg font-semibold">Navigation</h2>
        {isMobile && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-4 space-y-2">
        {sidebarItems.map((item, index) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <motion.div
              key={item.path}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                to={item.path}
                onClick={isMobile ? onClose : undefined}
                className={cn(
                  "flex items-start space-x-3 p-3 rounded-xl transition-all duration-200",
                  "hover:bg-muted/50 group",
                  isActive && "bg-gradient-primary text-primary-foreground shadow-medical"
                )}
              >
                <Icon className={cn(
                  "h-5 w-5 mt-0.5 transition-transform duration-200",
                  "group-hover:scale-110",
                  isActive ? "text-primary-foreground" : "text-primary"
                )} />
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "font-medium truncate",
                    isActive ? "text-primary-foreground" : "text-foreground"
                  )}>
                    {item.name}
                  </p>
                  <p className={cn(
                    "text-xs truncate mt-0.5",
                    isActive ? "text-primary-foreground/80" : "text-muted-foreground"
                  )}>
                    {item.description}
                  </p>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border/50">
        <div className="text-xs text-muted-foreground">
          <p>BioSentinel v1.0.0</p>
          <p>Medical Decision Support</p>
        </div>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed left-0 top-16 bottom-0 w-80 bg-card/95 backdrop-blur-lg border-r border-border/50 z-50"
          >
            {sidebarContent}
          </motion.aside>
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
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed left-0 top-16 bottom-0 w-64 bg-card/80 backdrop-blur-lg border-r border-border/50 z-40"
        >
          {sidebarContent}
        </motion.aside>
      )}
    </AnimatePresence>
  );
};