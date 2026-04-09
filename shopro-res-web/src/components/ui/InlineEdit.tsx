import React, { useState, useEffect, useRef } from 'react'
import { Check, X, Edit2 } from 'lucide-react'
import { cn } from "@/lib/utils"
import { Input } from "./Input"
import { Button } from "./Button"

export interface InlineEditProps {
  value: string;
  onSave: (value: string) => void;
  label?: string;
  className?: string;
}

const InlineEdit: React.FC<InlineEditProps> = ({ value, onSave, label, className }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [currentValue, setCurrentValue] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus()
    }
  }, [isEditing])

  const handleSave = () => {
    onSave(currentValue)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setCurrentValue(value)
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <div className={cn("flex items-center gap-1", className)}>
        <Input
          ref={inputRef}
          value={currentValue}
          onChange={(e) => setCurrentValue(e.target.value)}
          className="h-8 text-sm"
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave()
            if (e.key === 'Escape') handleCancel()
          }}
        />
        <Button size="icon" variant="ghost" className="h-8 w-8 text-success" onClick={handleSave}>
          <Check className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="ghost" className="h-8 w-8 text-error" onClick={handleCancel}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <div 
      className={cn("group flex items-center gap-2 cursor-pointer py-1 px-2 -ml-2 rounded hover:bg-muted/30 transition-colors", className)}
      onClick={() => setIsEditing(true)}
    >
      <span className="text-sm font-medium">{value || label || 'Edit'}</span>
      <Edit2 className="h-3.3 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  )
}

export { InlineEdit }
