"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface Lead {
  _id: string;
  status: string;
  priority?: string;
  follow_up_date?: string;
}

export default function AnalyticsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await api.get("/api/leads/");
      setLeads(response.data);
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalLeads = leads.length;

  const newLeads = leads.filter(
    (lead) => lead.status === "new"
  ).length;

  const contactedLeads = leads.filter(
    (lead) => lead.status === "contacted"
  ).length;

  const interestedLeads = leads.filter(
    (lead) => lead.status === "interested"
  ).length;

  const enrolledLeads = leads.filter(
    (lead) => lead.status === "enrolled"
  ).length;

  const hotLeads = leads.filter(
    (lead) => lead.priority === "hot"
  ).length;

  const today = new Date()
    .toISOString()
    .split("T")[0];

  const followUpsDue = leads.filter(
    (lead) =>
      lead.follow_up_date &&
      lead.follow_up_date !== "" &&
      lead.follow_up_date <= today
  ).length;

  const conversionRate =
    totalLeads > 0
      ? (
          (enrolledLeads / totalLeads) *
          100
        ).toFixed(1)
      : "0";

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white p-10">
        <h1 className="text-4xl font-bold">
          Loading Analytics...
        </h1>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white p-10">
      <div className="max-w-7xl mx-auto">

        <div className="mb-10">
          <h1 className="text-5xl font-bold">
            Analytics Dashboard
          </h1>

          <p className="text-slate-400 mt-2">
            Track lead performance and
            conversion metrics.
          </p>
        </div>

        {/* Top Metrics */}

        <div className="grid md:grid-cols-4 gap-6 mb-10">

          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6">
            <p className="text-slate-400">
              Total Leads
            </p>

            <h2 className="text-5xl font-bold mt-3">
              {totalLeads}
            </h2>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6">
            <p className="text-slate-400">
              Conversion Rate
            </p>

            <h2 className="text-5xl font-bold mt-3 text-orange-400">
              {conversionRate}%
            </h2>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6">
            <p className="text-slate-400">
              Hot Leads
            </p>

            <h2 className="text-5xl font-bold mt-3 text-red-400">
              {hotLeads}
            </h2>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6">
            <p className="text-slate-400">
              Follow Ups Due
            </p>

            <h2 className="text-5xl font-bold mt-3 text-yellow-400">
              {followUpsDue}
            </h2>
          </div>

        </div>

        {/* Funnel Metrics */}

        <div className="grid md:grid-cols-4 gap-6">

          <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
            <p className="text-slate-400">
              New Leads
            </p>

            <h3 className="text-4xl font-bold text-green-400 mt-2">
              {newLeads}
            </h3>
          </div>

          <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
            <p className="text-slate-400">
              Contacted
            </p>

            <h3 className="text-4xl font-bold text-yellow-400 mt-2">
              {contactedLeads}
            </h3>
          </div>

          <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
            <p className="text-slate-400">
              Interested
            </p>

            <h3 className="text-4xl font-bold text-blue-400 mt-2">
              {interestedLeads}
            </h3>
          </div>

          <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
            <p className="text-slate-400">
              Enrolled
            </p>

            <h3 className="text-4xl font-bold text-purple-400 mt-2">
              {enrolledLeads}
            </h3>
          </div>

        </div>

      </div>
    </main>
  );
}