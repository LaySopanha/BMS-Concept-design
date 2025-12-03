
import {
  Fan,
  Cpu,
  Bell,
  Activity,
  Database,
  Filter,
  Box,
  ClipboardList,
  Wrench,
  CalendarClock,
  ShoppingCart,
  Users,
  Eye,
  LayoutDashboard,
  FileCheck,
  Video,
  ArrowUpFromLine
} from "lucide-react";
import { 
  ClientContext, 
  SystemCategory, 
  InventoryItem, 
  Asset, 
  ModuleItem, 
  OperationRecord,
  Technician,
  WorkOrder,
  PurchaseRequest,
  PipelineItem,
  Invoice
} from "./types";

// ... [Keep existing Clients, Categories, Inventory, Assets, Modules, Operations] ...

export const MOCK_CLIENTS: ClientContext[] = [
  { 
    id: "CL-001", 
    name: "Royal Phnom Penh Hospital", 
    type: "Hospital", 
    location: "Monivong Blvd, Phnom Penh", 
    contactPerson: "Dr. Sary", 
    contactPhone: "012-999-888", 
    description: "Premium international hospital requiring 24/7 medical gas and HVAC monitoring.",
    contracts: [
      { id: "CTR-001", title: "Comprehensive Maintenance 2024", status: "Active", startDate: "2024-01-01", endDate: "2024-12-31", fileName: "RPH_SLA_2024_Signed.pdf" }
    ]
  },
  { 
    id: "CL-002", 
    name: "Sokha Hotel", 
    type: "Hotel", 
    location: "Chroy Changvar", 
    contactPerson: "Mr. Vibol", 
    contactPhone: "011-222-333", 
    description: "Luxury hotel resort. Focus on HVAC and Pool systems.",
    contracts: [
       { id: "CTR-002", title: "HVAC & Pool Systems", status: "Negotiation", startDate: "2025-01-01", endDate: "2025-12-31", fileName: "Draft_Renewal_Sokha.docx" }
    ]
  },
  { 
    id: "CL-003", 
    name: "Vattanac Capital", 
    type: "Office Building", 
    location: "Monivong Blvd", 
    contactPerson: "Ms. Leakhena", 
    contactPhone: "017-555-444", 
    description: "Grade A office tower. Critical ELV and Lift systems.",
    contracts: [
      { id: "CTR-003", title: "ELV & Lift Annual AMC", status: "Active", startDate: "2023-06-01", endDate: "2025-06-01", fileName: "Vattanac_AMC_Signed.pdf" }
    ]
  }
];

export const MOCK_CATEGORIES: SystemCategory[] = [
  { id: "CAT-HVAC", name: "HVAC Systems", code: "HVAC", icon: Fan },
  { id: "CAT-ELV", name: "ELV & Access Control", code: "ELV", icon: Cpu },
  { id: "CAT-CCTV", name: "CCTV & Security", code: "CCTV", icon: Video },
  { id: "CAT-LIFT", name: "Elevator Systems", code: "LIFT", icon: ArrowUpFromLine },
  { id: "CAT-FIRE", name: "Fire Safety", code: "FIRE", icon: Bell },
  { id: "CAT-MED", name: "Medical Equipment", code: "MED", icon: Activity },
  { id: "CAT-PLUMB", name: "Plumbing & Pumps", code: "PLB", icon: Filter },
];

