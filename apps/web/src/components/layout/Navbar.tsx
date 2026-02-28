import { useState, useEffect } from "react";
import { Menu, Activity, TrendingUp, Microscope, Home, FileText, Stethoscope, User, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
  useUser
} from "@clerk/clerk-react";

import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

export const Navbar = () => {

  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const { user } = useUser();
  const isDoctor = user?.publicMetadata?.role === "doctor";
  const isAdmin = user?.publicMetadata?.role === "admin";
  const [isMobile, setIsMobile] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle resize for responsive width
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
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
    { name: "Home", path: "/", icon: Home },
    { name: "Dashboard", path: "/dashboard", icon: Activity },
    { name: "Diagnosis", path: "/diagnosis", icon: Microscope },
    { name: "Forecast", path: "/forecast", icon: TrendingUp },
    { name: "Reports", path: "/reports", icon: FileText },
    ...(isAdmin ? [{ name: "Admin", path: "/admin", icon: ShieldCheck }] : []),
  ];

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 flex justify-center transition-all duration-500 pointer-events-none ${scrolled ? "pt-2" : "pt-4"}`}>
      <motion.nav
        initial={false}
        animate={{
          y: 0,
          opacity: 1,
          width: scrolled ? (isMobile ? "94%" : "85%") : (isMobile ? "96%" : "99%"),
          maxWidth: scrolled ? "1100px" : "1600px"
        }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 20
        }}
        className={`pointer-events-auto transition-all duration-500 ${scrolled
          ? "bg-white/70 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-white/20 py-2 px-6"
          : "bg-white shadow-sm border border-primary/5 py-4 px-8"
          } rounded-[32px] flex items-center justify-between`}
      >
        {/* Left: Logo & Brand */}
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src="/blacklogo.svg"
              alt="Foresee"
              className="h-10 sm:h-12 w-auto object-contain group-hover:scale-105 transition-transform duration-300"
            />
            <span className="font-display font-bold text-xl sm:text-2xl tracking-tight text-primary">
              Foresee
            </span>
          </Link>
        </div>

        {/* Center: Navigation Links (Desktop) */}
        <div className="hidden lg:flex items-center gap-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`relative px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 z-10 ${isActive ? "text-primary" : "text-foreground/70 hover:text-primary"
                  }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="navbar-pill"
                    className="absolute inset-0 bg-primary/10 rounded-full -z-10"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <div className="flex items-center gap-2">
                  <item.icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Right: Actions (Desktop) */}
        <div className="hidden lg:flex items-center gap-3 sm:gap-4">
          <div className="h-6 w-px bg-border/50 mx-2"></div>
          <SignedOut>
            <SignInButton mode="modal">
              <Button className="bg-primary hover:bg-primary-hover text-white rounded-full px-6 shadow-md hover:shadow-lg transition-all duration-300">
                <span className="flex items-center gap-2">Sign In</span>
              </Button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <div className="flex items-center gap-3">
              {/* Role Badge — styled to match the navbar design language */}
              <div className="flex items-center gap-1.5">
                <div className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10">
                  {isDoctor
                    ? <Stethoscope className="w-3.5 h-3.5 text-primary" />
                    : <User className="w-3.5 h-3.5 text-primary" />
                  }
                </div>
                <span className="text-sm font-semibold tracking-wide text-primary">
                  {isDoctor ? "Doctor" : "Patient"}
                </span>
              </div>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8 sm:w-10 sm:h-10 border-2 border-white shadow-sm"
                  }
                }}
              />
            </div>
          </SignedIn>


        </div>

        {/* Mobile Menu Toggle (Visible on small screens) */}
        <div className="lg:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full text-primary"
              >
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px] rounded-l-[24px] border-l border-primary/10 bg-white/95 backdrop-blur-md">
              <div className="flex flex-col h-full py-6">
                <div className="flex items-center gap-3 mb-8 px-2">
                  <img
                    src="/blacklogo.svg"
                    alt="Foresee"
                    className="h-8 w-auto object-contain"
                  />
                  <span className="font-display font-bold text-xl tracking-tight text-primary">
                    Foresee
                  </span>
                </div>

                <div className="flex flex-col gap-2 space-y-1">
                  {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <Link
                        key={item.name}
                        to={item.path}
                        className={`relative px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 ${isActive
                          ? "bg-primary/10 text-primary font-semibold"
                          : "text-foreground/70 hover:text-primary hover:bg-primary/5"
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <item.icon className="w-5 h-5" />
                          <span>{item.name}</span>
                        </div>
                      </Link>
                    );
                  })}



                </div>

                <div className="mt-auto pt-8 border-t border-border/50">
                  <div className="space-y-4 px-2">
                    <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider pl-2">
                      Account
                    </p>
                    <div className="flex items-center gap-4">
                      <SignedOut>
                        <SignInButton mode="modal">
                          <Button className="w-full bg-primary hover:bg-primary-hover text-white rounded-xl shadow-md">
                            Sign In
                          </Button>
                        </SignInButton>
                      </SignedOut>
                      <SignedIn>
                        <div className="flex items-center gap-3 pl-2">
                          <UserButton
                            appearance={{
                              elements: {
                                avatarBox: "w-10 h-10 border-2 border-white shadow-sm"
                              }
                            }}
                          />
                          <div className="flex flex-col gap-0.5">
                            <span className="text-sm font-semibold text-foreground">My Account</span>
                            <div className="flex items-center gap-1">
                              {isDoctor
                                ? <Stethoscope className="w-3 h-3 text-primary" />
                                : <User className="w-3 h-3 text-foreground/40" />
                              }
                              <span className={`text-xs font-semibold ${isDoctor ? "text-primary" : "text-foreground/40"
                                }`}>
                                {isDoctor ? "Doctor" : "Patient"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </SignedIn>
                    </div>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </motion.nav>
    </div>
  );
};