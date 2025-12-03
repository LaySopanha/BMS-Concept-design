
import React, { useState, useEffect } from "react";
import { PipelineItem, PipelineStage, QuoteLineItem, WorkOrder, Asset, ViewState, InventoryItem } from "../types";
import { MOCK_TECHNICIANS } from "../data";
import { 
  Plus, 
  Calendar, 
  User, 
  DollarSign, 
  CheckCircle2,
  FileCheck,
  X,
  MapPin, 
  Phone,
  Trash2,
  Box,
  ShoppingCart,
  AlertTriangle,
  ArrowRight
} from "lucide-react";

interface PipelineWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: PipelineItem | null;
  onUpdate: (item: PipelineItem) => void;
  onCreateSO: (so: WorkOrder) => void;
  assets?: Asset[];
  onNavigate?: (view: ViewState) => void;
  inventory?: InventoryItem[];
}

export const PipelineWizardModal = ({
  isOpen,
  onClose,
  item: initialItem,
  onUpdate,
  onCreateSO,
  assets = [],
  onNavigate,
  inventory = []
}: PipelineWizardModalProps) => {
  const [activeItem, setActiveItem] = useState<PipelineItem | null>(null);
  
  // Quote Line Item State
  const [tempLineItem, setTempLineItem] = useState({ desc: "", qty: 1, price: 0 });
  const [selectedInventoryId, setSelectedInventoryId] = useState("");

  useEffect(() => {
    setActiveItem(initialItem);
  }, [initialItem]);

  if (!isOpen || !activeItem) return null;

  // Filter assets for the current client
  const clientAssets = assets.filter(a => a.clientId === activeItem.clientId);

  // --- Quote Helpers ---

  // Handle Inventory Selection
  const handleInventorySelect = (id: string) => {
      setSelectedInventoryId(id);
      if (id) {
          const item = inventory.find(i => i.id === id);
          if (item) {
              setTempLineItem({
                  desc: item.name,
                  qty: 1,
                  price: item.sellingPrice
              });
          }
      } else {
          setTempLineItem({ desc: "", qty: 1, price: 0 });
      }
  };

  const addLineItem = () => {
      if (!tempLineItem.desc) return;
      const newItem: QuoteLineItem = {
          id: Date.now().toString(),
          description: tempLineItem.desc,
          quantity: tempLineItem.qty,
          unitPrice: tempLineItem.price,
          total: tempLineItem.qty * tempLineItem.price
      };
      const updatedItems = [...(activeItem.quoteLineItems || []), newItem];
      const newTotal = updatedItems.reduce((acc, curr) => acc + curr.total, 0);
      
      const updated = {
          ...activeItem,
          quoteLineItems: updatedItems,
          quoteAmount: newTotal
      };
      setActiveItem(updated);
      onUpdate(updated);
      // Reset
      setTempLineItem({ desc: "", qty: 1, price: 0 });
      setSelectedInventoryId("");
  };

  const removeLineItem = (itemId: string) => {
      const updatedItems = (activeItem.quoteLineItems || []).filter(i => i.id !== itemId);
      const newTotal = updatedItems.reduce((acc, curr) => acc + curr.total, 0);
      const updated = {
          ...activeItem,
          quoteLineItems: updatedItems,
          quoteAmount: newTotal
      };
      setActiveItem(updated);
      onUpdate(updated);
  };

  const handleUpdate = (updates: Partial<PipelineItem>) => {
      const updated = { ...activeItem, ...updates };
      // If updating asset ID, find asset name too
      if (updates.assetId) {
          const asset = assets.find(a => a.id === updates.assetId);
          updated.assetName = asset?.name;
      }
      setActiveItem(updated);
      onUpdate(updated);
  };

  // --- Stage Transitions ---

  const submitSurvey = () => {
      handleUpdate({ stage: 'Quotation', quoteLineItems: [], quoteAmount: 0 });
  };

  const finalizeQuote = () => {
      if (!activeItem.quoteAmount || activeItem.quoteAmount <= 0) {
          alert("Please add line items to the quote first.");
          return;
      }
      alert("Quote finalized and 'sent' to client.");
  };

  const markWon = () => {
      handleUpdate({ stage: 'Won' });
  };

  const generateSO = () => {
      // Create a robust unique ID
      const soId = `SO-${Date.now().toString().slice(-6)}`;
      
      const so: WorkOrder = {
          id: soId,
          title: activeItem.title || "Generated Service Order",
          assetId: activeItem.assetId || "Unassigned", 
          assetName: activeItem.assetName || activeItem.category || "General Asset",
          clientName: activeItem.clientName || "Unknown Client",
          priority: activeItem.priority || "Medium",
          status: 'Open',
          description: `SOURCED FROM QUOTE\n\nIssue: ${activeItem.description || "N/A"}\nTechnical Notes: ${activeItem.rootCause || "N/A"} - ${activeItem.proposedRemedy || "N/A"}\n\nAgreed Value: $${activeItem.quoteAmount?.toFixed(2)}`,
          createdDate: new Date().toISOString().split('T')[0],
          tasks: [],
          partsUsed: [],
          images: []
      };
      
      // 1. Create the SO in App State
      onCreateSO(so);
      
      // 2. Link it back to this Pipeline Item
      handleUpdate({ convertedSOId: so.id });
      
      // 3. Close Modal
      onClose(); 
      
      // 4. Navigate to Work Orders View
      if (onNavigate) {
        onNavigate('work-orders');
      }
  };

  // Stock Warning Logic
  const selectedInvItem = inventory.find(i => i.id === selectedInventoryId);
  const stockWarning = selectedInvItem && selectedInvItem.quantity < tempLineItem.qty;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
          
          {/* Modal Header */}
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                    Manage Request: {activeItem.id}
                </h2>
                <p className="text-sm text-slate-500">{activeItem.title}</p>
              </div>
              <button onClick={onClose}><X size={24} className="text-slate-400 hover:text-slate-600" /></button>
          </div>

          <div className="flex-1 overflow-y-auto flex flex-col md:flex-row">
              
              {/* LEFT: Context & Request Info */}
              <div className="w-full md:w-1/3 bg-slate-50 border-r border-slate-200 p-6 space-y-6">
                    <div>
                        <h3 className="text-xs font-bold text-slate-400 uppercase mb-3">Client Information</h3>
                        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm space-y-3">
                            <div>
                                <div className="text-sm font-bold text-slate-800">{activeItem.clientName}</div>
                                <div className="text-xs text-slate-500">ID: {activeItem.clientId}</div>
                            </div>
                            <div className="flex items-start gap-2 text-sm text-slate-600">
                                <MapPin size={16} className="shrink-0 text-slate-400 mt-0.5" />
                                <span>{activeItem.locationDetail || "No location specified"}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                <User size={16} className="text-slate-400" />
                                <span>{activeItem.contactName || "No contact"}</span>
                            </div>
                            {activeItem.contactPhone && (
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <Phone size={16} className="text-slate-400" />
                                    <span>{activeItem.contactPhone}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xs font-bold text-slate-400 uppercase mb-3">Original Request</h3>
                        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                            <p className="text-sm text-slate-700 leading-relaxed mb-3">{activeItem.description}</p>
                            <div className="flex flex-wrap gap-2">
                                <span className={`text-xs font-bold px-2 py-1 rounded ${activeItem.priority === 'High' ? 'bg-rose-100 text-rose-700' : 'bg-blue-50 text-blue-700'}`}>
                                    {activeItem.priority} Priority
                                </span>
                                {activeItem.category && <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2 py-1 rounded">{activeItem.category}</span>}
                            </div>
                        </div>
                    </div>

                    {/* Asset Link Display */}
                    {activeItem.assetName && (
                        <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                            <h3 className="text-xs font-bold text-emerald-600 uppercase mb-2 flex items-center gap-1">
                                <Box size={14} /> Linked Asset
                            </h3>
                            <div className="text-sm font-bold text-emerald-900">{activeItem.assetName}</div>
                            <div className="text-xs text-emerald-700 font-mono">{activeItem.assetId}</div>
                        </div>
                    )}

                    {/* Current Stage Indicator */}
                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                        <h3 className="text-xs font-bold text-blue-400 uppercase mb-2">Workflow Status</h3>
                        <div className="text-lg font-bold text-blue-800">{activeItem.stage === 'Won' ? 'Approved' : activeItem.stage}</div>
                    </div>
              </div>

              {/* RIGHT: Action Forms based on Stage */}
              <div className="w-full md:w-2/3 p-8">
                    
                    {/* 1. REQUEST STAGE ACTIONS */}
                    {activeItem.stage === 'Request' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">1</div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800">Schedule Site Survey</h3>
                                    <p className="text-sm text-slate-500">Assign a technician to investigate the issue.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="col-span-2">
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Select Asset (Optional)</label>
                                    <select 
                                        className="w-full p-2 border border-slate-300 rounded outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                                        value={activeItem.assetId || ""}
                                        onChange={(e) => handleUpdate({ assetId: e.target.value })}
                                    >
                                        <option value="">-- General Request (No Specific Asset) --</option>
                                        {clientAssets.map(asset => (
                                            <option key={asset.id} value={asset.id}>{asset.name} ({asset.code})</option>
                                        ))}
                                    </select>
                                    <p className="text-xs text-slate-400 mt-1">Linking an asset ensures history is tracked in the registry.</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Survey Date</label>
                                    <input 
                                        type="date" 
                                        className="w-full p-2 border border-slate-300 rounded outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                                        value={activeItem.surveyScheduledDate || ""}
                                        onChange={(e) => handleUpdate({ surveyScheduledDate: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Assign Surveyor</label>
                                    <select 
                                        className="w-full p-2 border border-slate-300 rounded outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                                        value={activeItem.surveyorName || ""}
                                        onChange={(e) => handleUpdate({ surveyorName: e.target.value })}
                                    >
                                        <option value="">Select Technician...</option>
                                        {MOCK_TECHNICIANS.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="pt-4">
                                <button 
                                    onClick={() => handleUpdate({ stage: 'Survey' })}
                                    disabled={!activeItem.surveyScheduledDate || !activeItem.surveyorName}
                                    className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
                                >
                                    Confirm & Move to Survey Stage
                                </button>
                            </div>
                        </div>
                    )}

                    {/* 2. SURVEY STAGE ACTIONS */}
                    {activeItem.stage === 'Survey' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 font-bold">2</div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800">Technical Report</h3>
                                    <p className="text-sm text-slate-500">Log findings to prepare for quotation.</p>
                                </div>
                            </div>

                            <div className="bg-amber-50 p-4 rounded-lg border border-amber-100 mb-4 flex items-center gap-2 text-amber-800 text-sm">
                                <User size={16} /> <strong>Surveyor:</strong> {activeItem.surveyorName}
                                <span className="mx-2">|</span>
                                <Calendar size={16} /> <strong>Date:</strong> {activeItem.surveyScheduledDate}
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Root Cause / Findings</label>
                                <textarea 
                                    className="w-full p-3 border border-slate-300 rounded outline-none focus:ring-2 focus:ring-amber-500 text-slate-800"
                                    rows={2}
                                    placeholder="What is wrong?"
                                    value={activeItem.rootCause || ""}
                                    onChange={(e) => handleUpdate({ rootCause: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Proposed Remedy</label>
                                <textarea 
                                    className="w-full p-3 border border-slate-300 rounded outline-none focus:ring-2 focus:ring-amber-500 text-slate-800"
                                    rows={2}
                                    placeholder="How do we fix it?"
                                    value={activeItem.proposedRemedy || ""}
                                    onChange={(e) => handleUpdate({ proposedRemedy: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Parts Needed (Optional)</label>
                                <input 
                                    type="text" 
                                    className="w-full p-3 border border-slate-300 rounded outline-none focus:ring-2 focus:ring-amber-500 text-slate-800"
                                    placeholder="List parts..."
                                    value={activeItem.partsNeeded || ""}
                                    onChange={(e) => handleUpdate({ partsNeeded: e.target.value })}
                                />
                            </div>

                            <div className="pt-4">
                                <button 
                                    onClick={submitSurvey}
                                    disabled={!activeItem.rootCause || !activeItem.proposedRemedy}
                                    className="w-full py-3 bg-amber-500 text-white font-bold rounded-lg hover:bg-amber-600 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
                                >
                                    Submit Report & Start Quote
                                </button>
                            </div>
                        </div>
                    )}

                    {/* 3. QUOTATION STAGE ACTIONS */}
                    {activeItem.stage === 'Quotation' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold">3</div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800">Quotation Builder</h3>
                                    <p className="text-sm text-slate-500">Prepare financial proposal.</p>
                                </div>
                            </div>

                            {/* Reference Report */}
                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-sm text-slate-600 mb-6">
                                <div className="font-bold text-slate-800 mb-1">Technical Reference:</div>
                                <p><strong>Root Cause:</strong> {activeItem.rootCause}</p>
                                <p><strong>Remedy:</strong> {activeItem.proposedRemedy}</p>
                            </div>

                            {/* Line Items Table */}
                            <div className="border border-slate-200 rounded-lg overflow-hidden mb-4">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-100 text-slate-500 font-bold">
                                        <tr>
                                            <th className="px-4 py-2">Description</th>
                                            <th className="px-4 py-2 w-20 text-center">Qty</th>
                                            <th className="px-4 py-2 w-28 text-right">Price</th>
                                            <th className="px-4 py-2 w-28 text-right">Total</th>
                                            <th className="px-4 py-2 w-10"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {(activeItem.quoteLineItems || []).map(item => (
                                            <tr key={item.id}>
                                                <td className="px-4 py-2 text-slate-800">{item.description}</td>
                                                <td className="px-4 py-2 text-center text-slate-800">{item.quantity}</td>
                                                <td className="px-4 py-2 text-right text-slate-800">${item.unitPrice.toFixed(2)}</td>
                                                <td className="px-4 py-2 text-right font-medium text-slate-800">${item.total.toFixed(2)}</td>
                                                <td className="px-4 py-2 text-right">
                                                    <button onClick={() => removeLineItem(item.id)} className="text-rose-400 hover:text-rose-600">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        
                                        {/* Add Row Input */}
                                        <tr className="bg-purple-50/30">
                                            <td className="px-4 py-2 relative">
                                                {/* Inventory Selector */}
                                                <select 
                                                    className="w-full bg-transparent border-b border-transparent focus:border-purple-300 outline-none text-xs text-blue-600 mb-1"
                                                    value={selectedInventoryId}
                                                    onChange={(e) => handleInventorySelect(e.target.value)}
                                                >
                                                    <option value="">+ Select Part from Inventory (Optional)</option>
                                                    {inventory.map(i => (
                                                        <option key={i.id} value={i.id}>{i.name} (${i.sellingPrice})</option>
                                                    ))}
                                                </select>
                                                <input 
                                                    placeholder="Item Description"
                                                    className="w-full bg-transparent border-b border-transparent focus:border-purple-300 outline-none text-slate-800 placeholder-slate-500 font-medium"
                                                    value={tempLineItem.desc}
                                                    onChange={e => setTempLineItem({...tempLineItem, desc: e.target.value})}
                                                    onKeyDown={e => e.key === 'Enter' && addLineItem()}
                                                />
                                            </td>
                                            <td className="px-4 py-2">
                                                <input 
                                                    type="number" min="1"
                                                    className="w-full text-center bg-transparent border-b border-transparent focus:border-purple-300 outline-none text-slate-800 font-medium"
                                                    value={tempLineItem.qty}
                                                    onChange={e => setTempLineItem({...tempLineItem, qty: parseInt(e.target.value) || 1})}
                                                />
                                                {stockWarning && (
                                                    <div className="text-[10px] text-rose-600 font-bold flex items-center justify-center gap-1 mt-1">
                                                        <AlertTriangle size={10} /> Low Stock!
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-4 py-2">
                                                <input 
                                                    type="number" min="0"
                                                    className="w-full text-right bg-transparent border-b border-transparent focus:border-purple-300 outline-none text-slate-800 font-medium"
                                                    value={tempLineItem.price}
                                                    onChange={e => setTempLineItem({...tempLineItem, price: parseFloat(e.target.value) || 0})}
                                                />
                                            </td>
                                            <td className="px-4 py-2 text-right text-slate-600 font-mono">
                                                ${(tempLineItem.qty * tempLineItem.price).toFixed(2)}
                                            </td>
                                            <td className="px-4 py-2 text-right">
                                                <button onClick={addLineItem} className="text-purple-600 hover:text-purple-800 font-bold">
                                                    <Plus size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    </tbody>
                                    <tfoot className="bg-slate-50 border-t border-slate-200">
                                        <tr>
                                            <td colSpan={3} className="px-4 py-3 text-right font-bold text-slate-600">Grand Total</td>
                                            <td className="px-4 py-3 text-right font-bold text-slate-800 text-lg">
                                                ${activeItem.quoteAmount?.toLocaleString()}
                                            </td>
                                            <td></td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>

                            {stockWarning && (
                                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between text-sm mb-4">
                                    <span className="text-amber-800 font-medium flex items-center gap-2">
                                        <AlertTriangle size={16} /> Inventory Low on {tempLineItem.desc}
                                    </span>
                                    <button 
                                        onClick={() => onNavigate && onNavigate('procurement')}
                                        className="text-blue-600 hover:underline font-bold text-xs"
                                    >
                                        Buy from Procurement →
                                    </button>
                                </div>
                            )}
                            
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Validity Date</label>
                                    <input 
                                        type="date" 
                                        className="w-full p-2 border border-slate-300 rounded outline-none focus:ring-2 focus:ring-purple-500 text-slate-800"
                                        value={activeItem.validityDate || ""}
                                        onChange={(e) => handleUpdate({ validityDate: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Payment Terms</label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g. 50% Upfront"
                                        className="w-full p-2 border border-slate-300 rounded outline-none focus:ring-2 focus:ring-purple-500 text-slate-800"
                                        value={activeItem.paymentTerms || ""}
                                        onChange={(e) => handleUpdate({ paymentTerms: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button 
                                    onClick={finalizeQuote}
                                    className="flex-1 py-3 border border-purple-200 text-purple-700 font-bold rounded-lg hover:bg-purple-50 transition-colors"
                                >
                                    Save Quote (Send to Client)
                                </button>
                                <button 
                                    onClick={markWon}
                                    className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
                                >
                                    Finalize & Approve
                                </button>
                            </div>
                        </div>
                    )}

                    {/* 4. APPROVED (WON) STAGE ACTIONS */}
                    {activeItem.stage === 'Won' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 text-center py-8">
                            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-600">
                                <CheckCircle2 size={40} />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900">Quote Approved!</h3>
                            <p className="text-slate-600 max-w-md mx-auto">
                                The client has accepted the proposal for <strong>${activeItem.quoteAmount?.toLocaleString()}</strong>.
                                You can now proceed to operations.
                            </p>

                            {activeItem.convertedSOId ? (
                                <div className="mt-8 p-6 bg-slate-50 border border-slate-200 rounded-xl inline-block">
                                    <span className="text-sm font-bold text-slate-500 uppercase">Service Order Reference</span>
                                    <div className="text-3xl font-mono font-bold text-blue-600 mt-2">{activeItem.convertedSOId}</div>
                                </div>
                            ) : (
                                <button 
                                    onClick={generateSO}
                                    className="mt-8 px-8 py-4 bg-blue-600 text-white font-bold text-lg rounded-xl hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all hover:scale-105 flex items-center gap-2 mx-auto"
                                >
                                    Generate Service Order <ArrowRight size={20} />
                                </button>
                            )}
                        </div>
                    )}
              </div>
          </div>
      </div>
    </div>
  );
};
