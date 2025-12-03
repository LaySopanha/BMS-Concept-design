
import React, { useState, useMemo } from "react";
import { InventoryItem, SystemCategory, StockTransaction } from "../types";
import { ClipboardList, Search, Plus, Package, X, Box, History, AlertTriangle, Trash2, Edit, TrendingUp, TrendingDown, DollarSign } from "lucide-react";

export const InventoryManagement = ({
  inventory, setInventory, categoriesState
}: {
  inventory: InventoryItem[];
  setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
  categories: SystemCategory[]; // Legacy ref - unused in this component but kept for signature compatibility
  categoriesState: SystemCategory[];
  setCategoriesState: React.Dispatch<React.SetStateAction<SystemCategory[]>>;
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  
  const emptyPart: Partial<InventoryItem> = {
     name: "", sku: "", categoryId: categoriesState[0]?.id || "", location: "", 
     quantity: 0, minStockLevel: 5, unitCost: 0, sellingPrice: 0, supplier: "", description: "", compatibility: [], transactions: []
  };
  const [formData, setFormData] = useState<Partial<InventoryItem>>(emptyPart);

  // Stats Calculation
  const totalValue = useMemo(() => inventory.reduce((acc, item) => acc + (item.quantity * item.unitCost), 0), [inventory]);
  const lowStockCount = useMemo(() => inventory.filter(item => item.quantity <= item.minStockLevel).length, [inventory]);

  const filteredItems = useMemo(() => {
    return inventory.filter(item => {
      const matchCategory = selectedCategory === "all" || item.categoryId === selectedCategory;
      const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.sku.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [inventory, selectedCategory, searchQuery]);

  const handleOpenAdd = () => {
      setFormMode("create");
      setFormData(emptyPart);
      setIsAddModalOpen(true);
  };

  const handleOpenEdit = (item: InventoryItem) => {
      setFormMode("edit");
      setFormData(item);
      setSelectedItem(null); // Close detail view if open behind
      setIsAddModalOpen(true);
  };

  const handleViewDetail = (item: InventoryItem) => {
      setSelectedItem(item);
  };

  const handleDelete = (id: string) => {
      if(confirm("Are you sure you want to delete this item? Transaction history will be lost.")) {
          setInventory(prev => prev.filter(i => i.id !== id));
          setSelectedItem(null);
          setIsAddModalOpen(false);
      }
  };

  const handleSubmit = (e: React.FormEvent) => {
     e.preventDefault();
     if (formMode === "create") {
         const newItem: InventoryItem = {
             ...formData as InventoryItem,
             id: `INV-${Date.now()}`,
             transactions: [
                 { id: `TX-${Date.now()}`, date: new Date().toLocaleDateString(), type: 'IN', quantity: formData.quantity || 0, reference: "Initial Stock", user: "Admin" }
             ]
         };
         setInventory(prev => [newItem, ...prev]);
     } else {
         setInventory(prev => prev.map(item => item.id === formData.id ? { ...formData as InventoryItem } : item));
     }
     setIsAddModalOpen(false);
  };

  const getCategoryName = (id: string) => categoriesState.find(c => c.id === id)?.name || id;

  return (
    <div className="p-8 h-[calc(100vh-64px)] overflow-y-auto bg-slate-50">
       <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
             <div>
                <h1 className="text-2xl font-bold text-slate-800">Spare Parts Inventory</h1>
                <p className="text-slate-500 mt-1">Track stock levels, value, and procurement needs.</p>
             </div>
             <div className="flex gap-4">
                 <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm flex flex-col items-end">
                     <span className="text-[10px] font-bold text-slate-400 uppercase">Total Inventory Value</span>
                     <span className="font-mono font-bold text-emerald-600">${totalValue.toLocaleString()}</span>
                 </div>
                 <button onClick={handleOpenAdd} className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-bold">
                    <Plus size={18} /> Add Item
                 </button>
             </div>
          </div>

          {/* Filters & Search */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-wrap gap-4 items-center">
             <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input 
                  type="text" 
                  placeholder="Search parts by name, SKU..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 w-full border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
             </div>
             <div className="flex items-center gap-2 overflow-x-auto">
                 <button 
                    onClick={() => setSelectedCategory('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap border ${selectedCategory === 'all' ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}
                 >
                    All Parts
                 </button>
                 {categoriesState.map(cat => (
                     <button 
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap border ${selectedCategory === cat.id ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}
                     >
                        {cat.name}
                     </button>
                 ))}
             </div>
          </div>

          {/* Inventory Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
             {filteredItems.map(item => {
                const isLowStock = item.quantity <= item.minStockLevel;
                return (
                   <div 
                      key={item.id} 
                      onClick={() => handleViewDetail(item)}
                      className={`bg-white rounded-xl border shadow-sm hover:shadow-xl transition-all cursor-pointer flex flex-col overflow-hidden group ${isLowStock ? 'border-amber-200 ring-1 ring-amber-100' : 'border-slate-200'}`}
                   >
                      <div className="p-5 flex-1">
                         <div className="flex justify-between items-start mb-3">
                            <span className="text-[10px] font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-500">{item.sku}</span>
                            {isLowStock && (
                                <span className="flex items-center gap-1 text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded animate-pulse">
                                    <AlertTriangle size={10} /> REORDER
                                </span>
                            )}
                         </div>
                         <h3 className="font-bold text-slate-800 mb-1 group-hover:text-blue-600 transition-colors line-clamp-2">{item.name}</h3>
                         <p className="text-xs text-slate-500 mb-4">{getCategoryName(item.categoryId)}</p>
                         
                         <div className="flex items-end justify-between mt-auto">
                             <div>
                                 <span className="block text-[10px] uppercase text-slate-400 font-bold">In Stock</span>
                                 <span className={`text-xl font-bold ${isLowStock ? 'text-amber-600' : 'text-slate-800'}`}>{item.quantity}</span>
                             </div>
                             <div className="text-right">
                                 <span className="block text-[10px] uppercase text-slate-400 font-bold">Price</span>
                                 <span className="text-sm font-medium text-slate-700">${item.sellingPrice.toFixed(2)}</span>
                             </div>
                         </div>
                      </div>
                      <div className="bg-slate-50 px-5 py-2 border-t border-slate-100 flex justify-between items-center text-xs">
                          <span className="text-slate-500 flex items-center gap-1"><Package size={12} /> {item.location}</span>
                          <span className="text-blue-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">View Details →</span>
                      </div>
                   </div>
                );
             })}
          </div>
       </div>

       {/* Item Detail View (Side Panel or Modal) - Using Modal for now */}
       {selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
             <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-start bg-slate-50">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-mono bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-500">{selectedItem.sku}</span>
                            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">{getCategoryName(selectedItem.categoryId)}</span>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900">{selectedItem.name}</h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => handleOpenEdit(selectedItem)} className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit Item">
                            <Edit size={20} />
                        </button>
                        <button onClick={() => setSelectedItem(null)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                            <X size={24} />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Left Column: Stats & Info */}
                    <div className="col-span-1 space-y-6">
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                            <div className="text-xs font-bold text-slate-400 uppercase mb-2">Current Stock</div>
                            <div className="text-4xl font-bold text-slate-800 mb-1">{selectedItem.quantity}</div>
                            {selectedItem.quantity <= selectedItem.minStockLevel && (
                                <div className="flex items-center gap-2 text-xs font-bold text-amber-600 bg-amber-50 p-2 rounded">
                                    <AlertTriangle size={14} /> Low Stock (Min: {selectedItem.minStockLevel})
                                </div>
                            )}
                        </div>

                        <div className="space-y-4">
                            <div>
                                <div className="text-xs font-bold text-slate-400 uppercase mb-1">Pricing</div>
                                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                    <span className="text-sm text-slate-600">Unit Cost</span>
                                    <span className="font-mono font-medium">${selectedItem.unitCost.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                    <span className="text-sm text-slate-600">Selling Price</span>
                                    <span className="font-mono font-bold text-emerald-600">${selectedItem.sellingPrice.toFixed(2)}</span>
                                </div>
                            </div>

                            <div>
                                <div className="text-xs font-bold text-slate-400 uppercase mb-1">Location</div>
                                <div className="text-sm font-medium text-slate-800 flex items-center gap-2">
                                    <Package size={16} className="text-slate-400" />
                                    {selectedItem.location}
                                </div>
                            </div>
                            
                            <div>
                                <div className="text-xs font-bold text-slate-400 uppercase mb-1">Vendor</div>
                                <div className="text-sm font-medium text-slate-800">{selectedItem.supplier}</div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: History & Details */}
                    <div className="col-span-2">
                        <div className="mb-6">
                            <h3 className="text-sm font-bold text-slate-800 uppercase mb-2">Description</h3>
                            <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                                {selectedItem.description || "No description provided."}
                            </p>
                        </div>

                        <div>
                            <h3 className="text-sm font-bold text-slate-800 uppercase mb-4 flex items-center gap-2">
                                <History size={16} /> Stock History
                            </h3>
                            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                                        <tr>
                                            <th className="px-4 py-3 font-medium">Date</th>
                                            <th className="px-4 py-3 font-medium">Type</th>
                                            <th className="px-4 py-3 font-medium">Ref</th>
                                            <th className="px-4 py-3 font-medium text-right">Qty</th>
                                            <th className="px-4 py-3 font-medium text-right">User</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {(selectedItem.transactions || []).length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="px-4 py-8 text-center text-slate-400 italic">No transaction history found.</td>
                                            </tr>
                                        ) : (
                                            selectedItem.transactions.slice().reverse().map(tx => (
                                                <tr key={tx.id} className="hover:bg-slate-50">
                                                    <td className="px-4 py-3 text-slate-600">{tx.date}</td>
                                                    <td className="px-4 py-3">
                                                        <span className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded w-fit ${tx.type === 'IN' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                                            {tx.type === 'IN' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                                            {tx.type}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 font-mono text-xs text-slate-500">{tx.reference}</td>
                                                    <td className={`px-4 py-3 text-right font-bold ${tx.type === 'IN' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                        {tx.type === 'IN' ? '+' : '-'}{tx.quantity}
                                                    </td>
                                                    <td className="px-4 py-3 text-right text-slate-500">{tx.user}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
             </div>
          </div>
       )}

       {/* Add / Edit Modal */}
       {isAddModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
             <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                   <h2 className="text-lg font-bold text-slate-800">{formMode === 'create' ? "Add New Part" : "Edit Part"}</h2>
                   <button onClick={() => setIsAddModalOpen(false)}><X size={20} className="text-slate-400 hover:text-slate-600" /></button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                   <div className="grid grid-cols-2 gap-4">
                       <div className="col-span-2">
                          <label className="block text-sm font-medium text-slate-700 mb-1">Part Name</label>
                          <input required type="text" className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" 
                             value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                       </div>
                       <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">SKU / Code</label>
                          <input required type="text" className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm" 
                             value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} />
                       </div>
                       <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                          <select className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                             value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: e.target.value})}>
                             {categoriesState.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                          </select>
                       </div>
                   </div>

                   <div className="grid grid-cols-3 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
                       <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Initial Stock</label>
                          <input type="number" min="0" className="w-full p-2 border border-slate-300 rounded outline-none" 
                             value={formData.quantity} onChange={e => setFormData({...formData, quantity: parseInt(e.target.value) || 0})} 
                             disabled={formMode === 'edit'} // Disable direct stock edit, use transactions
                             title={formMode === 'edit' ? "Use transactions to adjust stock" : ""}
                          />
                       </div>
                       <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Min Level</label>
                          <input type="number" min="0" className="w-full p-2 border border-slate-300 rounded outline-none" 
                             value={formData.minStockLevel} onChange={e => setFormData({...formData, minStockLevel: parseInt(e.target.value) || 0})} />
                       </div>
                       <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Location</label>
                          <input type="text" className="w-full p-2 border border-slate-300 rounded outline-none" 
                             value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
                       </div>
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                       <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Unit Cost ($)</label>
                          <input type="number" step="0.01" min="0" className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" 
                             value={formData.unitCost} onChange={e => setFormData({...formData, unitCost: parseFloat(e.target.value) || 0})} />
                       </div>
                       <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Selling Price ($)</label>
                          <input type="number" step="0.01" min="0" className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-bold text-emerald-700" 
                             value={formData.sellingPrice} onChange={e => setFormData({...formData, sellingPrice: parseFloat(e.target.value) || 0})} />
                       </div>
                   </div>
                   
                   <div>
                       <label className="block text-sm font-medium text-slate-700 mb-1">Supplier / Vendor</label>
                       <input type="text" className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" 
                          value={formData.supplier} onChange={e => setFormData({...formData, supplier: e.target.value})} />
                   </div>

                   <div>
                       <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                       <textarea rows={2} className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm" 
                          value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                   </div>

                   <div className="flex justify-between items-center pt-4 border-t border-slate-100 mt-2">
                      {formMode === 'edit' && (
                          <button type="button" onClick={() => handleDelete(formData.id!)} className="text-rose-500 hover:text-rose-700 text-sm font-bold flex items-center gap-1">
                              <Trash2 size={16} /> Delete Item
                          </button>
                      )}
                      <div className="flex gap-3 ml-auto">
                          <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-bold text-sm transition-colors">Cancel</button>
                          <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">
                             {formMode === 'create' ? "Create Part" : "Save Changes"}
                          </button>
                      </div>
                   </div>
                </form>
             </div>
          </div>
       )}
    </div>
  );
};
