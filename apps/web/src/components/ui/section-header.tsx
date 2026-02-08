
import React from 'react';

interface SectionHeaderProps {
    icon: any;
    title: string;
    subtitle: string;
    rightElement?: React.ReactNode;
}

export const SectionHeader = ({ icon: Icon, title, subtitle, rightElement }: SectionHeaderProps) => (
    <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/5 border border-primary/10 shadow-sm">
                <Icon className="h-5 w-5 text-primary" />
            </div>
            <div>
                <h3 className="text-lg font-semibold text-primary uppercase tracking-tight">{title}</h3>
                <p className="text-[11px] text-foreground/60 font-semibold uppercase tracking-widest leading-none">{subtitle}</p>
            </div>
        </div>
        {rightElement}
    </div>
);
