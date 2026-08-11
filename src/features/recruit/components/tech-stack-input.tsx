"use client";

import { useState, KeyboardEvent } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

interface TechStackInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
}

export function TechStackInput({ 
  value, 
  onChange, 
  placeholder = "엔터키로 기술 스택 추가 (선택)" 
}: TechStackInputProps) {
  const [inputValue, setInputValue] = useState("");

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const newTag = inputValue.trim();
      if (newTag && !value.includes(newTag)) {
        onChange([...value, newTag]);
        setInputValue("");
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter((tag) => tag !== tagToRemove));
  };

  return (
    <div className="space-y-3 w-full">
      <Input
        type="text"
        placeholder={placeholder}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((tag) => (
            <Badge 
              key={tag} 
              variant="secondary" 
              className="bg-secondary text-secondary-foreground hover:bg-secondary/80 pl-2.5 pr-1.5 py-1 text-sm flex items-center gap-1"
            >
              {tag}
              <button 
                type="button" 
                onClick={() => removeTag(tag)}
                className="hover:bg-black/10 rounded-full p-0.5 transition-colors"
                aria-label={`${tag} 삭제`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