// --- UPDATED MOCK INVENTORY WITH REAL DATA ---
export const MOCK_INVENTORY: InventoryItem[] = [
  // HVAC PARTS
  {
    id: "INV-HVAC-001",
    name: "Scroll Compressor 10HP",
    sku: "CMP-SCR-10HP",
    categoryId: "CAT-HVAC",
    location: "Warehouse A - Rack 3",
    quantity: 2,
    minStockLevel: 2,
    unitCost: 850.00,
    sellingPrice: 1200.00,
    supplier: "Trane Parts",
    description: "R410A Scroll Compressor for rooftop units.",
    compatibility: ["Trane Voyager", "Carrier Weathermaster"],
    transactions: [
        { id: "TX-01", date: "2023-12-01", type: "IN", quantity: 4, reference: "PO-2201", user: "Admin" },
        { id: "TX-02", date: "2024-01-15", type: "OUT", quantity: 2, reference: "SO-005", user: "John Smith" }
    ]
  },
  {
    id: "INV-HVAC-002",
    name: "Condenser Fan Motor 1HP",
    sku: "MTR-CND-1HP",
    categoryId: "CAT-HVAC",
    location: "Warehouse A - Rack 4",
    quantity: 8,
    minStockLevel: 5,
    unitCost: 120.00,
    sellingPrice: 185.00,
    supplier: "Grainger",
    description: "Universal replacement condenser fan motor, 1075 RPM.",
    compatibility: ["Universal"],
    transactions: []
  },
  {
    id: "INV-HVAC-003",
    name: "Pleated Filter 20x20x2 (MERV 8)",
    sku: "FIL-20202",
    categoryId: "CAT-HVAC",
    location: "Warehouse A - Bin 12",
    quantity: 150,
    minStockLevel: 50,
    unitCost: 4.50,
    sellingPrice: 8.50,
    supplier: "Camfil",
    description: "Standard pleated air filter for AHUs.",
    compatibility: ["AHU Generic"],
    transactions: []
  },
  {
    id: "INV-HVAC-004",
    name: "Digital Thermostat (Pro 5000)",
    sku: "STAT-PRO-5000",
    categoryId: "CAT-HVAC",
    location: "Warehouse A - Shelf 2",
    quantity: 12,
    minStockLevel: 10,
    unitCost: 45.00,
    sellingPrice: 85.00,
    supplier: "Honeywell",
    description: "Non-programmable digital thermostat.",
    compatibility: ["Split Systems"],
    transactions: []
  },

  // ELV PARTS
  {
    id: "INV-ELV-001",
    name: "HID Card Reader (ProxPoint)",
    sku: "ACS-HID-PP",
    categoryId: "CAT-ELV",
    location: "Secure Store B",
    quantity: 5,
    minStockLevel: 5,
    unitCost: 110.00,
    sellingPrice: 165.00,
    supplier: "HID Global",
    description: "125kHz Proximity Card Reader.",
    compatibility: ["Lenel", "Gallagher"],
    transactions: []
  },
  {
    id: "INV-ELV-002",
    name: "Maglock 600lbs",
    sku: "ACS-MAG-600",
    categoryId: "CAT-ELV",
    location: "Secure Store B",
    quantity: 10,
    minStockLevel: 5,
    unitCost: 45.00,
    sellingPrice: 75.00,
    supplier: "SecurGroup",
    description: "Electromagnetic lock for single door.",
    compatibility: ["Generic Access Control"],
    transactions: []
  },
  {
    id: "INV-ELV-003",
    name: "Cat6 Cable Roll (305m)",
    sku: "CAB-CAT6-BLUE",
    categoryId: "CAT-ELV",
    location: "Warehouse B - Floor",
    quantity: 3,
    minStockLevel: 5,
    unitCost: 115.00,
    sellingPrice: 160.00,
    supplier: "CommScope",
    description: "UTP Cat6 Network Cable, Blue.",
    compatibility: ["Network", "CCTV"],
    transactions: []
  },

  // CCTV PARTS
  {
    id: "INV-CCTV-001",
    name: "4MP Dome Camera IP",
    sku: "CAM-IP-4MP",
    categoryId: "CAT-CCTV",
    location: "Secure Store B",
    quantity: 4,
    minStockLevel: 4,
    unitCost: 135.00,
    sellingPrice: 220.00,
    supplier: "Hikvision",
    description: "Vandal proof dome camera with IR.",
    compatibility: ["Hikvision NVR", "Milestone"],
    transactions: []
  },
  {
    id: "INV-CCTV-002",
    name: "NVR 16-Channel 4TB",
    sku: "NVR-16CH",
    categoryId: "CAT-CCTV",
    location: "Secure Store B",
    quantity: 1,
    minStockLevel: 2,
    unitCost: 450.00,
    sellingPrice: 650.00,
    supplier: "Dahua",
    description: "Network Video Recorder with 4TB HDD.",
    compatibility: ["ONVIF Cameras"],
    transactions: []
  },

  // FIRE SAFETY
  {
    id: "INV-FIRE-001",
    name: "Optical Smoke Detector",
    sku: "SD-OPT-ADDR",
    categoryId: "CAT-FIRE",
    location: "Warehouse C - Shelf 1",
    quantity: 45,
    minStockLevel: 20,
    unitCost: 35.00,
    sellingPrice: 65.00,
    supplier: "Notifier",
    description: "Addressable optical smoke detector head.",
    compatibility: ["NFS-3030", "NFS-640"],
    transactions: []
  },
  {
    id: "INV-FIRE-002",
    name: "Break Glass Call Point",
    sku: "MCP-RED",
    categoryId: "CAT-FIRE",
    location: "Warehouse C - Shelf 1",
    quantity: 12,
    minStockLevel: 10,
    unitCost: 28.00,
    sellingPrice: 55.00,
    supplier: "KAC",
    description: "Manual Call Point, Red, Surface Mount.",
    compatibility: ["Conventional Panels"],
    transactions: []
  },

  // ELEVATOR
  {
    id: "INV-LIFT-001",
    name: "Roller Guide Shoe (100mm)",
    sku: "LFT-ROL-100",
    categoryId: "CAT-LIFT",
    location: "Warehouse D",
    quantity: 6,
    minStockLevel: 8,
    unitCost: 180.00,
    sellingPrice: 280.00,
    supplier: "Schindler Parts",
    description: "Main rail roller guide assembly.",
    compatibility: ["Schindler 3300", "5500"],
    transactions: []
  },
  {
    id: "INV-LIFT-002",
    name: "Door Drive Belt",
    sku: "LFT-BELT-D5",
    categoryId: "CAT-LIFT",
    location: "Warehouse D",
    quantity: 15,
    minStockLevel: 5,
    unitCost: 25.00,
    sellingPrice: 45.00,
    supplier: "Generic Lift Parts",
    description: "Toothed belt for door operator.",
    compatibility: ["KONE", "Otis"],
    transactions: []
  }
];

