import {
  Home,
  Code2,
  Database,
  BrainCircuit,
  Cpu,
  Languages,
  Sparkles,
  Bot,
  Building2,
  Users,
  Settings,
  BookOpen,
  ClipboardCheck,
  FolderKanban,
  MessageSquare,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

export interface NavigationItem {
  title: string;
  href: string;
  icon: LucideIcon;
  permission:
  | "dashboard"
  | "python_lab"
  | "sql_lab"
  | "eda"
  | "automl"
  | "autodl"
  | "autonlp"
  | "genai"
  | "agentic_ai"
  | "crm"
  | "leads"
  | "user_management"
  | "platform";
  section:
    | "dashboard"
    | "labs"
    | "business"
    | "platform";
  comingSoon?: boolean;
}

export const NAVIGATION: NavigationItem[] = [

  { title: "Learning Paths", href: "/learn", icon: BookOpen, permission: "dashboard", section: "dashboard" },
  { title: "Practice", href: "/practice", icon: ClipboardCheck, permission: "dashboard", section: "dashboard" },
  { title: "Projects", href: "/learn/projects", icon: FolderKanban, permission: "dashboard", section: "dashboard" },
  { title: "Assessments", href: "/assessments", icon: ClipboardCheck, permission: "dashboard", section: "dashboard" },
  { title: "Interview", href: "/interview", icon: MessageSquare, permission: "dashboard", section: "dashboard" },
  { title: "My Progress", href: "/my-progress", icon: TrendingUp, permission: "dashboard", section: "dashboard" },

    {
    title: "SQL Lab",
    href: "/sql",
    icon: Database,
    permission: "sql_lab",
    section: "labs",
  },

  {
    title: "Python Lab",
    href: "/python-lab",
    icon: Code2,
    permission: "python_lab",
    section: "labs",
  },


  {
  title: "EDA Hub",
  href: "/eda",
  icon: Database,
  permission: "eda",
  section: "labs",
},

{
    title: "AutoML",
    href: "/automl",
    icon: BrainCircuit,
    permission: "automl",
    section: "labs",
},

  {
    title: "AutoDL",
    href: "/autodl",
    icon: Cpu,
    permission: "autodl",
    section: "labs",
  },

  {
    title: "AutoNLP",
    href: "/autonlp",
    icon: Languages,
    permission: "autonlp",
    section: "labs",
  },

  {
    title: "GenAI",
    href: "/genai",
    icon: Sparkles,
    permission: "genai",
    section: "labs",
  },

  {
    title: "Agentic AI",
    href: "#",
    icon: Bot,
    permission: "agentic_ai",
    section: "labs",
    comingSoon: true,
  },

  {
    title: "Leads",
    href: "/leads",
    icon: Users,
    permission: "leads",
    section: "business",
  },
  {
    title: "CRM",
    href: "/crm",
    icon: Building2,
    permission: "crm",
    section: "business",
  },

  {
    title: "User Management",
    href: "/users",
    icon: Users,
    permission: "user_management",
    section: "business",
  },

  {
    title: "Platform",
    href: "/platform",
    icon: Settings,
    permission: "platform",
    section: "platform",
  },

  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home,
    permission: "dashboard",
    section: "dashboard",
  },
];
