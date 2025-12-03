import React, { useState } from "react";
import { SystemCategory } from "../types";
import { Plus, X, Layers } from "lucide-react";

export const SystemManagement = ({
   categoriesState, setCategoriesState
 }: {
   categoriesState: SystemCategory[];
   setCategoriesState: React.Dispatch<React.SetStateAction<SystemCategory[]>>;
 }) => {
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [newCat, setNewCat] = useState({ name: "", code: "" });
 
   const handleCreate = (e: React.FormEvent) => {
     e.preventDefault();
     const cat: SystemCategory = {
       id: `CAT-${newCat.code.toUpperCase()}-${Date.now()}`,
       name: newCat.name,
       code: newCat.code.toUpperCase(),
       icon: Layers // Default icon
     };
     setCategoriesState(prev => [...prev, cat]);
     setIsModalOpen(false);
     setNewCat({ name: "", code: "" });
   };
 
   return (
     <div className="p-8 h-[calc(100vh-64px)] overflow-y-auto bg-slate-50">
        <div className="max-w-5xl mx-auto">
           <div className="flex justify-between items-center mb-8">
              <div>
                 <h1 className="text-2xl font-bold text-slate-800">System Categories (Tier 2)</h1>
                 <p className="text-slate-500 mt-1">Manage functional groups and business lines (e.g., HVAC, Solar, Security).</p>
              </div>
              <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors shadow-sm font-medium">
                 <Plus size={18} /> Add New System
              </button>
           </div>
 
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categoriesState.map(cat => {
                 const CatIcon = cat.icon || Layers;
                 return (
                    <div key={cat.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow">
                       <div className="flex justify-between items-start mb-4">
                          <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                             <CatIcon size={24} />
                          </div>
                          <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded text-slate-500">ID: {cat.code}</span>
                       </div>
                       <h3 className="text-lg font-bold text-slate-800 mb-2">{cat.name}</h3>
                       <p className="text-sm text-slate-500">
                          Active functional tag for asset classification and inventory management.
                       </p>
                    </div>
                 );
              })}
              
              <button onClick={() => setIsModalOpen(true)} className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center text-slate-400 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all group">
                 <Plus size={32} className="mb-2 group-hover:scale-110 transition-transform" />
                 <span className="font-medium">Create New Category</span>
              </button>
           </div>
        </div>
 
        {/* Modal */}
        {isModalOpen && (
           <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
                 <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-slate-800">New System Category</h2>
                    <button onClick={() => setIsModalOpen(false)}><X size={20} className="text-slate-400 hover:text-slate-600" /></button>
                 </div>
                 <form onSubmit={handleCreate} className="p-6 space-y-4">
                    <div>
                       <label className="block text-sm font-medium text-slate-700 mb-1">System Name</label>
                       <input required type="text" placeholder="e.g. Solar Energy" className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                          value={newCat.name} onChange={e => setNewCat({...newCat, name: e.target.value})} />
                    </div>
                    <div>
                       <label className="block text-sm font-medium text-slate-700 mb-1">System Code (Tag)</label>
                       <input required type="text" placeholder="e.g. SOLAR" className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none uppercase" 
                          value={newCat.code} onChange={e => setNewCat({...newCat, code: e.target.value})} />
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                       <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors">Cancel</button>
                       <button type="submit" className="px-4 py-2 bg-slate-800 text-white rounded-lg font-medium hover:bg-slate-700 transition-colors">Create Tag</button>
                    </div>
                 </form>
              </div>
           </div>
        )}
     </div>
   );
};
