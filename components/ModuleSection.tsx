import React from "react";
import { ModuleItem } from "../types";
import { ArrowRight, Info } from "lucide-react";

type ModuleSectionProps = {
  title: string;
  modules: ModuleItem[];
  colorTheme: "emerald" | "blue" | "indigo" | "amber" | "rose";
  note?: string;
  icon?: React.ElementType;
};

const ModernModuleCard: React.FC<{ item: ModuleItem; colorClass: string; bgClass: string; borderClass: string; }> = ({ item, colorClass, bgClass, borderClass }) => {
  const Icon = item.icon;
  
  return (
    <div className="group relative bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full overflow-hidden">
      <div className={`absolute top-0 left-0 w-full h-1 ${bgClass} opacity-80`} />
      
      <div className="p-5 flex-1">
        <div className="flex justify-between items-start mb-4">
          <div className={`p-3.5 rounded-xl ${bgClass} bg-opacity-10 ${colorClass} group-hover:scale-105 transition-transform duration-300`}>
            <Icon size={26} strokeWidth={1.5} />
          </div>
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${bgClass} opacity-75`}></span>
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${bgClass}`}></span>
            </span>
          </div>
        </div>

        <h3 className="text-lg font-bold text-slate-800 mb-1 group-hover:text-blue-700 transition-colors">{item.title}</h3>
        {item.subtitle && <p className="text-sm text-slate-500 mb-3">{item.subtitle}</p>}
        
        <div className="mt-4 pt-4 border-t border-slate-100">
           <div className="flex items-center gap-2 mb-2">
              <span className={`text-xs font-bold uppercase tracking-wider ${colorClass}`}>{item.flowTitle}</span>
              <div className="h-px bg-slate-100 flex-1"></div>
           </div>
           
           <div className="relative">
              <div className={`absolute left-[5px] top-1 bottom-1 w-0.5 ${bgClass} bg-opacity-20`}></div>
              <ul className="space-y-2 relative">
                {item.flowSteps.map((step, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-sm text-slate-600 pl-3 relative">
                     <span className={`absolute left-0 w-2.5 h-2.5 rounded-full border-2 border-white ${bgClass}`}></span>
                     {step}
                  </li>
                ))}
              </ul>
           </div>
        </div>
      </div>
      
      <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex justify-between items-center group-hover:bg-blue-50/50 transition-colors">
         <span className="text-xs font-semibold text-slate-400 group-hover:text-blue-600">Explore Module</span>
         <ArrowRight size={16} className="text-slate-400 group-hover:text-blue-600 transform group-hover:translate-x-1 transition-all" />
      </div>
    </div>
  );
};

export const ModuleSection: React.FC<ModuleSectionProps> = ({ title, modules, colorTheme, note, icon: SectionIcon }) => {
  const themes = {
    emerald: { text: "text-emerald-600", bg: "bg-emerald-500", border: "border-emerald-200" },
    blue: { text: "text-blue-600", bg: "bg-blue-500", border: "border-blue-200" },
    indigo: { text: "text-indigo-600", bg: "bg-indigo-500", border: "border-indigo-200" },
    amber: { text: "text-amber-600", bg: "bg-amber-500", border: "border-amber-200" },
    rose: { text: "text-rose-600", bg: "bg-rose-500", border: "border-rose-200" }
  };
  
  const theme = themes[colorTheme];

  return (
    <section className="mb-10">
      <div className="flex items-center gap-3 mb-6">
        {SectionIcon && <SectionIcon className={`w-6 h-6 ${theme.text}`} />}
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">{title}</h2>
        <div className={`h-1 flex-1 ${theme.bg} bg-opacity-10 rounded-full ml-4`}></div>
      </div>
      
      {note && (
        <div className={`mb-6 p-4 rounded-lg border ${theme.border} ${theme.bg} bg-opacity-5 flex items-start gap-3`}>
           <Info className={`w-5 h-5 ${theme.text} shrink-0 mt-0.5`} />
           <p className="text-sm text-slate-700 font-medium">{note}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {modules.map((item) => (
          <ModernModuleCard 
            key={item.id} 
            item={item} 
            colorClass={theme.text} 
            bgClass={theme.bg}
            borderClass={theme.border}
          />
        ))}
      </div>
    </section>
  );
};