export const MOCK_ASSETS: Asset[] = [
  {
    id: "AST-RPH-001",
    clientId: "CL-001", 
    categoryId: "CAT-HVAC",
    code: "HVAC-CH-01",
    name: "Trane Centrifugal Chiller",
    location: "Roof Block A",
    quantity: 1,
    status: "Under Maintenance",
    model: "CVHE-500",
    serialNumber: "TR-9982-X2",
    vendor: "Trane Official",
    purchaseCost: 45000,
    warrantyExpiry: "2025-12-31",
    department: "Facilities",
    attributes: {
      "Cooling Capacity": "500 Tons",
      "Refrigerant": "R-134a",
      "Compressor Type": "Centrifugal",
      "Voltage": "400V 3-Phase",
      "Flow Rate": "1200 GPM"
    },
    serviceScope: "Both",
    image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&q=80&w=600",
    movementHistory: [],
    maintenanceHistory: [],
    requests: [],
    activeSO: "SO-001"
  },
  {
    id: "AST-RPH-003",
    clientId: "CL-001", 
    categoryId: "CAT-LIFT",
    code: "LFT-PAS-01",
    name: "Main Lobby Passenger Lift",
    location: "Lobby Block A",
    quantity: 1,
    status: "Active",
    model: "Schindler 5500",
    serialNumber: "SCH-5500-01",
    vendor: "Schindler",
    purchaseCost: 65000,
    warrantyExpiry: "2027-01-01",
    department: "Facilities",
    attributes: {
      "Capacity": "1600 kg",
      "Speed": "2.5 m/s",
      "Floors": "G, 1-12"
    },
    serviceScope: "Both",
    image: "https://images.unsplash.com/photo-1546252438-2321876822c1?auto=format&fit=crop&q=80&w=600",
    movementHistory: [],
    maintenanceHistory: [],
    requests: []
  },
  {
    id: "AST-RPH-005",
    clientId: "CL-001", 
    categoryId: "CAT-MED",
    code: "MED-MRI-04",
    name: "Siemens Magnetom MRI",
    location: "Imaging Center, G Floor",
    quantity: 1,
    status: "Active",
    model: "Magnetom Vida",
    serialNumber: "SM-4421-B",
    vendor: "Siemens Healthineers",
    purchaseCost: 1200000,
    warrantyExpiry: "2028-06-01",
    department: "Radiology",
    attributes: {
        "Field Strength": "3.0 Tesla",
        "Bore Size": "70 cm",
        "Gradient": "XT 60/200"
    },
    serviceScope: "Service",
    image: "https://images.unsplash.com/photo-1516549655169-df83a0929519?auto=format&fit=crop&q=80&w=600",
    movementHistory: [],
    maintenanceHistory: [],
    requests: []
  },
  {
    id: "AST-SOK-001",
    clientId: "CL-002",
    categoryId: "CAT-CCTV",
    code: "CCTV-EXT-01",
    name: "Perimeter PTZ Camera",
    location: "North Gate",
    quantity: 1,
    status: "Active",
    model: "Hikvision DarkFighter",
    serialNumber: "HK-DF-992",
    vendor: "SecurGroup",
    purchaseCost: 1200,
    warrantyExpiry: "2025-05-15",
    department: "Security",
    attributes: {
      "Zoom": "25x Optical",
      "Resolution": "4MP",
      "IP Rating": "IP67"
    },
    serviceScope: "SparePart",
    image: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&q=80&w=600",
    movementHistory: [],
    maintenanceHistory: [],
    requests: []
  }
];

