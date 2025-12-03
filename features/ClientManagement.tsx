
import React, { useState, useMemo } from "react";
import { ClientContext, Asset, WorkOrder, PipelineItem, RequestPriority, ViewState, InventoryItem, Invoice } from "../types"; 
import { PipelineWizardModal } from "../components/PipelineWizardModal";
import { 
  Plus, 
  Search, 
  Filter, 
  FileText, 
  Building2, 
  Edit, 
  MapPin, 
  Briefcase, 
  Paperclip, 
  X, 
  UploadCloud,
  Layers,
  ArrowLeft,
  LayoutDashboard,
  ClipboardList,
  Wrench,
  DollarSign,
  ChevronRight,
  User,
  CheckCircle2,
  History,
  Info,
  ChevronDown,
  ChevronUp,
  Package,
  Calendar,
  ArrowRight,
  Receipt,
  FileCheck
} from "lucide-react";
import { MOCK_CATEGORIES as STATIC_CATEGORIES, MOCK_INVOICES } from "../data";
import { StatusBadge } from "../components/StatusBadge";

export type ClientTab = 'overview' | 'commercial' | 'assets' | 'operations' | 'financials' | 'history';

// Helper type for the bundled view
interface ServiceBundle {
    id: string;
    title: string;
    startDate: string;
    lastUpdate: string;
    status: 'Active' | 'Completed' | 'Cancelled';
    totalValue: number;
    
    // Linked Records
    pipelineItem?: PipelineItem;
    workOrder?: WorkOrder;
    invoices: Invoice[];
    
    // Metadata
    category?: string;
    technicianName?: string;
}

