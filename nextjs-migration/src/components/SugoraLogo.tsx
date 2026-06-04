import React from 'react';

interface SugoraLogoProps {
  className?: string;
  showSlogan?: boolean;
}

export default function SugoraLogo({ className = "h-12", showSlogan = true }: SugoraLogoProps) {
  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Visual Wing Emblem */}
      <svg
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-auto filter drop-shadow-sm shrink-0"
      >
        <g id="SugoraWing">
          {/* Feather 1: Upper Wing (Violet/Purple) */}
          <path
            d="M50 15C32.5 19 18 36.5 15.5 56.5C14.5 64.5 16 71.5 19 76.5C18 73.5 17.5 70 17.5 66C17.5 44.5 35 24.5 50 15Z"
            fill="url(#grad-feather1)"
          />
          {/* Feather 2: Upper Middle (Pink/Red-Orange) */}
          <path
            d="M68 35C49.5 37.5 32.5 54 28 74C26.5 80.5 27 86.5 29.5 91C28 88.5 27.5 85 27.5 81.5C27.5 60.5 45 42 68 35Z"
            fill="url(#grad-feather2)"
          />
          {/* Feather 3: Lower Middle (Amber/Yellow) */}
          <path
            d="M78 52C63 52.5 48.5 66.5 44 83C42.5 88.5 43 93.5 45 97.5C44 95.5 43.5 92.5 43.5 89.5C43.5 71.5 58 57 78 52Z"
            fill="url(#grad-feather3)"
          />
          {/* Feather 4: Lowest Wing Tip (Green/Teal) */}
          <path
            d="M86 68C75 66.5 63 76 58 89C56.5 93 56.5 96.5 57.5 99.5C56.5 98 56 95.5 56 93.5C56 79.5 68.5 69.5 86 68Z"
            fill="url(#grad-feather4)"
          />
        </g>
        
        {/* Definition representing the linear gradients for each wing feather */}
        <defs>
          <linearGradient id="grad-feather1" x1="15.5" y1="15" x2="50" y2="76.5" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#7C3AED" />   {/* Violet-600 */}
            <stop offset="50%" stopColor="#D946EF" />  {/* Fuchsia-500 */}
            <stop offset="100%" stopColor="#EC4899" /> {/* Pink-505 */}
          </linearGradient>
          <linearGradient id="grad-feather2" x1="27.5" y1="35" x2="68" y2="91" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#EC4899" />   {/* Pink-500 */}
            <stop offset="60%" stopColor="#F43F5E" />   {/* Rose-500 */}
            <stop offset="100%" stopColor="#F97316" />  {/* Orange-500 */}
          </linearGradient>
          <linearGradient id="grad-feather3" x1="43.5" y1="52" x2="78" y2="97.5" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#F97316" />   {/* Orange-500 */}
            <stop offset="50%" stopColor="#F59E0B" />  {/* Amber-500 */}
            <stop offset="100%" stopColor="#EAB308" /> {/* Yellow-500 */}
          </linearGradient>
          <linearGradient id="grad-feather4" x1="56" y1="68" x2="86" y2="99.5" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#10B981" />   {/* Emerald-500 */}
            <stop offset="60%" stopColor="#14B8A6" />   {/* Teal-500 */}
            <stop offset="100%" stopColor="#06B6D4" />  {/* Cyan-500 */}
          </linearGradient>
        </defs>
      </svg>

      {/* Sugora Typography */}
      <div className="flex flex-col justify-center">
        <div className="flex items-baseline">
          {/* Custom Stylized S */}
          <span className="text-2xl md:text-3xl font-extrabold italic tracking-tight bg-gradient-to-r from-violet-600 via-fuchsia-500 to-rose-500 bg-clip-text text-transparent transform -skew-x-6">
            S
          </span>
          {/* Bold italic modern letters */}
          <span className="text-xl md:text-2xl font-black italic tracking-wide uppercase bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500 bg-clip-text text-transparent transform -skew-x-6">
            ugora
          </span>
        </div>
        {showSlogan && (
          <span className="text-[7.5px] uppercase tracking-[0.22em] font-extrabold text-gray-400 dark:text-zinc-500 leading-none -mt-0.5">
            Turn Time Into Value
          </span>
        )}
      </div>
    </div>
  );
}