export const CORE_MODULES: ModuleItem[] = [
  { 
    id: "asset", 
    title: "Asset Management", 
    icon: Box,
    flowTitle: "Lifecycle",
    flowSteps: ["Registry", "Depreciation", "Decommission"]
  },
  { 
    id: "inventory", 
    title: "Spare Parts & Inventory", 
    icon: ClipboardList,
    flowTitle: "Stock Control",
    flowSteps: ["Stock Levels", "Transactions", "Reorder Alerts"]
  },
  { 
    id: "service", 
    title: "Service Order (SO)", 
    icon: Wrench,
    flowTitle: "Workflow",
    flowSteps: ["Ticket Created", "Tech Assigned", "Work Verified"]
  },
  { 
    id: "ppm", 
    title: "Preventive Maintenance", 
    icon: CalendarClock,
    flowTitle: "Scheduler",
    flowSteps: ["Calendar", "Task Checklist", "Compliance"]
  },
  { 
    id: "procurement", 
    title: "Procurement", 
    icon: ShoppingCart, 
    subtitle: "End-to-End Cycle",
    flowTitle: "Purchase Cycle",
    flowSteps: ["PR Approval", "PO Issued", "GRN & Invoice"]
  },
  { 
    id: "contractor", 
    title: "Contractor Portal", 
    icon: Users,
    flowTitle: "Vendor Mgmt",
    flowSteps: ["Onboarding", "Work Permits", "Performance"]
  },
  { 
    id: "consultant", 
    title: "Consultant Oversight", 
    icon: Eye,
    flowTitle: "Audit",
    flowSteps: ["Dashboard", "Approvals", "Audit Logs"]
  },
];

export const REPORTING_MODULES: ModuleItem[] = [
  { 
    id: "reporting", 
    title: "Reporting & Dashboard", 
    icon: LayoutDashboard,
    flowTitle: "Analytics",
    flowSteps: ["KPI Overview", "Custom Builder", "Export PDF"]
  }
];

export const OPERATIONS_DATA: OperationRecord[] = [
  {
    id: "SO-2024-001",
    module: "Service Order",
    subject: "HVAC Chiller Unit 3 Malfunction",
    status: "critical",
    priority: "high",
    technician: "Mike Ross",
    date: "10 mins ago",
    details: "Chiller unit is vibrating excessively. Temperature readings are unstable. Immediate inspection required to prevent shutdown.",
    timeline: [
      { time: "10:00 AM", event: "Alert Triggered by BMS" },
      { time: "10:05 AM", event: "Ticket Auto-Created" },
      { time: "10:10 AM", event: "Assigned to Mike Ross" }
    ]
  }
];

