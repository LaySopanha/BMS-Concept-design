
import React, { useState, useEffect } from "react";
import { WorkOrder, Technician, PartUsage, Task, InventoryItem, ClientContext, Asset, RequestPriority } from "../types";
import { MOCK_TECHNICIANS, MOCK_WORK_ORDERS } from "../data";
import { 
  Wrench, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  User, 
  Briefcase, 
  Calendar, 
  ClipboardList,
  Plus,
  Trash2,
  ImageIcon,
  Upload,
  Save,
  Building,
  ArrowRight,
  Package
} from "lucide-react";

export const WorkOrders = ({ 
    orders: initialOrders,
    inventory,
    clients,
    assets,
    onStockUpdate,
    onCreateOrder
}: { 
    orders: WorkOrder[];
    inventory: InventoryItem[];
    clients: ClientContext[];
    assets: Asset[];
    onStockUpdate: (itemId: string, qty: number, type: 'IN' | 'OUT', reference: string) => void;
    onCreateOrder: (order: WorkOrder) => void;
}) => {
  // Merge initial orders (from App state/creation) with MOCK detailed orders for this demo
  const [localOrders, setLocalOrders] = useState<WorkOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<WorkOrder | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Create Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newOrderForm, setNewOrderForm] = useState({
      clientId: "",
      assetId: "",
      title: "",
      description: "",
      priority: "Medium" as RequestPriority,
      startDate: "",
      dueDate: ""
  });

  // Form States for Edit Modal
  const [editOrder, setEditOrder] = useState<WorkOrder | null>(null);
  const [newPart, setNewPart] = useState({ name: "", qty: 1, inventoryId: "" });
  const [newTask, setNewTask] = useState("");

  useEffect(() => {
    // Combine passed orders (newly created) with static mock data
    // Ensure initialOrders (newly created) are first
    const combined = [...initialOrders, ...MOCK_WORK_ORDERS];
    // De-duplicate by ID just in case
    const unique = Array.from(new Map(combined.map(item => [item.id, item])).values());
    setLocalOrders(unique);
  }, [initialOrders]);

  const handleOpenDetail = (order: WorkOrder) => {
    // Ensure tasks/parts arrays exist if data is missing them
    const safeOrder = {
        ...order,
        tasks: order.tasks || [],
        partsUsed: order.partsUsed || [],
        images: order.images || []
    };
    setSelectedOrder(safeOrder);
    setEditOrder(safeOrder);
    setIsModalOpen(true);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newOrderForm.clientId || !newOrderForm.assetId) return;

      const client = clients.find(c => c.id === newOrderForm.clientId);
      const asset = assets.find(a => a.id === newOrderForm.assetId);

      const newOrder: WorkOrder = {
          id: `SO-${Date.now().toString().slice(-6)}`,
          title: newOrderForm.title,
          assetId: newOrderForm.assetId,
          assetName: asset?.name || "Unknown Asset",
          clientName: client?.name || "Unknown Client",
          priority: newOrderForm.priority,
          status: 'Open',
          description: newOrderForm.description,
          createdDate: new Date().toISOString().split('T')[0],
          startDate: newOrderForm.startDate,
          dueDate: newOrderForm.dueDate,
          tasks: [],
          partsUsed: [],
          images: []
      };

      onCreateOrder(newOrder);
      setIsCreateModalOpen(false);
      setNewOrderForm({ clientId: "", assetId: "", title: "", description: "", priority: "Medium", startDate: "", dueDate: "" });
  };

  const handleSave = () => {
    if (editOrder) {
        // Inventory Deduction Logic: Find parts that were added in this session
        const originalOrder = localOrders.find(o => o.id === editOrder.id);
        
        // Check for new parts that have an inventory ID
        const originalPartsCount = originalOrder?.partsUsed.length || 0;
        const currentPartsCount = editOrder.partsUsed.length;

        if (currentPartsCount > originalPartsCount) {
             const newParts = editOrder.partsUsed.slice(originalPartsCount);
             newParts.forEach(part => {
                 if (part.inventoryItemId) {
                     onStockUpdate(part.inventoryItemId, part.quantity, 'OUT', editOrder.id);
                 }
             });
             if (newParts.length > 0) alert(`Work Order updated. ${newParts.length} parts deducted from inventory.`);
        }

        setLocalOrders(prev => prev.map(o => o.id === editOrder.id ? editOrder : o));
        setIsModalOpen(false);
    }
  };

  const updateStatus = (status: WorkOrder['status']) => {
      if (editOrder) setEditOrder({...editOrder, status});
  };

  const assignTechnician = (techId: string) => {
      if (editOrder) setEditOrder({...editOrder, assignedTechnicianId: techId});
  };

  const toggleTask = (taskId: string) => {
      if (editOrder) {
          const updatedTasks = editOrder.tasks.map(t => 
             t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t
          );
          setEditOrder({ ...editOrder, tasks: updatedTasks });
      }
  };

  const addTask = () => {
      if (editOrder && newTask.trim()) {
          const task: Task = { id: `T-${Date.now()}`, description: newTask, isCompleted: false };
          setEditOrder({ ...editOrder, tasks: [...editOrder.tasks, task] });
          setNewTask("");
      }
  };

  const addPart = () => {
      if (editOrder && newPart.inventoryId) {
          const inventoryItem = inventory.find(i => i.id === newPart.inventoryId);
          if (inventoryItem) {
              const part: PartUsage = { 
                  id: `P-${Date.now()}`, 
                  inventoryItemId: inventoryItem.id,
                  partName: inventoryItem.name, 
                  quantity: newPart.qty, 
                  cost: inventoryItem.unitCost
              };
              setEditOrder({ ...editOrder, partsUsed: [...editOrder.partsUsed, part] });
              setNewPart({ name: "", qty: 1, inventoryId: "" });
          }
      }
  };

  const removePart = (partId: string) => {
      if (editOrder) {
          setEditOrder({ ...editOrder, partsUsed: editOrder.partsUsed.filter(p => p.id !== partId) });
      }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editOrder) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setEditOrder(prev => prev ? ({ ...prev, images: [...prev.images, result] }) : null);
      };
      reader.readAsDataURL(file);
    }
  };

  const getTechName = (id?: string) => MOCK_TECHNICIANS.find(t => t.id === id);

  // Helper for Stepper
  const getStepStatus = (step: string, currentStatus: WorkOrder['status']) => {
      const steps = ['Open', 'In Progress', 'Review', 'Completed'];
      const currentIndex = steps.indexOf(currentStatus);
      const stepIndex = steps.indexOf(step);
      
      if (stepIndex < currentIndex) return 'completed';
      if (stepIndex === currentIndex) return 'current';
      return 'pending';
  };

  return (
    <div className="p-8 h-[calc(100vh-64px)] overflow-y-auto bg-slate-50">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex justify-between items-end">
           <div>
              <h1 className="text-2xl font-bold text-slate-800">Work Orders (SO)</h1>
              <p className="text-slate-500 mt-1">Manage active maintenance tickets, assign technicians, and track progress.</p>
           </div>
           <div className="flex items-center gap-4">
               <div className="flex gap-2 text-sm">
                   <span className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 font-medium">
                       Total: {localOrders.length}
                   </span>
                   <span className="px-3 py-2 bg-blue-50 border border-blue-100 rounded-lg text-blue-700 font-medium">
                       Open: {localOrders.filter(o => o.status === 'Open' || o.status === 'In Progress').length}
                   </span>
               </div>
               <button 
                  onClick={() => setIsCreateModalOpen(true)}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-sm"
               >
                   <Plus size={18} /> Create Order
               </button>
           </div>
        </div>

        {/* --- Work Order List --- */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {localOrders.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center text-slate-400">
               <Wrench size={48} className="mb-4 opacity-20" />
               <p className="font-medium text-lg">No Active Work Orders</p>
               <p className="text-sm">Submit a service request from the Asset Management screen.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
               {localOrders.map(order => {
                  const tech = getTechName(order.assignedTechnicianId);
                  return (
                    <div 
                        key={order.id} 
                        onClick={() => handleOpenDetail(order)}
                        className="p-6 hover:bg-slate-50 transition-colors cursor-pointer group"
                    >
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-3">
                                <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${order.priority === 'High' ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'}`}>
                                    {order.priority}
                                </span>
                                <span className="font-mono text-xs text-slate-400">#{order.id}</span>
                            </div>
                            <span className="text-sm font-medium text-slate-600 flex items-center gap-1">
                                <Clock size={14} /> {order.createdDate}
                            </span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-1 group-hover:text-blue-600 transition-colors">
                            {order.title || order.description.substring(0, 50)}
                        </h3>
                        <div className="text-sm text-slate-500 mb-3 flex items-center gap-2">
                            <Building size={14} className="text-slate-400" />
                            <span className="font-medium text-slate-700">{order.clientName}</span>
                            <span>•</span>
                            <span>{order.assetName}</span>
                        </div>
                        <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-xs font-bold text-slate-500 overflow-hidden">
                                    {tech ? (
                                        tech.type === 'Internal' ? <User size={16} /> : <Briefcase size={16} />
                                    ) : "?"}
                                </div>
                                <div className="text-sm">
                                    <span className="block font-medium text-slate-700">{tech?.name || "Unassigned"}</span>
                                    {tech && <span className="block text-[10px] text-slate-400">{tech.type}</span>}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${order.status === 'Open' ? 'bg-amber-50 text-amber-700 border-amber-200' : order.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                                    {order.status}
                                </span>
                            </div>
                        </div>
                    </div>
                  );
               })}
            </div>
          )}
        </div>

        {/* --- Create Modal --- */}
        {isCreateModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                    <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                        <h2 className="text-lg font-bold text-slate-800">Create New Work Order</h2>
                        <button onClick={() => setIsCreateModalOpen(false)}><X size={20} className="text-slate-400 hover:text-slate-600" /></button>
                    </div>
                    <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Client</label>
                            <select 
                                required className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                value={newOrderForm.clientId}
                                onChange={(e) => setNewOrderForm({...newOrderForm, clientId: e.target.value, assetId: ""})}
                            >
                                <option value="">-- Select Client --</option>
                                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Asset</label>
                            <select 
                                required className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                value={newOrderForm.assetId}
                                onChange={(e) => setNewOrderForm({...newOrderForm, assetId: e.target.value})}
                                disabled={!newOrderForm.clientId}
                            >
                                <option value="">-- Select Asset --</option>
                                {assets
                                    .filter(a => a.clientId === newOrderForm.clientId)
                                    .map(a => <option key={a.id} value={a.id}>{a.name} ({a.code})</option>)
                                }
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Issue / Title</label>
                            <input 
                                required type="text" 
                                className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g. Broken Fan Motor"
                                value={newOrderForm.title}
                                onChange={(e) => setNewOrderForm({...newOrderForm, title: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Priority</label>
                            <select 
                                className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                value={newOrderForm.priority}
                                onChange={(e) => setNewOrderForm({...newOrderForm, priority: e.target.value as RequestPriority})}
                            >
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Start Date</label>
                                <input 
                                    type="date"
                                    className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                    value={newOrderForm.startDate}
                                    onChange={(e) => setNewOrderForm({...newOrderForm, startDate: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Due Date</label>
                                <input 
                                    type="date"
                                    className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                    value={newOrderForm.dueDate}
                                    onChange={(e) => setNewOrderForm({...newOrderForm, dueDate: e.target.value})}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Description</label>
                            <textarea 
                                className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                rows={3}
                                value={newOrderForm.description}
                                onChange={(e) => setNewOrderForm({...newOrderForm, description: e.target.value})}
                            />
                        </div>
                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                            <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-bold">Cancel</button>
                            <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 shadow-lg">Create Ticket</button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {/* --- Detail/Edit Modal --- */}
        {isModalOpen && editOrder && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
                    
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-start bg-slate-50">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h2 className="text-xl font-bold text-slate-900">{editOrder.id}</h2>
                                <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${editOrder.priority === 'High' ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'}`}>
                                    {editOrder.priority} Priority
                                </span>
                            </div>
                            <h3 className="text-lg font-medium text-slate-700">{editOrder.title || "Untitled Service Order"}</h3>
                        </div>
                        <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-200">
                            <X size={24} />
                        </button>
                    </div>

                    {/* "Golden Thread" Workflow Stepper */}
                    <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
                        <div className="flex items-center justify-between relative">
                            {/* Line Background */}
                            <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 -z-10 rounded-full"></div>
                            
                            {/* Steps */}
                            {[
                                { id: 'Open', label: '1. Request' }, 
                                { id: 'In Progress', label: '2. Execution' }, 
                                { id: 'Review', label: '3. Quality Check' }, 
                                { id: 'Completed', label: '4. Invoice' }
                            ].map((step) => {
                                const status = getStepStatus(step.id, editOrder.status);
                                return (
                                    <div key={step.id} className="flex flex-col items-center bg-slate-50 px-2">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-4 transition-all ${
                                            status === 'completed' ? 'bg-emerald-500 border-emerald-200 text-white' : 
                                            status === 'current' ? 'bg-blue-600 border-blue-200 text-white scale-110' : 
                                            'bg-white border-slate-200 text-slate-400'
                                        }`}>
                                            {status === 'completed' ? <CheckCircle2 size={16} /> : 
                                             status === 'current' ? <span className="animate-pulse w-2 h-2 bg-white rounded-full"/> : 
                                             <span className="w-2 h-2 bg-slate-300 rounded-full"/>}
                                        </div>
                                        <span className={`text-xs font-bold mt-2 ${status === 'current' ? 'text-blue-700' : 'text-slate-500'}`}>{step.label}</span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto flex flex-col md:flex-row">
                        {/* LEFT COLUMN: Details & Tasks */}
                        <div className="flex-[2] p-8 border-r border-slate-100">
                            
                            <div className="mb-8">
                                <h4 className="text-sm font-bold text-slate-400 uppercase mb-4">Work Description</h4>
                                <textarea 
                                    className="w-full p-3 border border-slate-200 rounded-lg text-slate-700 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50"
                                    rows={3}
                                    value={editOrder.description}
                                    onChange={(e) => setEditOrder({...editOrder, description: e.target.value})}
                                />
                            </div>

                            <div className="mb-8">
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="text-sm font-bold text-slate-400 uppercase flex items-center gap-2">
                                        <ClipboardList size={16} /> Task Checklist
                                    </h4>
                                    <span className="text-xs text-slate-400">
                                        {editOrder.tasks.filter(t => t.isCompleted).length} / {editOrder.tasks.length} Done
                                    </span>
                                </div>
                                <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                    {editOrder.tasks.map(task => (
                                        <div key={task.id} className="flex items-center gap-3 p-2 bg-white rounded border border-slate-200 shadow-sm">
                                            <input 
                                                type="checkbox" 
                                                checked={task.isCompleted} 
                                                onChange={() => toggleTask(task.id)}
                                                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                                            />
                                            <span className={`text-sm ${task.isCompleted ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                                                {task.description}
                                            </span>
                                        </div>
                                    ))}
                                    <div className="flex items-center gap-2 mt-2">
                                        <input 
                                            type="text" 
                                            placeholder="Add new task..." 
                                            className="flex-1 p-2 text-sm border border-slate-200 rounded outline-none"
                                            value={newTask}
                                            onChange={(e) => setNewTask(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && addTask()}
                                        />
                                        <button onClick={addTask} className="p-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200">
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-8">
                                <h4 className="text-sm font-bold text-slate-400 uppercase mb-4 flex items-center gap-2">
                                    <Wrench size={16} /> Spare Parts Used
                                </h4>
                                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                                            <tr>
                                                <th className="px-4 py-2">Part Name</th>
                                                <th className="px-4 py-2 w-20 text-center">Qty</th>
                                                <th className="px-4 py-2 w-10"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {editOrder.partsUsed.map(part => (
                                                <tr key={part.id}>
                                                    <td className="px-4 py-2 text-slate-700">{part.partName}</td>
                                                    <td className="px-4 py-2 text-center">{part.quantity}</td>
                                                    <td className="px-4 py-2 text-right">
                                                        <button onClick={() => removePart(part.id)} className="text-rose-400 hover:text-rose-600">
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                            <tr className="bg-slate-50">
                                                <td className="px-4 py-2">
                                                    <select 
                                                        className="w-full bg-transparent outline-none text-slate-700 border-none p-0 focus:ring-0"
                                                        value={newPart.inventoryId}
                                                        onChange={(e) => setNewPart({...newPart, inventoryId: e.target.value})}
                                                    >
                                                        <option value="">-- Select Inventory Part --</option>
                                                        {inventory.map(item => (
                                                            <option key={item.id} value={item.id}>{item.name} (Stock: {item.quantity})</option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className="px-4 py-2">
                                                    <input 
                                                        type="number" min="1"
                                                        className="w-full bg-transparent outline-none text-center text-slate-700"
                                                        value={newPart.qty}
                                                        onChange={(e) => setNewPart({...newPart, qty: parseInt(e.target.value)})}
                                                    />
                                                </td>
                                                <td className="px-4 py-2 text-right">
                                                    <button onClick={addPart} disabled={!newPart.inventoryId} className="text-blue-500 font-bold text-xs uppercase disabled:text-slate-400">Add</button>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <p className="text-xs text-slate-400 mt-2 italic">* Adding parts here will deduct from inventory upon save.</p>
                            </div>

                            <div>
                                <h4 className="text-sm font-bold text-slate-400 uppercase mb-4 flex items-center gap-2">
                                    <ImageIcon size={16} /> Attachments & Evidence
                                </h4>
                                <div className="grid grid-cols-4 gap-4">
                                    {editOrder.images.map((img, idx) => (
                                        <div key={idx} className="aspect-square rounded-lg bg-slate-100 border border-slate-200 overflow-hidden relative group">
                                            <img src={img} className="w-full h-full object-cover" alt="Evidence" />
                                        </div>
                                    ))}
                                    <label className="aspect-square rounded-lg border-2 border-dashed border-slate-200 hover:border-blue-400 hover:bg-blue-50 flex flex-col items-center justify-center cursor-pointer transition-colors text-slate-400 hover:text-blue-500">
                                        <Upload size={24} className="mb-2" />
                                        <span className="text-xs font-bold uppercase">Upload</span>
                                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                    </label>
                                </div>
                            </div>

                        </div>

                        {/* RIGHT COLUMN: Info & Actions */}
                        <div className="flex-1 p-8 bg-slate-50/50">
                            
                            {/* Workflow Actions */}
                            <div className="mb-8 space-y-3">
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Advance Stage</label>
                                <div className="flex flex-col gap-2">
                                    {['Open', 'In Progress', 'Review', 'Completed'].map((status) => (
                                        <button
                                            key={status}
                                            onClick={() => updateStatus(status as any)}
                                            className={`w-full py-2 px-4 rounded-lg border text-sm font-bold transition-all flex items-center justify-between ${editOrder.status === status ? 'bg-blue-600 text-white border-blue-600 shadow-md transform scale-105' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'}`}
                                        >
                                            {status}
                                            {editOrder.status === status && <CheckCircle2 size={16} />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Assignment */}
                            <div className="mb-8">
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-3">Assigned Contractor</label>
                                <div className="space-y-2">
                                    {MOCK_TECHNICIANS.map(tech => (
                                        <button
                                            key={tech.id}
                                            onClick={() => assignTechnician(tech.id)}
                                            className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${editOrder.assignedTechnicianId === tech.id ? 'bg-white border-blue-500 ring-2 ring-blue-100 shadow-sm' : 'bg-slate-100 border-transparent hover:bg-white hover:border-slate-200'}`}
                                        >
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${tech.type === 'Internal' ? 'bg-indigo-500' : 'bg-amber-500'}`}>
                                                {tech.name.substring(0,1)}
                                            </div>
                                            <div>
                                                <div className="font-bold text-sm text-slate-700">{tech.name}</div>
                                                <div className="text-[10px] text-slate-500 uppercase tracking-wide">{tech.type} • {tech.role}</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Related Info */}
                            <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-4">
                                <div>
                                    <div className="text-xs text-slate-400 uppercase font-bold mb-1">Asset</div>
                                    <div className="text-sm font-medium text-slate-700">{editOrder.assetName}</div>
                                    <div className="text-xs text-slate-500 font-mono">{editOrder.assetId}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-slate-400 uppercase font-bold mb-1">Client</div>
                                    <div className="text-sm font-medium text-slate-700">{editOrder.clientName}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-slate-400 uppercase font-bold mb-1">Dates</div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Created:</span>
                                        <span className="font-medium">{editOrder.createdDate}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Due:</span>
                                        <span className="font-medium text-rose-600">{editOrder.dueDate || "N/A"}</span>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-slate-200 bg-white flex justify-end gap-3">
                        <button onClick={() => setIsModalOpen(false)} className="px-6 py-2 text-slate-600 hover:bg-slate-50 font-bold rounded-lg transition-colors">
                            Cancel
                        </button>
                        <button onClick={handleSave} className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 flex items-center gap-2">
                            <Save size={18} /> Save Updates
                        </button>
                    </div>

                </div>
            </div>
        )}
      </div>
    </div>
  );
};
