"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";

interface Lead {
  _id: string;
  name: string;
  email: string;
  phone: string;
  profession: string;
  program_interest: string;
  status: string;
  notes?: string;

  priority?: string;
  follow_up_date?: string;

  created_at: string;
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] =
  useState("all");
  const [selectedLead, setSelectedLead] =
  useState<Lead | null>(null);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const response = await api.get("/api/leads/");
      setLeads(response.data);
    } catch (error) {
      console.error("Error fetching leads:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (
    leadId: string,
    newStatus: string
  ) => {
    try {
      setLeads((prevLeads) =>
        prevLeads.map((lead) =>
          lead._id === leadId
            ? { ...lead, status: newStatus }
            : lead
        )
      );


      await api.patch(
        `/api/leads/${leadId}?status=${newStatus}`
      );
    } catch (error) {
      console.error("Failed to update status:", error);
      fetchLeads();
    }
  };

  const handleNotesChange = async (
  leadId: string,
  notes: string
) => {
  try {
    setLeads((prev) =>
      prev.map((lead) =>
        lead._id === leadId
          ? { ...lead, notes }
          : lead
      )
    );

    await api.patch(
      `/api/leads/${leadId}/notes?notes=${encodeURIComponent(
        notes
      )}`
    );
  } catch (error) {
    console.error("Failed to update notes:", error);
  }
};

const handlePriorityChange = async (
  leadId: string,
  priority: string
) => {
  try {

    setLeads((prev) =>
      prev.map((lead) =>
        lead._id === leadId
          ? { ...lead, priority }
          : lead
      )
    );

    await api.patch(
      `/api/leads/${leadId}/priority?priority=${priority}`
    );

  } catch (error) {
    console.error(
      "Failed to update priority:",
      error
    );

    fetchLeads();
  }
};

const handleFollowUpChange = async (
  leadId: string,
  followUpDate: string
) => {
  try {

    setLeads((prev) =>
      prev.map((lead) =>
        lead._id === leadId
          ? {
              ...lead,
              follow_up_date: followUpDate,
            }
          : lead
      )
    );

    await api.patch(
      `/api/leads/${leadId}/followup?follow_up_date=${followUpDate}`
    );

  } catch (error) {
    console.error(
      "Failed to update follow up:",
      error
    );
  }
};

  const exportCSV = () => {
    window.open(
      "http://127.0.0.1:8000/api/leads/export/csv",
      "_blank"
    );
  };

  const openWhatsApp = (phone: string) => {
  const cleanPhone = phone.replace(/\D/g, "");

  window.open(
    `https://wa.me/91${cleanPhone}`,
    "_blank"
  );
};

  const filteredLeads = useMemo(() => {

  return leads.filter((lead) => {

    const searchMatch =
      `${lead.name} ${lead.email} ${lead.phone}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const statusMatch =
      statusFilter === "all"
        ? true
        : lead.status === statusFilter;

    return searchMatch && statusMatch;
  });

}, [leads, searchTerm, statusFilter]);

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

  const conversionRate =
    totalLeads > 0
      ? ((enrolledLeads / totalLeads) * 100).toFixed(1)
      : "0";

  const getStatusClass = (status: string) => {
    switch (status) {
      case "new":
        return "text-green-400";

      case "contacted":
        return "text-yellow-400";

      case "demo_scheduled":
        return "text-cyan-400";

      case "interested":
        return "text-blue-400";

      case "enrolled":
        return "text-purple-400";

      case "not_interested":
        return "text-red-400";

      default:
        return "text-slate-300";
    }
  };

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}

        <div className="mb-8">
          <h1 className="text-4xl font-bold">
            Lead Dashboard
          </h1>

          <p className="text-slate-400 mt-2">
            Manage demo requests and prospective students.
          </p>
        </div>

        {/* Metrics */}

        <div className="grid md:grid-cols-6 gap-4 mb-8">

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <p className="text-slate-400 text-sm">
              Total Leads
            </p>
            <h2 className="text-3xl font-bold mt-2">
              {totalLeads}
            </h2>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <p className="text-slate-400 text-sm">
              New Leads
            </p>
            <h2 className="text-3xl font-bold text-green-400 mt-2">
              {newLeads}
            </h2>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <p className="text-slate-400 text-sm">
              Contacted
            </p>
            <h2 className="text-3xl font-bold text-yellow-400 mt-2">
              {contactedLeads}
            </h2>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <p className="text-slate-400 text-sm">
              Interested
            </p>
            <h2 className="text-3xl font-bold text-blue-400 mt-2">
              {interestedLeads}
            </h2>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <p className="text-slate-400 text-sm">
              Enrolled
            </p>
            <h2 className="text-3xl font-bold text-purple-400 mt-2">
              {enrolledLeads}
            </h2>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <p className="text-slate-400 text-sm">
              Conversion Rate
            </p>
            <h2 className="text-3xl font-bold text-orange-400 mt-2">
              {conversionRate}%
            </h2>
          </div>

        </div>
        <div className="flex flex-wrap gap-2 mb-6">

  {[
    "all",
    "new",
    "contacted",
    "interested",
    "enrolled",
    "not_interested"
  ].map((status) => (

    <button
      key={status}
      onClick={() =>
        setStatusFilter(status)
      }
      className={`px-4 py-2 rounded-lg border ${
        statusFilter === status
          ? "bg-blue-600"
          : "bg-slate-900"
      }`}
    >
      {status}
    </button>

  ))}

</div>

        {/* Search + Export */}

        <div className="flex flex-col md:flex-row gap-4 mb-6">

          <input
            type="text"
            placeholder="Search by name, email, phone, profession, program or status..."
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(e.target.value)
            }
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
          />

          <button
            onClick={exportCSV}
            className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-xl font-semibold transition"
          >
            Export CSV
          </button>

        </div>

        {/* Leads Table */}

        <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden">

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="bg-slate-900">
                <tr>
  <th className="text-left p-4">Name</th>
  <th className="text-left p-4">Email</th>
  <th className="text-left p-4">Phone</th>
  <th className="text-left p-4">Profession</th>
  <th className="text-left p-4">Program</th>
  <th className="text-left p-4">Status</th>
  <th className="text-left p-4">Priority</th>
  <th className="text-left p-4">Follow Up</th>
  <th className="text-left p-4">Notes</th>
  <th className="text-left p-4">Actions</th>
</tr>
              </thead>

              <tbody>

                {loading ? (
                  <tr>
                    <td colSpan={10} className="text-center p-8">
                      Loading Leads...
                    </td>
                  </tr>
                ) : filteredLeads.length === 0 ? (
                  <tr>
                    <td
                      colSpan={10}
                      className="text-center p-8 text-slate-400"
                    >
                      No leads found.
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead) => (
                    <tr
                      key={lead._id}
                      className="border-t border-slate-800 hover:bg-slate-900/50"
                    >
                      <td className="p-4 font-medium">
                        {lead.name}
                      </td>

                      <td className="p-4 text-slate-300">
                        {lead.email}
                      </td>

                      <td className="p-4 text-slate-300">
                        {lead.phone}
                      </td>

                      <td className="p-4 text-slate-300">
                        {lead.profession}
                      </td>

                      <td className="p-4 text-slate-300">
                        {lead.program_interest}
                      </td>

                      <td className="p-4">
                        <select
                          value={lead.status}
                          onChange={(e) =>
                            handleStatusChange(
                              lead._id,
                              e.target.value
                            )
                          }
                          className={`bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 focus:outline-none ${getStatusClass(
                            lead.status
                          )}`}
                        >
                          <option value="new">New</option>
                          <option value="contacted">
                            Contacted
                          </option>
                          <option value="demo_scheduled">
                            Demo Scheduled
                          </option>
                          <option value="interested">
                            Interested
                          </option>
                          <option value="enrolled">
                            Enrolled
                          </option>
                          <option value="not_interested">
                            Not Interested
                          </option>
                        </select>
                      </td>
                      <td className="p-4">

  <select
  value={lead.priority || "warm"}
  onChange={(e) =>
    handlePriorityChange(
      lead._id,
      e.target.value
    )
  }
  className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-2"
>
  <option value="cold">
    ❄️ Cold
  </option>

  <option value="warm">
    🟡 Warm
  </option>

  <option value="hot">
    🔥 Hot
  </option>
</select>

</td>
<td className="p-4">

  <input
  type="date"
  value={lead.follow_up_date || ""}
  onChange={(e) =>
    handleFollowUpChange(
      lead._id,
      e.target.value
    )
  }
  className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2"
/>

</td>
                      <td className="p-4">
  <textarea
    value={lead.notes || ""}
    onChange={(e) =>
      handleNotesChange(
        lead._id,
        e.target.value
      )
    }
    rows={3}
    placeholder="Add notes..."
    className="w-48 bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm"
  />
</td>


<td className="p-4">
  <div className="flex gap-2">

    <button
      onClick={() =>
        openWhatsApp(lead.phone)
      }
      className="bg-green-600 hover:bg-green-700 px-3 py-2 rounded-lg"
    >
      WhatsApp
    </button>

    <button
      onClick={() =>
        setSelectedLead(lead)
      }
      className="bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-lg"
    >
      View
    </button>

  </div>
</td>

                    </tr>
                  ))
                )}

              </tbody>

            </table>

          </div>

        </div>

      </div>
    </main>
  );
}