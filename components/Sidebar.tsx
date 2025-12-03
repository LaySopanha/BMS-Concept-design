
import React from "react";
import { ViewState } from "../types";
import {
  LayoutDashboard,
  Building2,
  Box,
  Wrench,
  ClipboardList,
  Layers,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  ShoppingCart,
  GitPullRequest
} from "lucide-react";

export const Sidebar = ({ 
  isOpen, 
  toggle, 
  currentView, 
  onNavigate 
}: { 
  isOpen: boolean; 
  toggle: () => void; 
  currentView: ViewState; 
  onNavigate: (view: ViewState) => void 
}) => {
  const menuItems: { icon: any; label: string; view: ViewState }[] = [
    { icon: LayoutDashboard, label: "Home", view: "dashboard" },
    { icon: Building2, label: "Clients", view: "clients" },
    { icon: GitPullRequest, label: "Commercial", view: "pipeline" }, // Restored Global View
    { icon: Box, label: "Assets", view: "assets" },
    { icon: Wrench, label: "Work Orders", view: "work-orders" },
    { icon: ClipboardList, label: "Inventory", view: "inventory" },
    { icon: ShoppingCart, label: "Procurement", view: "procurement" },
    { icon: Layers, label: "CDS Care Services", view: "systems" },
    { icon: DollarSign, label: "Finance & Invoices", view: "payment" },
    { icon: BarChart3, label: "Reports", view: "reports" },
  ];

  return (
    <aside 
      className={`
        hidden md:flex flex-col bg-white border-r border-slate-200 
        h-full transition-all duration-300 ease-in-out z-30 shrink-0 overflow-y-auto overflow-x-hidden
        ${isOpen ? 'w-64' : 'w-20'}
      `}
    >
      <div className="flex-1 py-6">
        <nav className="space-y-1 px-3">
          {menuItems.map((item, idx) => {
            const isActive = currentView === item.view;
            return (
              <button 
                key={idx}
                onClick={() => onNavigate(item.view)}
                className={`
                  w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors group relative
                  ${isActive ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}
                `}
                title={!isOpen ? item.label : undefined}
              >
                <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} className="shrink-0" />
                <span className={`font-medium whitespace-nowrap transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden absolute'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
          
          <div className="my-4 border-t border-slate-100 mx-3"></div>

          <button 
            onClick={() => onNavigate('settings')}
            className={`
              w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors group relative
              ${currentView === 'settings' ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}
            `}
            title={!isOpen ? "Settings" : undefined}
          >
            <Settings size={22} className="shrink-0" />
             <span className={`font-medium whitespace-nowrap transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden absolute'}`}>
                Settings
              </span>
          </button>
        </nav>
      </div>

      <div className="p-4 border-t border-slate-100 flex items-center justify-between mt-auto bg-white">
         <button 
            className={`flex items-center gap-3 text-slate-500 hover:text-slate-700 transition-colors ${!isOpen && 'justify-center w-full'}`}
         >
            <LogOut size={20} />
            <span className={`text-sm font-medium ${isOpen ? 'opacity-100' : 'hidden'}`}>Logout</span>
         </button>
         
         {isOpen && (
             <button onClick={toggle} className="p-1 rounded-md hover:bg-slate-100 text-slate-400">
                 <ChevronLeft size={20} />
             </button>
         )}
      </div>
      
      {!isOpen && (
          <div className="p-4 border-t border-slate-100 flex justify-center bg-white">
             <button onClick={toggle} className="p-1 rounded-md hover:bg-slate-100 text-slate-400">
                 <ChevronRight size={20} />
             </button>
          </div>
      )}
    </aside>
  );
};
