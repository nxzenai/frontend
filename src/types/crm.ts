export interface Lead {

    id: string;

    name: string;

    email: string;

    phone: string;

    profession: string;

    program_interest: string;

    preferred_demo_date: string;

    message: string;

    notes: string;

    priority:
        | "hot"
        | "warm"
        | "cold";

    status:
        | "new"
        | "contacted"
        | "qualified"
        | "demo_scheduled"
        | "proposal_sent"
        | "enrolled"
        | "lost";

    assigned_to?: string;

    follow_up_date?: string;

    created_at: string;

}

export interface LeadListResponse {

    items: Lead[];

    page: number;

    limit: number;

    total: number;

    pages: number;

}

export interface DashboardResponse {

    total: number;

    new: number;

    contacted: number;

    qualified: number;

    enrolled: number;

    lost: number;

}

export interface CRMOverview {

    statistics: DashboardResponse;

    recent_leads: Lead[];

}