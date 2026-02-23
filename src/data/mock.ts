import { Product, SalesRep, Conversation, ChatMessage, Notification } from "@/types";

export const products: Product[] = [
  {
    id: "p1",
    name: "Champa X1 Pro Server",
    description: "Enterprise-grade server solution with cutting-edge performance.",
    longDescription: "The Champa X1 Pro Server delivers unmatched performance for enterprise workloads. Built with the latest generation processors and high-speed memory, it handles demanding applications with ease. Perfect for data centers, cloud infrastructure, and mission-critical operations.",
    price: 4999,
    category: "Servers",
    images: ["/placeholder.svg"],
    specs: { Processor: "64-Core ARM", RAM: "256GB DDR5", Storage: "8TB NVMe SSD", Network: "100GbE" },
    inStock: true,
    rating: 4.8,
  },
  {
    id: "p2",
    name: "SecureNet Firewall 500",
    description: "Advanced network security appliance with AI-driven threat detection.",
    longDescription: "SecureNet Firewall 500 uses machine learning to detect and neutralize threats in real-time. With deep packet inspection and zero-trust architecture, your network stays protected 24/7.",
    price: 2499,
    category: "Security",
    images: ["/placeholder.svg"],
    specs: { Throughput: "40 Gbps", Connections: "10M concurrent", "VPN Tunnels": "5000", "Threat DB": "Updated hourly" },
    inStock: true,
    rating: 4.6,
  },
  {
    id: "p3",
    name: "CloudLink SD-WAN Gateway",
    description: "Intelligent WAN optimization for distributed enterprises.",
    longDescription: "CloudLink SD-WAN Gateway revolutionizes how your branches connect. With intelligent path selection and real-time optimization, experience up to 3x faster cloud application performance.",
    price: 1899,
    category: "Networking",
    images: ["/placeholder.svg"],
    specs: { Ports: "8x 10GbE", "SD-WAN": "Yes", QoS: "Advanced", "Cloud Ready": "AWS, Azure, GCP" },
    inStock: true,
    rating: 4.7,
  },
  {
    id: "p4",
    name: "Champa UPS 3000VA",
    description: "Uninterruptible power supply for critical infrastructure.",
    longDescription: "Keep your systems running through any power event. The Champa UPS 3000VA provides clean, reliable power with automatic failover in less than 4ms.",
    price: 899,
    category: "Power",
    images: ["/placeholder.svg"],
    specs: { Capacity: "3000VA / 2700W", Runtime: "15 min full load", Transfer: "<4ms", Form: "2U Rack" },
    inStock: false,
    rating: 4.5,
  },
  {
    id: "p5",
    name: "DataVault NAS Enterprise",
    description: "High-performance network attached storage for enterprises.",
    longDescription: "DataVault NAS Enterprise provides petabyte-scale storage with enterprise-grade reliability. Features RAID 6, snapshots, and seamless cloud tier integration.",
    price: 3299,
    category: "Storage",
    images: ["/placeholder.svg"],
    specs: { Bays: "12x 3.5\"", "Max Capacity": "192TB", RAID: "0,1,5,6,10", Protocol: "NFS, SMB, iSCSI" },
    inStock: true,
    rating: 4.9,
  },
  {
    id: "p6",
    name: "Champa Managed Switch 48P",
    description: "48-port managed gigabit switch with PoE+ support.",
    longDescription: "The Champa Managed Switch 48P delivers enterprise networking at scale. With full PoE+ budget, VLAN support, and centralized management, it's the backbone of modern networks.",
    price: 749,
    category: "Networking",
    images: ["/placeholder.svg"],
    specs: { Ports: "48x 1GbE + 4x 10GbE SFP+", PoE: "740W budget", Management: "CLI, Web, SNMP", VLAN: "4096" },
    inStock: true,
    rating: 4.4,
  },
];

export const categories = ["All", "Servers", "Security", "Networking", "Power", "Storage"];

export const salesReps: SalesRep[] = [
  { id: "rep1", name: "Alex Johnson", email: "alex@champa.com", status: "online" },
  { id: "rep2", name: "Sarah Chen", email: "sarah@champa.com", status: "offline" },
];

export const demoConversations: Conversation[] = [
  {
    id: "conv1",
    userId: "guest-123",
    userName: "Guest User",
    assignedRep: "rep1",
    status: "active",
    lastMessage: "Hi, I need help with server pricing.",
    lastMessageTime: new Date(Date.now() - 300000).toISOString(),
    unread: 2,
  },
];

export const demoMessages: ChatMessage[] = [
  {
    id: "m1",
    conversationId: "conv1",
    senderId: "guest-123",
    senderName: "Guest User",
    senderType: "user",
    content: "Hi, I need help with server pricing.",
    timestamp: new Date(Date.now() - 600000).toISOString(),
  },
  {
    id: "m2",
    conversationId: "conv1",
    senderId: "rep1",
    senderName: "Alex Johnson",
    senderType: "sales",
    content: "Hello! I'd be happy to help. Which server model are you interested in?",
    timestamp: new Date(Date.now() - 300000).toISOString(),
  },
];

export const demoNotifications: Notification[] = [
  {
    id: "n1",
    type: "chat",
    title: "New Chat Request",
    message: "Guest User started a new conversation.",
    timestamp: new Date(Date.now() - 600000).toISOString(),
    read: false,
    referenceId: "conv1",
  },
];
