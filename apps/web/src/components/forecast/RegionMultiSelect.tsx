import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, ChevronDown, Check, Search, MapPin } from "lucide-react";

interface RegionMultiSelectProps {
  regions: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  maxSelections?: number;
  disabled?: boolean;
}

export const RegionMultiSelect = ({
  regions,
  selected,
  onChange,
  maxSelections = 5,
  disabled = false,
}: RegionMultiSelectProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const handleToggle = (region: string) => {
    const isSelected = selected.includes(region);
    if (isSelected) {
      onChange(selected.filter((r) => r !== region));
    } else if (selected.length < maxSelections) {
      onChange([...selected, region]);
    }
  };

  const handleRemove = (region: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selected.filter((r) => r !== region));
  };

  const clearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange([]);
  };

  const filteredRegions = regions.filter((r) =>
    r.toLowerCase().includes(search.toLowerCase())
  );

  const isAtCapacity = selected.length >= maxSelections;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild disabled={disabled}>
        <button
          type="button"
          className={`w-full min-h-[3rem] px-4 py-2.5 bg-white border rounded-xl transition-all text-left
            ${open ? "border-primary/40 ring-2 ring-primary/10 shadow-sm" : "border-gray-200 hover:border-gray-300"}
            ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          `}
        >
          {selected.length === 0 ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">Select regions to compare…</span>
              </div>
              <ChevronDown
                className={`h-4 w-4 text-muted-foreground transition-transform ${
                  open ? "rotate-180" : ""
                }`}
              />
            </div>
          ) : (
            <div className="flex items-start justify-between gap-2">
              <div className="flex flex-wrap gap-1.5 flex-1 min-w-0">
                {selected.map((region) => (
                  <span
                    key={region}
                    className="inline-flex items-center gap-1.5 pl-2.5 pr-1 py-1 rounded-full bg-primary/8 border border-primary/15 text-primary text-xs font-medium group"
                  >
                    <span>{region}</span>
                    <button
                      type="button"
                      onClick={(e) => handleRemove(region, e)}
                      className="p-0.5 rounded-full hover:bg-primary/15 transition-colors"
                      aria-label={`Remove ${region}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-1 flex-shrink-0 pt-0.5">
                {selected.length > 0 && (
                  <button
                    type="button"
                    onClick={clearAll}
                    className="text-[10px] text-muted-foreground hover:text-foreground font-medium px-1.5 py-0.5 rounded hover:bg-gray-100 transition-colors"
                  >
                    Clear
                  </button>
                )}
                <ChevronDown
                  className={`h-4 w-4 text-muted-foreground transition-transform ${
                    open ? "rotate-180" : ""
                  }`}
                />
              </div>
            </div>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        className="w-[--radix-popover-trigger-width] p-0 rounded-xl border-gray-200 shadow-lg overflow-hidden"
        align="start"
        sideOffset={6}
      >
        {/* Search input */}
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
                const isSelected = selected.includes(region);
                const isDisabled = !isSelected && isAtCapacity;
                return (
                  <button
                    key={region}
                    type="button"
                    onClick={() => handleToggle(region)}
                    disabled={isDisabled}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-sm transition-colors
                      ${
                        isSelected
                          ? "bg-primary/8 text-primary font-medium"
                          : isDisabled
                            ? "opacity-40 cursor-not-allowed"
                            : "text-foreground hover:bg-gray-50"
                      }
                    `}
                  >
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors
                        ${
                          isSelected
                            ? "bg-primary border-primary"
                            : "border-gray-300 bg-white"
                        }
                      `}
                    >
                      {isSelected && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                    </div>
                    <span className="flex-1">{region}</span>
                  </button>
                );
              })
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="border-t border-gray-100 px-3 py-2 flex items-center justify-between bg-gray-50/40">
          <div className="flex items-center gap-1.5">
            <div className="flex gap-0.5">
              {Array.from({ length: maxSelections }).map((_, i) => (
                <div
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${
                    i < selected.length ? "bg-primary" : "bg-gray-200"
                  }`}
                />
              ))}
            </div>
            <span className="text-[11px] text-muted-foreground font-medium">
              {selected.length}/{maxSelections}
            </span>
          </div>
          {isAtCapacity && (
            <span className="text-[10px] text-amber-600 font-medium">
              Max reached
            </span>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
