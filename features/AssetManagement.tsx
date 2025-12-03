
import React, { useState, useMemo } from "react";
import { Asset, AssetStatus, ClientContext, SystemCategory, ServiceScope, WorkOrder, RequestPriority, PipelineItem } from "../types";
import { 
  Building2, 
  Search, 
  Plus, 
  Box, 
  ChevronRight, 
  X, 
  Wrench, 
  Database,
  Save,
  UserCheck,
  MoreVertical,
  ImageIcon,
  ClipboardList,
  CheckCircle2,
  AlertCircle,
  Edit,
  User,
  Upload,
  Calendar,
  QrCode,
  Printer,
  FileText
} from "lucide-react";
import { StatusBadge } from "../components/StatusBadge";

export const AssetManagement = ({ 
  assets, setAssets, clients, categories, onLogRequest
}: { 
  assets: Asset[]; 
  setAssets: React.Dispatch<React.SetStateAction<Asset[]>>;
  clients: ClientContext[];
  categories: SystemCategory[];
  onLogRequest: (req: Partial<PipelineItem>) => void;
}) => {
  const [selectedClient, setSelectedClient] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  // UI State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"view" | "edit" | "create">("view");
  const [activeTab, setActiveTab] = useState<'details' | 'qrcode'>('details');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  
  // Create Request Modal State
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [pendingRequestAsset, setPendingRequestAsset] = useState<Asset | null>(null);
  const [requestFormData, setRequestFormData] = useState({
     title: "",
     description: "",
     priority: "Medium" as RequestPriority,
  });

  // Form State
  const emptyAsset: Partial<Asset> = {
    name: "", code: "", clientId: "", categoryId: "", location: "", 
    quantity: 1, status: "Active", model: "", serialNumber: "", vendor: "", 
    department: "", attributes: {}, requests: [], serviceScope: "Service",
    image: ""
  };
  const [formData, setFormData] = useState<Partial<Asset>>(emptyAsset);
  const [assignedTechnician, setAssignedTechnician] = useState("");

  // Filter Logic
  const filteredAssets = useMemo(() => {
    return assets.filter(asset => {
      const matchClient = selectedClient === "all" || asset.clientId === selectedClient;
      const matchCategory = selectedCategory === "all" || asset.categoryId === selectedCategory;
      const matchSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          asset.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          asset.serialNumber.toLowerCase().includes(searchQuery.toLowerCase());
      return matchClient && matchCategory && matchSearch;
    });
  }, [assets, selectedClient, selectedCategory, searchQuery]);

  // Dynamic Categories: Only show categories that exist for the selected client
  const visibleCategories = useMemo(() => {
    if (selectedClient === "all") return categories;
    const clientAssetCatIds = new Set(assets.filter(a => a.clientId === selectedClient).map(a => a.categoryId));
    return categories.filter(c => clientAssetCatIds.has(c.id));
  }, [categories, assets, selectedClient]);

  // Actions
  const handleCreateNew = () => {
    setFormData(emptyAsset);
    setViewMode("create");
    setActiveTab("details");
    setAssignedTechnician("");
    setIsModalOpen(true);
  };

  const handleViewDetails = (asset: Asset) => {
    setSelectedAsset(asset);
    setFormData(asset);
    setAssignedTechnician(""); 
    setViewMode("view");
    setActiveTab("details");
    setIsModalOpen(true);
  };

  // UPDATED: Now opens "Log Request" modal
  const handleLogRequestClick = (e: React.MouseEvent, asset: Asset) => {
    e.stopPropagation(); 
    // Pre-fill form
    setPendingRequestAsset(asset);
    setRequestFormData({
       title: `Issue: ${asset.name}`,
       description: `Issue reported for ${asset.name} (${asset.code}).`,
       priority: "Medium",
    });
    setIsRequestModalOpen(true);
  };

  const submitRequest = (e: React.FormEvent) => {
      e.preventDefault();
      if (!pendingRequestAsset || !pendingRequestAsset.id) return;
      
      // Call prop to create pipeline item
      onLogRequest({
          clientId: pendingRequestAsset.clientId,
          assetId: pendingRequestAsset.id,
          title: requestFormData.title,
          description: requestFormData.description,
          priority: requestFormData.priority
      });
      
      alert(`Request Logged Successfully! View in 'Commercial' Pipeline.`);
      setIsRequestModalOpen(false);
      setPendingRequestAsset(null);
      setIsModalOpen(false); // Close parent modal if open
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (viewMode === "create") {
      const newAsset: Asset = {
        ...formData as Asset,
        id: `AST-${Date.now()}`,
        purchaseCost: 0,
        warrantyExpiry: "",
        movementHistory: [],
        maintenanceHistory: [],
        requests: [],
        image: formData.image || undefined 
      };
      setAssets(prev => [newAsset, ...prev]);
    } else {
      setAssets(prev => prev.map(a => a.id === formData.id ? { ...a, ...formData } as Asset : a));
      setSelectedAsset(formData as Asset); 
    }
    setViewMode("view");
    if (viewMode === "create") setIsModalOpen(false);
  };

  const handleAttributeChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, attributes: { ...prev.attributes, [key]: value } }));
  };

  const getClientName = (id?: string) => clients.find(c => c.id === id)?.name || "Unknown";
  const getCategoryName = (id?: string) => categories.find(c => c.id === id)?.name || "Unknown";

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-slate-50">
      {/* 1. Context Sidebar */}
      <div className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 z-10">
        <div className="p-4 border-b border-slate-100">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Context (Tier 1)</h3>
          <div className="font-bold text-slate-800 text-lg flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            Clients / Sites
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          <button
             onClick={() => { setSelectedClient("all"); setSelectedCategory("all"); }}
             className={`w-full text-left px-4 py-3 border-l-4 transition-colors ${selectedClient === 'all' ? 'border-blue-600 bg-blue-50' : 'border-transparent hover:bg-slate-50'}`}
          >
             <span className="font-medium text-slate-700 block">All Locations</span>
             <span className="text-xs text-slate-400">{assets.length} Assets Total</span>
          </button>
          {clients.map(client => {
             const count = assets.filter(a => a.clientId === client.id).length;
             return (
               <button
                 key={client.id}
                 onClick={() => { setSelectedClient(client.id); setSelectedCategory("all"); }}
                 className={`w-full text-left px-4 py-3 border-l-4 transition-colors relative ${selectedClient === client.id ? 'border-blue-600 bg-blue-50' : 'border-transparent hover:bg-slate-50'}`}
               >
                 <span className="font-medium text-slate-700 block">{client.name}</span>
                 <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-600">{client.type}</span>
                    <span className="text-xs text-slate-400">{count} Assets</span>
                 </div>
               </button>
             );
          })}
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0 relative">
         {/* 2. Top Bar: Filters & Actions */}
         <div className="bg-white border-b border-slate-200 px-6 py-4 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center z-10">
            <div>
               <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  {selectedClient === "all" ? "Global Asset Registry" : clients.find(c => c.id === selectedClient)?.name}
               </h2>
               <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">System Filter:</span>
                  <div className="flex gap-2 overflow-x-auto no-scrollbar max-w-[500px]">
                    <button 
                        onClick={() => setSelectedCategory("all")}
                        className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors whitespace-nowrap ${selectedCategory === 'all' ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}
                    >
                        All
                    </button>
                    {visibleCategories.map(cat => {
                      const CatIcon = cat.icon || Box;
                      return (
                        <button 
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors flex items-center gap-1.5 whitespace-nowrap ${selectedCategory === cat.id ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}
                        >
                            <CatIcon size={12} />
                            {cat.name}
                        </button>
                      );
                    })}
                  </div>
               </div>
            </div>
            
            <div className="flex items-center gap-3 w-full md:w-auto">
               <div className="relative flex-1 md:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input 
                    type="text" 
                    placeholder="Search name, code, SN..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                  />
               </div>
               <button 
                 onClick={handleCreateNew} 
                 className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors shadow-md active:scale-95"
               >
                  <Plus size={18} /> Add Asset
               </button>
            </div>
         </div>

         {/* 3. Main Asset Grid (Visual Cards) */}
         <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
               {filteredAssets.map(asset => {
                  const cat = categories.find(c => c.id === asset.categoryId);
                  const CatIcon = cat?.icon || Box;
                  const hasActiveSO = !!asset.activeSO;
                  
                  return (
                     <div 
                        key={asset.id} 
                        onClick={() => handleViewDetails(asset)} 
                        className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group flex flex-col overflow-hidden"
                     >
                        {/* Image Header */}
                        <div className="h-40 bg-slate-100 relative overflow-hidden group-hover:opacity-90 transition-opacity">
                            {asset.image ? (
                                <img src={asset.image} alt={asset.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-50">
                                    <ImageIcon size={48} strokeWidth={1.5} />
                                </div>
                            )}
                            <div className="absolute top-3 right-3">
                                <StatusBadge status={asset.status} />
                            </div>
                            <div className="absolute bottom-3 left-3 flex gap-1">
                                {(asset.serviceScope === 'Service' || asset.serviceScope === 'Both') && (
                                    <span className="px-2 py-1 bg-blue-600/90 text-white text-[10px] font-bold rounded flex items-center gap-1 backdrop-blur-sm shadow-sm">
                                        <Wrench size={10} /> Service
                                    </span>
                                )}
                                {(asset.serviceScope === 'SparePart' || asset.serviceScope === 'Both') && (
                                    <span className="px-2 py-1 bg-emerald-600/90 text-white text-[10px] font-bold rounded flex items-center gap-1 backdrop-blur-sm shadow-sm">
                                        <ClipboardList size={10} /> Parts
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="p-4 flex-1 flex flex-col">
                           <div className="flex items-center gap-2 mb-2 text-xs font-medium text-slate-500">
                                <CatIcon size={14} className="text-blue-500" />
                                <span>{cat?.name}</span>
                           </div>
                           
                           <h3 className="font-bold text-slate-800 text-lg leading-tight mb-1 group-hover:text-blue-600 transition-colors line-clamp-2">{asset.name}</h3>
                           <p className="text-sm text-slate-500 mb-4 line-clamp-1">{asset.location}</p>
                           
                           {/* Action Section */}
                           <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Service</span>
                                    {hasActiveSO ? (
                                        <span className="text-xs font-bold text-amber-600 flex items-center gap-1">
                                            <AlertCircle size={12} /> Pending SO
                                        </span>
                                    ) : (
                                        <span className="text-xs font-medium text-emerald-600">Available</span>
                                    )}
                                </div>
                                
                                <button 
                                    onClick={(e) => handleLogRequestClick(e, asset)}
                                    className="px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-1 shadow-sm"
                                >
                                    <FileText size={12} /> Log Request
                                </button>
                           </div>
                        </div>
                     </div>
                  );
               })}
            </div>
         </div>

         {/* 4. Log Request Modal (Replaced SO Modal) */}
         {isRequestModalOpen && pendingRequestAsset && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
               <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                  <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                      <div>
                        <h2 className="text-lg font-bold text-slate-800">Log Asset Issue</h2>
                        <p className="text-xs text-slate-500">Creates a ticket in the Commercial Pipeline</p>
                      </div>
                     <button onClick={() => setIsRequestModalOpen(false)}><X size={20} className="text-slate-400 hover:text-slate-600" /></button>
                  </div>
                  
                  <form onSubmit={submitRequest} className="p-6 space-y-4">
                     {/* Asset Summary */}
                     <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 flex items-start gap-3 mb-4">
                        <div className="p-2 bg-white rounded-md border border-blue-100 text-blue-600">
                           <Box size={18} />
                        </div>
                        <div>
                           <div className="text-sm font-bold text-slate-800">{pendingRequestAsset.name}</div>
                           <div className="text-xs text-slate-500 font-mono">{pendingRequestAsset.code} • {pendingRequestAsset.location}</div>
                        </div>
                     </div>

                     <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Issue Title</label>
                        <input required type="text" className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" 
                           value={requestFormData.title} onChange={e => setRequestFormData({...requestFormData, title: e.target.value})} />
                     </div>
                     
                     <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Description</label>
                        <textarea required rows={3} className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm" 
                           value={requestFormData.description} onChange={e => setRequestFormData({...requestFormData, description: e.target.value})} />
                     </div>

                     <div>
                           <label className="block text-sm font-bold text-slate-700 mb-1">Priority</label>
                           <select className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                              value={requestFormData.priority} onChange={e => setRequestFormData({...requestFormData, priority: e.target.value as RequestPriority})}>
                              <option value="Low">Low</option>
                              <option value="Medium">Medium</option>
                              <option value="High">High</option>
                           </select>
                     </div>

                     <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-2">
                        <button type="button" onClick={() => setIsRequestModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-bold text-sm transition-colors">Cancel</button>
                        <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">
                           Submit Request
                        </button>
                     </div>
                  </form>
               </div>
            </div>
         )}

         {/* 5. Asset Detail Modal */}
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
               <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col overflow-hidden">
                  
                  {/* Modal Header */}
                  <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-start bg-white">
                     <div>
                        <h2 className="text-2xl font-bold text-slate-900">{formData.name || "New Asset"}</h2>
                        <p className="text-sm text-slate-500 font-mono mt-1">{formData.code || "NO-CODE"}</p>
                     </div>
                     <div className="flex items-center gap-3">
                        <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-colors">
                            <X size={24} />
                        </button>
                     </div>
                  </div>
                  
                  {/* Tab Navigation */}
                  <div className="px-6 border-b border-slate-200 bg-slate-50 flex gap-6">
                      <button 
                        onClick={() => setActiveTab('details')}
                        className={`py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'details' ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                      >
                          Asset Details
                      </button>
                      <button 
                        onClick={() => setActiveTab('qrcode')}
                        className={`py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'qrcode' ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                      >
                          <QrCode size={16} /> QR Tag
                      </button>
                  </div>

                  {/* Modal Content - Scrollable */}
                  <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
                    
                    {activeTab === 'details' && (
                        <form onSubmit={handleSave} className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                             
                             {/* Status & Assignment Bar */}
                             <div className="flex flex-col md:flex-row gap-4">
                                 <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex-1">
                                     <span className="block text-xs font-bold text-slate-400 uppercase mb-2">Current Status</span>
                                     <div className="flex items-center gap-3">
                                        <StatusBadge status={formData.status as AssetStatus || "Active"} />
                                        {viewMode !== 'view' && (
                                            <select 
                                                className="text-sm border border-slate-300 rounded p-1"
                                                value={formData.status}
                                                onChange={(e) => setFormData({...formData, status: e.target.value as AssetStatus})}
                                            >
                                                <option value="Active">Active</option>
                                                <option value="Under Maintenance">Under Maintenance</option>
                                                <option value="Damaged">Damaged</option>
                                                <option value="Decommissioned">Decommissioned</option>
                                            </select>
                                        )}
                                     </div>
                                 </div>
                                 
                                 <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex-[2] flex items-end gap-3">
                                     <div className="flex-1">
                                         <label className="block text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-1">
                                             <UserCheck size={12} /> Default Technician
                                         </label>
                                         <div className="relative">
                                             <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                             <input 
                                                type="text" 
                                                placeholder="Enter Technician Name..." 
                                                className="w-full pl-9 pr-4 py-2 border-b border-slate-300 focus:border-blue-500 outline-none text-sm bg-transparent"
                                                value={assignedTechnician}
                                                onChange={(e) => setAssignedTechnician(e.target.value)}
                                             />
                                         </div>
                                     </div>
                                 </div>
                             </div>
                             
                             {/* Image Section */}
                             <div>
                                <h3 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2 mb-4">Asset Image</h3>
                                <div className="flex flex-col md:flex-row gap-6">
                                    <div className="w-full md:w-64 h-48 bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-center overflow-hidden relative">
                                        {formData.image ? (
                                            <img src={formData.image} alt="Asset Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="flex flex-col items-center text-slate-400">
                                                <ImageIcon size={48} strokeWidth={1} />
                                                <span className="text-xs mt-2 font-medium">No Image</span>
                                            </div>
                                        )}
                                    </div>
                                    {viewMode !== 'view' && (
                                        <div className="flex-1 flex flex-col justify-center">
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Upload New Image</label>
                                            <div className="flex items-center gap-4">
                                                <label className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors shadow-sm">
                                                    <Upload size={16} className="text-slate-500" />
                                                    <span className="text-sm font-medium text-slate-700">Choose File</span>
                                                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                                                </label>
                                                <span className="text-xs text-slate-400">JPG, PNG, WebP up to 5MB</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                             </div>

                             {/* Identification Section */}
                             <div>
                                 <h3 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2 mb-4">Identification</h3>
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                     <div>
                                         <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Asset Name</label>
                                         {viewMode === 'view' ? (
                                             <div className="text-slate-900 font-medium text-lg">{formData.name}</div>
                                         ) : (
                                             <input type="text" className="w-full p-2 border border-slate-300 rounded" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                                         )}
                                     </div>
                                     <div>
                                         <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Serial Number</label>
                                         {viewMode === 'view' ? (
                                             <div className="text-slate-900 font-mono">{formData.serialNumber || "N/A"}</div>
                                         ) : (
                                             <input type="text" className="w-full p-2 border border-slate-300 rounded" value={formData.serialNumber} onChange={e => setFormData({...formData, serialNumber: e.target.value})} />
                                         )}
                                     </div>
                                     <div>
                                         <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Asset Code</label>
                                         {viewMode === 'view' ? (
                                             <div className="text-slate-900 font-mono">{formData.code}</div>
                                         ) : (
                                             <input type="text" className="w-full p-2 border border-slate-300 rounded" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} />
                                         )}
                                     </div>
                                     <div>
                                         <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Specific Location</label>
                                         {viewMode === 'view' ? (
                                             <div className="text-slate-900">{formData.location}</div>
                                         ) : (
                                             <input type="text" className="w-full p-2 border border-slate-300 rounded" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
                                         )}
                                     </div>
                                     <div>
                                         <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Model</label>
                                         {viewMode === 'view' ? (
                                             <div className="text-slate-900">{formData.model || "-"}</div>
                                         ) : (
                                             <input type="text" className="w-full p-2 border border-slate-300 rounded" value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} />
                                         )}
                                     </div>
                                 </div>
                             </div>

                             {/* Classification Section */}
                             <div>
                                 <h3 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2 mb-4">Classification</h3>
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                     <div>
                                         <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Client / Site (Tier 1)</label>
                                         <div className="text-slate-900 font-medium bg-slate-100 px-3 py-2 rounded border border-slate-200 inline-block">
                                            {getClientName(formData.clientId)}
                                         </div>
                                     </div>
                                     <div>
                                         <label className="block text-xs font-bold text-slate-500 uppercase mb-1">System Category (Tier 2)</label>
                                         <div className="text-slate-900 font-medium">
                                            {getCategoryName(formData.categoryId)}
                                         </div>
                                     </div>
                                     <div>
                                         <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Vendor</label>
                                         {viewMode === 'view' ? (
                                             <div className="text-slate-900">{formData.vendor || "Unknown"}</div>
                                         ) : (
                                             <input type="text" className="w-full p-2 border border-slate-300 rounded" value={formData.vendor} onChange={e => setFormData({...formData, vendor: e.target.value})} />
                                         )}
                                     </div>
                                     <div>
                                         <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Service Scope</label>
                                         {viewMode === 'view' ? (
                                             <div className="text-slate-900 font-medium">{formData.serviceScope}</div>
                                         ) : (
                                             <select className="p-2 border border-slate-300 rounded" value={formData.serviceScope} onChange={e => setFormData({...formData, serviceScope: e.target.value as any})}>
                                                <option value="Service">Service</option>
                                                <option value="SparePart">Spare Parts</option>
                                                <option value="Both">Both</option>
                                             </select>
                                         )}
                                     </div>
                                 </div>
                             </div>

                             {/* Technical Attributes Card */}
                             <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                 <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex items-center gap-2">
                                    <Database size={16} className="text-blue-500" />
                                    <h4 className="font-bold text-slate-800">Technical Attributes</h4>
                                 </div>
                                 <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {Object.entries(formData.attributes || {}).map(([key, value]) => (
                                        <div key={key}>
                                            <label className="block text-xs text-slate-400 mb-1">{key}</label>
                                            {viewMode === 'view' ? (
                                                <div className="font-semibold text-slate-800">{value}</div>
                                            ) : (
                                                <input 
                                                    type="text" 
                                                    className="w-full p-2 border border-slate-300 rounded text-sm"
                                                    value={value as string}
                                                    onChange={(e) => handleAttributeChange(key, e.target.value)}
                                                />
                                            )}
                                        </div>
                                    ))}
                                    {viewMode !== 'view' && (
                                        <button type="button" className="flex items-center gap-2 text-blue-600 text-sm font-bold border border-dashed border-blue-300 rounded p-2 justify-center hover:bg-blue-50">
                                            <Plus size={16} /> Add Attribute
                                        </button>
                                    )}
                                 </div>
                             </div>

                             {/* Hidden Submit Button for Form */}
                             <button type="submit" className="hidden" />

                        </form>
                    )}

                    {activeTab === 'qrcode' && (
                        <div className="flex flex-col items-center justify-center h-full animate-in fade-in zoom-in duration-300 py-8">
                             <div className="bg-white p-8 rounded-xl border-2 border-slate-800 shadow-2xl max-w-sm w-full text-center relative">
                                 {/* Print Mock */}
                                 <div className="absolute top-0 left-0 w-full h-2 bg-slate-800"></div>
                                 
                                 <div className="flex justify-between items-center mb-6">
                                     <span className="font-bold text-slate-800 text-lg">CDS Care Asset Tag</span>
                                     <span className="font-mono text-xs text-slate-400">{formData.code}</span>
                                 </div>
                                 
                                 <div className="bg-white p-2 inline-block">
                                     {/* QR Code Placeholder using API for visual */}
                                     <img 
                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${JSON.stringify({id: formData.id, code: formData.code})}`} 
                                        alt="Asset QR" 
                                        className="w-48 h-48 mix-blend-multiply"
                                     />
                                 </div>
                                 
                                 <div className="mt-6 border-t-2 border-dashed border-slate-200 pt-4">
                                     <h3 className="font-bold text-xl text-slate-900">{formData.name}</h3>
                                     <p className="text-sm text-slate-500 mt-1">{formData.location}</p>
                                     <p className="text-xs font-mono text-slate-400 mt-2">ID: {formData.id}</p>
                                 </div>
                             </div>
                             
                             <div className="mt-8 flex gap-4">
                                 <button 
                                    type="button" 
                                    onClick={() => alert("Sending to label printer...")}
                                    className="px-6 py-3 bg-slate-800 text-white font-bold rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-2 shadow-lg"
                                 >
                                     <Printer size={18} /> Print Label
                                 </button>
                             </div>
                             <p className="text-sm text-slate-500 mt-4 max-w-md text-center">
                                 Print this tag and affix it to the physical asset. Technicians can scan this code with the mobile app to instantly view maintenance history or report issues.
                             </p>
                        </div>
                    )}
                  </div>
                  
                  {/* Footer Action Area */}
                  {activeTab === 'details' && (
                    <div className="p-6 border-t border-slate-200 bg-white flex justify-end gap-4">
                        {viewMode === 'view' ? (
                            <>
                                <button 
                                    type="button" 
                                    onClick={() => setViewMode('edit')} 
                                    className="px-6 py-3 border border-slate-300 text-slate-700 font-bold rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2"
                                >
                                    <Edit size={18} /> Edit Asset
                                </button>
                                
                                <button 
                                    type="button" 
                                    onClick={(e) => handleLogRequestClick(e, formData as Asset)}
                                    className="px-6 py-3 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-700 transition-colors shadow-lg flex items-center gap-2"
                                >
                                    <FileText size={18} /> Log Request
                                </button>
                            </>
                        ) : (
                            <>
                                <button 
                                    type="button" 
                                    onClick={() => setViewMode('view')} 
                                    className="px-6 py-3 border border-slate-300 text-slate-700 font-bold rounded-lg hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="button" 
                                    onClick={handleSave} 
                                    className="px-6 py-3 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition-colors shadow-lg flex items-center gap-2"
                                >
                                    <Save size={18} /> Save Changes
                                </button>
                            </>
                        )}
                    </div>
                  )}

               </div>
            </div>
         )}
      </div>
    </div>
  );
};
