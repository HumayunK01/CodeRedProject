import { Bug, Droplet, Thermometer } from "lucide-react";

export const DISEASES_COVERED = [
  { name: "Dengue", icon: Droplet, tint: "bg-primary/8 text-primary border-primary/15" },
  { name: "Malaria", icon: Bug, tint: "bg-primary/8 text-primary border-primary/15" },
  { name: "Viral Fever", icon: Thermometer, tint: "bg-primary/8 text-primary border-primary/15" },
] as const;

interface DiseaseBadgesProps {
  /** "inline" = compact pill row, "header" = labeled row with icon prefix, "minimal" = just names */
  variant?: "inline" | "header" | "minimal";
  className?: string;
}

export const DiseaseBadges = ({
  variant = "inline",
  className = "",
}: DiseaseBadgesProps) => {
  if (variant === "minimal") {
    return (
      <span className={`text-[10px] text-muted-foreground ${className}`}>
        Covers: {DISEASES_COVERED.map((d) => d.name).join(" · ")}
      </span>
    );
  }

  if (variant === "header") {
    return (
      <div className={`flex items-center gap-2 flex-wrap ${className}`}>
        <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
          Diseases Covered
        </span>
        <div className="flex items-center gap-1.5 flex-wrap">
          {DISEASES_COVERED.map(({ name, icon: Icon, tint }) => (
            <span
              key={name}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-medium ${tint}`}
            >
              <Icon className="h-2.5 w-2.5" />
              {name}
            </span>
          ))}
        </div>
      </div>
    );
  }

  // inline (default)
  return (
    <div className={`flex items-center gap-1.5 flex-wrap ${className}`}>
      {DISEASES_COVERED.map(({ name, icon: Icon, tint }) => (
        <span
          key={name}
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-medium ${tint}`}
        >
          <Icon className="h-2.5 w-2.5" />
          {name}
        </span>
      ))}
    </div>
  );
};