export const MOCK_TECHNICIANS: Technician[] = [
  { id: "TECH-001", name: "John Smith", type: "Internal", role: "Senior HVAC Tech", phone: "012-333-444" },
  { id: "TECH-002", name: "Mike Ross", type: "Internal", role: "General Technician", phone: "011-222-333" },
  { id: "SUB-001", name: "SafeGuard Fire Team", type: "Subcontractor", role: "Fire Safety Specialist", company: "SafeGuard Fire", phone: "099-888-777" },
  { id: "SUB-002", name: "KONE Service", type: "Subcontractor", role: "Elevator Specialist", company: "KONE Cambodia", phone: "010-555-666" }
];

export const MOCK_WORK_ORDERS: WorkOrder[] = [
  {
    id: "SO-001",
    title: "HVAC Preventive Maintenance",
    assetId: "AST-RPH-001",
    assetName: "Trane Centrifugal Chiller",
    clientName: "Royal Phnom Penh Hospital",
    priority: "Medium",
    status: "In Progress",
    description: "Quarterly maintenance check for HVAC Unit 1. Vibration analysis and oil level check required.",
    createdDate: "2024-01-15",
    startDate: "2024-01-16",
    assignedTechnicianId: "TECH-001",
    dueDate: "2024-01-20",
    tasks: [
      { id: "T1", description: "Check compressor oil level", isCompleted: true },
      { id: "T2", description: "Clean condenser coils", isCompleted: false },
      { id: "T3", description: "Vibration analysis test", isCompleted: false }
    ],
    partsUsed: [
      { id: "P1", inventoryItemId: "INV-HVAC-003", partName: "Pleated Filter 20x20x2", quantity: 2, cost: 4.50 }
    ],
    images: [
      "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&q=80&w=400"
    ]
  },
  {
    id: "SO-002",
    title: "Elevator Door Sensor Fault",
    assetId: "AST-RPH-003",
    assetName: "Main Lobby Passenger Lift",
    clientName: "Royal Phnom Penh Hospital",
    priority: "High",
    status: "Open",
    description: "Lift doors are sticking and not closing properly on 3rd floor.",
    createdDate: "2024-01-18",
    startDate: "2024-01-18",
    assignedTechnicianId: undefined, // Unassigned
    tasks: [
      { id: "T1", description: "Inspect door sensors", isCompleted: false },
      { id: "T2", description: "Lubricate door rails", isCompleted: false }
    ],
    partsUsed: [],
    images: []
  },
  {
    id: "SO-003",
    title: "Fire Panel Battery Replacement",
    assetId: "AST-VAT-001",
    assetName: "Main Fire Alarm Control Panel",
    clientName: "Vattanac Capital",
    priority: "Medium",
    status: "Completed",
    description: "Backup battery showing low voltage warning on main panel.",
    createdDate: "2024-01-10",
    startDate: "2024-01-11",
    completedDate: "2024-01-12",
    assignedTechnicianId: "SUB-001",
    tasks: [
      { id: "T1", description: "Test battery voltage", isCompleted: true },
      { id: "T2", description: "Replace 12V 7Ah batteries", isCompleted: true },
      { id: "T3", description: "System reset and verification", isCompleted: true }
    ],
    partsUsed: [],
    images: []
  }
];

export const MOCK_PURCHASE_REQUESTS: PurchaseRequest[] = [
  {
    id: "PR001",
    clientId: "CL-001", // Royal Phnom Penh Hospital
    requesterName: "Nestar",
    requestDate: "2024-01-18",
    status: 'Pending',
    requestedItems: [
      { itemName: "HVAC Air Filters (Pack of 10)", quantity: 10, estimatedCost: 45.00 }
    ]
  },
  {
    id: "PR002",
    clientId: "CL-003",
    requesterName: "Mike Ross",
    workOrderId: "SO-003",
    requestDate: "2024-01-11",
    status: 'Approved',
    requestedItems: [
      { itemName: "12V 7Ah Sealed Lead Acid Battery", quantity: 2, estimatedCost: 50.00 }
    ]
  }
];

