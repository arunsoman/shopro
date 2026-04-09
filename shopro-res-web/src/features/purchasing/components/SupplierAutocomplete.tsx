"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/Button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/Command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover"
import { useSuppliers } from "@/hooks/useSuppliers"
import { Supplier } from "@/types"

export interface SupplierAutocompleteProps {
  value?: number;
  onChange: (supplierId: number) => void;
  onAddNew?: () => void;
  className?: string;
}

export function SupplierAutocomplete({ value, onChange, onAddNew, className }: SupplierAutocompleteProps) {
  const [open, setOpen] = React.useState(false)
  const { data: suppliers = [], isLoading } = useSuppliers()

  const selectedSupplier = suppliers.find((s) => s.id === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between h-10 px-3", className)}
          disabled={isLoading}
        >
          <span className="truncate">
            {selectedSupplier ? selectedSupplier.name : "Select supplier..."}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search supplier..." />
          <CommandList>
            <CommandEmpty>No supplier found.</CommandEmpty>
            <CommandGroup>
              {suppliers.map((supplier) => (
                <CommandItem
                  key={supplier.id}
                  value={supplier.name}
                  onSelect={() => {
                    onChange(supplier.id)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === supplier.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {supplier.name}
                </CommandItem>
              ))}
            </CommandGroup>
            {onAddNew && (
                <>
                  <CommandSeparator />
                  <CommandGroup>
                    <CommandItem 
                        onSelect={() => {
                            setOpen(false)
                            onAddNew()
                        }}
                        className="text-primary font-medium"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add New Supplier
                    </CommandItem>
                  </CommandGroup>
                </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
