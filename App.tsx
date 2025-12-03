
import React, { useState } from "react";
import { ViewState, InventoryItem, SystemCategory, Asset, ClientContext, WorkOrder, PipelineItem, RequestPriority } from "./types";
import { MOCK_INVENTORY, MOCK_CATEGORIES, MOCK_ASSETS, MOCK_CLIENTS, MOCK_PIPELINE } from "./data";
import { Logo } from "./components/Logo";
import { Sidebar } from "./components/Sidebar";
import { Dashboard } from "./features/Dashboard";
import { InventoryManagement } from "./features/InventoryManagement";
import { SystemManagement } from "./features/SystemManagement";
import { AssetManagement } from "./features/AssetManagement";
import { ClientManagement, ClientTab } from "./features/ClientManagement";
import { WorkOrders } from "./features/WorkOrders";
import { PaymentManagement } from "./features/PaymentManagement"; 
import { Reports } from "./features/Reports"; 
import { Procurement } from "./features/Procurement"; 
import { Settings } from "./features/Settings"; 
import { Pipeline } from "./features/Pipeline"; 
import { Menu, Search, BellRing, Plus, X } from "lucide-react";

export const App = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentView, setCurrentView] = useState<ViewState>("dashboard");
  
  // Lifted Client Management State
  const [clientViewId, setClientViewId] = useState<string | null>(null);
  const [clientActiveTab, setClientActiveTab] = useState<ClientTab>('overview');
  
  // Data State
  const [inventory, setInventory] = useState<InventoryItem[]>(MOCK_INVENTORY);
  const [categories, setCategories] = useState<SystemCategory[]>(MOCK_CATEGORIES);
  const [assets, setAssets] = useState<Asset[]>(MOCK_ASSETS);
  const [clients, setClients] = useState<ClientContext[]>(MOCK_CLIENTS);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [pipelineItems, setPipelineItems] = useState<PipelineItem[]>(MOCK_PIPELINE);

  // Global "Quick Request" Modal State
  const [isGlobalRequestModalOpen, setIsGlobalRequestModalOpen] = useState(false);
  const [newGlobalRequest, setNewGlobalRequest] = useState({
      clientId: "",
      assetId: "",
      title: "",
      description: "",
      priority: "Medium" as RequestPriority,
      category: "",
      requestedCompletionDate: ""
  });

  const handleCreateWorkOrder = (order: WorkOrder) => {
    setWorkOrders(prev => [order, ...prev]);
  };

  // Central Inventory Update Handler
  const handleStockUpdate = (itemId: string, qty: number, type: 'IN' | 'OUT', reference: string) => {
      setInventory(prev => prev.map(item => {
          if (item.id === itemId) {
              const newQty = type === 'IN' ? item.quantity + qty : item.quantity - qty;
              const transaction = {
                  id: `TX-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                  date: new Date().toLocaleDateString(),
                  type: type,
                  quantity: qty,
                  reference: reference,
                  user: "Admin"
              };
              return {
                  ...item,
                  quantity: newQty,
                  transactions: [...item.transactions, transaction]
              };
          }
          return item;
      }));
  };

  // Central Pipeline Request Handler (Used by AssetManagement and Global Modal)
  const handleLogPipelineRequest = (request: Partial<PipelineItem>) => {
      const client = clients.find(c => c.id === request.clientId);
      const asset = assets.find(a => a.id === request.assetId);

      const item: PipelineItem = {
          id: `REQ-${Date.now()}`,
          clientId: request.clientId || "",
          clientName: client?.name || "Unknown",
          title: request.title || "New Request",
          description: request.description || "",
          priority: request.priority || "Medium",
          stage: 'Request',
          category: request.category || asset?.categoryId || "",
          createdDate: new Date().toISOString().split('T')[0],
          requestedCompletionDate: request.requestedCompletionDate,
          
          // Asset Linking
          assetId: asset?.id,
          assetName: asset?.name,
          locationDetail: asset?.location || client?.location
      };

      setPipelineItems(prev => [item, ...prev]);
      return item;
  };

  const handleGlobalRequestSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newGlobalRequest.clientId) return;

      handleLogPipelineRequest(newGlobalRequest);
      
      // Deep Link Logic
      setClientViewId(newGlobalRequest.clientId); // Select the client
      setClientActiveTab('commercial');           // Switch to Request tab
      setCurrentView('clients');                  // Navigate to Client Module
      
      setIsGlobalRequestModalOpen(false);
      setNewGlobalRequest({ clientId: "", assetId: "", title: "", description: "", priority: "Medium", category: "", requestedCompletionDate: "" });
  };

  const renderView = () => {
    switch(currentView) {
      case "dashboard": return (
        <Dashboard 
          assets={assets}
          workOrders={workOrders}
        />
      );
      case "inventory": return (
        <InventoryManagement 
           inventory={inventory} setInventory={setInventory} 
           categories={categories} 
           categoriesState={categories} setCategoriesState={setCategories} 
        />
      );
      case "systems": return (
        <SystemManagement 
           categoriesState={categories} setCategoriesState={setCategories} 
        />
      );
      case "assets": return (
         <AssetManagement 
            assets={assets} setAssets={setAssets} 
            clients={clients} 
            categories={categories} 
            onLogRequest={handleLogPipelineRequest}
         />
      );
      case "clients": return (
         <ClientManagement 
            clients={clients} setClients={setClients} 
            assets={assets}
            workOrders={workOrders}
            onCreateWorkOrder={handleCreateWorkOrder}
            pipelineItems={pipelineItems}
            setPipelineItems={setPipelineItems}
            viewClientId={clientViewId}
            setViewClientId={setClientViewId}
            activeTab={clientActiveTab}
            setActiveTab={setClientActiveTab}
            onNavigate={setCurrentView}
            inventory={inventory}
         />
      );
      case "pipeline": return (
        <Pipeline 
           clients={clients}
           assets={assets}
           onCreateWorkOrder={handleCreateWorkOrder}
           pipelineItems={pipelineItems}
           setPipelineItems={setPipelineItems}
           onNavigate={setCurrentView}
           inventory={inventory}
        />
      );
      case "work-orders": return (
        <WorkOrders 
            orders={workOrders} 
            inventory={inventory}
            clients={clients}
            assets={assets}
            onStockUpdate={handleStockUpdate} 
            onCreateOrder={handleCreateWorkOrder}
        />
      );
      case "procurement": return (
         <Procurement 
            workOrders={workOrders}
            assets={assets}
            clients={clients}
            inventory={inventory}
            categories={categories}
            onStockUpdate={handleStockUpdate}
         />
      );
      case "payment": return (
        <PaymentManagement 
            clients={clients} 
            workOrders={workOrders} 
            inventory={inventory}
        />
      );
      case "reports": return (
        <Reports 
            assets={assets}
            workOrders={workOrders}
            inventory={inventory}
        />
      );
      case "settings": return (
        <Settings />
      );
      default: return (
        <Dashboard 
          assets={assets}
          workOrders={workOrders}
        />
      );
    }
  };

  return (
    <div className="h-screen bg-white font-sans text-slate-900 flex flex-col overflow-hidden">
      {/* Navbar */}
      <nav className="flex-none z-40 w-full bg-white border-b border-slate-200 px-4 h-16 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
           <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-slate-100 rounded-lg md:hidden">
              <Menu size={24} className="text-slate-600" />
           </button>
           <Logo />
        </div>
        
        <div className="flex items-center gap-6">
          <div className="hidden md:flex relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
             <input 
               type="text" 
               placeholder="Search modules..." 
               className="pl-9 pr-4 py-2 bg-slate-100 border-none rounded-full text-sm focus:ring-2 focus:ring-blue-500 outline-none w-64 transition-all"
             />
          </div>
          
          <div className="flex items-center gap-4">
             {/* GLOBAL ACTION BUTTON */}
             <button 
                onClick={() => setIsGlobalRequestModalOpen(true)}
                className="hidden md:flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-800 transition-colors shadow-sm"
             >
                <Plus size={16} /> Log Request
             </button>

             <button className="relative p-2 text-slate-500 hover:bg-slate-50 rounded-full transition-colors">
                <BellRing size={20} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
             </button>
             <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                <div className="text-right hidden sm:block">
                   <div className="text-sm font-bold text-slate-800">Admin User</div>
                   <div className="text-xs text-slate-500">System Administrator</div>
                </div>
                <div className="w-9 h-9 rounded-full bg-blue-100 border-2 border-white shadow-sm flex items-center justify-center text-blue-700 font-bold">
                   AU
                </div>
             </div>
          </div>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          isOpen={sidebarOpen} 
          toggle={() => setSidebarOpen(!sidebarOpen)} 
          currentView={currentView}
          onNavigate={setCurrentView}
        />
        <main className="flex-1 relative overflow-hidden flex flex-col h-full bg-slate-50">
           {renderView()}
        </main>
      </div>

      {/* GLOBAL QUICK REQUEST MODAL */}
      {isGlobalRequestModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                  <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                      <h2 className="text-lg font-bold text-slate-800">Log New Client Request</h2>
                      <button onClick={() => setIsGlobalRequestModalOpen(false)}><X size={20} className="text-slate-400 hover:text-slate-600" /></button>
                  </div>
                  <form onSubmit={handleGlobalRequestSubmit} className="p-6 space-y-4">
                      <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1">Client</label>
                          <select 
                            required className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            value={newGlobalRequest.clientId} onChange={e => setNewGlobalRequest({...newGlobalRequest, clientId: e.target.value, assetId: ""})}
                          >
                              <option value="">Select Client...</option>
                              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                          </select>
                      </div>

                      {newGlobalRequest.clientId && (
                        <div className="animate-in fade-in slide-in-from-top-2">
                           <label className="block text-sm font-bold text-slate-700 mb-1">Select Asset (Optional)</label>
                           <select 
                             className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                             value={newGlobalRequest.assetId} onChange={e => setNewGlobalRequest({...newGlobalRequest, assetId: e.target.value})}
                           >
                               <option value="">-- General / No Asset --</option>
                               {assets
                                 .filter(a => a.clientId === newGlobalRequest.clientId)
                                 .map(a => <option key={a.id} value={a.id}>{a.name} ({a.code})</option>)
                               }
                           </select>
                        </div>
                      )}

                      <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1">Request Title</label>
                          <input 
                            required type="text" className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="e.g. Broken AC in Lobby"
                            value={newGlobalRequest.title} onChange={e => setNewGlobalRequest({...newGlobalRequest, title: e.target.value})}
                          />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                               <label className="block text-sm font-bold text-slate-700 mb-1">Category</label>
                               <select 
                                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                  value={newGlobalRequest.category} onChange={e => setNewGlobalRequest({...newGlobalRequest, category: e.target.value})}
                               >
                                  <option value="">-- Select --</option>
                                  {MOCK_CATEGORIES.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                               </select>
                          </div>
                          <div>
                               <label className="block text-sm font-bold text-slate-700 mb-1">Target Date</label>
                               <input 
                                  type="date"
                                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                  value={newGlobalRequest.requestedCompletionDate} onChange={e => setNewGlobalRequest({...newGlobalRequest, requestedCompletionDate: e.target.value})}
                               />
                          </div>
                      </div>
                      <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1">Description</label>
                          <textarea 
                            className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" rows={3}
                            value={newGlobalRequest.description} onChange={e => setNewGlobalRequest({...newGlobalRequest, description: e.target.value})}
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1">Priority</label>
                          <select 
                            className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            value={newGlobalRequest.priority} onChange={e => setNewGlobalRequest({...newGlobalRequest, priority: e.target.value as RequestPriority})}
                          >
                              <option value="Low">Low</option>
                              <option value="Medium">Medium</option>
                              <option value="High">High</option>
                          </select>
                      </div>
                      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                          <button type="button" onClick={() => setIsGlobalRequestModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-bold">Cancel</button>
                          <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700">Save & View Client</button>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};
