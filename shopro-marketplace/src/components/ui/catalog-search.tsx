/**
 * Component: CatalogSearch
 * Adapted from: AnimatedGlowingSearchBar (shopro-original-21.tsx)
 * DNA Preserved: Conic Gradient Glows, Spin Animation, Masks, Focal Input.
 */

import { cn } from "@/lib/utils";

export function CatalogSearch({ 
  placeholder = "Search catalog...", 
  onSearch,
  className
}: { 
  placeholder?: string; 
  onSearch?: (q: string) => void;
  className?: string;
}) {
  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      <div id="poda" className="relative flex items-center justify-center group w-full max-w-[400px]">
        {/* Outer glow layers — exact original CSS adapted for Tailwind */}
        <div className="absolute z-[-1] overflow-hidden h-full w-full rounded-xl blur-[3px] before:absolute before:content-[''] before:z-[-2] before:w-[999px] before:h-[999px] before:bg-no-repeat before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:rotate-60 before:bg-[conic-gradient(#000,#402fb5_5%,#000_38%,#000_50%,#cf30aa_60%,#000_87%)] before:transition-all before:duration-[2000ms] group-hover:before:rotate-[-120deg] group-focus-within:before:rotate-[420deg] group-focus-within:before:duration-[4000ms]" />
        
        <div className="absolute z-[-1] overflow-hidden h-full w-full rounded-xl blur-[3px] before:absolute before:content-[''] before:z-[-2] before:w-[600px] before:h-[600px] before:bg-no-repeat before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:rotate-[82deg] before:bg-[conic-gradient(rgba(0,0,0,0),#18116a,rgba(0,0,0,0)_10%,rgba(0,0,0,0)_50%,#6e1b60,rgba(0,0,0,0)_60%)] before:transition-all before:duration-[2000ms] group-hover:before:rotate-[-98deg] group-focus-within:before:rotate-[442deg] group-focus-within:before:duration-[4000ms]" />
        
        <div className="absolute z-[-1] overflow-hidden h-full w-full rounded-lg blur-[2px] before:absolute before:content-[''] before:z-[-2] before:w-[600px] before:h-[600px] before:bg-no-repeat before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:rotate-[83deg] before:bg-[conic-gradient(rgba(0,0,0,0)_0%,#a099d8,rgba(0,0,0,0)_8%,rgba(0,0,0,0)_50%,#dfa2da,rgba(0,0,0,0)_58%)] before:brightness-140 before:transition-all before:duration-[2000ms] group-hover:before:rotate-[-97deg] group-focus-within:before:rotate-[443deg] group-focus-within:before:duration-[4000ms]" />
        
        <div id="main" className="relative group w-full">
          <input 
            placeholder={placeholder} 
            type="text" 
            name="text" 
            autoComplete="off"
            onChange={(e) => onSearch?.(e.target.value)} 
            className="bg-[#010201] border-none w-full h-[52px] rounded-lg text-white px-[48px] text-sm focus:outline-none placeholder-gray-500" 
          />
          
          <div id="pink-mask" className="pointer-events-none w-[30px] h-[20px] absolute bg-[#cf30aa] top-[10px] left-[5px] blur-2xl opacity-80 transition-all duration-[2000ms] group-hover:opacity-0" />
          
          <div className="absolute h-[38px] w-[36px] overflow-hidden top-[7px] right-[7px] rounded-lg before:absolute before:content-[''] before:w-[600px] before:h-[600px] before:bg-no-repeat before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:rotate-90 before:bg-[conic-gradient(rgba(0,0,0,0),#3d3a4f,rgba(0,0,0,0)_50%,rgba(0,0,0,0)_50%,#3d3a4f,rgba(0,0,0,0)_100%)] before:brightness-135 before:animate-[spin_4s_linear_infinite]" />
          
          <div id="filter-icon" className="absolute top-1.5 right-1.5 flex items-center justify-center z-[2] h-10 w-9 overflow-hidden rounded-lg bg-gradient-to-b from-[#161329] via-black to-[#1d1b4b] border border-transparent shadow-inner">
            <svg height="20" width="20" viewBox="4.8 4.56 14.832 15.408" fill="none">
              <path d="M8.16 6.65002H15.83C16.47 6.65002 16.99 7.17002 16.99 7.81002V9.09002C16.99 9.56002 16.7 10.14 16.41 10.43L13.91 12.64C13.56 12.93 13.33 13.51 13.33 13.98V16.48C13.33 16.83 13.1 17.29 12.81 17.47L12 17.98C11.24 18.45 10.2 17.92 10.2 16.99V13.91C10.2 13.5 9.97 12.98 9.73 12.69L7.52 10.36C7.23 10.08 7 9.55002 7 9.20002V7.87002C7 7.17002 7.52 6.65002 8.16 6.65002Z" stroke="#d6d6e6" strokeWidth="1" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          
          <div id="search-icon" className="absolute left-4 top-3.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" viewBox="0 0 24 24" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" height="20" fill="none" className="text-gray-400">
              <circle stroke="currentColor" r="8" cy="11" cx="11" />
              <line stroke="currentColor" y2="16.65" y1="22" x2="16.65" x1="22" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
