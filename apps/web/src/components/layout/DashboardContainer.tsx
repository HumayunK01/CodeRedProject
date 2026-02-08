
import React from 'react';

interface DashboardContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const DashboardContainer = ({ children, className = "" }: DashboardContainerProps) => (
  <section className={`relative overflow-hidden bg-primary backdrop-blur-xl rounded-[24px] border border-primary/10 ${className}`}>
    {children}
  </section>
);
