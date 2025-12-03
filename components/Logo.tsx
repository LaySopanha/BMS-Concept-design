import React from "react";

export const Logo = () => (
  <div className="flex items-center gap-2">
    <div className="relative w-8 h-10">
      <svg viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-sm">
        <path d="M50 0L100 30V80C100 105 50 120 50 120" fill="#16a34a" /> 
        <path d="M50 0L0 30V80C0 105 50 120 50 120" fill="#eab308" />   
        <path d="M25 85 L50 95 L75 80" stroke="white" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
    <div className="flex flex-col leading-tight">
      <span className="text-xl font-bold text-slate-800 tracking-tight">CDS <span className="text-brand-green">Care</span></span>
      <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">Facility Management</span>
    </div>
  </div>
);
