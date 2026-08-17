"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import EDAService from "@/services/eda.service";
import type { EDAList, EDAOverview, EDAPreview, EDAProject, EDAProfiles, EDAQuality } from "@/types/eda";

const message = (error: unknown) => {
  const candidate = error as { response?: { data?: { message?: string } } };
  return candidate.response?.data?.message ?? "The request could not be completed.";
};

export default function useEDA() {
  const [catalog, setCatalog] = useState<EDAList>({ items: [], total: 0, page: 1, limit: 20, pages: 0 });
  const [page, setPage] = useState(1); const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<EDAProject | null>(null);
  const [overview, setOverview] = useState<EDAOverview | null>(null); const [preview, setPreview] = useState<EDAPreview | null>(null);
  const [profiles, setProfiles] = useState<EDAProfiles | null>(null); const [quality, setQuality] = useState<EDAQuality | null>(null);
  const [loadingCatalog, setLoadingCatalog] = useState(true); const [loadingProject, setLoadingProject] = useState(false); const [uploading, setUploading] = useState(false); const [error, setError] = useState<string | null>(null);
  const controller = useRef<AbortController | null>(null);

  const loadCatalog = useCallback(async (targetPage = page, targetSearch = search) => {
    setLoadingCatalog(true); setError(null);
    try { setCatalog(await EDAService.list(targetPage, 20, targetSearch)); }
    catch (err) { setError(message(err)); } finally { setLoadingCatalog(false); }
  }, [page, search]);

  useEffect(() => { const timer = window.setTimeout(() => { void loadCatalog(page, search); }, 250); return () => window.clearTimeout(timer); }, [page, search, loadCatalog]);

  const select = useCallback(async (project: EDAProject, previewPage = 1) => {
    controller.current?.abort(); controller.current = new AbortController();
    setSelected(project); setOverview(null); setPreview(null); setProfiles(null); setQuality(null); setLoadingProject(true); setError(null);
    try {
      const [nextOverview, nextPreview] = await Promise.all([EDAService.overview(project.id, { signal: controller.current.signal }), EDAService.preview(project.id, previewPage, 25, { signal: controller.current.signal })]);
      setOverview(nextOverview); setPreview(nextPreview);
    } catch (err) { if ((err as { code?: string }).code !== "ERR_CANCELED") setError(message(err)); }
    finally { setLoadingProject(false); }
  }, []);

  const changePreviewPage = useCallback(async (next: number) => { if (!selected) return; setLoadingProject(true); try { setPreview(await EDAService.preview(selected.id, next, 25)); } catch (err) { setError(message(err)); } finally { setLoadingProject(false); } }, [selected]);
  const loadProfiles = useCallback(async () => { if (!selected || profiles) return; try { setProfiles(await EDAService.profile(selected.id)); } catch (err) { setError(message(err)); } }, [selected, profiles]);
  const loadQuality = useCallback(async () => { if (!selected || quality) return; try { setQuality(await EDAService.quality(selected.id)); } catch (err) { setError(message(err)); } }, [selected, quality]);
  const upload = useCallback(async (file: File) => { setUploading(true); setError(null); try { const project = await EDAService.upload(file); setPage(1); await loadCatalog(1, search); await select(project); } catch (err) { setError(message(err)); throw err; } finally { setUploading(false); } }, [loadCatalog, search, select]);
  const remove = useCallback(async (project: EDAProject) => { try { await EDAService.delete(project.id); if (selected?.id === project.id) { setSelected(null); setOverview(null); setPreview(null); setProfiles(null); setQuality(null); } const nextPage = catalog.items.length === 1 && page > 1 ? page - 1 : page; setPage(nextPage); await loadCatalog(nextPage, search); } catch (err) { setError(message(err)); } }, [catalog.items.length, loadCatalog, page, search, selected]);
  return { catalog, page, setPage, search, setSearch: (value: string) => { setSearch(value); setPage(1); }, selected, overview, preview, profiles, quality, loadingCatalog, loadingProject, uploading, error, setError, loadCatalog, select, changePreviewPage, loadProfiles, loadQuality, upload, remove };
}
