
import React, { useState } from "react";
import { 
  User, 
  Settings as SettingsIcon, 
  Bell, 
  Shield, 
  Save, 
  Upload, 
  Plus, 
  Trash2, 
  Edit,
  Mail,
  Smartphone,
  Globe,
  Building
} from "lucide-react";

interface SystemUser {
    id: string;
    name: string;
    email: string;
    role: 'Admin' | 'Manager' | 'Technician';
    status: 'Active' | 'Inactive';
}

export const Settings = () => {
  const [activeTab, setActiveTab] = useState<'general' | 'users' | 'notifications'>('general');
  
  // General Settings State
  const [generalConfig, setGeneralConfig] = useState({
      companyName: "CDS Care Facility Management",
      supportEmail: "support@cds-care.com",
      currency: "USD ($)",
      timezone: "Asia/Phnom_Penh",
      logo: ""
  });

  // User Management State (Mock CRUD)
  const [users, setUsers] = useState<SystemUser[]>([
      { id: "U1", name: "Admin User", email: "admin@cds.com", role: "Admin", status: "Active" },
      { id: "U2", name: "John Tech", email: "john@cds.com", role: "Technician", status: "Active" },
      { id: "U3", name: "Sarah Manager", email: "sarah@cds.com", role: "Manager", status: "Inactive" }
  ]);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null);
  const [userForm, setUserForm] = useState<Partial<SystemUser>>({ name: "", email: "", role: "Technician", status: "Active" });

  // Notifications State
  const [notifications, setNotifications] = useState({
      emailAlerts: true,
      smsAlerts: false,
      lowStock: true,
      woUpdates: true,
      newPr: true
  });

  // --- Handlers ---

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              setGeneralConfig(prev => ({ ...prev, logo: reader.result as string }));
          };
          reader.readAsDataURL(file);
      }
  };

  const handleSaveGeneral = () => {
      alert("System configuration saved successfully.");
  };

  // User CRUD
  const handleDeleteUser = (id: string) => {
      if (confirm("Are you sure you want to delete this user?")) {
          setUsers(prev => prev.filter(u => u.id !== id));
      }
  };

  const openUserModal = (user?: SystemUser) => {
      if (user) {
          setEditingUser(user);
          setUserForm(user);
      } else {
          setEditingUser(null);
          setUserForm({ name: "", email: "", role: "Technician", status: "Active" });
      }
      setIsUserModalOpen(true);
  };

  const saveUser = (e: React.FormEvent) => {
      e.preventDefault();
      if (editingUser) {
          setUsers(prev => prev.map(u => u.id === editingUser.id ? { ...u, ...userForm } as SystemUser : u));
      } else {
          const newUser: SystemUser = {
              ...userForm as SystemUser,
              id: `U-${Date.now()}`
          };
          setUsers(prev => [...prev, newUser]);
      }
      setIsUserModalOpen(false);
  };

  return (
    <div className="p-8 h-[calc(100vh-64px)] overflow-y-auto bg-slate-50">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">System Settings</h1>
            <p className="text-slate-500 mt-1">Configure general preferences, manage users, and system branding.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
            {/* Settings Sidebar */}
            <div className="w-full md:w-64 flex flex-col gap-2">
                <button 
                    onClick={() => setActiveTab('general')}
                    className={`text-left px-4 py-3 rounded-lg font-medium flex items-center gap-3 transition-colors ${activeTab === 'general' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:bg-white/50'}`}
                >
                    <SettingsIcon size={18} /> General & Branding
                </button>
                <button 
                    onClick={() => setActiveTab('users')}
                    className={`text-left px-4 py-3 rounded-lg font-medium flex items-center gap-3 transition-colors ${activeTab === 'users' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:bg-white/50'}`}
                >
                    <User size={18} /> User Management
                </button>
                <button 
                    onClick={() => setActiveTab('notifications')}
                    className={`text-left px-4 py-3 rounded-lg font-medium flex items-center gap-3 transition-colors ${activeTab === 'notifications' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:bg-white/50'}`}
                >
                    <Bell size={18} /> Notifications
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 p-8">
                
                {/* GENERAL TAB */}
                {activeTab === 'general' && (
                    <div className="space-y-8 animate-in fade-in duration-300">
                        <div>
                            <h2 className="text-xl font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Organization Profile</h2>
                            <div className="grid grid-cols-1 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Company / Organization Name</label>
                                    <div className="flex items-center gap-2">
                                        <Building size={18} className="text-slate-400" />
                                        <input 
                                            type="text" 
                                            className="flex-1 p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                            value={generalConfig.companyName}
                                            onChange={(e) => setGeneralConfig({...generalConfig, companyName: e.target.value})}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Support Email</label>
                                        <div className="flex items-center gap-2">
                                            <Mail size={18} className="text-slate-400" />
                                            <input 
                                                type="email" 
                                                className="flex-1 p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                                value={generalConfig.supportEmail}
                                                onChange={(e) => setGeneralConfig({...generalConfig, supportEmail: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">System Currency</label>
                                        <select 
                                            className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                            value={generalConfig.currency}
                                            onChange={(e) => setGeneralConfig({...generalConfig, currency: e.target.value})}
                                        >
                                            <option value="USD ($)">USD ($)</option>
                                            <option value="KHR (៛)">KHR (៛)</option>
                                            <option value="EUR (€)">EUR (€)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Branding</h2>
                            <div className="flex items-start gap-6">
                                <div className="w-32 h-32 bg-slate-100 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden relative group">
                                    {generalConfig.logo ? (
                                        <img src={generalConfig.logo} alt="Logo" className="w-full h-full object-contain" />
                                    ) : (
                                        <span className="text-xs text-slate-400 font-bold uppercase text-center px-2">No Logo Uploaded</span>
                                    )}
                                    <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                        <Upload className="text-white" />
                                        <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                                    </label>
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-700">System Logo</h3>
                                    <p className="text-sm text-slate-500 mb-2">Upload your company logo to appear on reports and the dashboard.</p>
                                    <label className="inline-block px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-700 cursor-pointer hover:bg-slate-50">
                                        Choose File
                                        <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4">
                            <button 
                                onClick={handleSaveGeneral}
                                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-sm"
                            >
                                <Save size={18} /> Save Changes
                            </button>
                        </div>
                    </div>
                )}

                {/* USERS TAB */}
                {activeTab === 'users' && (
                    <div className="animate-in fade-in duration-300">
                        <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                            <h2 className="text-xl font-bold text-slate-800">User Management</h2>
                            <button 
                                onClick={() => openUserModal()}
                                className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-emerald-700 transition-colors"
                            >
                                <Plus size={16} /> Add User
                            </button>
                        </div>

                        <div className="overflow-hidden border border-slate-200 rounded-lg">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                                    <tr>
                                        <th className="px-4 py-3">Name</th>
                                        <th className="px-4 py-3">Email</th>
                                        <th className="px-4 py-3">Role</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {users.map(user => (
                                        <tr key={user.id} className="hover:bg-slate-50">
                                            <td className="px-4 py-3 font-medium text-slate-800">{user.name}</td>
                                            <td className="px-4 py-3 text-slate-500">{user.email}</td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${user.role === 'Admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-0.5 rounded text-xs font-bold ${user.status === 'Active' ? 'text-emerald-700' : 'text-slate-400'}`}>
                                                    {user.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => openUserModal(user)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Edit size={16} /></button>
                                                    <button onClick={() => handleDeleteUser(user.id)} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded"><Trash2 size={16} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* NOTIFICATIONS TAB */}
                {activeTab === 'notifications' && (
                    <div className="space-y-8 animate-in fade-in duration-300">
                        <h2 className="text-xl font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Alert Preferences</h2>
                        
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Mail size={20} /></div>
                                    <div>
                                        <h3 className="font-bold text-slate-800">Email Notifications</h3>
                                        <p className="text-sm text-slate-500">Receive system alerts via email.</p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" checked={notifications.emailAlerts} onChange={() => setNotifications({...notifications, emailAlerts: !notifications.emailAlerts})} />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>

                            <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><Smartphone size={20} /></div>
                                    <div>
                                        <h3 className="font-bold text-slate-800">SMS / Mobile Alerts</h3>
                                        <p className="text-sm text-slate-500">Receive critical alerts on your mobile device.</p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" checked={notifications.smsAlerts} onChange={() => setNotifications({...notifications, smsAlerts: !notifications.smsAlerts})} />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>

                            <h3 className="font-bold text-slate-700 mt-6 mb-2">Trigger Events</h3>
                            <div className="pl-4 space-y-2">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input type="checkbox" className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" checked={notifications.lowStock} onChange={() => setNotifications({...notifications, lowStock: !notifications.lowStock})} />
                                    <span className="text-slate-700">Inventory Low Stock Warnings</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input type="checkbox" className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" checked={notifications.woUpdates} onChange={() => setNotifications({...notifications, woUpdates: !notifications.woUpdates})} />
                                    <span className="text-slate-700">Work Order Assignments & Status Changes</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input type="checkbox" className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" checked={notifications.newPr} onChange={() => setNotifications({...notifications, newPr: !notifications.newPr})} />
                                    <span className="text-slate-700">New Purchase Requests needing approval</span>
                                </label>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>

        {/* User Modal */}
        {isUserModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                        <h2 className="text-lg font-bold text-slate-800">{editingUser ? "Edit User" : "Add New User"}</h2>
                        <button onClick={() => setIsUserModalOpen(false)} className="text-slate-400 hover:text-slate-600"><Trash2 size={20} className="rotate-45" /></button>
                    </div>
                    <form onSubmit={saveUser} className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Full Name</label>
                            <input required type="text" className="w-full p-2 border border-slate-300 rounded outline-none focus:border-blue-500" 
                                value={userForm.name} onChange={e => setUserForm({...userForm, name: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Email Address</label>
                            <input required type="email" className="w-full p-2 border border-slate-300 rounded outline-none focus:border-blue-500" 
                                value={userForm.email} onChange={e => setUserForm({...userForm, email: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Role</label>
                            <select className="w-full p-2 border border-slate-300 rounded outline-none focus:border-blue-500"
                                value={userForm.role} onChange={e => setUserForm({...userForm, role: e.target.value as any})}>
                                <option value="Admin">Admin</option>
                                <option value="Manager">Manager</option>
                                <option value="Technician">Technician</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Account Status</label>
                            <select className="w-full p-2 border border-slate-300 rounded outline-none focus:border-blue-500"
                                value={userForm.status} onChange={e => setUserForm({...userForm, status: e.target.value as any})}>
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                        </div>
                        <div className="flex justify-end gap-2 pt-4">
                            <button type="button" onClick={() => setIsUserModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded font-medium">Cancel</button>
                            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700">Save User</button>
                        </div>
                    </form>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};
