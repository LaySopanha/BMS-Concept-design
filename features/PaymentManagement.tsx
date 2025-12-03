import React, { useState, useMemo } from "react";
import { Invoice, PaymentStatus, ClientContext, WorkOrder, InventoryItem } from "../types";
import { MOCK_INVOICES } from "../data";
import { 
  DollarSign, 
  FileText, 
  Download, 
  Search, 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  X,
  Printer,
  Trash2,
  Building2,
  Calendar,
  Wrench,
  Package
} from "lucide-react";

export const PaymentManagement = ({
  clients,
  workOrders,
  inventory
}: {
  clients: ClientContext[];
  workOrders: WorkOrder[];
  inventory: InventoryItem[];
}) => {
  const [invoices, setInvoices] = useState<Invoice[]>(MOCK_INVOICES);
  const [statusFilter, setStatusFilter] = useState<string>("All");
  
  // Create Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState("");
  const [selectedWO, setSelectedWO] = useState("");
  const [invoiceItems, setInvoiceItems] = useState<{description: string, amount: number}[]>([]);
  const [newItem, setNewItem] = useState({ description: "", amount: 0 });
  const [laborDetails, setLaborDetails] = useState({ hours: 0, rate: 50 });
  
  // Spare Part Selector State
  const [selectedPartId, setSelectedPartId] = useState("");
  const [partQty, setPartQty] = useState(1);
  const [partOverridePrice, setPartOverridePrice] = useState<number | null>(null);

  // View Modal State
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null);

  const getStatusColor = (status: PaymentStatus) => {
    switch(status) {
      case 'Paid': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Pending': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Overdue': return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const totalRevenue = invoices.filter(i => i.status === 'Paid').reduce((acc, curr) => acc + curr.amount, 0);
  const pendingRevenue = invoices.filter(i => i.status === 'Pending').reduce((acc, curr) => acc + curr.amount, 0);
  const overdueRevenue = invoices.filter(i => i.status === 'Overdue').reduce((acc, curr) => acc + curr.amount, 0);

  const filteredInvoices = statusFilter === "All" ? invoices : invoices.filter(i => i.status === statusFilter);

  // --- Invoice Logic ---

  const handleClientChange = (clientId: string) => {
      setSelectedClient(clientId);
      setSelectedWO("");
      setInvoiceItems([]);
  };

  const handleWOChange = (woId: string) => {
      setSelectedWO(woId);
      const wo = workOrders.find(w => w.id === woId);
      if (wo) {
          const partsItems = (wo.partsUsed || []).map(p => ({
              description: `Part Used (WO): ${p.partName} (Qty: ${p.quantity})`,
              amount: (p.cost || 0) * p.quantity 
          }));
          setInvoiceItems(partsItems);
      }
  };

  const addLaborCost = () => {
      if (laborDetails.hours > 0) {
          setInvoiceItems(prev => [...prev, {
              description: `Labor Charges (${laborDetails.hours} hrs @ $${laborDetails.rate}/hr)`,
              amount: laborDetails.hours * laborDetails.rate
          }]);
          setLaborDetails({ hours: 0, rate: 50 }); // Reset
      }
  };

  const addSparePart = () => {
    if (selectedPartId) {
        const item = inventory.find(i => i.id === selectedPartId);
        if (item) {
            const unitPrice = partOverridePrice !== null ? partOverridePrice : item.sellingPrice;
            setInvoiceItems(prev => [...prev, {
                description: `Spare Part: ${item.name} (Qty: ${partQty})`,
                amount: unitPrice * partQty
            }]);
            // Reset
            setSelectedPartId("");
            setPartQty(1);
            setPartOverridePrice(null);
        }
    }
  };

  const addManualItem = () => {
      if (newItem.description && newItem.amount > 0) {
          setInvoiceItems(prev => [...prev, newItem]);
          setNewItem({ description: "", amount: 0 });
      }
  };

  const removeItem = (idx: number) => {
      setInvoiceItems(prev => prev.filter((_, i) => i !== idx));
  };

  const calculateTotal = () => invoiceItems.reduce((acc, item) => acc + item.amount, 0);

  const handleCreateInvoice = () => {
      if (!selectedClient || invoiceItems.length === 0) return;
      
      const client = clients.find(c => c.id === selectedClient);
      const newInv: Invoice = {
          id: `INV-${Date.now()}`,
          invoiceNumber: `INV-2024-${Math.floor(Math.random() * 1000)}`,
          clientId: selectedClient,
          clientName: client?.name || "Unknown",
          dateIssued: new Date().toISOString().split('T')[0],
          dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0], // +30 days
          amount: calculateTotal(),
          status: 'Pending',
          items: invoiceItems,
          workOrderRef: selectedWO || undefined
      };
      
      setInvoices(prev => [newInv, ...prev]);
      setIsCreateOpen(false);
      // Reset form
      setSelectedClient("");
      setSelectedWO("");
      setInvoiceItems([]);
  };

  return (
    <div className="p-8 h-[calc(100vh-64px)] overflow-y-auto bg-slate-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Finance & Invoices</h1>
            <p className="text-slate-500 mt-1">Track billing, payments, and revenue status.</p>
          </div>
          <button 
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2 rounded-lg font-bold shadow hover:bg-slate-800 transition-colors"
          >
            <Plus size={18} /> Create Invoice
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
             <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Revenue (Paid)</p>
                <h3 className="text-2xl font-bold text-emerald-600">${totalRevenue.toLocaleString()}</h3>
             </div>
             <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                <CheckCircle2 size={24} />
             </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
             <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Pending Amount</p>
                <h3 className="text-2xl font-bold text-blue-600">${pendingRevenue.toLocaleString()}</h3>
             </div>
             <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                <Clock size={24} />
             </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
             <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Overdue Amount</p>
                <h3 className="text-2xl font-bold text-rose-600">${overdueRevenue.toLocaleString()}</h3>
             </div>
             <div className="p-3 bg-rose-50 text-rose-600 rounded-lg">
                <AlertCircle size={24} />
             </div>
          </div>
        </div>

        {/* Filters & List */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
           <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-wrap gap-4 items-center justify-between">
              <div className="flex items-center gap-2">
                 <button 
                   onClick={() => setStatusFilter("All")}
                   className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border ${statusFilter === 'All' ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200'}`}
                 >
                    All Invoices
                 </button>
                 {['Paid', 'Pending', 'Overdue'].map(status => (
                    <button 
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border ${statusFilter === status ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-white text-slate-600 border-slate-200'}`}
                    >
                       {status}
                    </button>
                 ))}
              </div>
              <div className="relative">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                 <input 
                   type="text" 
                   placeholder="Search invoice # or client..." 
                   className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                 />
              </div>
           </div>

           <div className="divide-y divide-slate-100">
              {filteredInvoices.map((inv) => (
                 <div key={inv.id} onClick={() => setViewInvoice(inv)} className="p-5 hover:bg-slate-50 transition-colors flex items-center justify-between group cursor-pointer">
                    <div className="flex items-center gap-4">
                       <div className="p-3 bg-slate-100 rounded-lg text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                          <FileText size={24} />
                       </div>
                       <div>
                          <div className="flex items-center gap-2 mb-1">
                             <span className="font-bold text-slate-800">{inv.invoiceNumber}</span>
                             <span className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded border uppercase font-bold ${getStatusColor(inv.status)}`}>
                                {inv.status}
                             </span>
                          </div>
                          <div className="text-sm text-slate-500 flex items-center gap-2">
                             <span className="font-medium text-slate-700">{inv.clientName}</span>
                             <span>•</span>
                             <span>Issued: {inv.dateIssued}</span>
                          </div>
                       </div>
                    </div>
                    
                    <div className="flex items-center gap-8">
                       <div className="text-right">
                          <span className="block text-xs font-bold text-slate-400 uppercase">Amount</span>
                          <span className="text-lg font-bold text-slate-800">${inv.amount.toLocaleString()}</span>
                       </div>
                       <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View & Print">
                          <Printer size={20} />
                       </button>
                    </div>
                 </div>
              ))}
           </div>
        </div>

        {/* --- CREATE INVOICE MODAL --- */}
        {isCreateOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                    <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <Plus size={20} className="text-blue-600"/> Create New Invoice
                        </h2>
                        <button onClick={() => setIsCreateOpen(false)}><X size={20} className="text-slate-400 hover:text-slate-600" /></button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8">
                        {/* 1. Client & WO Selection */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Select Client</label>
                                <select 
                                    className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                    value={selectedClient}
                                    onChange={(e) => handleClientChange(e.target.value)}
                                >
                                    <option value="">-- Choose Client --</option>
                                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Import from Work Order (Optional)</label>
                                <select 
                                    className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                    value={selectedWO}
                                    onChange={(e) => handleWOChange(e.target.value)}
                                    disabled={!selectedClient}
                                >
                                    <option value="">-- None --</option>
                                    {workOrders
                                        .filter(w => !selectedClient || clients.find(c => c.id === selectedClient)?.name === w.clientName)
                                        .map(wo => (
                                        <option key={wo.id} value={wo.id}>{wo.id} - {wo.title}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* 2. Labor Calculator */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                <h3 className="text-sm font-bold text-blue-800 uppercase mb-3 flex items-center gap-2">
                                    <Clock size={16} /> Labor Cost Calculator
                                </h3>
                                <div className="flex items-end gap-3 flex-wrap">
                                    <div className="flex-1 min-w-[100px]">
                                        <label className="block text-xs font-bold text-blue-600 mb-1">Hours</label>
                                        <input type="number" min="0" className="w-full p-2 border border-blue-200 rounded outline-none" 
                                            value={laborDetails.hours} onChange={e => setLaborDetails({...laborDetails, hours: parseFloat(e.target.value) || 0})}
                                        />
                                    </div>
                                    <div className="flex-1 min-w-[100px]">
                                        <label className="block text-xs font-bold text-blue-600 mb-1">Rate ($/hr)</label>
                                        <input type="number" min="0" className="w-full p-2 border border-blue-200 rounded outline-none" 
                                            value={laborDetails.rate} onChange={e => setLaborDetails({...laborDetails, rate: parseFloat(e.target.value) || 0})}
                                        />
                                    </div>
                                    <button 
                                        onClick={addLaborCost}
                                        className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded hover:bg-blue-700 transition-colors"
                                    >
                                        Add
                                    </button>
                                </div>
                            </div>

                            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                                <h3 className="text-sm font-bold text-emerald-800 uppercase mb-3 flex items-center gap-2">
                                    <Package size={16} /> Add Spare Parts
                                </h3>
                                <div className="space-y-2">
                                    <select 
                                        className="w-full p-2 border border-emerald-200 rounded outline-none text-sm"
                                        value={selectedPartId}
                                        onChange={(e) => {
                                            setSelectedPartId(e.target.value);
                                            setPartOverridePrice(null);
                                        }}
                                    >
                                        <option value="">-- Select Inventory Part --</option>
                                        {inventory.map(item => (
                                            <option key={item.id} value={item.id}>{item.name} (${item.sellingPrice})</option>
                                        ))}
                                    </select>
                                    <div className="flex gap-2">
                                        <input 
                                            type="number" min="1" placeholder="Qty"
                                            className="w-20 p-2 border border-emerald-200 rounded outline-none text-sm"
                                            value={partQty}
                                            onChange={(e) => setPartQty(parseInt(e.target.value) || 1)}
                                        />
                                        <input 
                                            type="number" min="0" placeholder="Override Price"
                                            className="flex-1 p-2 border border-emerald-200 rounded outline-none text-sm"
                                            value={partOverridePrice === null ? "" : partOverridePrice}
                                            onChange={(e) => setPartOverridePrice(parseFloat(e.target.value))}
                                        />
                                        <button 
                                            onClick={addSparePart}
                                            disabled={!selectedPartId}
                                            className="px-4 py-2 bg-emerald-600 text-white text-sm font-bold rounded hover:bg-emerald-700 transition-colors disabled:bg-slate-300"
                                        >
                                            Add
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 3. Items Table */}
                        <div className="mb-4">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-100 text-slate-500 font-bold border-b border-slate-200">
                                    <tr>
                                        <th className="px-4 py-3">Description</th>
                                        <th className="px-4 py-3 text-right">Amount ($)</th>
                                        <th className="px-4 py-3 w-10"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {invoiceItems.length === 0 && (
                                        <tr>
                                            <td colSpan={3} className="p-8 text-center text-slate-400 italic">No items added yet.</td>
                                        </tr>
                                    )}
                                    {invoiceItems.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50">
                                            <td className="px-4 py-3 text-slate-700">{item.description}</td>
                                            <td className="px-4 py-3 text-right font-mono font-medium">${item.amount.toFixed(2)}</td>
                                            <td className="px-4 py-3 text-right">
                                                <button onClick={() => removeItem(idx)} className="text-rose-400 hover:text-rose-600"><Trash2 size={16} /></button>
                                            </td>
                                        </tr>
                                    ))}
                                    {/* Manual Add Row */}
                                    <tr className="bg-slate-50/50">
                                        <td className="px-4 py-2">
                                            <input 
                                                placeholder="Add custom item description..." 
                                                className="w-full bg-transparent outline-none border-b border-transparent focus:border-blue-400 text-sm py-1"
                                                value={newItem.description}
                                                onChange={e => setNewItem({...newItem, description: e.target.value})}
                                            />
                                        </td>
                                        <td className="px-4 py-2 text-right">
                                            <input 
                                                type="number" min="0" placeholder="0.00"
                                                className="w-24 text-right bg-transparent outline-none border-b border-transparent focus:border-blue-400 text-sm py-1"
                                                value={newItem.amount || ""}
                                                onChange={e => setNewItem({...newItem, amount: parseFloat(e.target.value)})}
                                            />
                                        </td>
                                        <td className="px-4 py-2 text-right">
                                            <button onClick={addManualItem} className="text-blue-600 font-bold text-xs uppercase hover:underline">Add</button>
                                        </td>
                                    </tr>
                                </tbody>
                                <tfoot className="border-t-2 border-slate-200 bg-slate-50">
                                    <tr>
                                        <td className="px-4 py-3 font-bold text-slate-700 text-right">Total Amount</td>
                                        <td className="px-4 py-3 text-right font-bold text-xl text-slate-900">${calculateTotal().toFixed(2)}</td>
                                        <td></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>

                    <div className="p-4 border-t border-slate-200 bg-white flex justify-end gap-3">
                        <button onClick={() => setIsCreateOpen(false)} className="px-6 py-2 text-slate-600 hover:bg-slate-50 font-bold rounded-lg transition-colors">Cancel</button>
                        <button 
                            onClick={handleCreateInvoice}
                            disabled={!selectedClient || invoiceItems.length === 0}
                            className={`px-6 py-2 text-white font-bold rounded-lg transition-colors shadow-lg ${!selectedClient || invoiceItems.length === 0 ? 'bg-slate-300 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'}`}
                        >
                            Generate Invoice
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* --- VIEW / PRINT INVOICE MODAL --- */}
        {viewInvoice && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
                <div className="bg-white w-full max-w-3xl min-h-[80vh] shadow-2xl flex flex-col relative">
                    <button 
                        onClick={() => setViewInvoice(null)} 
                        className="absolute -right-4 -top-4 bg-white text-slate-800 p-2 rounded-full shadow-lg hover:bg-slate-100 z-10"
                    >
                        <X size={24} />
                    </button>
                    
                    {/* Invoice Paper Layout */}
                    <div className="flex-1 p-12 bg-white text-slate-900 font-sans" id="invoice-print-area">
                        {/* Header */}
                        <div className="flex justify-between items-start mb-12 border-b border-slate-100 pb-8">
                            <div>
                                <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">INVOICE</h1>
                                <p className="text-slate-500 font-medium mt-2">#{viewInvoice.invoiceNumber}</p>
                            </div>
                            <div className="text-right">
                                <div className="text-xl font-bold text-slate-800">CDS <span className="text-emerald-600">Care</span></div>
                                <div className="text-sm text-slate-500 mt-1">Facility Management</div>
                                <div className="text-sm text-slate-500">123 Norodom Blvd, Phnom Penh</div>
                                <div className="text-sm text-slate-500">contact@cds-care.com</div>
                            </div>
                        </div>

                        {/* Bill To & Dates */}
                        <div className="flex justify-between mb-12">
                            <div>
                                <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">Bill To</h3>
                                <div className="font-bold text-lg text-slate-800">{viewInvoice.clientName}</div>
                                <div className="text-sm text-slate-500">Client ID: {viewInvoice.clientId}</div>
                            </div>
                            <div className="text-right space-y-2">
                                <div>
                                    <span className="text-xs font-bold text-slate-400 uppercase mr-4">Date Issued</span>
                                    <span className="font-medium">{viewInvoice.dateIssued}</span>
                                </div>
                                <div>
                                    <span className="text-xs font-bold text-slate-400 uppercase mr-4">Due Date</span>
                                    <span className="font-medium">{viewInvoice.dueDate}</span>
                                </div>
                                {viewInvoice.workOrderRef && (
                                    <div>
                                        <span className="text-xs font-bold text-slate-400 uppercase mr-4">Ref WO</span>
                                        <span className="font-medium text-blue-600">{viewInvoice.workOrderRef}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Table */}
                        <div className="mb-12">
                            <table className="w-full">
                                <thead className="border-b-2 border-slate-800 text-slate-800">
                                    <tr>
                                        <th className="py-3 text-left font-bold uppercase text-xs">Description</th>
                                        <th className="py-3 text-right font-bold uppercase text-xs">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {viewInvoice.items.map((item, i) => (
                                        <tr key={i}>
                                            <td className="py-4 text-sm text-slate-700">{item.description}</td>
                                            <td className="py-4 text-right text-sm font-medium">${item.amount.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Totals */}
                        <div className="flex justify-end">
                            <div className="w-64 space-y-3">
                                <div className="flex justify-between text-sm text-slate-500">
                                    <span>Subtotal</span>
                                    <span>${viewInvoice.amount.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm text-slate-500">
                                    <span>Tax (0%)</span>
                                    <span>$0.00</span>
                                </div>
                                <div className="flex justify-between text-xl font-bold text-slate-900 border-t-2 border-slate-900 pt-3">
                                    <span>Total</span>
                                    <span>${viewInvoice.amount.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                        
                        {/* Footer */}
                        <div className="mt-16 pt-8 border-t border-slate-100 text-center">
                            <p className="text-sm font-bold text-slate-800 mb-1">Thank you for your business!</p>
                            <p className="text-xs text-slate-400">Please make payment via ABA Bank: 001 123 456 (CDS Care Ltd).</p>
                        </div>
                    </div>

                    {/* Action Bar */}
                    <div className="bg-slate-50 p-4 flex justify-between items-center border-t border-slate-200">
                         <div className={`px-3 py-1 rounded text-xs font-bold uppercase border ${getStatusColor(viewInvoice.status)}`}>
                             Status: {viewInvoice.status}
                         </div>
                         <button className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-lg font-bold hover:bg-slate-800 transition-colors shadow-lg">
                             <Printer size={18} /> Print / Download PDF
                         </button>
                    </div>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};
