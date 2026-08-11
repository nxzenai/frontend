"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

import useCRM from "@/hooks/useCRM";

import CRMHeader from "@/components/crm/CRMHeader";
import CRMStats from "@/components/crm/CRMStats";
import CRMFilters from "@/components/crm/CRMFilters";
import LeadTable from "@/components/crm/LeadTable";
import LeadDrawer from "@/components/crm/LeadDrawer";
import EmptyCRM from "@/components/crm/EmptyCRM";

export default function CRMPage() {

  const {

    loading,

    leads,

    dashboard,

    search,
    setSearch,

    status,
    setStatus,

    priority,
    setPriority,

    selectedLead,
    setSelectedLead,

    refresh,

  } = useCRM();

  return (

    <ProtectedRoute>

      <DashboardLayout>

        <CRMHeader />

        <div className="mt-8">

          <CRMStats
            dashboard={dashboard}
          />

        </div>

        <div className="mt-8">

          <CRMFilters

            search={search}

            setSearch={setSearch}

            status={status}

            setStatus={setStatus}

            priority={priority}

            setPriority={setPriority}

            onRefresh={refresh}

          />

        </div>
                <div className="mt-8">

          {

            loading ?

            (

              <div
                className="
                  rounded-2xl
                  border
                  border-slate-800
                  bg-slate-900
                  p-20
                  text-center
                "
              >

                <div
                  className="
                    mx-auto
                    h-12
                    w-12
                    animate-spin
                    rounded-full
                    border-4
                    border-slate-600
                    border-t-blue-500
                  "
                />

                <p className="mt-6 text-slate-400">

                  Loading CRM...

                </p>

              </div>

            )

            :

            leads.length === 0 ?

            (

              <EmptyCRM />

            )

            :

            (

              <LeadTable

                leads={leads}

                onSelectLead={
                  setSelectedLead
                }

              />

            )

          }

        </div>
                {

          selectedLead &&

          (

            <LeadDrawer

              lead={selectedLead}

              onClose={() =>
                setSelectedLead(null)
              }

              onRefresh={refresh}

            />

          )

        }

      </DashboardLayout>

    </ProtectedRoute>

  );

}