
import React, { useState, useMemo } from "react";
import { Asset, WorkOrder, InventoryItem } from "../types";
import { MOCK_WORK_ORDERS, MOCK_INVOICES, MOCK_PURCHASE_REQUESTS, MOCK_TECHNICIANS } from "../data";
import { 
  FileText, 
  Download, 
  Calendar, 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Wrench, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  Printer, 
  ChevronRight, 
  Filter
} from "lucide-react";

export const Reports = ({ 
    assets, 
    workOrders: liveWorkOrders, 
    inventory 
}: { 
    assets: Asset[], 
    workOrders: WorkOrder[], 
    inventory: InventoryItem[] 
}) => {
    // UI State
    const [activeTab, setActiveTab] = useState<'executive' | 'financial' | 'operational'>('executive');
    const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
    const [dateRange, setDateRange] = useState("This Month");

    // --- DATA AGGREGATION ---
    
    // Merge live orders with mock orders for robust demo data
    const allWorkOrders = useMemo(() => {
        const combined = [...liveWorkOrders, ...MOCK_WORK_ORDERS];
        return Array.from(new Map(combined.map(item => [item.id, item])).values());
    }, [liveWorkOrders]);

    // Calculate Stats
    const kpi = useMemo(() => {
        const totalAssets = assets.length;
        const activeSOs = allWorkOrders.filter(o => o.status === 'Open' || o.status === 'In Progress').length;
        const completedSOs = allWorkOrders.filter(o => o.status === 'Completed').length;
        
        // Financials (Mock aggregation from invoices)
        const totalRevenue = MOCK_INVOICES.filter(i => i.status === 'Paid').reduce((acc, i) => acc + i.amount, 0);
        const pendingRevenue = MOCK_INVOICES.filter(i => i.status !== 'Paid').reduce((acc, i) => acc + i.amount, 0);
        
        // Inventory
        const lowStockCount = inventory.filter(i => i.quantity <= i.minStockLevel).length;
        const totalStockValue = inventory.reduce((acc, i) => acc + (i.quantity * i.unitCost), 0);

        return { totalAssets, activeSOs, completedSOs, totalRevenue, pendingRevenue, lowStockCount, totalStockValue };
    }, [assets, allWorkOrders, inventory]);

    // Mock Trend Data for Charts
    const financialTrend = [
        { month: 'Aug', revenue: 12000, cost: 4500 },
        { month: 'Sep', revenue: 14500, cost: 5200 },
        { month: 'Oct', revenue: 13200, cost: 4800 },
        { month: 'Nov', revenue: 18500, cost: 6100 },
        { month: 'Dec', revenue: 22000, cost: 8500 },
        { month: 'Jan', revenue: 19500, cost: 5500 }, // Current
    ];
    const maxFinVal = 25000;

    const operationalTrend = [
        { day: 'Mon', open: 5, closed: 4 },
        { day: 'Tue', open: 8, closed: 6 },
        { day: 'Wed', open: 12, closed: 10 },
        { day: 'Thu', open: 7, closed: 5 },
        { day: 'Fri', open: 9, closed: 8 },
        { day: 'Sat', open: 4, closed: 2 },
        { day: 'Sun', open: 2, closed: 1 },
    ];
    const maxOpVal = 15;

    // Technician Performance Mock
    const techPerformance = MOCK_TECHNICIANS.map(tech => {
        const jobs = allWorkOrders.filter(wo => wo.assignedTechnicianId === tech.id);
        const completed = jobs.filter(wo => wo.status === 'Completed').length;
        return {
            ...tech,
            totalJobs: jobs.length,
            completedJobs: completed,
            rating: (4 + Math.random()).toFixed(1) // Random rating 4.0-5.0
        };
    }).sort((a, b) => b.completedJobs - a.completedJobs);

  return (
    <div className="p-8 h-[calc(100vh-64px)] overflow-y-auto bg-slate-50">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
            <div>
                <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Analytics & Reporting</h1>
                <p className="text-slate-500 mt-1">Operational insights and financial performance metrics.</p>
            </div>
            <div className="flex items-center gap-3">
                <div className="flex bg-white rounded-lg border border-slate-200 p-1 shadow-sm">
                    <button 
                        className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${dateRange === 'This Month' ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                        onClick={() => setDateRange('This Month')}
                    >
                        This Month
                    </button>
                    <button 
                        className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${dateRange === 'Last Quarter' ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                        onClick={() => setDateRange('Last Quarter')}
                    >
                        Last Quarter
                    </button>
                    <button 
                        className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${dateRange === 'Year to Date' ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                        onClick={() => setDateRange('Year to Date')}
                    >
                        YTD
                    </button>
                </div>
                <button 
                    onClick={() => setIsGeneratorOpen(true)}
                    className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200"
                >
                    <FileText size={18} /> Generate Report
                </button>
            </div>
        </div>

        {/* TABS */}
        <div className="flex items-center gap-6 border-b border-slate-200 mb-8 overflow-x-auto">
            <button 
                onClick={() => setActiveTab('executive')}
                className={`pb-4 px-2 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${activeTab === 'executive' ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
                <PieChart size={18} /> Executive Overview
            </button>
            <button 
                onClick={() => setActiveTab('financial')}
                className={`pb-4 px-2 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${activeTab === 'financial' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
                <DollarSign size={18} /> Financial Health
            </button>
            <button 
                onClick={() => setActiveTab('operational')}
                className={`pb-4 px-2 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${activeTab === 'operational' ? 'border-amber-600 text-amber-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
                <Wrench size={18} /> Operations & Team
            </button>
        </div>

        {/* CONTENT AREA */}
        
        {/* --- 1. EXECUTIVE TAB --- */}
        {activeTab === 'executive' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                {/* Top KPIs */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><TrendingUp size={24} /></div>
                            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">+12% vs last mo</span>
                        </div>
                        <div className="text-3xl font-bold text-slate-900 mb-1">{kpi.completedSOs}</div>
                        <div className="text-sm text-slate-500 font-medium">Jobs Completed</div>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg"><DollarSign size={24} /></div>
                            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">+5% vs last mo</span>
                        </div>
                        <div className="text-3xl font-bold text-slate-900 mb-1">${kpi.totalRevenue.toLocaleString()}</div>
                        <div className="text-sm text-slate-500 font-medium">Revenue Collected</div>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-amber-50 text-amber-600 rounded-lg"><AlertTriangle size={24} /></div>
                            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded">{kpi.lowStockCount} Items Low</span>
                        </div>
                        <div className="text-3xl font-bold text-slate-900 mb-1">${kpi.totalStockValue.toLocaleString()}</div>
                        <div className="text-sm text-slate-500 font-medium">Inventory Value</div>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-purple-50 text-purple-600 rounded-lg"><Users size={24} /></div>
                            <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded">Active</span>
                        </div>
                        <div className="text-3xl font-bold text-slate-900 mb-1">{kpi.activeSOs}</div>
                        <div className="text-sm text-slate-500 font-medium">Jobs In Progress</div>
                    </div>
                </div>

                {/* Big Chart: Financial Trend */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-lg font-bold text-slate-800">Financial Performance</h3>
                            <p className="text-sm text-slate-500">Revenue vs Operational Costs (Last 6 Months)</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                <div className="w-3 h-3 bg-emerald-500 rounded-sm"></div> Revenue
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                <div className="w-3 h-3 bg-rose-400 rounded-sm"></div> Costs
                            </div>
                        </div>
                    </div>
                    
                    <div className="h-64 flex items-end justify-between gap-4 relative pl-10 pb-6">
                        {/* Grid Lines */}
                        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-6 pl-10">
                            {[1, 0.75, 0.5, 0.25, 0].map(t => (
                                <div key={t} className="w-full h-px border-t border-dashed border-slate-200 relative">
                                    <span className="absolute -left-10 -top-2 text-xs text-slate-400">${(maxFinVal * t)/1000}k</span>
                                </div>
                            ))}
                        </div>

                        {financialTrend.map((d, i) => (
                            <div key={i} className="flex-1 flex items-end justify-center gap-2 h-full z-10 group relative">
                                {/* Revenue Bar */}
                                <div 
                                    className="w-8 bg-emerald-500 rounded-t hover:bg-emerald-400 transition-all cursor-pointer relative"
                                    style={{ height: `${(d.revenue / maxFinVal) * 100}%` }}
                                >
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                                        Rev: ${d.revenue.toLocaleString()}
                                    </div>
                                </div>
                                {/* Cost Bar */}
                                <div 
                                    className="w-8 bg-rose-400 rounded-t hover:bg-rose-300 transition-all cursor-pointer relative"
                                    style={{ height: `${(d.cost / maxFinVal) * 100}%` }}
                                >
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                                        Cost: ${d.cost.toLocaleString()}
                                    </div>
                                </div>
                                <span className="absolute -bottom-6 text-xs font-bold text-slate-500">{d.month}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}

        {/* --- 2. FINANCIAL TAB --- */}
        {activeTab === 'financial' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-800 mb-6">Revenue Breakdown</h3>
                        <div className="flex items-center justify-center">
                            <div className="relative w-64 h-64">
                                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                                    {/* Mock Pie Segments */}
                                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f1f5f9" strokeWidth="20" />
                                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="#3b82f6" strokeWidth="20" strokeDasharray="150 251" /> {/* Services */}
                                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="#10b981" strokeWidth="20" strokeDasharray="70 251" strokeDashoffset="-150" /> {/* Parts */}
                                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f59e0b" strokeWidth="20" strokeDasharray="30 251" strokeDashoffset="-220" /> {/* Contracts */}
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-3xl font-bold text-slate-800">${kpi.totalRevenue.toLocaleString()}</span>
                                    <span className="text-xs text-slate-500 uppercase">Total Revenue</span>
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 space-y-3">
                            <div className="flex justify-between items-center text-sm">
                                <span className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-500 rounded-full"></div> Service Labor</span>
                                <span className="font-bold text-slate-700">60%</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="flex items-center gap-2"><div className="w-3 h-3 bg-emerald-500 rounded-full"></div> Spare Parts</span>
                                <span className="font-bold text-slate-700">28%</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="flex items-center gap-2"><div className="w-3 h-3 bg-amber-500 rounded-full"></div> Annual Contracts</span>
                                <span className="font-bold text-slate-700">12%</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
                        <h3 className="text-lg font-bold text-slate-800 mb-4">Outstanding Invoices</h3>
                        <div className="flex-1 overflow-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                                    <tr>
                                        <th className="px-4 py-2">Invoice #</th>
                                        <th className="px-4 py-2">Client</th>
                                        <th className="px-4 py-2 text-right">Amount</th>
                                        <th className="px-4 py-2">Due</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {MOCK_INVOICES.filter(i => i.status !== 'Paid').map(inv => (
                                        <tr key={inv.id} className="hover:bg-slate-50">
                                            <td className="px-4 py-3 font-mono text-blue-600">{inv.invoiceNumber}</td>
                                            <td className="px-4 py-3">{inv.clientName}</td>
                                            <td className="px-4 py-3 text-right font-bold text-slate-800">${inv.amount.toLocaleString()}</td>
                                            <td className={`px-4 py-3 font-bold ${inv.status === 'Overdue' ? 'text-rose-600' : 'text-slate-500'}`}>
                                                {inv.dueDate}
                                            </td>
                                        </tr>
                                    ))}
                                    {MOCK_INVOICES.filter(i => i.status !== 'Paid').length === 0 && (
                                        <tr><td colSpan={4} className="p-4 text-center text-slate-400">No outstanding invoices.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-lg flex justify-between items-center">
                            <span className="text-sm font-bold text-blue-800">Total Pending Collection</span>
                            <span className="text-xl font-bold text-blue-700">${kpi.pendingRevenue.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* --- 3. OPERATIONAL TAB --- */}
        {activeTab === 'operational' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-6">Work Order Volume (Weekly)</h3>
                    <div className="h-64 flex items-end justify-between gap-4 px-4 pb-6 border-b border-slate-200 relative">
                         {operationalTrend.map((d, i) => (
                             <div key={i} className="flex-1 flex flex-col justify-end gap-1 h-full z-10 group">
                                <div className="flex gap-1 h-full items-end justify-center">
                                    <div className="w-6 bg-slate-300 rounded-t hover:bg-slate-400 transition-all" style={{ height: `${(d.open / maxOpVal) * 100}%` }} title={`Opened: ${d.open}`}></div>
                                    <div className="w-6 bg-emerald-500 rounded-t hover:bg-emerald-600 transition-all" style={{ height: `${(d.closed / maxOpVal) * 100}%` }} title={`Closed: ${d.closed}`}></div>
                                </div>
                                <span className="text-center text-xs font-bold text-slate-500 mt-2">{d.day}</span>
                             </div>
                         ))}
                    </div>
                    <div className="flex justify-center gap-6 mt-4">
                        <div className="flex items-center gap-2 text-sm"><div className="w-3 h-3 bg-slate-300 rounded-sm"></div> Tickets Opened</div>
                        <div className="flex items-center gap-2 text-sm"><div className="w-3 h-3 bg-emerald-500 rounded-sm"></div> Tickets Closed</div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Technician Leaderboard</h3>
                    <div className="overflow-hidden border border-slate-100 rounded-lg">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4">Technician / Vendor</th>
                                    <th className="px-6 py-4">Role</th>
                                    <th className="px-6 py-4 text-center">Jobs Completed</th>
                                    <th className="px-6 py-4 text-center">Efficiency Rating</th>
                                    <th className="px-6 py-4 text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {techPerformance.map((tech) => (
                                    <tr key={tech.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-slate-800">{tech.name}</td>
                                        <td className="px-6 py-4 text-slate-500">
                                            <span className={`px-2 py-0.5 rounded text-xs border ${tech.type === 'Internal' ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-amber-50 text-amber-600 border-amber-200'}`}>
                                                {tech.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="font-bold text-slate-900">{tech.completedJobs}</span>
                                            <span className="text-slate-400 text-xs ml-1">/ {tech.totalJobs}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-1 font-bold text-emerald-600">
                                                {tech.rating} <span className="text-slate-300">★</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="text-xs font-bold text-emerald-600 flex items-center justify-end gap-1">
                                                <CheckCircle2 size={12} /> Active
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        )}

      </div>

      {/* REPORT GENERATOR MODAL */}
      {isGeneratorOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                  <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                      <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                          <Printer size={20} className="text-slate-500"/> Report Generator
                      </h2>
                      <button onClick={() => setIsGeneratorOpen(false)}><X size={20} className="text-slate-400 hover:text-slate-600" /></button>
                  </div>
                  
                  <div className="p-8 grid grid-cols-2 gap-8">
                      <div className="space-y-6">
                          <div>
                              <label className="block text-sm font-bold text-slate-700 mb-2">Report Type</label>
                              <div className="space-y-2">
                                  <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
                                      <input type="radio" name="reportType" className="text-blue-600" defaultChecked />
                                      <div>
                                          <div className="text-sm font-bold text-slate-800">Monthly Executive Summary</div>
                                          <div className="text-xs text-slate-500">High-level KPIs, financials & operational highlights.</div>
                                      </div>
                                  </label>
                                  <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
                                      <input type="radio" name="reportType" className="text-blue-600" />
                                      <div>
                                          <div className="text-sm font-bold text-slate-800">Detailed Maintenance Log</div>
                                          <div className="text-xs text-slate-500">Full history of all Work Orders and assets touched.</div>
                                      </div>
                                  </label>
                                  <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
                                      <input type="radio" name="reportType" className="text-blue-600" />
                                      <div>
                                          <div className="text-sm font-bold text-slate-800">Financial Statement</div>
                                          <div className="text-xs text-slate-500">Revenue, costs, P&L breakdown by Client.</div>
                                      </div>
                                  </label>
                              </div>
                          </div>

                          <div>
                              <label className="block text-sm font-bold text-slate-700 mb-2">Date Range</label>
                              <select className="w-full p-2 border border-slate-300 rounded-lg outline-none bg-white">
                                  <option>Current Month (Jan 2024)</option>
                                  <option>Last Month (Dec 2023)</option>
                                  <option>Last Quarter (Q4 2023)</option>
                                  <option>Custom Range...</option>
                              </select>
                          </div>
                      </div>

                      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 flex flex-col justify-between">
                          <div>
                              <h4 className="text-xs font-bold text-slate-400 uppercase mb-4">Export Preview</h4>
                              <div className="w-full aspect-[3/4] bg-white shadow-sm border border-slate-200 rounded p-4 mb-4 flex flex-col gap-2">
                                  <div className="h-4 w-1/2 bg-slate-200 rounded mb-2"></div>
                                  <div className="h-2 w-full bg-slate-100 rounded"></div>
                                  <div className="h-2 w-full bg-slate-100 rounded"></div>
                                  <div className="h-2 w-3/4 bg-slate-100 rounded"></div>
                                  <div className="mt-4 h-24 w-full bg-blue-50 rounded border border-blue-100"></div>
                                  <div className="mt-2 flex gap-2">
                                      <div className="h-16 w-1/2 bg-slate-100 rounded"></div>
                                      <div className="h-16 w-1/2 bg-slate-100 rounded"></div>
                                  </div>
                              </div>
                          </div>
                          
                          <div className="space-y-3">
                              <button className="w-full py-3 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 shadow-lg">
                                  <Download size={18} /> Download PDF
                              </button>
                              <button className="w-full py-3 bg-white border border-slate-300 text-slate-700 font-bold rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
                                  <FileText size={18} /> Export as CSV
                              </button>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
    