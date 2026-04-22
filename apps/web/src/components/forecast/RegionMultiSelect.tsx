import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, ChevronDown } from "lucide-react";

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

  const handleSelect = (region: string) => {
    const updated = selected.includes(region)
      ? selected.filter((r) => r !== region)
      : [...selected, region];
    onChange(updated);
  };

  const handleRemove = (region: string) => {
    onChange(selected.filter((r) => r !== region));
  };

  const filteredRegions = regions.filter((r) =>
    r.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild disabled={disabled}>
        <Button
          variant="outline"
          className="w-full justify-start text-left h-auto min-h-10"
        >
          {selected.length === 0 ? (
            <span className="text-muted-foreground">Select regions to compare...</span>
          ) : (
            <div className="flex flex-wrap gap-2 w-full">
              {selected.map((region) => (
                <Badge
                  key={region}
                  variant="secondary"
                  className="flex items-center gap-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(region);
                  }}
                >
                  {region}
                  <X className="h-3 w-3 cursor-pointer hover:opacity-70" />
                </Badge>
              ))}
            </div>
          )}
          <ChevronDown className="h-4 w-4 ml-auto opacity-50 flex-shrink-0" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Search regions..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <ScrollArea className="h-64">
              <div className="p-2">
                {filteredRegions.map((region) => {
                  const isSelected = selected.includes(region);
                  const isDisabled =
                    !isSelected && selected.length >= maxSelections;
                  return (
                    <CommandItem
                      key={region}
                      value={region}
                      onSelect={() => !isDisabled && handleSelect(region)}
                      disabled={isDisabled}
                      className={isDisabled ? "opacity-50 cursor-not-allowed" : ""}
                    >
                      <Checkbox
                        checked={isSelected}
                        disabled={isDisabled}
                        className="mr-2"
                      />
                      <span>{region}</span>
                    </CommandItem>
                  );
                })}
              </div>
            </ScrollArea>
          </CommandList>
        </Command>

        <div className="border-t px-3 py-2 text-xs text-muted-foreground text-center">
          {selected.length}/{maxSelections} selected
        </div>
      </PopoverContent>
    </Popover>
  );
};
