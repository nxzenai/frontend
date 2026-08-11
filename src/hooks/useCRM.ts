"use client";

import {
  useEffect,
  useState,
} from "react";

import CRMService from "@/services/crm.service";

import {
  Lead,
  DashboardResponse,
  CRMOverview,
} from "@/types/crm";

export default function useCRM() {
  ////////////////////////////////////////////
  // State
  ////////////////////////////////////////////

  const [loading, setLoading] =
    useState(true);

  const [leads, setLeads] =
    useState<Lead[]>([]);

  const [dashboard, setDashboard] =
    useState<DashboardResponse | null>(
      null
    );

  const [overview, setOverview] =
    useState<CRMOverview | null>(null);

  const [selectedLead, setSelectedLead] =
    useState<Lead | null>(null);

  ////////////////////////////////////////////
  // Filters
  ////////////////////////////////////////////

  const [page, setPage] =
    useState(1);

  const [search, setSearch] =
    useState("");

  const [status, setStatus] =
    useState("");

  const [priority, setPriority] =
    useState("");

  ////////////////////////////////////////////
  // Pagination
  ////////////////////////////////////////////

  const [totalPages, setTotalPages] =
    useState(1);

  const [totalLeads, setTotalLeads] =
    useState(0);
  ////////////////////////////////////////////
  // Dashboard
  ////////////////////////////////////////////

  async function loadDashboard() {
    const data =
      await CRMService.dashboard();

    setDashboard(data);
  }

  ////////////////////////////////////////////
  // Overview
  ////////////////////////////////////////////

  async function loadOverview() {
    const data =
      await CRMService.overview();

    setOverview(data);
  }

  ////////////////////////////////////////////
  // Leads
  ////////////////////////////////////////////

  async function loadLeads() {
    const response =
      await CRMService.list(
        page,
        search,
        status,
        priority
      );

    setLeads(response.items);

    setTotalPages(response.pages);

    setTotalLeads(response.total);
  }

  ////////////////////////////////////////////
  // Refresh
  ////////////////////////////////////////////

  async function refresh() {
    try {
      setLoading(true);

      await Promise.all([
        loadDashboard(),
        loadOverview(),
        loadLeads(),
      ]);
    } finally {
      setLoading(false);
    }
  }
    ////////////////////////////////////////////
  // Effects
  ////////////////////////////////////////////

  useEffect(() => {
    refresh();
  }, [
    page,
    status,
    priority,
  ]);

  useEffect(() => {
    const timer =
      setTimeout(() => {
        refresh();
      }, 400);

    return () =>
      clearTimeout(timer);
  }, [search]);

  ////////////////////////////////////////////
  // Exports
  ////////////////////////////////////////////

  return {

    loading,

    leads,

    dashboard,

    overview,

    selectedLead,

    setSelectedLead,

    page,

    setPage,

    search,

    setSearch,

    status,

    setStatus,

    priority,

    setPriority,

    totalPages,

    totalLeads,

    refresh,

  };
}