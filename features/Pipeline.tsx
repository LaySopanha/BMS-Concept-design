
import React, { useState, useMemo } from "react";
import { PipelineItem, PipelineStage, ClientContext, WorkOrder, RequestPriority, Asset, ViewState, InventoryItem } from "../types";
import { MOCK_CATEGORIES } from "../data";
import { PipelineWizardModal } from "../components/PipelineWizardModal";
import { 
  Plus, 
  Search, 
  Building,
  Calendar,
  Briefcase,
  ChevronRight,
  CheckCircle2,
  X
} from "lucide-react";

export const Pipeline = ({
  clients,
  assets,
  onCreateWorkOrder,
  pipelineItems,
  setPipelineItems,
  onNavigate,
  inventory
}: {
  clients: ClientContext[];
  assets: Asset[];
  onCreateWorkOrder: (order: WorkOrder) => void;
  pipelineItems: PipelineItem[];
  setPipelineItems: React.Dispatch<React.SetStateAction<PipelineItem[]>>;
  onNavigate: (view: ViewState) => void;
  inventory: InventoryItem[];
}) => {
  // View State
  const [activeStageFilter, setActiveStageFilter] = useState<PipelineStage | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardItem, setWizardItem] = useState<PipelineItem | null>(null);

  // New Request Form State
  const [newRequest, setNewRequest] = useState({
     clientId: "",
     title: "",
     description: "",
     category: "",
     priority: "Medium" as RequestPriority,
     requestedCompletionDate: "",
     contactName: "",
     locationDetail: ""
  });

  // --- Calculations ---

  const metrics = useMemo(() => {
    const totalValue = pipelineItems.reduce((acc, item) => acc + (item.quoteAmount || 0), 0);
    const activeCount = pipelineItems.filter(i => i.stage !== 'Won' && i.stage !== 'Lost').length;
    const wonCount = pipelineItems.filter(i => i.stage === 'Won').length;
    const winRate = pipelineItems.length > 0 ? Math.round((wonCount / pipelineItems.length) * 100) : 0;
    
    return { totalValue, activeCount, winRate };
  }, [pipelineItems]);

  const filteredItems = useMemo(() => {
      return pipelineItems.filter(item => {
          const matchStage = activeStageFilter === 'All' || item.stage === activeStageFilter;
          const matchSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              item.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              item.id.toLowerCase().includes(searchQuery.toLowerCase());
          return matchStage && matchSearch;
      });
  }, [pipelineItems, activeStageFilter, searchQuery]);

  // --- Helpers ---

  const getStageProgress = (stage: PipelineStage) => {
      switch(stage) {
          case 'Request': return 25;
          case 'Survey': return 50;
          case 'Quotation': return 75;
          case 'Won': return 100;
          default: return 0;
      }
  };

  const getPriorityColor = (p: string) => {
      switch(p) {
          case 'High': return 'text-rose-600 bg-rose-50 border-rose-100';
          case 'Medium': return 'text-blue-600 bg-blue-50 border-blue-100';
          case 'Low': return 'text-slate-600 bg-slate-100 border-slate-200';
          default: return 'text-slate-600';
      }
  };

  const getDaysOpen = (dateStr: string) => {
      const created = new Date(dateStr);
      const now = new Date();
      const diff = Math.floor((now.getTime() - created.getTime()) / (1000 * 3600 * 24));
      return diff;
  };

  // --- Actions ---

  const handleCreateRequest = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newRequest.clientId) return;
      
      const client = clients.find(c => c.id === newRequest.clientId);
      const item: PipelineItem = {
          id: `REQ-${Date.now()}`,
          clientId: newRequest.clientId,
          clientName: client?.name || "Unknown",
          title: newRequest.title,
          description: newRequest.description,
          priority: newRequest.priority,
          category: newRequest.category,
          stage: 'Request',
          createdDate: new Date().toISOString().split('T')[0],
          requestedCompletionDate: newRequest.requestedCompletionDate,
          contactName: newRequest.contactName || client?.contactPerson,
          contactPhone: client?.contactPhone,
          locationDetail: newRequest.locationDetail || client?.location
      };
      
      setPipelineItems(prev => [item, ...prev]);
      setIsModalOpen(false);
      setNewRequest({ clientId: "", title: "", description: "", priority: "Medium", category: "", requestedCompletionDate: "", contactName: "", locationDetail: "" });
  };

  const openDetail = (item: PipelineItem) => {
      setWizardItem(item);
      setIsWizardOpen(true);
  };

  const handleUpdateItem = (updated: PipelineItem) => {
      setPipelineItems(prev => prev.map(i => i.id === updated.id ? updated : i));
  };

  return (
    <div className="p-8 h-[calc(100vh-64px)] overflow-y-auto bg-slate-50">
      <div className="max-w-7xl mx-auto">
        
        {/* Header & Metrics */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
            <div>
                <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Commercial Pipeline</h1>
                <p className="text-slate-500 mt-1">Manage new business, surveys, and quotations.</p>
            </div>
            <div className="flex gap-4">
                <div className="bg-white px-5 py-2 rounded-xl border border-slate-200 shadow-sm">
                    <div className="text-xs font-bold text-slate-400 uppercase">Pipeline Value</div>
                    <div className="text-xl font-bold text-slate-800">${metrics.totalValue.toLocaleString()}</div>
                </div>
                <div className="bg-white px-5 py-2 rounded-xl border border-slate-200 shadow-sm">
                    <div className="text-xs font-bold text-slate-400 uppercase">Active Deals</div>
                    <div className="text-xl font-bold text-blue-600">{metrics.activeCount}</div>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2 rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200"
                >
                    <Plus size={18} /> New Request
                </button>
            </div>
        </div>

        {/* Toolbar */}
        <div className="bg-white rounded-t-xl border border-slate-200 p-4 flex flex-col md:flex-row justify-between items-center gap-4">
            
            {/* Tabs */}
            <div className="flex bg-slate-100 p-1 rounded-lg">
                {[
                    { id: 'All', label: 'All' },
                    { id: 'Request', label: 'Request' },
                    { id: 'Survey', label: 'Survey' },
                    { id: 'Quotation', label: 'Quotation' },
                    { id: 'Won', label: 'Approved' } // Renamed display label
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveStageFilter(tab.id as any)}
                        className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${activeStageFilter === tab.id ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Search */}
            <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input 
                    type="text" 
                    placeholder="Search client, title, or ID..." 
                    className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
        </div>

        {/* Data Grid */}
        <div className="bg-white border-x border-b border-slate-200 rounded-b-xl overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50/50 text-xs font-bold text-slate-500 uppercase border-b border-slate-200">
                    <tr>
                        <th className="px-6 py-4">Request Details</th>
                        <th className="px-6 py-4">Client / Context</th>
                        <th className="px-6 py-4 w-48">Progress</th>
                        <th className="px-6 py-4">Value / Priority</th>
                        <th className="px-6 py-4 text-right">Last Update</th>
                        <th className="px-6 py-4 w-16"></th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {filteredItems.map(item => {
                        const progress = getStageProgress(item.stage);
                        const daysOpen = getDaysOpen(item.createdDate);
                        
                        return (
                            <tr key={item.id} onClick={() => openDetail(item)} className="hover:bg-blue-50/30 transition-colors cursor-pointer group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-xs shrink-0 border border-slate-200">
                                            {item.category ? item.category.substring(0,2).toUpperCase() : "RQ"}
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-800 text-sm group-hover:text-blue-600 transition-colors">{item.title}</div>
                                            <div className="text-xs text-slate-500 font-mono mt-0.5">{item.id}</div>
                                        </div>
                                    </div>
                                </td>
                                
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                                        <Building size={14} className="text-slate-400" />
                                        {item.clientName}
                                    </div>
                                    <div className="text-xs text-slate-400 pl-6 mt-1">{item.locationDetail || "General Site"}</div>
                                </td>

                                <td className="px-6 py-4">
                                    <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase mb-1.5">
                                        <span>{item.stage === 'Won' ? 'Approved' : item.stage}</span>
                                        <span>{progress}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full rounded-full transition-all duration-500 ${item.stage === 'Won' ? 'bg-emerald-500' : 'bg-blue-500'}`} 
                                            style={{ width: `${progress}%` }}
                                        ></div>
                                    </div>
                                </td>

                                <td className="px-6 py-4">
                                    {item.quoteAmount ? (
                                        <div className="font-mono font-bold text-slate-800">${item.quoteAmount.toLocaleString()}</div>
                                    ) : (
                                        <div className="text-xs text-slate-400 italic">Pending Quote</div>
                                    )}
                                    <span className={`inline-block mt-1 text-[10px] px-2 py-0.5 rounded border uppercase font-bold ${getPriorityColor(item.priority)}`}>
                                        {item.priority}
                                    </span>
                                </td>

                                <td className="px-6 py-4 text-right">
                                    <div className="text-xs font-bold text-slate-600 flex items-center justify-end gap-1">
                                        <Calendar size={12} /> {item.createdDate}
                                    </div>
                                    <div className={`text-[10px] mt-1 font-medium ${daysOpen > 7 ? 'text-rose-500' : 'text-slate-400'}`}>
                                        {daysOpen === 0 ? 'Today' : `${daysOpen} days open`}
                                    </div>
                                </td>

                                <td className="px-6 py-4 text-right">
                                    <ChevronRight size={18} className="text-slate-300 group-hover:text-blue-500" />
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            
            {filteredItems.length === 0 && (
                <div className="p-12 text-center text-slate-400">
                    <Briefcase size={48} className="mx-auto mb-4 opacity-20" />
                    <p className="font-medium">No items found matching your filters.</p>
                    <button onClick={() => setIsModalOpen(true)} className="mt-4 text-blue-600 font-bold hover:underline">
                        Create New Request
                    </button>
                </div>
            )}
        </div>
      </div>

      {/* CREATE NEW REQUEST MODAL */}
      {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                  <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                      <h2 className="text-lg font-bold text-slate-800">Log New Client Request</h2>
                      <button onClick={() => setIsModalOpen(false)}><X size={20} className="text-slate-400 hover:text-slate-600" /></button>
                  </div>
                  <form onSubmit={handleCreateRequest} className="p-8 space-y-6">
                      <div className="grid grid-cols-2 gap-6">
                          <div className="col-span-2">
                            <label className="block text-sm font-bold text-slate-700 mb-1">Select Client</label>
                            <select 
                                required className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                value={newRequest.clientId} onChange={e => setNewRequest({...newRequest, clientId: e.target.value})}
                            >
                                <option value="">-- Choose Client --</option>
                                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                          </div>
                          
                          <div className="col-span-2">
                            <label className="block text-sm font-bold text-slate-700 mb-1">Request Title</label>
                            <input 
                                required type="text" className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="e.g. Broken AC in Lobby"
                                value={newRequest.title} onChange={e => setNewRequest({...newRequest, title: e.target.value})}
                            />
                          </div>

                          <div>
                              <label className="block text-sm font-bold text-slate-700 mb-1">Category</label>
                              <select 
                                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                  value={newRequest.category} onChange={e => setNewRequest({...newRequest, category: e.target.value})}
                              >
                                  <option value="">-- Select --</option>
                                  {MOCK_CATEGORIES.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                              </select>
                          </div>
                          <div>
                              <label className="block text-sm font-bold text-slate-700 mb-1">Priority</label>
                              <select 
                                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                value={newRequest.priority} onChange={e => setNewRequest({...newRequest, priority: e.target.value as RequestPriority})}
                              >
                                  <option value="Low">Low</option>
                                  <option value="Medium">Medium</option>
                                  <option value="High">High</option>
                              </select>
                          </div>

                          <div className="col-span-2">
                              <label className="block text-sm font-bold text-slate-700 mb-1">Description / Notes</label>
                              <textarea 
                                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" rows={3}
                                value={newRequest.description} onChange={e => setNewRequest({...newRequest, description: e.target.value})}
                              />
                          </div>
                          
                          <div className="col-span-2 border-t border-slate-100 pt-4 mt-2">
                              <h4 className="text-sm font-bold text-slate-400 uppercase mb-3">Optional Details (Overrides Client Default)</h4>
                              <div className="grid grid-cols-2 gap-4">
                                  <div>
                                      <label className="block text-xs font-bold text-slate-500 mb-1">Specific Location</label>
                                      <input type="text" className="w-full p-2 border border-slate-300 rounded text-sm" 
                                          placeholder="e.g. Room 302"
                                          value={newRequest.locationDetail} onChange={e => setNewRequest({...newRequest, locationDetail: e.target.value})}
                                      />
                                  </div>
                                  <div>
                                      <label className="block text-xs font-bold text-slate-500 mb-1">Contact Name</label>
                                      <input type="text" className="w-full p-2 border border-slate-300 rounded text-sm" 
                                          placeholder="Who called?"
                                          value={newRequest.contactName} onChange={e => setNewRequest({...newRequest, contactName: e.target.value})}
                                      />
                                  </div>
                              </div>
                          </div>
                      </div>

                      <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                          <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-slate-600 hover:bg-slate-100 rounded-lg font-bold">Cancel</button>
                          <button type="submit" className="px-8 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 shadow-lg shadow-blue-200">Create Request</button>
                      </div>
                  </form>
              </div>
          </div>
      )}

      {/* SHARED WIZARD MODAL */}
      <PipelineWizardModal 
          isOpen={isWizardOpen}
          onClose={() => setIsWizardOpen(false)}
          item={wizardItem}
          onUpdate={handleUpdateItem}
          onCreateSO={onCreateWorkOrder}
          assets={assets}
          onNavigate={onNavigate}
          inventory={inventory}
      />
    </div>
  );
};
