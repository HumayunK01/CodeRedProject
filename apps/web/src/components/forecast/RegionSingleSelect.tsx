import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronDown, Check, Search, MapPin, X } from "lucide-react";

interface RegionSingleSelectProps {
  regions: string[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export const RegionSingleSelect = ({
  regions,
  value,
  onChange,
  disabled = false,
  placeholder = "Select a region…",
}: RegionSingleSelectProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const handleSelect = (region: string) => {
    onChange(region);
    setOpen(false);
    setSearch("");
  };

  const filteredRegions = regions.filter((r) =>
    r.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild disabled={disabled}>
        <button
          type="button"
          className={`w-full h-12 px-4 bg-white border rounded-xl transition-all text-left
            ${open ? "border-primary/40 ring-2 ring-primary/10 shadow-sm" : "border-gray-200 hover:border-gray-300"}
            ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          `}
        >
          <div className="flex items-center justify-between h-full">
            <div className="flex items-center gap-2 min-w-0">
              <MapPin
                className={`h-4 w-4 flex-shrink-0 ${
                  value ? "text-primary" : "text-muted-foreground"
                }`}
              />
              <span
                className={`text-sm truncate ${
                  value ? "text-foreground font-medium" : "text-muted-foreground"
                }`}
              >
                {value || placeholder}
              </span>
            </div>
            <ChevronDown
              className={`h-4 w-4 text-muted-foreground transition-transform flex-shrink-0 ${
                open ? "rotate-180" : ""
              }`}
            />
          </div>
        </button>
      </PopoverTrigger>

      <PopoverContent
        className="w-[--radix-popover-trigger-width] p-0 rounded-xl border-gray-200 shadow-lg overflow-hidden"
        align="start"
        sideOffset={6}
      >
        {/* Search */}
        <div className="border-b border-gray-100 px-3 py-2.5 flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <input
            type="text"
            placeholder="Search regions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="p-0.5 rounded hover:bg-gray-100"
            >
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Options */}
        <ScrollArea className="h-64">
          <div className="p-1.5">
            {filteredRegions.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No regions found
              </div>
            ) : (
              filteredRegions.map((region) => {
                const isSelected = value === region;
                return (
                  <button
                    key={region}
                    type="button"
                    onClick={() => handleSelect(region)}
                    className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-left text-sm transition-colors
                      ${
                        isSelected
                          ? "bg-primary/8 text-primary font-medium"
                          : "text-foreground hover:bg-gray-50"
                      }
                    `}
                  >
                    <span className="flex-1 truncate">{region}</span>
                    {isSelected && (
                      <Check className="h-4 w-4 text-primary flex-shrink-0" strokeWidth={2.5} />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};
