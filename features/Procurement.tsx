import React, { useState } from "react";
import { PurchaseRequest, PurchaseOrder, WorkOrder, ClientContext, Asset, InventoryItem, SystemCategory } from "../types";
import { MOCK_PURCHASE_REQUESTS } from "../data";
import { 
  ShoppingCart, 
  Search, 
  Plus, 
  ArrowRight, 
  Building,
  Check,
  Ban,
  FileCheck,
  X,
  Package,
  User,
  ExternalLink,
  Download
} from "lucide-react";

export const Procurement = ({
  workOrders,
  assets,
  clients,
  inventory,
  categories,
  onStockUpdate
}: {
  workOrders: WorkOrder[];
  assets: Asset[];
  clients: ClientContext[];
  inventory: InventoryItem[];
  categories: SystemCategory[];
  onStockUpdate: (itemId: string, qty: number, type: 'IN' | 'OUT', reference: string) => void;
}) => {
  const [requests, setRequests] = useState<PurchaseRequest[]>(MOCK_PURCHASE_REQUESTS);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [view, setView] = useState<'PR' | 'PO'>('PR');
  
  // Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newPR, setNewPR] = useState({
     clientId: "",
     requesterName: "",
     categoryId: "",
     inventoryId: "",
     itemName: "",
     quantity: 1,
     cost: 0
  });

  const getClientName = (id: string) => clients.find(c => c.id === id)?.name || "Unknown Client";

  const filteredRequests = requests.filter(req => {
     const clientName = getClientName(req.clientId);
     const searchStr = `${req.id} ${clientName} ${req.requesterName}`.toLowerCase();
     return searchStr.includes(searchQuery.toLowerCase());
  });

  const getStatusColor = (status: string) => {
     switch(status) {
       case 'Approved': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
       case 'Pending': return 'bg-amber-100 text-amber-700 border-amber-200';
       case 'Rejected': return 'bg-rose-100 text-rose-700 border-rose-200';
       case 'PO Issued': return 'bg-blue-100 text-blue-700 border-blue-200';
       case 'Received': return 'bg-purple-100 text-purple-700 border-purple-200';
       case 'Ordered': return 'bg-blue-50 text-blue-600 border-blue-200';
       default: return 'bg-slate-100 text-slate-600';
     }
  };

  const handleCreate = (e: React.FormEvent) => {
      e.preventDefault();
      // Validate required fields
      if (!newPR.clientId) {
          alert("Please select a client.");
          return;
      }
      if (!newPR.itemName) {
          alert("Please select a part or enter an item name.");
          return;
      }

      const newRequest: PurchaseRequest = {
          id: `PR-${Date.now()}`,
          clientId: newPR.clientId,
          requesterName: newPR.requesterName || "Admin",
          requestDate: new Date().toISOString().split('T')[0],
          status: 'Pending',
          requestedItems: [
              { 
                  itemName: newPR.itemName, 
                  quantity: newPR.quantity, 
                  estimatedCost: newPR.cost,
                  inventoryId: newPR.inventoryId || undefined
              }
          ]
      };

      setRequests(prev => [newRequest, ...prev]);
      setIsCreateOpen(false);
      // Reset form
      setNewPR({ clientId: "", requesterName: "", categoryId: "", inventoryId: "", itemName: "", quantity: 1, cost: 0 });
  };

  const updateStatus = (id: string, status: PurchaseRequest['status']) => {
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  const handleConvert = (pr: PurchaseRequest) => {
      if (confirm("Convert this PR to an official Purchase Order?")) {
          // 1. Update PR Status
          updateStatus(pr.id, 'PO Issued');
          
          // 2. Generate PO
          const total = pr.requestedItems.reduce((acc, item) => acc + ((item.estimatedCost || 0) * item.quantity), 0);
          
          const newPO: PurchaseOrder = {
              id: `PO-${Date.now()}`,
              poNumber: `PO-2024-${Math.floor(Math.random() * 10000)}`,
              prId: pr.id,
              vendor: "Preferred Vendor", // Mock vendor assignment
              dateIssued: new Date().toISOString().split('T')[0],
              status: 'Ordered',
              totalAmount: total,
              items: pr.requestedItems.map(i => ({
                  itemName: i.itemName,
                  quantity: i.quantity,
                  unitPrice: i.estimatedCost || 0,
                  total: (i.estimatedCost || 0) * i.quantity,
                  inventoryId: i.inventoryId // Preserve link to inventory
              }))
          };
          
          // 3. Add to PO list
          setPurchaseOrders(prev => [newPO, ...prev]);
          alert(`Purchase Order ${newPO.poNumber} created!`);
      }
  };

  const handleReceiveGoods = (po: PurchaseOrder) => {
      if (confirm(`Mark PO ${po.poNumber} as Received? This will update inventory stock levels.`)) {
          // 1. Update PO Status
          setPurchaseOrders(prev => prev.map(p => p.id === po.id ? { ...p, status: 'Received' } : p));
          
          // 2. Update Inventory Stock
          po.items.forEach(item => {
              if (item.inventoryId) {
                  onStockUpdate(item.inventoryId, item.quantity, 'IN', po.poNumber);
              }
          });
          
          alert("Goods Received Note (GRN) created. Stock levels updated.");
      }
  };

  const handleInventorySelect = (itemId: string) => {
      const item = inventory.find(i => i.id === itemId);
      if (item) {
          setNewPR(prev => ({
              ...prev,
              inventoryId: item.id,
              itemName: item.name,
              cost: item.unitCost // Use unit cost as estimate
          }));
      } else {
           setNewPR(prev => ({ ...prev, inventoryId: "", itemName: "", cost: 0 }));
      }
  };

  return (
    <div className="p-8 h-[calc(100vh-64px)] overflow-y-auto bg-slate-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Procurement & Sourcing</h1>
            <p className="text-slate-500 mt-1">Manage PR → PO → GRN → Invoice workflow</p>
          </div>
          <button 
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2 rounded-lg font-bold hover:bg-emerald-700 transition-colors shadow-sm"
          >
             <Plus size={18} /> Create Purchase Request
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-1 bg-white p-1 rounded-xl border border-slate-200 w-fit mb-6 shadow-sm">
           <button 
             onClick={() => setView('PR')}
             className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${view === 'PR' ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-slate-700'}`}
           >
             Purchase Requests (PR)
           </button>
           <button 
             onClick={() => setView('PO')}
             className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${view === 'PO' ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-slate-700'}`}
           >
             Purchase Orders (PO) ({purchaseOrders.length})
           </button>
        </div>

        {/* PR LIST VIEW */}
        {view === 'PR' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
             
             {/* Toolbar */}
             <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h3 className="font-bold text-slate-700 text-lg flex items-center gap-2">
                   <ShoppingCart size={20} className="text-slate-400" />
                   Purchase Requests ({filteredRequests.length})
                </h3>
                <div className="relative w-72">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                   <input 
                      type="text" 
                      placeholder="Search PR, Asset, or Tech..." 
                      className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                   />
                </div>
             </div>

             <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                   <thead>
                      <tr className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                         <th className="px-6 py-4">ID</th>
                         <th className="px-6 py-4">Client / Context</th>
                         <th className="px-6 py-4">Requested By</th>
                         <th className="px-6 py-4">Requested Item</th>
                         <th className="px-6 py-4 text-center">Qty</th>
                         <th className="px-6 py-4">Date</th>
                         <th className="px-6 py-4">Status</th>
                         <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100">
                      {filteredRequests.map(pr => {
                         const clientName = getClientName(pr.clientId);
                         const totalQty = pr.requestedItems.reduce((acc, i) => acc + i.quantity, 0);
                         
                         // Find associated PO if it exists
                         const associatedPO = purchaseOrders.find(po => po.prId === pr.id);
                         
                         return (
                           <tr key={pr.id} className="hover:bg-slate-50 transition-colors group">
                              {/* ID */}
                              <td className="px-6 py-4 font-mono text-sm font-bold text-slate-800">
                                  {pr.id}
                              </td>
                              
                              {/* Client / Context */}
                              <td className="px-6 py-4">
                                  <div className="text-sm font-bold text-slate-700 flex items-center gap-1">
                                      <Building size={12} className="text-slate-400" />
                                      {clientName}
                                  </div>
                              </td>

                              {/* Requested By */}
                              <td className="px-6 py-4">
                                  <div className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                      <User size={14} className="text-slate-400" />
                                      {pr.requesterName}
                                  </div>
                              </td>

                              {/* Item Details */}
                              <td className="px-6 py-4">
                                 {pr.requestedItems.map((item, idx) => (
                                    <div key={idx} className="text-sm font-medium text-slate-800 mb-1 flex items-center gap-2">
                                       {item.inventoryId && <Package size={14} className="text-blue-500" />}
                                       {item.itemName}
                                    </div>
                                 ))}
                              </td>

                              {/* Quantity */}
                              <td className="px-6 py-4 text-center">
                                  <span className="inline-block bg-slate-100 text-slate-700 font-bold px-3 py-1 rounded-lg text-sm">
                                      {totalQty}
                                  </span>
                              </td>

                              {/* Date */}
                              <td className="px-6 py-4 text-sm text-slate-600">
                                  {pr.requestDate}
                              </td>

                              {/* Status */}
                              <td className="px-6 py-4">
                                 <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold border ${getStatusColor(pr.status)}`}>
                                    {pr.status}
                                 </span>
                              </td>

                              {/* Actions */}
                              <td className="px-6 py-4 text-right">
                                 <div className="flex items-center justify-end gap-2">
                                     {pr.status === 'Pending' && (
                                        <>
                                           <button 
                                              onClick={() => updateStatus(pr.id, 'Approved')}
                                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded border border-transparent hover:border-emerald-200 transition-colors"
                                              title="Approve"
                                           >
                                              <Check size={16} />
                                           </button>
                                           <button 
                                              onClick={() => updateStatus(pr.id, 'Rejected')}
                                              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded border border-transparent hover:border-rose-200 transition-colors"
                                              title="Reject"
                                           >
                                              <Ban size={16} />
                                           </button>
                                        </>
                                     )}
                                     
                                     {pr.status === 'Approved' && (
                                        <button 
                                          onClick={() => handleConvert(pr)}
                                          className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded text-xs font-bold hover:bg-blue-700 transition-colors shadow-sm"
                                        >
                                           Convert to PO <ArrowRight size={12} />
                                        </button>
                                     )}
                                     
                                     {pr.status === 'PO Issued' && associatedPO && (
                                        <button 
                                          onClick={() => setView('PO')}
                                          className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors bg-blue-50 px-3 py-1.5 rounded hover:bg-blue-100 border border-blue-200"
                                        >
                                           View PO <ExternalLink size={12} />
                                        </button>
                                     )}
                                 </div>
                              </td>
                           </tr>
                         );
                      })}
                   </tbody>
                </table>
             </div>
          </div>
        )}

        {/* PO VIEW */}
        {view === 'PO' && (
           <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-slate-50">
                  <h3 className="font-bold text-slate-700 text-lg flex items-center gap-2">
                      <FileCheck size={20} className="text-slate-400" />
                      Active Purchase Orders
                  </h3>
              </div>
              
              {purchaseOrders.length === 0 ? (
                  <div className="p-12 text-center text-slate-400">
                      <FileCheck size={48} className="mx-auto mb-4 opacity-20" />
                      <p>No Purchase Orders generated yet.</p>
                      <p className="text-sm">Approve and convert a PR to see it here.</p>
                  </div>
              ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                                <th className="px-6 py-4">PO Number</th>
                                <th className="px-6 py-4">Vendor</th>
                                <th className="px-6 py-4">Items</th>
                                <th className="px-6 py-4 text-right">Total Amount</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {purchaseOrders.map(po => (
                                <tr key={po.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 font-mono font-bold text-blue-600">{po.poNumber}</td>
                                    <td className="px-6 py-4 text-sm font-medium">{po.vendor}</td>
                                    <td className="px-6 py-4">
                                        {po.items.map((item, idx) => (
                                            <div key={idx} className="text-sm text-slate-600 flex items-center gap-2">
                                                <span>{item.quantity}x {item.itemName}</span>
                                                {item.inventoryId && (
                                                    <span title="Linked to Inventory">
                                                        <Package size={12} className="text-blue-500" />
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </td>
                                    <td className="px-6 py-4 text-right font-bold text-slate-800">${po.totalAmount.toLocaleString()}</td>
                                    <td className="px-6 py-4">
                                        <span className={`text-xs px-2 py-0.5 border rounded font-bold uppercase ${getStatusColor(po.status)}`}>
                                            {po.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {po.status === 'Ordered' && (
                                            <button 
                                                onClick={() => handleReceiveGoods(po)}
                                                className="px-3 py-1.5 bg-purple-600 text-white text-xs font-bold rounded hover:bg-purple-700 transition-colors shadow-sm flex items-center gap-1 ml-auto"
                                            >
                                                <Download size={14} /> Receive Goods
                                            </button>
                                        )}
                                        {po.status === 'Received' && (
                                            <span className="text-xs text-slate-400 font-medium italic flex items-center gap-1 justify-end">
                                                <Check size={14} /> Added to Stock
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                  </div>
              )}
           </div>
        )}

        {/* CREATE PR MODAL */}
        {isCreateOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                        <h2 className="text-lg font-bold text-slate-800">New Purchase Request</h2>
                        <button onClick={() => setIsCreateOpen(false)}><X size={20} className="text-slate-400 hover:text-slate-600" /></button>
                    </div>
                    
                    <form onSubmit={handleCreate} className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Select Client</label>
                            <select 
                                required
                                className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                                value={newPR.clientId}
                                onChange={(e) => setNewPR({...newPR, clientId: e.target.value})}
                            >
                                <option value="">-- Select Client --</option>
                                {clients.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Requested By</label>
                            <input 
                                required
                                type="text"
                                placeholder="Enter Name (e.g., Nestar)"
                                className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                                value={newPR.requesterName}
                                onChange={(e) => setNewPR({...newPR, requesterName: e.target.value})}
                            />
                        </div>
                        
                        {/* Category & Inventory Selector */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Service Category</label>
                                <select 
                                    className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                                    value={newPR.categoryId}
                                    onChange={(e) => {
                                        setNewPR({...newPR, categoryId: e.target.value, inventoryId: "", itemName: "", cost: 0});
                                    }}
                                >
                                    <option value="">-- Select --</option>
                                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Select Spare Part</label>
                                <select 
                                    className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                                    value={newPR.inventoryId}
                                    onChange={(e) => handleInventorySelect(e.target.value)}
                                    disabled={!newPR.categoryId}
                                >
                                    <option value="">-- Manual Entry --</option>
                                    {inventory
                                        .filter(i => i.categoryId === newPR.categoryId)
                                        .map(item => (
                                            <option key={item.id} value={item.id}>{item.name}</option>
                                        ))
                                    }
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Item Name / Description</label>
                            <input 
                                required
                                type="text" 
                                placeholder="e.g. 500W Halogen Bulb"
                                className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                                value={newPR.itemName}
                                onChange={(e) => setNewPR({...newPR, itemName: e.target.value})}
                                readOnly={!!newPR.inventoryId} // Read-only if picked from inventory
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Quantity</label>
                                <input 
                                    required
                                    type="number" 
                                    min="1"
                                    className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                                    value={newPR.quantity}
                                    onChange={(e) => setNewPR({...newPR, quantity: parseInt(e.target.value) || 1})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Est. Cost ($)</label>
                                <input 
                                    type="number" 
                                    min="0"
                                    className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                                    value={newPR.cost}
                                    onChange={(e) => setNewPR({...newPR, cost: parseFloat(e.target.value) || 0})}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-2">
                            <button type="button" onClick={() => setIsCreateOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-bold text-sm transition-colors">Cancel</button>
                            <button type="submit" className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-bold text-sm hover:bg-emerald-700 transition-colors shadow-lg">
                                Submit Request
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};