import { useState } from "react";
import { Navbar } from "./Navbar";
import Footer from "./Footer";
import { Chatbot } from "@/components/ui/chatbot";

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  const [chatbotOpen, setChatbotOpen] = useState(false);

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
      <Chatbot isOpen={chatbotOpen} onToggle={setChatbotOpen} />
    </div>
  );
};