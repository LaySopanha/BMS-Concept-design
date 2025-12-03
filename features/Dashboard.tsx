

import React, { useMemo } from "react";
import { CORE_MODULES, REPORTING_MODULES, MOCK_TECHNICIANS, MOCK_PURCHASE_REQUESTS, MOCK_WORK_ORDERS } from "../data";
import { ModuleSection } from "../components/ModuleSection";
import { Asset, WorkOrder } from "../types";
import { QrCode, ClipboardList, AlertTriangle, CheckCircle2, Send, History, User } from "lucide-react";

export const Dashboard = ({ 
  assets, 
  workOrders 
}: { 
  assets: Asset[]; 
  workOrders: WorkOrder[]; 
}) => {
  
  // Calculate Stats
  const activeServiceOrders = useMemo(() => {
    // Combine mock + real
    const allOrders = [...workOrders, ...MOCK_WORK_ORDERS];
    const uniqueOrders = Array.from(new Map(allOrders.map(item => [item.id, item])).values());
    return uniqueOrders.filter(o => o.status === 'Open' || o.status === 'In Progress').length;
  }, [workOrders]);

  const recentActivity = useMemo(() => {
     // Combine & Sort by newest
     const allOrders = [...workOrders, ...MOCK_WORK_ORDERS];
     const uniqueOrders = Array.from(new Map(allOrders.map(item => [item.id, item])).values());
     
     // Mock sorting logic: newly created workOrders from app state usually have newer timestamps or higher IDs
     // For demo, we just take the first 3 (which will include newly created ones if unshift was used)
     // Actually, let's reverse to show newest first if the array order is chronological
     return uniqueOrders.slice(0, 3);
  }, [workOrders]);

  const totalAssets = assets.length;
  const pendingApprovals = MOCK_PURCHASE_REQUESTS.filter(pr => pr.status === 'Pending').length;
  const activeContractors = MOCK_TECHNICIANS.length;

  return (
    <div className="flex-1 overflow-auto bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex flex-col md:flex-row justify-between md:items-end gap-4">
           <div>
             <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Welcome back, hounestar9!</h1>
           </div>
           <div className="flex items-center gap-2 text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
              <span className="relative flex h-2 w-2">
                <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-400"></span>
              </span>
              IoT Gateways: Offline (Phase 2 Planned)
           </div>
        </header>

        {/* Phase 1: Operational Workflow Visualization */}
        <div className="mb-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Widget 1: Recent QR Scans (The Core Mechanic Phase 1) */}
            <div className="lg:col-span-2 bg-white p-0 rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                            <QrCode size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800">Field Activity Feed</h3>
                            <p className="text-xs text-slate-500">Real-time "Scan-to-Solve" logs from technician mobile apps.</p>
                        </div>
                    </div>
                    <span className="text-xs font-bold uppercase text-slate-400">Today</span>
                </div>
                <div className="divide-y divide-slate-100">
                    {recentActivity.map((order, idx) => (
                         <div key={order.id} className="p-4 flex gap-4 hover:bg-slate-50 transition-colors animate-in fade-in slide-in-from-left-2">
                            <div className="flex flex-col items-center gap-1">
                                <span className="text-xs font-bold text-slate-400">
                                    {idx === 0 ? 'Just Now' : idx === 1 ? '10 mins ago' : '1 hr ago'}
                                </span>
                                <div className="h-full w-px bg-slate-200"></div>
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-bold text-slate-800 text-sm">
                                        {MOCK_TECHNICIANS.find(t => t.id === order.assignedTechnicianId)?.name || "Unassigned"}
                                    </span>
                                    <span className={`text-xs px-2 py-0.5 rounded font-bold ${order.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                        {order.status === 'Completed' ? 'Job Done' : 'Issue Report'}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-600">
                                    Logged ticket <span className="font-mono text-xs font-bold bg-slate-100 px-1 rounded">#{order.id}</span> for {order.assetName}.
                                </p>
                                <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                                    {order.status === 'Completed' ? (
                                         <><CheckCircle2 size={12} className="text-emerald-500" /> Resolved</>
                                    ) : (
                                         <><AlertTriangle size={12} className="text-amber-500" /> Needs Action</>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Fallback Static Entry if list is short */}
                    {recentActivity.length < 3 && (
                        <div className="p-4 flex gap-4 hover:bg-slate-50 transition-colors opacity-60">
                            <div className="flex flex-col items-center gap-1">
                                <span className="text-xs font-bold text-slate-400">08:30 AM</span>
                                <div className="h-full w-px bg-slate-200"></div>
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-bold text-slate-800 text-sm">SafeGuard Team</span>
                                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-bold">Maintenance</span>
                                </div>
                                <p className="text-sm text-slate-600">Scanned <span className="font-mono text-xs font-bold bg-slate-100 px-1 rounded">FIRE-PNL-Main</span>. Started monthly battery test.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Widget 2: Manual Readings & Telegram (Addressing the "No IoT" constraint) */}
            <div className="flex flex-col gap-6">
                
                {/* Manual Readings Card */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
                            <ClipboardList size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800">Manual Log</h3>
                            <p className="text-xs text-slate-500">Bridging the IoT Gap</p>
                        </div>
                    </div>
                    
                    <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                            <div>
                                <div className="text-xs font-bold text-slate-500 uppercase">Chiller Temp</div>
                                <div className="font-mono font-bold text-slate-800">6.5°C</div>
                            </div>
                            <div className="text-right">
                                <div className="text-[10px] text-slate-400">Updated by Tech</div>
                                <div className="text-xs font-bold text-slate-600">2 hrs ago</div>
                            </div>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                            <div>
                                <div className="text-xs font-bold text-slate-500 uppercase">Water Meter</div>
                                <div className="font-mono font-bold text-slate-800">4,502 m³</div>
                            </div>
                            <div className="text-right">
                                <div className="text-[10px] text-slate-400">Updated by Tech</div>
                                <div className="text-xs font-bold text-slate-600">Yesterday</div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-3 text-center">
                        <button className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline">View All Readings</button>
                    </div>
                </div>

                {/* Telegram Integration Card (Slide 8) */}
                <div className="bg-[#2AABEE] bg-opacity-10 p-5 rounded-xl border border-[#2AABEE] border-opacity-20">
                    <div className="flex items-center gap-2 mb-3">
                        <Send size={18} className="text-[#2AABEE]" />
                        <h3 className="font-bold text-slate-800 text-sm">Telegram Alerts (Live)</h3>
                    </div>
                    <div className="space-y-2">
                        <div className="bg-white p-2 rounded shadow-sm text-xs">
                            <span className="font-bold text-rose-600">[CRITICAL]</span> Fire Panel Battery Low at Vattanac Capital.
                            <div className="text-[10px] text-slate-400 mt-1">Sent to: Operations Group</div>
                        </div>
                        <div className="bg-white p-2 rounded shadow-sm text-xs">
                            <span className="font-bold text-emerald-600">[INFO]</span> SO-1092 Completed by Mike Ross.
                            <div className="text-[10px] text-slate-400 mt-1">Sent to: Supervisors</div>
                        </div>
                    </div>
                </div>

            </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
           <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-sm font-medium text-slate-600 mb-2">Active Service Orders</div>
              <div className="text-4xl font-extrabold text-slate-900 mb-1">{activeServiceOrders}</div>
              <div className="text-sm text-slate-400">Open and in progress</div>
           </div>
           <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-sm font-medium text-slate-600 mb-2">Total Assets</div>
              <div className="text-4xl font-extrabold text-slate-900 mb-1">{totalAssets}</div>
              <div className="text-sm text-slate-400">Facility equipment</div>
           </div>
           <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-sm font-medium text-slate-600 mb-2">Pending Approvals</div>
              <div className="text-4xl font-extrabold text-slate-900 mb-1">{pendingApprovals}</div>
              <div className="text-sm text-slate-400">Purchase Requests</div>
           </div>
           <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-sm font-medium text-slate-600 mb-2">Active Contractors</div>
              <div className="text-4xl font-extrabold text-slate-900 mb-1">{activeContractors}</div>
              <div className="text-sm text-slate-400">Technicians & Vendors</div>
           </div>
        </div>

        <h2 className="text-xl font-bold text-slate-800 mb-6">Core Modules</h2>
        <ModuleSection 
          title="" 
          modules={CORE_MODULES} 
          colorTheme="blue" 
          icon={undefined}
        />

        <div className="mt-8"></div>

        <h2 className="text-xl font-bold text-slate-800 mb-6">Reports</h2>
        <ModuleSection 
          title="" 
          modules={REPORTING_MODULES} 
          colorTheme="emerald" 
          icon={undefined}
        />

      </div>
    </div>
  );
};