export const ClientManagement = ({
  clients, setClients, assets, workOrders, pipelineItems, setPipelineItems,
  viewClientId, setViewClientId, activeTab, setActiveTab, onCreateWorkOrder, onNavigate, inventory
}: {
  clients: ClientContext[];
  setClients: React.Dispatch<React.SetStateAction<ClientContext[]>>;
  assets: Asset[];
  workOrders: WorkOrder[];
  pipelineItems: PipelineItem[];
  setPipelineItems: React.Dispatch<React.SetStateAction<PipelineItem[]>>;
  viewClientId: string | null;
  setViewClientId: (id: string | null) => void;
  activeTab: ClientTab;
  setActiveTab: (tab: ClientTab) => void;
  onCreateWorkOrder: (so: WorkOrder) => void;
  onNavigate: (view: ViewState) => void;
  inventory: InventoryItem[];
}) => {
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Form State for Create/Edit
  const [formData, setFormData] = useState<Partial<ClientContext>>({
    name: "", type: "Hospital", location: "", contactPerson: "", contactPhone: "", description: "", contracts: [], systemTypes: []
  });
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Wizard Modal State
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardItem, setWizardItem] = useState<PipelineItem | null>(null);

  // Filter States for Main Grid
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  
  // History Expansion State
  const [expandedBundleId, setExpandedBundleId] = useState<string | null>(null);
  
  // -- Derivations --
  const selectedClient = clients.find(c => c.id === viewClientId);

  const filteredClients = useMemo(() => {
    return clients.filter(client => {
       const matchText = client.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         (client.contactPerson && client.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()));
       const matchType = filterType === "all" || client.type === filterType;
       return matchText && matchType;
    });
  }, [clients, searchQuery, filterType]);

  // Client Specific Data Filters
  const clientAssets = assets.filter(a => a.clientId === viewClientId);
  const clientWorkOrders = workOrders.filter(wo => wo.clientName === selectedClient?.name); // Matching by name due to mock data limitations
  const clientPipeline = pipelineItems.filter(p => p.clientId === viewClientId);
  const clientInvoices = MOCK_INVOICES.filter(i => i.clientId === viewClientId);

  // -- HISTORY BUNDLING LOGIC (The Golden Thread Stitching) --
  const serviceBundles = useMemo(() => {
      if (!selectedClient) return [];
      
      const bundles: ServiceBundle[] = [];
      const processedSOIds = new Set<string>();

      // 1. Start with Pipeline Items (The source of truth for most flows)
      clientPipeline.forEach(item => {
          const linkedSO = clientWorkOrders.find(so => so.id === item.convertedSOId);
          if (linkedSO) processedSOIds.add(linkedSO.id);
          
          const linkedInvoices = linkedSO 
              ? clientInvoices.filter(inv => inv.workOrderRef === linkedSO.id)
              : [];

          const isCompleted = item.stage === 'Won' && linkedSO?.status === 'Completed';

          bundles.push({
              id: item.id,
              title: item.title,
              startDate: item.createdDate,
              lastUpdate: linkedSO?.createdDate || item.createdDate,
              status: isCompleted ? 'Completed' : 'Active',
              totalValue: item.quoteAmount || 0,
              pipelineItem: item,
              workOrder: linkedSO,
              invoices: linkedInvoices,
              category: item.category,
              technicianName: item.surveyorName || linkedSO?.assignedTechnicianId
          });
      });

      // 2. Catch "Direct" Work Orders (Those created without a pipeline request)
      clientWorkOrders.forEach(so => {
          if (!processedSOIds.has(so.id)) {
              const linkedInvoices = clientInvoices.filter(inv => inv.workOrderRef === so.id);
              bundles.push({
                  id: so.id,
                  title: so.title || "Direct Service Order",
                  startDate: so.createdDate,
                  lastUpdate: so.startDate || so.createdDate,
                  status: so.status === 'Completed' ? 'Completed' : 'Active',
                  totalValue: 0, // Direct SOs might not have quote value stored easily in this mock
                  workOrder: so,
                  invoices: linkedInvoices,
                  technicianName: so.assignedTechnicianId
              });
          }
      });

      // Sort by newest start date
      return bundles.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
  }, [selectedClient, clientPipeline, clientWorkOrders, clientInvoices]);

  // -- Actions --

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    const newClient: ClientContext = {
      ...formData as ClientContext,
      id: `CL-${Date.now()}`,
      contracts: uploadedFile ? [{
          id: `CTR-${Date.now()}`,
          title: "Initial Service Agreement",
          status: "Active",
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
          fileName: uploadedFile
      }] : []
    };
    setClients(prev => [...prev, newClient]);
    setIsModalOpen(false);
    
    // Auto-navigate to the new client's 360 view
    setViewClientId(newClient.id);
    setActiveTab('overview');
  };

  const handleUpdateClient = (e: React.FormEvent) => {
      e.preventDefault();
      if (!viewClientId) return;
      setClients(prev => prev.map(c => c.id === viewClientId ? { ...c, ...formData } as ClientContext : c));
      setIsModalOpen(false);
  };

  const openCreateModal = () => {
      setFormData({ name: "", type: "Hospital", location: "", contactPerson: "", contactPhone: "", description: "", contracts: [], systemTypes: [] });
      setUploadedFile(null);
      setIsEditMode(false);
      setIsModalOpen(true);
  };

  const openEditModal = () => {
      if (!selectedClient) return;
      setFormData(selectedClient);
      setUploadedFile(null);
      setIsEditMode(true);
      setIsModalOpen(true);
  };

  const handleAddQuickRequest = () => {
      if(!viewClientId || !selectedClient) return;
      const newItem: PipelineItem = {
          id: `REQ-${Date.now()}`,
          clientId: viewClientId,
          clientName: selectedClient.name,
          title: "New Service Request",
          description: "Created from Client Dashboard",
          priority: "Medium",
          stage: "Request",
          createdDate: new Date().toISOString().split('T')[0]
      };
      setPipelineItems(prev => [newItem, ...prev]);
      setActiveTab('commercial'); // Switch to commercial tab to see it
  };

  const openWizard = (item: PipelineItem) => {
      setWizardItem(item);
      setIsWizardOpen(true);
  };

  const handleUpdatePipelineItem = (updated: PipelineItem) => {
      setPipelineItems(prev => prev.map(i => i.id === updated.id ? updated : i));
  };

  // Helper for Commercial Table
  const getStageBadge = (stage: string) => {
      switch(stage) {
          case 'Request': return 'bg-blue-50 text-blue-700 border-blue-200';
          case 'Survey': return 'bg-amber-50 text-amber-700 border-amber-200';
          case 'Quotation': return 'bg-purple-50 text-purple-700 border-purple-200';
          case 'Won': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
          default: return 'bg-slate-100 text-slate-600';
      }
  };

  const toggleBundle = (id: string) => {
      if (expandedBundleId === id) setExpandedBundleId(null);
      else setExpandedBundleId(id);
  };

  // --- Render Views ---

  if (viewClientId && selectedClient) {
      // === DETAIL VIEW (CUSTOMER 360) ===
      return (
          <div className="flex flex-col h-[calc(100vh-64px)] bg-slate-50">
              {/* Header */}
              <div className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-start shadow-sm z-10">
                  <div>
                      <button 
                        onClick={() => setViewClientId(null)} 
                        className="flex items-center gap-1 text-slate-500 hover:text-blue-600 text-sm font-medium mb-2 transition-colors"
                      >
                          <ArrowLeft size={16} /> Back to Client List
                      </button>
                      <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                          {selectedClient.name}
                          <span className="text-sm font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">{selectedClient.type}</span>
                      </h1>
                      <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
                          <span className="flex items-center gap-1"><MapPin size={14} /> {selectedClient.location}</span>
                          <span className="flex items-center gap-1"><User size={14} /> {selectedClient.contactPerson}</span>
                      </div>
                  </div>
                  <div className="flex gap-2">
                      <button onClick={openEditModal} className="px-4 py-2 border border-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2">
                          <Edit size={16} /> Edit Profile
                      </button>
                      <button onClick={handleAddQuickRequest} className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm">
                          <Plus size={16} /> New Request
                      </button>
                  </div>
              </div>

              {/* Tabs */}
              <div className="bg-white border-b border-slate-200 px-6 flex gap-6 sticky top-0 z-10">
                  {[
                      { id: 'overview', label: 'Overview', icon: LayoutDashboard },
                      { id: 'commercial', label: 'Requests & Quotes', icon: ClipboardList, count: clientPipeline.length },
                      { id: 'assets', label: 'Assets', icon: Building2, count: clientAssets.length },
                      { id: 'operations', label: 'Work Orders', icon: Wrench, count: clientWorkOrders.length },
                      { id: 'financials', label: 'Financials', icon: DollarSign },
                      { id: 'history', label: 'Service History', icon: History }
                  ].map(tab => (
                      <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id as ClientTab)}
                          className={`py-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${activeTab === tab.id ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                      >
                          <tab.icon size={16} />
                          {tab.label}
                          {tab.count !== undefined && (
                              <span className="ml-1 px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded-full text-[10px]">{tab.count}</span>
                          )}
                      </button>
                  ))}
              </div>

              {/* Content Area */}
              <div className="flex-1 overflow-y-auto p-8">
                  <div className="max-w-6xl mx-auto">
                      
                      {/* OVERVIEW TAB */}
                      {activeTab === 'overview' && (
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                              {/* Left: Info Card */}
                              <div className="lg:col-span-2 space-y-6">
                                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                      <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Client Details</h3>
                                      <div className="grid grid-cols-2 gap-6">
                                          <div>
                                              <label className="text-xs font-bold text-slate-400 uppercase">Description</label>
                                              <p className="text-sm text-slate-700 mt-1 leading-relaxed">{selectedClient.description || "No description provided."}</p>
                                          </div>
                                          <div>
                                              <label className="text-xs font-bold text-slate-400 uppercase">Primary Contact</label>
                                              <p className="text-sm text-slate-800 font-medium mt-1">{selectedClient.contactPerson}</p>
                                              <p className="text-sm text-slate-500">{selectedClient.contactPhone}</p>
                                          </div>
                                          <div>
                                              <label className="text-xs font-bold text-slate-400 uppercase">Facility Systems</label>
                                              <div className="flex flex-wrap gap-1 mt-2">
                                                  {selectedClient.systemTypes && selectedClient.systemTypes.length > 0 ? (
                                                      selectedClient.systemTypes.map(s => (
                                                          <span key={s} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded border border-blue-100">{s}</span>
                                                      ))
                                                  ) : (
                                                      <span className="text-sm text-slate-400 italic">No specific systems tagged</span>
                                                  )}
                                              </div>
                                          </div>
                                      </div>
                                  </div>

                                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                      <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Active Contracts</h3>
                                      {selectedClient.contracts.length > 0 ? (
                                          <div className="space-y-3">
                                              {selectedClient.contracts.map(contract => (
                                                  <div key={contract.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-lg border border-slate-200">
                                                      <div className="flex items-center gap-3">
                                                          <div className="p-2 bg-white rounded border border-slate-200 text-blue-600">
                                                              <FileText size={20} />
                                                          </div>
                                                          <div>
                                                              <div className="font-bold text-slate-800 text-sm">{contract.title}</div>
                                                              <div className="text-xs text-slate-500">
                                                                  {contract.startDate} to {contract.endDate}
                                                              </div>
                                                          </div>
                                                      </div>
                                                      <div className="flex items-center gap-3">
                                                          <span className={`px-2 py-1 rounded text-xs font-bold ${contract.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                                              {contract.status}
                                                          </span>
                                                          <button className="text-blue-600 hover:text-blue-800 text-xs font-bold flex items-center gap-1">
                                                              <Paperclip size={12} /> View
                                                          </button>
                                                      </div>
                                                  </div>
                                              ))}
                                          </div>
                                      ) : (
                                          <div className="text-center py-6 text-slate-400 italic">No contracts on file.</div>
                                      )}
                                  </div>
                              </div>

                              {/* Right: Quick Stats */}
                              <div className="space-y-6">
                                  <div className="bg-slate-900 text-white p-6 rounded-xl shadow-lg">
                                      <h3 className="text-sm font-bold opacity-70 uppercase mb-4">Account Health</h3>
                                      <div className="flex items-center gap-4 mb-6">
                                          <div className="w-16 h-16 rounded-full border-4 border-emerald-500 flex items-center justify-center text-xl font-bold">
                                              98%
                                          </div>
                                          <div>
                                              <div className="text-lg font-bold">Excellent</div>
                                              <div className="text-xs opacity-70">SLA Compliance Rate</div>
                                          </div>
                                      </div>
                                      <div className="border-t border-white/10 pt-4 space-y-2">
                                          <div className="flex justify-between text-sm">
                                              <span className="opacity-70">Open Requests</span>
                                              <span className="font-bold">{clientPipeline.length}</span>
                                          </div>
                                          <div className="flex justify-between text-sm">
                                              <span className="opacity-70">Active Work Orders</span>
                                              <span className="font-bold">{clientWorkOrders.filter(o => o.status !== 'Completed').length}</span>
                                          </div>
                                      </div>
                                  </div>
                              </div>
                          </div>
                      )}

                      {/* COMMERCIAL (PIPELINE) TAB */}
                      {activeTab === 'commercial' && (
                          <div className="space-y-6">
                              <div className="flex justify-between items-center mb-4">
                                  <div>
                                      <h3 className="text-lg font-bold text-slate-800">Commercial Pipeline</h3>
                                      <p className="text-xs text-slate-500">Track all Requests, Surveys, and Quotations for this client.</p>
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-slate-500 bg-blue-50 px-3 py-2 rounded-lg border border-blue-100">
                                      <Info size={14} className="text-blue-600" />
                                      <span>Request → Survey (Visit) → Quote (Price) → Approved (Order)</span>
                                  </div>
                              </div>
                              
                              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                                  <table className="w-full text-left text-sm">
                                      <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                                          <tr>
                                              <th className="px-6 py-3 w-32">Status</th>
                                              <th className="px-6 py-3">Description / Title</th>
                                              <th className="px-6 py-3">Category</th>
                                              <th className="px-6 py-3">Created</th>
                                              <th className="px-6 py-3">Value</th>
                                              <th className="px-6 py-3 text-right">Action</th>
                                          </tr>
                                      </thead>
                                      <tbody className="divide-y divide-slate-100">
                                          {clientPipeline.map(item => (
                                              <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                                  <td className="px-6 py-4">
                                                      <span className={`px-2 py-1 rounded text-xs font-bold border ${getStageBadge(item.stage)}`}>
                                                          {item.stage === 'Won' ? 'Approved' : item.stage}
                                                      </span>
                                                  </td>
                                                  <td className="px-6 py-4">
                                                      <div className="font-bold text-slate-800">{item.title}</div>
                                                      <div className="text-xs text-slate-500 mt-0.5 line-clamp-1">{item.description}</div>
                                                  </td>
                                                  <td className="px-6 py-4 text-slate-600">
                                                      {item.category ? (
                                                          <span className="bg-slate-100 px-2 py-0.5 rounded text-xs font-medium border border-slate-200">{item.category}</span>
                                                      ) : "-"}
                                                  </td>
                                                  <td className="px-6 py-4 text-slate-500 font-mono text-xs">
                                                      {item.createdDate}
                                                  </td>
                                                  <td className="px-6 py-4 font-medium text-slate-800">
                                                      {item.quoteAmount ? `$${item.quoteAmount.toLocaleString()}` : "-"}
                                                  </td>
                                                  <td className="px-6 py-4 text-right">
                                                      <button 
                                                        onClick={() => openWizard(item)}
                                                        className="text-blue-600 hover:text-blue-800 font-bold text-xs"
                                                      >
                                                          Manage
                                                      </button>
                                                  </td>
                                              </tr>
                                          ))}
                                          {clientPipeline.length === 0 && (
                                              <tr>
                                                  <td colSpan={6} className="p-12 text-center text-slate-400">
                                                      <ClipboardList size={32} className="mx-auto mb-2 opacity-20" />
                                                      <p>No active requests or quotes found.</p>
                                                      <button onClick={handleAddQuickRequest} className="mt-4 text-blue-600 font-bold hover:underline">
                                                          + Log First Request
                                                      </button>
                                                  </td>
                                              </tr>
                                          )}
                                      </tbody>
                                  </table>
                              </div>
                          </div>
                      )}

                      {/* ASSETS TAB */}
                      {activeTab === 'assets' && (
                          <div>
                               <div className="flex justify-between items-center mb-6">
                                  <h3 className="text-lg font-bold text-slate-800">Installed Assets ({clientAssets.length})</h3>
                              </div>
                              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                                  <table className="w-full text-left text-sm">
                                      <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                                          <tr>
                                              <th className="px-4 py-3">Asset Name</th>
                                              <th className="px-4 py-3">Code / SN</th>
                                              <th className="px-4 py-3">Location</th>
                                              <th className="px-4 py-3">Status</th>
                                          </tr>
                                      </thead>
                                      <tbody className="divide-y divide-slate-100">
                                          {clientAssets.map(asset => (
                                              <tr key={asset.id} className="hover:bg-slate-50">
                                                  <td className="px-4 py-3 font-medium text-slate-800">{asset.name}</td>
                                                  <td className="px-4 py-3 font-mono text-slate-500 text-xs">
                                                      <div>{asset.code}</div>
                                                      <div className="text-slate-400">{asset.serialNumber}</div>
                                                  </td>
                                                  <td className="px-4 py-3 text-slate-600">{asset.location}</td>
                                                  <td className="px-4 py-3">
                                                      <StatusBadge status={asset.status} />
                                                  </td>
                                              </tr>
                                          ))}
                                          {clientAssets.length === 0 && (
                                              <tr>
                                                  <td colSpan={4} className="p-8 text-center text-slate-400 italic">No assets registered for this client.</td>
                                              </tr>
                                          )}
                                      </tbody>
                                  </table>
                              </div>
                          </div>
                      )}

                      {/* OPERATIONS (WORK ORDERS) TAB */}
                      {activeTab === 'operations' && (
                          <div className="space-y-4">
                              {clientWorkOrders.map(wo => (
                                  <div key={wo.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between hover:bg-slate-50 transition-colors">
                                      <div className="flex items-center gap-4">
                                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${wo.status === 'Completed' ? 'bg-emerald-500' : 'bg-blue-500'}`}>
                                              {wo.status === 'Completed' ? <CheckCircle2 size={20} /> : <Wrench size={20} />}
                                          </div>
                                          <div>
                                              <div className="font-bold text-slate-800 text-sm">{wo.title}</div>
                                              <div className="text-xs text-slate-500 flex items-center gap-2">
                                                  <span className="font-mono">{wo.id}</span>
                                                  <span>•</span>
                                                  <span>{wo.createdDate}</span>
                                                  <span>•</span>
                                                  <span>{wo.assetName}</span>
                                              </div>
                                          </div>
                                      </div>
                                      <div className="text-right">
                                          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${wo.status === 'Open' ? 'bg-amber-50 text-amber-700 border-amber-200' : wo.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                                              {wo.status}
                                          </span>
                                      </div>
                                  </div>
                              ))}
                              {clientWorkOrders.length === 0 && (
                                  <div className="py-12 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
                                      <Wrench size={32} className="mx-auto mb-2 opacity-20" />
                                      <p>No work history found.</p>
                                  </div>
                              )}
                          </div>
                      )}

                      {/* FINANCIALS TAB */}
                      {activeTab === 'financials' && (
                          <div className="space-y-6">
                              <div className="grid grid-cols-3 gap-6">
                                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                      <div className="text-xs text-slate-400 uppercase font-bold">Total Invoiced</div>
                                      <div className="text-2xl font-bold text-slate-900 mt-1">
                                          ${clientInvoices.reduce((acc, i) => acc + i.amount, 0).toLocaleString()}
                                      </div>
                                  </div>
                                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                      <div className="text-xs text-slate-400 uppercase font-bold">Outstanding</div>
                                      <div className="text-2xl font-bold text-blue-600 mt-1">
                                          ${clientInvoices.filter(i => i.status !== 'Paid').reduce((acc, i) => acc + i.amount, 0).toLocaleString()}
                                      </div>
                                  </div>
                              </div>
                              
                              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                                  <table className="w-full text-left text-sm">
                                      <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                                          <tr>
                                              <th className="px-4 py-3">Invoice #</th>
                                              <th className="px-4 py-3">Date</th>
                                              <th className="px-4 py-3">Status</th>
                                              <th className="px-4 py-3 text-right">Amount</th>
                                          </tr>
                                      </thead>
                                      <tbody className="divide-y divide-slate-100">
                                          {clientInvoices.map(inv => (
                                              <tr key={inv.id} className="hover:bg-slate-50">
                                                  <td className="px-4 py-3 font-mono text-slate-700 font-medium">{inv.invoiceNumber}</td>
                                                  <td className="px-4 py-3 text-slate-500">{inv.dateIssued}</td>
                                                  <td className="px-4 py-3">
                                                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${inv.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                                          {inv.status}
                                                      </span>
                                                  </td>
                                                  <td className="px-4 py-3 text-right font-bold text-slate-800">${inv.amount.toLocaleString()}</td>
                                              </tr>
                                          ))}
                                          {clientInvoices.length === 0 && (
                                              <tr>
                                                  <td colSpan={4} className="p-8 text-center text-slate-400 italic">No invoices found.</td>
                                              </tr>
                                          )}
                                      </tbody>
                                  </table>
                              </div>
                          </div>
                      )}

                      {/* HISTORY (BUNDLED SERVICE VIEW) TAB */}
                      {activeTab === 'history' && (
                          <div className="space-y-6 animate-in fade-in duration-300">
                              <div className="flex justify-between items-center mb-4">
                                  <div>
                                      <h3 className="text-lg font-bold text-slate-800">Service History Bundles</h3>
                                      <p className="text-sm text-slate-500">Full lifecycle view of every service request.</p>
                                  </div>
                                  <div className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                                      {serviceBundles.length} Cases
                                  </div>
                              </div>
                              
                              <div className="space-y-4">
                                  {serviceBundles.map(bundle => {
                                      const isExpanded = expandedBundleId === bundle.id;
                                      
                                      return (
                                          <div key={bundle.id} className={`bg-white rounded-xl border transition-all overflow-hidden ${isExpanded ? 'border-blue-300 shadow-md ring-1 ring-blue-100' : 'border-slate-200 shadow-sm hover:border-blue-200'}`}>
                                              {/* BUNDLE HEADER */}
                                              <div 
                                                  onClick={() => toggleBundle(bundle.id)}
                                                  className={`p-5 flex items-center justify-between cursor-pointer ${isExpanded ? 'bg-slate-50 border-b border-slate-100' : 'hover:bg-slate-50/50'}`}
                                              >
                                                  <div className="flex items-center gap-4">
                                                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg ${bundle.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                                                          {bundle.status === 'Completed' ? <CheckCircle2 size={24} /> : <History size={24} />}
                                                      </div>
                                                      <div>
                                                          <h4 className="font-bold text-slate-800 text-lg">{bundle.title}</h4>
                                                          <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                                                              <span className="font-mono bg-slate-100 px-1.5 rounded text-slate-600 border border-slate-200">{bundle.id}</span>
                                                              <span>•</span>
                                                              <span className="flex items-center gap-1"><Calendar size={12}/> {bundle.startDate}</span>
                                                              {bundle.category && (
                                                                  <>
                                                                    <span>•</span>
                                                                    <span className="font-medium text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">{bundle.category}</span>
                                                                  </>
                                                              )}
                                                          </div>
                                                      </div>
                                                  </div>
                                                  
                                                  <div className="flex items-center gap-6">
                                                      <div className="text-right hidden sm:block">
                                                          <div className="text-xs font-bold text-slate-400 uppercase">Case Value</div>
                                                          <div className="text-lg font-bold text-slate-800">${bundle.totalValue.toLocaleString()}</div>
                                                      </div>
                                                      <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${bundle.status === 'Completed' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-blue-100 text-blue-700 border-blue-200'}`}>
                                                          {bundle.status}
                                                      </div>
                                                      {isExpanded ? <ChevronUp className="text-slate-400" /> : <ChevronDown className="text-slate-400" />}
                                                  </div>
                                              </div>

                                              {/* BUNDLE BODY (EXPANDED - DIGITAL DOSSIER) */}
                                              {isExpanded && (
                                                  <div className="p-6 bg-white animate-in slide-in-from-top-2 duration-300">
                                                      <div className="flex flex-col gap-8 relative">
                                                          {/* Vertical Timeline Connectors */}
                                                          <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-slate-200 -z-10"></div>

                                                          {/* SECTION 1: COMMERCIAL / PIPELINE */}
                                                          {bundle.pipelineItem && (
                                                              <div className="flex gap-6">
                                                                  <div className="w-12 flex flex-col items-center gap-1 pt-1">
                                                                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center border-4 border-white shadow-sm z-10">
                                                                          <ClipboardList size={16} />
                                                                      </div>
                                                                  </div>
                                                                  <div className="flex-1 bg-slate-50 rounded-xl border border-slate-200 p-5">
                                                                      <div className="flex justify-between items-start border-b border-slate-200 pb-3 mb-3">
                                                                          <h5 className="font-bold text-slate-800 text-sm uppercase flex items-center gap-2">Request & Quotation</h5>
                                                                          <span className="text-xs font-mono text-slate-400">{bundle.pipelineItem.id}</span>
                                                                      </div>
                                                                      
                                                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                                                                          <div>
                                                                              <div className="text-xs font-bold text-slate-400 uppercase mb-1">Issue Details</div>
                                                                              <p className="text-sm text-slate-700 mb-2">{bundle.pipelineItem.description}</p>
                                                                              {(bundle.pipelineItem.rootCause || bundle.pipelineItem.proposedRemedy) && (
                                                                                  <div className="bg-amber-50 p-2 rounded border border-amber-100 text-xs text-amber-800">
                                                                                      <strong>Tech Diagnosis:</strong> {bundle.pipelineItem.rootCause} <br/>
                                                                                      <strong>Fix:</strong> {bundle.pipelineItem.proposedRemedy}
                                                                                  </div>
                                                                              )}
                                                                          </div>
                                                                          <div>
                                                                             <div className="text-xs font-bold text-slate-400 uppercase mb-1">Approved Quote</div>
                                                                             {bundle.pipelineItem.quoteLineItems && bundle.pipelineItem.quoteLineItems.length > 0 ? (
                                                                                 <ul className="text-sm text-slate-600 space-y-1">
                                                                                     {bundle.pipelineItem.quoteLineItems.map((qi, idx) => (
                                                                                         <li key={qi.id} className="flex justify-between border-b border-slate-200 border-dashed pb-1 last:border-0">
                                                                                             <span>{qi.quantity}x {qi.description}</span>
                                                                                             <span className="font-mono font-medium">${qi.total}</span>
                                                                                         </li>
                                                                                     ))}
                                                                                     <li className="flex justify-between pt-1 font-bold text-slate-800">
                                                                                         <span>Total</span>
                                                                                         <span>${bundle.pipelineItem.quoteAmount?.toLocaleString()}</span>
                                                                                     </li>
                                                                                 </ul>
                                                                             ) : (
                                                                                 <span className="text-sm text-slate-400 italic">No detailed quote generated.</span>
                                                                             )}
                                                                          </div>
                                                                      </div>
                                                                  </div>
                                                              </div>
                                                          )}

                                                          {/* SECTION 2: OPERATIONS / EXECUTION */}
                                                          {bundle.workOrder && (
                                                              <div className="flex gap-6">
                                                                  <div className="w-12 flex flex-col items-center gap-1 pt-1">
                                                                      <div className={`w-8 h-8 rounded-full flex items-center justify-center border-4 border-white shadow-sm z-10 ${bundle.workOrder.status === 'Completed' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                                                                          <Wrench size={16} />
                                                                      </div>
                                                                  </div>
                                                                  <div className="flex-1 bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                                                                      <div className="flex justify-between items-start border-b border-slate-100 pb-3 mb-3">
                                                                          <h5 className="font-bold text-slate-800 text-sm uppercase flex items-center gap-2">Field Execution</h5>
                                                                          <div className="flex gap-2">
                                                                             <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${bundle.workOrder.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-amber-50 text-amber-600 border-amber-200'}`}>{bundle.workOrder.status}</span>
                                                                             <span className="text-xs font-mono text-slate-400">{bundle.workOrder.id}</span>
                                                                          </div>
                                                                      </div>

                                                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                                          <div>
                                                                              <div className="flex items-center gap-2 mb-3">
                                                                                  <User size={14} className="text-slate-400"/>
                                                                                  <span className="text-sm font-medium text-slate-700">Technician: {bundle.technicianName || "Unassigned"}</span>
                                                                              </div>
                                                                              
                                                                              <div className="text-xs font-bold text-slate-400 uppercase mb-2">Work Log</div>
                                                                              {bundle.workOrder.tasks && bundle.workOrder.tasks.length > 0 ? (
                                                                                  <div className="space-y-1 mb-4">
                                                                                      {bundle.workOrder.tasks.map(t => (
                                                                                          <div key={t.id} className="flex items-center gap-2 text-sm text-slate-600">
                                                                                              {t.isCompleted ? <FileCheck size={14} className="text-emerald-500" /> : <div className="w-3.5 h-3.5 border border-slate-300 rounded-sm"></div>}
                                                                                              <span className={t.isCompleted ? 'line-through opacity-70' : ''}>{t.description}</span>
                                                                                          </div>
                                                                                      ))}
                                                                                  </div>
                                                                              ) : (
                                                                                  <div className="text-sm text-slate-400 italic mb-4">No tasks checklist recorded.</div>
                                                                              )}
                                                                          </div>

                                                                          <div>
                                                                              <div className="text-xs font-bold text-slate-400 uppercase mb-2">Parts Consumed</div>
                                                                              {bundle.workOrder.partsUsed && bundle.workOrder.partsUsed.length > 0 ? (
                                                                                  <table className="w-full text-sm text-slate-600">
                                                                                      <tbody>
                                                                                          {bundle.workOrder.partsUsed.map(p => (
                                                                                              <tr key={p.id} className="border-b border-slate-100 last:border-0">
                                                                                                  <td className="py-1">{p.partName}</td>
                                                                                                  <td className="py-1 text-center font-bold">x{p.quantity}</td>
                                                                                              </tr>
                                                                                          ))}
                                                                                      </tbody>
                                                                                  </table>
                                                                              ) : (
                                                                                  <div className="text-sm text-slate-400 italic">No spare parts used.</div>
                                                                              )}
                                                                          </div>
                                                                      </div>
                                                                  </div>
                                                              </div>
                                                          )}

                                                          {/* SECTION 3: FINANCIALS / INVOICE */}
                                                          {bundle.invoices.length > 0 ? (
                                                              bundle.invoices.map(inv => (
                                                                  <div key={inv.id} className="flex gap-6">
                                                                      <div className="w-12 flex flex-col items-center gap-1 pt-1">
                                                                          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-4 border-white shadow-sm z-10 ${inv.status === 'Paid' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                                                              <Receipt size={16} />
                                                                          </div>
                                                                      </div>
                                                                      <div className="flex-1 bg-slate-50 rounded-xl border border-slate-200 p-5">
                                                                          <div className="flex justify-between items-start border-b border-slate-200 pb-3 mb-3">
                                                                              <h5 className="font-bold text-slate-800 text-sm uppercase flex items-center gap-2">Final Invoice</h5>
                                                                              <div className="flex gap-2 items-center">
                                                                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${inv.status === 'Paid' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-rose-100 text-rose-700 border-rose-200'}`}>{inv.status}</span>
                                                                                  <span className="text-xs font-mono text-slate-400">{inv.invoiceNumber}</span>
                                                                              </div>
                                                                          </div>
                                                                          
                                                                          <div className="flex justify-between items-end">
                                                                              <div className="text-sm text-slate-500">
                                                                                  <div>Date: {inv.dateIssued}</div>
                                                                                  <div className="mt-1 text-xs">
                                                                                      {inv.items.length} Line Items
                                                                                  </div>
                                                                              </div>
                                                                              <div className="text-right">
                                                                                  <div className="text-xs font-bold text-slate-400 uppercase">Total Billed</div>
                                                                                  <div className="text-2xl font-bold text-slate-900">${inv.amount.toLocaleString()}</div>
                                                                              </div>
                                                                          </div>
                                                                      </div>
                                                                  </div>
                                                              ))
                                                          ) : (
                                                              <div className="flex gap-6 opacity-50">
                                                                  <div className="w-12 flex flex-col items-center gap-1">
                                                                      <div className="w-8 h-8 rounded-full bg-slate-100 border-4 border-white z-10"></div>
                                                                  </div>
                                                                  <div className="py-2 text-sm text-slate-400 italic">Pending Invoice Generation...</div>
                                                              </div>
                                                          )}
                                                      </div>
                                                  </div>
                                              )}
                                          </div>
                                      );
                                  })}
                                  
                                  {serviceBundles.length === 0 && (
                                      <div className="p-12 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
                                          <History size={32} className="mx-auto mb-2 opacity-20" />
                                          <p>No service history found for this client.</p>
                                      </div>
                                  )}
                              </div>
                          </div>
                      )}

                  </div>
              </div>

              {/* SHARED WIZARD MODAL */}
              <PipelineWizardModal 
                  isOpen={isWizardOpen}
                  onClose={() => setIsWizardOpen(false)}
                  item={wizardItem}
                  onUpdate={handleUpdatePipelineItem}
                  onCreateSO={onCreateWorkOrder}
                  assets={assets}
                  onNavigate={onNavigate}
                  inventory={inventory}
              />
          </div>
      );
  }

  // === DEFAULT VIEW (GRID LIST) ===
  return (
    <div className="p-8 h-[calc(100vh-64px)] overflow-y-auto bg-slate-50">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
             <h1 className="text-2xl font-bold text-slate-800">Client Management</h1>
             <p className="text-slate-500 mt-1">Central database of customers. Select a client to view their 360° dashboard.</p>
          </div>
          <button onClick={openCreateModal} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium">
             <Plus size={18} /> Add New Client
          </button>
       </div>

       {/* Filters */}
       <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 min-w-[200px]">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
             <input 
               type="text" 
               placeholder="Search clients..." 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="pl-9 pr-4 py-2 w-full border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
             />
          </div>
          <div className="flex items-center gap-2">
             <Filter size={16} className="text-slate-400" />
             <select 
               value={filterType}
               onChange={(e) => setFilterType(e.target.value)}
               className="p-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
             >
                <option value="all">All Types</option>
                <option value="Hospital">Hospital</option>
                <option value="Hotel">Hotel</option>
                <option value="Warehouse">Warehouse</option>
                <option value="Office Building">Office Building</option>
             </select>
          </div>
       </div>

       {/* Client Grid */}
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map(client => (
             <div 
                key={client.id} 
                onClick={() => setViewClientId(client.id)}
                className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-lg transition-all cursor-pointer group flex flex-col"
             >
                <div className="p-6 flex-1">
                   <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                         <Building2 size={24} />
                      </div>
                      <button className="text-slate-300 group-hover:text-blue-600 transition-colors">
                          <ChevronRight size={20} />
                      </button>
                   </div>
                   
                   <h3 className="text-lg font-bold text-slate-800 mb-1">{client.name}</h3>
                   <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium border border-slate-200">{client.type}</span>
                      <span className="text-xs text-slate-400 flex items-center gap-1"><MapPin size={12} /> {client.location}</span>
                   </div>
                   
                   <div className="space-y-2 mb-2">
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                         <Briefcase size={14} className="text-slate-400" />
                         <span>{client.contactPerson || "N/A"}</span>
                      </div>
                   </div>
                </div>
                <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 rounded-b-xl flex justify-between items-center text-xs text-slate-500 group-hover:bg-blue-50/50 transition-colors">
                    <span>{client.contracts.length} Active Contract(s)</span>
                    <span className="font-bold text-slate-400 group-hover:text-blue-600">View Dashboard</span>
                </div>
             </div>
          ))}
       </div>

       {/* CREATE / EDIT MODAL */}
       {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
             <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 sticky top-0">
                   <h2 className="text-lg font-bold text-slate-800">{isEditMode ? "Edit Profile" : "Create New Client"}</h2>
                   <button onClick={() => setIsModalOpen(false)}><X size={20} className="text-slate-400 hover:text-slate-600" /></button>
                </div>
                <form onSubmit={isEditMode ? handleUpdateClient : handleCreateClient} className="p-6 space-y-4">
                   {/* Form Fields Same as before */}
                   <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Client Name</label>
                      <input required type="text" className="w-full p-2 border border-slate-300 rounded-lg outline-none" 
                         value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                         <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                         <select className="w-full p-2 border border-slate-300 rounded-lg outline-none"
                            value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as any})}>
                            <option value="Hospital">Hospital</option>
                            <option value="Hotel">Hotel</option>
                            <option value="Warehouse">Warehouse</option>
                            <option value="Office Building">Office Building</option>
                         </select>
                      </div>
                      <div>
                         <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                         <input required type="text" className="w-full p-2 border border-slate-300 rounded-lg outline-none" 
                            value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
                      </div>
                   </div>

                   {/* System Types Checkboxes */}
                   <div>
                       <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                           <Layers size={14} className="text-blue-500"/> Installed Systems
                       </label>
                       <div className="grid grid-cols-2 gap-2 p-3 border border-slate-300 rounded-lg max-h-40 overflow-y-auto bg-slate-50">
                          {STATIC_CATEGORIES.map(cat => (
                             <label key={cat.id} className="flex items-center gap-2 cursor-pointer p-1">
                                <input 
                                   type="checkbox"
                                   className="w-4 h-4 text-blue-600 rounded"
                                   checked={(formData.systemTypes || []).includes(cat.name)}
                                   onChange={(e) => {
                                      const current = formData.systemTypes || [];
                                      if (e.target.checked) setFormData({...formData, systemTypes: [...current, cat.name]});
                                      else setFormData({...formData, systemTypes: current.filter(t => t !== cat.name)});
                                   }}
                                />
                                <span className="text-sm text-slate-700">{cat.name}</span>
                             </label>
                          ))}
                       </div>
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <div>
                         <label className="block text-sm font-medium text-slate-700 mb-1">Contact Person</label>
                         <input type="text" className="w-full p-2 border border-slate-300 rounded-lg outline-none" 
                            value={formData.contactPerson} onChange={e => setFormData({...formData, contactPerson: e.target.value})} />
                      </div>
                      <div>
                         <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                         <input type="text" className="w-full p-2 border border-slate-300 rounded-lg outline-none" 
                            value={formData.contactPhone} onChange={e => setFormData({...formData, contactPhone: e.target.value})} />
                      </div>
                   </div>
                   
                   <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                      <textarea className="w-full p-2 border border-slate-300 rounded-lg outline-none" rows={3}
                         value={formData.description} onChange={e => setFormData({...formData,description: e.target.value})}></textarea>
                   </div>

                   {!isEditMode && (
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Initial Contract</label>
                          <div className={`border-2 border-dashed rounded-lg p-6 text-center relative ${uploadedFile ? 'border-blue-300 bg-blue-50' : 'border-slate-300 hover:bg-slate-50'}`}>
                              <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={(e) => setUploadedFile(e.target.files?.[0]?.name || null)} />
                              <div className="flex flex-col items-center justify-center">
                                  <UploadCloud className="h-8 w-8 text-slate-400 mb-1" />
                                  <p className="text-sm text-slate-600">{uploadedFile || "Upload Contract PDF (Optional)"}</p>
                              </div>
                          </div>
                        </div>
                   )}

                   <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                      <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium">Cancel</button>
                      <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
                          {isEditMode ? "Save Changes" : "Create Client & View Dashboard"}
                      </button>
                   </div>
                </form>
             </div>
          </div>
       )}
    </div>
  );
};
