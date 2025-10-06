import { useState, useEffect } from "react";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";
import Footer from "./Footer";
import { Chatbot } from "@/components/ui/chatbot";
import { ChatbotIntroModal } from "@/components/ui/chatbot-intro-modal";
import { useIsMobile } from "@/hooks/use-mobile";

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showChatbotIntro, setShowChatbotIntro] = useState(false);
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const isMobile = useIsMobile();

  // Check if user has seen chatbot intro before
  useEffect(() => {
    const hasSeenIntro = localStorage.getItem('chatbot-intro-seen');
    if (!hasSeenIntro) {
      // Show intro after a short delay for better UX
      const timer = setTimeout(() => {
        setShowChatbotIntro(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleCloseIntro = () => {
    setShowChatbotIntro(false);
    localStorage.setItem('chatbot-intro-seen', 'true');
  };

  const handleOpenChatFromIntro = () => {
    setChatbotOpen(true);
    setShowChatbotIntro(false);
    localStorage.setItem('chatbot-intro-seen', 'true');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      
      {/* Main Content Area */}
      <div className="flex">
        {/* Sidebar */}
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)}
          isMobile={isMobile}
        />
        
        {/* Page Content */}
        <main className={`flex-1 transition-all duration-300 ${
          !isMobile && sidebarOpen 
            ? 'md:ml-64' 
            : 'ml-0'
        }`}>
          <div className="pt-16 min-h-screen flex flex-col">
            <div className="flex-1">
              {children}
            </div>
            <Footer />
          </div>
        </main>
      </div>
      
      {/* Mobile Sidebar Overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* AI Chatbot */}
      <Chatbot isOpen={chatbotOpen} onToggle={setChatbotOpen} />

      {/* Chatbot Introduction Modal */}
      {showChatbotIntro && (
        <ChatbotIntroModal
          onClose={handleCloseIntro}
          onOpenChat={handleOpenChatFromIntro}
        />
      )}
    </div>
  );
};