// --- MOCK PIPELINE DATA ---
export const MOCK_PIPELINE: PipelineItem[] = [
  {
    id: "REQ-2024-05",
    clientId: "CL-002",
    clientName: "Sokha Hotel",
    title: "Pool Pump Noise Complaint",
    description: "Client reported loud grinding noise from Main Pool Pump #2. Needs assessment.",
    priority: "High",
    stage: "Request",
    createdDate: "2024-02-01",
    contactName: "Mr. Vibol",
    contactPhone: "011-222-333",
    locationDetail: "Pool Pump Room, B1"
  },
  {
    id: "REQ-2024-04",
    clientId: "CL-003",
    clientName: "Vattanac Capital",
    title: "Annual ELV Audit Request",
    description: "Request for annual audit of all Access Control points on floors 12-15.",
    priority: "Medium",
    stage: "Survey",
    createdDate: "2024-01-28",
    surveyScheduledDate: "2024-02-05",
    surveyorName: "John Smith",
    locationDetail: "Floors 12-15",
    contactName: "Ms. Leakhena"
  },
  {
    id: "REQ-2024-02",
    clientId: "CL-001",
    clientName: "Royal Phnom Penh Hospital",
    title: "New UPS Installation for Server Room",
    description: "Supply and install 10kVA UPS for the new imaging server room.",
    priority: "High",
    stage: "Quotation",
    createdDate: "2024-01-20",
    surveyScheduledDate: "2024-01-22",
    surveyorName: "Mike Ross",
    contactName: "Dr. Sary",
    locationDetail: "Imaging Dept, Server Room 3",
    rootCause: "New Equipment Installation",
    proposedRemedy: "Install APC 10kVA UPS with hardwired bypass panel.",
    partsNeeded: "UPS Unit, External Battery Pack, Bypass Switch, 30m Cabling",
    quoteAmount: 4200.00,
    validityDate: "2024-02-20",
    paymentTerms: "50% Deposit, 50% on Completion",
    quoteLineItems: [
       { id: "1", description: "APC 10kVA Online UPS", quantity: 1, unitPrice: 3500, total: 3500 },
       { id: "2", description: "Installation & Cabling", quantity: 1, unitPrice: 700, total: 700 }
    ]
  },
  {
    id: "REQ-2024-01",
    clientId: "CL-001",
    clientName: "Royal Phnom Penh Hospital",
    title: "Boiler Maintenance Contract",
    description: "Renewal of annual maintenance for steam boilers.",
    priority: "Low",
    stage: "Won",
    createdDate: "2024-01-05",
    quoteAmount: 2500.00,
    convertedSOId: "SO-1093",
    quoteLineItems: [
      { id: "1", description: "Annual Boiler Maintenance", quantity: 1, unitPrice: 2500, total: 2500 }
    ]
  }
];

export const MOCK_INVOICES: Invoice[] = [
  {
    id: "INV-001",
    invoiceNumber: "INV-2024-001",
    clientId: "CL-001",
    clientName: "Royal Phnom Penh Hospital",
    dateIssued: "2024-01-15",
    dueDate: "2024-02-15",
    amount: 4500.00,
    status: "Pending",
    items: [
      { description: "Quarterly HVAC Maintenance", amount: 3500.00 },
      { description: "Spare Parts Replacement (Filters)", amount: 1000.00 }
    ],
    workOrderRef: "SO-001"
  },
  {
    id: "INV-002",
    invoiceNumber: "INV-2024-002",
    clientId: "CL-003",
    clientName: "Vattanac Capital",
    dateIssued: "2024-01-10",
    dueDate: "2024-02-10",
    amount: 1200.00,
    status: "Paid",
    items: [
      { description: "Emergency Fire Panel Repair", amount: 1200.00 }
    ],
    workOrderRef: "SO-003"
  },
  {
    id: "INV-003",
    invoiceNumber: "INV-2023-089",
    clientId: "CL-002",
    clientName: "Sokha Hotel",
    dateIssued: "2023-12-01",
    dueDate: "2023-12-31",
    amount: 8500.00,
    status: "Overdue",
    items: [
      { description: "Annual Pool Pump Overhaul", amount: 8500.00 }
    ]
  }
];
