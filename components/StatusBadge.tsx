import React from "react";
import { AssetStatus } from "../types";

export const StatusBadge = ({ status }: { status: AssetStatus }) => {
  const getStyle = () => {
    switch(status) {
      case 'Active': return 'bg-emerald-100 text-emerald-700';
      case 'Under Maintenance': return 'bg-amber-100 text-amber-700';
      case 'Damaged': return 'bg-rose-100 text-rose-700';
      case 'Decommissioned': return 'bg-slate-100 text-slate-600 decoration-slate-400 line-through';
      case 'In Storage': return 'bg-blue-100 text-blue-700';
      default: return 'bg-slate-100 text-slate-600';
    }
  };
  return (
    <span className={`px-2.5 py-1 rounded text-xs font-bold ${getStyle()}`}>
      {status}
    </span>
  );
};
