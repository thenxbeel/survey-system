"use client";

import React from "react";

interface InputProps {
  type?: string;
  placeholder: string;
  icon?: React.ReactNode;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

/**
 * ADNTC CX Platform — Input
 * Light surface, blue focus ring (reference palette).
 */
export default function Input({
  type = "text",
  placeholder,
  icon,
  value,
  onChange,
}: InputProps) {
  return (
    <div className="relative w-full">
      {icon && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8A94A6]">
          {icon}
        </div>
      )}

      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="
          w-full
          rounded-[10px]
          border border-[#E6EDF3]
          bg-white
          py-3
          pr-4
          pl-12
          text-sm
          text-[#333333]
          outline-none
          transition-all
          duration-200
          focus:border-[#0B4A8B]
          focus:ring-4
          focus:ring-[#0B4A8B]/10
          hover:border-[#0B4A8B]/50
          placeholder:text-[#8A94A6]
        "
      />
    </div>
  );
}
