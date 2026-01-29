// import { useState, useEffect } from "react";
import { Navbar } from "./Navbar";
import Footer from "./Footer";
// import { Chatbot } from "@/components/ui/chatbot";
// import { ChatbotIntroModal } from "@/components/ui/chatbot-intro-modal";

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  /*
  const [showChatbotIntro, setShowChatbotIntro] = useState(false);
  const [chatbotOpen, setChatbotOpen] = useState(false);

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
  */

  return (
    <div className="min-h-screen bg-background pt-20 lg:pt-24">
      {/* Navbar */}
      <Navbar />

      {/* Main Content Area */}
      <div className="flex">
        {/* Page Content */}
        <main className="flex-1">
          <div className="min-h-screen flex flex-col">
            <div className="flex-1">
              {children}
            </div>
            <Footer />
          </div>
        </main>
      </div>

      {/* AI Chatbot */}
      {/* <Chatbot isOpen={chatbotOpen} onToggle={setChatbotOpen} /> */}

      {/* Chatbot Introduction Modal */}
      {/* {showChatbotIntro && (
        <ChatbotIntroModal
          onClose={handleCloseIntro}
          onOpenChat={handleOpenChatFromIntro}
        />
      )} */}
    </div>
  );
};