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
} from "lucide-react";

export interface NavigationItem {
  title: string;
  href: string;
  icon: any;
  permission:
  | "dashboard"
  | "python_lab"
  | "sql_lab"
  | "datasets"
  | "automl"
  | "autodl"
  | "autonlp"
  | "genai"
  | "agentic_ai"
  | "crm"
  | "user_management"
  | "platform";
  section:
    | "home"
    | "labs"
    | "business"
    | "platform";
  comingSoon?: boolean;
}

export const NAVIGATION: NavigationItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home,
    permission: "dashboard",
    section: "home",
  },

    {
    title: "SQL Lab",
    href: "/sql",
    icon: Database,
    permission: "sql_lab",
    section: "labs",
  },

  {
    title: "Python Lab",
    href: "/dashboard",
    icon: Code2,
    permission: "python_lab",
    section: "labs",
  },


  {
  title: "Datasets",
  href: "/datasets",
  icon: Database,
  permission: "datasets",
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
    href: "#",
    icon: Cpu,
    permission: "autodl",
    section: "labs",
    comingSoon: true,
  },

  {
    title: "AutoNLP",
    href: "#",
    icon: Languages,
    permission: "autonlp",
    section: "labs",
    comingSoon: true,
  },

  {
    title: "GenAI Studio",
    href: "#",
    icon: Sparkles,
    permission: "genai",
    section: "labs",
    comingSoon: true,
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
];
