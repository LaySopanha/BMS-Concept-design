
import { ElementType } from "react";

export type ViewState = "dashboard" | "assets" | "work-orders" | "inventory" | "procurement" | "reports" | "clients" | "systems" | "payment" | "settings" | "pipeline";

export type ModuleItem = {
  id: string;
  title: string;
  icon: ElementType;
  subtitle?: string;
  flowTitle: string;
  flowSteps: string[];
};

export type OperationRecord = {
  id: string;
  module: string;
  subject: string;
  status: "active" | "pending" | "completed" | "critical";
  priority: "low" | "medium" | "high";
  technician: string;
  date: string;
  details: string;
  timeline: { time: string; event: string }[];
};

export interface Contract {
  id: string;
  title: string;
  status: 'Active' | 'Expired' | 'Negotiation';
  startDate: string;
  endDate: string;
  fileName: string;
}

export interface ClientContext {
  id: string;
  name: string;
  type: string;
  location: string;
  contactPerson?: string;
  contactPhone?: string;
  description?: string;
  contracts: Contract[];
  systemTypes?: string[]; // Manually defined system scope
}

export interface SystemCategory {
  id: string;
  name: string;
  code: string;
  icon: ElementType;
  // Optional: link to parent client if not global
}

export type AssetStatus = 'Active' | 'Under Maintenance' | 'Damaged' | 'Decommissioned' | 'In Storage';

export interface MovementLog {
  id: string;
  date: string;
  from: string;
  to: string;
  user: string;
}

export interface MaintenanceLog {
  id: string;
  date: string;
  issue: string;
  cost: string;
  contractor: string;
  soNumber: string;
}

export type RequestType = 'Service' | 'SparePart' | 'Both';
export type ServiceScope = 'Service' | 'SparePart' | 'Both';
export type RequestPriority = 'Low' | 'Medium' | 'High';

export interface ServiceRequest {
  id: string;
  type: RequestType;
  description: string;
  priority: RequestPriority;
  status: 'Pending' | 'Approved' | 'In Progress' | 'Completed';
  date: string;
  requestedBy: string;
}

export interface Task {
  id: string;
  description: string;
  isCompleted: boolean;
}

export interface PartUsage {
  id: string;
  inventoryItemId?: string; // Link to inventory
  partName: string;
  quantity: number;
  cost: number;
}

export interface Technician {
  id: string;
  name: string;
  type: 'Internal' | 'Subcontractor';
  role: string;
  phone: string;
  company?: string; // If subcontractor
  avatar?: string;
}

export interface WorkOrder {
  id: string;
  title: string; // Added title
  assetId: string;
  assetName: string;
  clientName: string;
  priority: RequestPriority;
  status: 'Open' | 'In Progress' | 'Review' | 'Completed'; // Added Review
  description: string;
  createdDate: string;
  startDate?: string; // Planned Start Date
  assignedTechnicianId?: string; // Link to technician
  
  // Execution Details
  tasks: Task[];
  partsUsed: PartUsage[];
  images: string[]; // URLs or base64
  
  // Timestamps
  dueDate?: string;
  completedDate?: string;
}

export interface Asset {
  id: string;
  clientId: string;
  categoryId: string;
  code: string;
  name: string;
  location: string;
  quantity: number;
  status: AssetStatus;
  model: string;
  serialNumber: string;
  vendor: string;
  purchaseCost: number;
  warrantyExpiry: string;
  department: string;
  attributes: Record<string, string | number | boolean>;
  movementHistory: MovementLog[];
  maintenanceHistory: MaintenanceLog[];
  requests?: ServiceRequest[];
  serviceScope?: ServiceScope;
  image?: string;
  activeSO?: string; // ID of active work order if any
}

export interface StockTransaction {
  id: string;
  date: string;
  type: 'IN' | 'OUT'; // IN = Purchase/Return, OUT = Usage/Loss
  quantity: number;
  reference: string; // WO number or PO number
  user: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  categoryId: string;
  location: string;
  quantity: number;
  minStockLevel: number;
  unitCost: number;
  sellingPrice: number; // Added selling price
  supplier: string;
  description: string;
  compatibility: string[];
  transactions: StockTransaction[]; // History log
}

export type PaymentStatus = 'Paid' | 'Pending' | 'Overdue' | 'Draft';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  clientName: string;
  dateIssued: string;
  dueDate: string;
  amount: number;
  status: PaymentStatus;
  items: { description: string; amount: number }[];
  workOrderRef?: string;
}

export interface PurchaseRequest {
  id: string;
  workOrderId?: string; // Optional now
  clientId: string;     // Required
  requesterName: string;// Required
  requestDate: string;
  status: 'Pending' | 'Approved' | 'PO Issued' | 'Rejected';
  requestedItems: {
    itemName: string;
    quantity: number;
    estimatedCost?: number;
    inventoryId?: string;
  }[];
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  prId: string; // Linked PR
  vendor: string;
  dateIssued: string;
  status: 'Ordered' | 'Received' | 'Cancelled';
  totalAmount: number;
  items: {
    itemName: string;
    quantity: number;
    unitPrice: number;
    total: number;
    inventoryId?: string; // Added for stock update linkage
  }[];
}

// --- PIPELINE TYPES ---

export type PipelineStage = 'Request' | 'Survey' | 'Quotation' | 'Won' | 'Lost';

export interface QuoteLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface PipelineItem {
  id: string;
  clientId: string;
  clientName: string;
  title: string;
  description: string;
  priority: RequestPriority;
  category?: string; // e.g., HVAC, Fire
  stage: PipelineStage;
  createdDate: string;
  requestedCompletionDate?: string;
  
  // Link to Asset (New)
  assetId?: string;
  assetName?: string;

  // Request Details (New)
  contactName?: string;
  contactPhone?: string;
  locationDetail?: string; // e.g. "Room 302"

  // Survey Phase (Enhanced)
  surveyScheduledDate?: string;
  surveyorName?: string;
  rootCause?: string;
  proposedRemedy?: string;
  partsNeeded?: string;
  
  // Quote Phase (Enhanced)
  quoteAmount?: number;
  validityDate?: string;
  paymentTerms?: string; // e.g. "50% Deposit"
  quoteLineItems?: QuoteLineItem[];
  
  // Conversion
  convertedSOId?: string;
}
