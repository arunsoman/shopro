"use client";
import React from "react";
import { cn } from "@/lib/utils";

export function GlowingSearch({
  placeholder = "Search...",
  onSearch,
  className,
}: {
  placeholder?: string;
  onSearch?: (q: string) => void;
  className?: string;
}) {
  return (
    <div className={cn("relative inline-flex items-center", className)}>

      {/* Animated border — spinning conic gradient masked to a 2px ring */}
      <div className="absolute inset-[-2px] rounded-[14px] p-[2px] [background:conic-gradient(from_var(--a),#402fb5_0%,#cf30aa_20%,#a099d8_40%,#402fb5_60%,#cf30aa_80%,#402fb5_100%)] [--a:0deg] animate-[spin-border_3s_linear_infinite] [mask:linear-gradient(#000_0_0)_content-box,linear-gradient(#000_0_0)] [mask-composite:exclude]" />

      {/* Blurred glow copy behind it */}
      <div className="absolute inset-[-3px] rounded-[15px] -z-10 opacity-60 blur-[6px] [background:conic-gradient(from_var(--a),#402fb5_0%,#cf30aa_20%,#a099d8_40%,#402fb5_60%,#cf30aa_80%,#402fb5_100%)] [--a:0deg] animate-[spin-border_3s_linear_infinite]" />

      {/* Animated search lens */}
      <div className="absolute left-[15px] z-10 pointer-events-none animate-[lens-orbit_4s_ease-in-out_infinite]">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="7" stroke="url(#sg-a)" />
          <line x1="16.5" y1="16.5" x2="21" y2="21" stroke="url(#sg-b)" />
          <defs>
            <linearGradient id="sg-a" gradientTransform="rotate(45)">
              <stop offset="0%" stopColor="#a099d8" /><stop offset="100%" stopColor="#cf30aa" />
            </linearGradient>
            <linearGradient id="sg-b" gradientTransform="rotate(45)">
              <stop offset="0%" stopColor="#cf30aa" /><stop offset="100%" stopColor="#402fb5" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <input
        type="text"
        placeholder={placeholder}
        autoComplete="off"
        onChange={(e) => onSearch?.(e.target.value)}
        className={cn(
          "relative z-[1] w-[300px] h-[52px] rounded-xl border-none outline-none",
          "pl-[48px] pr-[52px] text-[15px]",
          "bg-[#f3f1fa] text-[#1a1625] placeholder:text-[#9a94b0]",
          "[@media(prefers-color-scheme:dark)]:bg-[#0d0b12]",
          "[@media(prefers-color-scheme:dark)]:text-[#e8e4f6]",
          "[@media(prefers-color-scheme:dark)]:placeholder:text-[#6b647e]",
        )}
      />

      {/* Fade mask — hides text runoff before filter button */}
      <div className="absolute right-[52px] z-[2] w-[60px] h-[32px] pointer-events-none bg-gradient-to-r from-transparent to-[#f3f1fa] [@media(prefers-color-scheme:dark)]:to-[#0d0b12] group-focus-within:opacity-0" />

      {/* Filter button */}
      <button className="absolute right-2 z-[2] w-9 h-9 rounded-lg flex items-center justify-center border-none cursor-pointer bg-gradient-to-br from-[#ede9f8] to-[#ddd6f3] hover:scale-105 active:scale-95 transition-transform [@media(prefers-color-scheme:dark)]:from-[#1a1530] [@media(prefers-color-scheme:dark)]:to-[#0d0b1a]">
        <svg width="16" height="16" viewBox="4.8 4.56 14.832 15.408" fill="none">
          <path d="M8.16 6.65H15.83C16.47 6.65 16.99 7.17 16.99 7.81V9.09C16.99 9.56 16.7 10.14 16.41 10.43L13.91 12.64C13.56 12.93 13.33 13.51 13.33 13.98V16.48C13.33 16.83 13.1 17.29 12.81 17.47L12 17.98C11.24 18.45 10.2 17.92 10.2 16.99V13.91C10.2 13.5 9.97 12.98 9.73 12.69L7.52 10.36C7.23 10.08 7 9.55 7 9.2V7.87C7 7.17 7.52 6.65 8.16 6.65Z"
            className="stroke-[#7c6fc7] [@media(prefers-color-scheme:dark)]:stroke-[#c4baee]"
            strokeWidth="1.2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  );
}