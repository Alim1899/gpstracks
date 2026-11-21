import { MOUNTAIN_PATH, SNOW_PATH } from "@/components/Utils/mountainIcon";

// მთის იკონი SVG-ს შიგნით გამოსაყენებლად (მაგ. სიმაღლის პროფილზე)
export function MountainIcon({ x = 0, y = 0, scale = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} aria-hidden="true">
      <path d={MOUNTAIN_PATH} fill="#1c2321" stroke="#fff" strokeWidth="2.5" strokeLinejoin="round" paintOrder="stroke" />
      <path d={SNOW_PATH} fill="#fff" />
    </g>
  );
}