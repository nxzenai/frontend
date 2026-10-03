"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import GenAIService from "@/services/genai.service";
import {
  addComposerAttachment,
  attachmentIdsForMessage,
  preserveComposerAttachmentIds,
  removeComposerAttachment,
  restoreConversationAttachmentIds,
} from "@/lib/genaiAttachmentLifecycle";
import type {
  Attachment, ChatMessage, ConversationSummary, GenAIHealth, Memory, ModelTier,
  Preferences, Project, ProjectInput, ReasoningLevel, StreamEvent, ToolStatus,
} from "@/types/genai";


const now = () => new Date().toISOString();
const supportedPredictionImage = /\.(png|jpe?g|webp|bmp|tiff?)$/i;

type ResolvedTool = {
  tool: string;
  action?: string;
  attachmentIds: string[];
  arguments: Record<string, unknown>;
};

type PendingConfirmation = ResolvedTool & { message: string; query: string; confirmationId: string };

type PendingResolution = ResolvedTool & {
  query: string;
  candidates: Array<Record<string, unknown>>;
  missingFields: string[];
  message?: string;
};

export default function useGenAIChat() {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [tier, setTier] = useState<ModelTier>("auto");
  const [reasoning, setReasoning] = useState<ReasoningLevel>("standard");
  const [projectDocumentsOnly, setProjectDocumentsOnly] = useState(false);
  const [health, setHealth] = useState<GenAIHealth | null>(null);
  const [preferences, setPreferences] = useState<Preferences>({ custom_preferences: {} });
  const [memories, setMemories] = useState<Memory[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [selectedAttachmentIds, updateSelectedAttachmentIds] = useState<string[]>([]);
  const selectedAttachmentIdsRef = useRef<string[]>([]);
  const attachmentScopeRef = useRef(0);
  const attachmentSaveRef = useRef<Promise<void>>(Promise.resolve());
  const setSelectedAttachmentIds = useCallback((value: string[] | ((current: string[]) => string[])) => {
    const next = typeof value === "function" ? value(selectedAttachmentIdsRef.current) : value;
    selectedAttachmentIdsRef.current = next;
    updateSelectedAttachmentIds(next);
  }, []);
  const [tools, setTools] = useState<ToolStatus[]>([]);
  const [routeInfo, setRouteInfo] = useState("");
  const [toolActivity, setToolActivity] = useState("");
  const [pendingConfirmation, setPendingConfirmation] = useState<PendingConfirmation | null>(null);
  const [pendingResolution, setPendingResolution] = useState<PendingResolution | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (error !== "Upload at least two supported test images."
        || pendingResolution?.tool !== "autodl"
        || pendingResolution.arguments.prediction_mode !== "image_batch") return;
    const trainingId = String(pendingResolution.arguments.dataset_attachment_id
      ?? pendingResolution.arguments.training_attachment_id ?? "");
    const count = attachments.filter(file => selectedAttachmentIds.includes(file.id)
      && file.id !== trainingId && supportedPredictionImage.test(file.filename)).length;
    if (count >= 2) setError(null);
  }, [attachments, error, pendingResolution, selectedAttachmentIds]);
  const controllerRef = useRef<AbortController | null>(null);
  const generationRef = useRef<string | null>(null);

  const refreshConversations = useCallback(async () => {
    setConversations(await GenAIService.listConversations());
  }, []);

  useEffect(() => {
    void Promise.all([
      refreshConversations(),
      GenAIService.health().then(setHealth),
      GenAIService.preferences().then(setPreferences),
      GenAIService.memories().then(setMemories),
      GenAIService.projects().then(setProjects),
      GenAIService.tools().then(setTools),
    ]).catch(() => setError("Some assistant settings could not be loaded."));
  }, [refreshConversations]);

  const openConversation = useCallback(async (id: string) => {
    if (isLoading) return;
    attachmentScopeRef.current += 1;
    setError(null);
    const conversation = await GenAIService.getConversation(id);
    setActiveConversationId(id);
    setProjectDocumentsOnly(false);
    setMessages(conversation.messages);
    setTier(conversation.selected_tier);
    setReasoning(conversation.reasoning_level);
    setActiveProjectId(conversation.project_id ?? null);
    setAttachments(await GenAIService.attachments(id));
    setSelectedAttachmentIds([]);
    setRouteInfo(""); setToolActivity(""); setPendingConfirmation(null);
    const pending = conversation.pending_prediction;
    const hasPendingInput = Boolean(pending?.candidates?.length || pending?.missing_fields?.length);
    setPendingResolution(pending && hasPendingInput ? {
      tool: pending.tool, action: pending.action, attachmentIds: pending.attachment_ids ?? [],
      arguments: pending.arguments ?? {}, query: pending.original_action ?? "Continue prediction",
      candidates: pending.candidates ?? [], missingFields: pending.missing_fields ?? [],
      message: pending.prompt,
    } : null);
    const confirmation = conversation.pending_confirmation;
    setSelectedAttachmentIds(restoreConversationAttachmentIds(conversation.active_attachment_ids));
    setPendingConfirmation(confirmation ? {
      tool: confirmation.tool, action: confirmation.action,
      attachmentIds: confirmation.attachment_ids ?? [], arguments: confirmation.arguments ?? {},
      query: pending?.original_action ?? "Continue confirmed action",
      confirmationId: confirmation.id,
      message: confirmation.message ?? `Confirm before allowing ${confirmation.tool.replaceAll("_", " ")} to continue.`,
    } : null);
  }, [isLoading]);

  const newChat = useCallback(() => {
    attachmentScopeRef.current += 1;
    controllerRef.current?.abort();
    setActiveConversationId(null); setMessages([]); setAttachments([]); setSelectedAttachmentIds([]);
    setError(null); setRouteInfo(""); setToolActivity(""); setPendingConfirmation(null); setPendingResolution(null);
  }, []);

  const sendMessage = useCallback(async (
    content: string, regenerate = false, resolvedOverride: ResolvedTool | null = null,
    preserveUser = false, confirmationId?: string,
  ) => {
    const query = content.trim();
    if (!query || isLoading) return;
    const temporaryAssistantId = `stream-${Date.now()}`;
    const userMessage: ChatMessage = { id: `user-${Date.now()}`, role: "user", content: query, created_at: now() };
    setMessages(current => {
      const base = regenerate && current.at(-1)?.role === "assistant" ? current.slice(0, -1) : current;
      return [...base, ...(regenerate || preserveUser ? [] : [userMessage]), { id: temporaryAssistantId, role: "assistant", content: "", created_at: now() }];
    });
    setIsLoading(true); setError(null); setRouteInfo(""); setToolActivity("");
    const controller = new AbortController();
    controllerRef.current = controller;
    let streamedError: string | null = null;
    const trainingAttachmentId = String(pendingResolution?.arguments.dataset_attachment_id
      ?? pendingResolution?.arguments.training_attachment_id ?? "");
    const continuationAttachments = pendingResolution && selectedAttachmentIds.length > 0
      ? selectedAttachmentIds.filter(id => id !== trainingAttachmentId)
      : (pendingResolution?.attachmentIds ?? []).filter(id => id !== trainingAttachmentId);
    const continuationArguments: Record<string, unknown> = pendingResolution ? { ...pendingResolution.arguments } : {};
    if (pendingResolution?.tool === "autodl" && continuationArguments.prediction_mode === "image_batch") {
      delete continuationArguments.attachment_id;
    }
    if (pendingResolution && continuationAttachments.length === 1
      && continuationAttachments[0] !== pendingResolution.attachmentIds[0]) {
      continuationArguments.attachment_id = continuationAttachments[0];
    }
    const continuation = !resolvedOverride && !confirmationId && pendingResolution ? {
      tool: pendingResolution.tool, action: pendingResolution.action,
      attachmentIds: continuationAttachments,
      arguments: continuationArguments,
    } : null;
    // The backend is the sole authority for initial intent/lab routing.  The
    // frontend supplies a tool only for a server-issued continuation or an
    // explicit resource-selection callback.
    const resolved = resolvedOverride ?? continuation;
    const messageAttachmentIds = attachmentIdsForMessage(
      resolved?.attachmentIds ?? selectedAttachmentIds,
    );
    if (continuation) setPendingResolution(null);
    try {
      await GenAIService.streamChat({
        conversation_id: activeConversationId, message: query, tier, reasoning, regenerate,
        tools: resolved ? [resolved.tool] : [], attachment_ids: messageAttachmentIds,
        project_id: activeProjectId, confirmation_id: confirmationId,
        use_project_documents_only: projectDocumentsOnly && !pendingResolution && !pendingConfirmation,
        tool_arguments: resolved ? { [resolved.tool]: resolved.arguments } : {},
      }, (event: StreamEvent) => {
        if (event.type === "metadata") {
          generationRef.current = event.generation_id;
          setActiveConversationId(event.conversation_id);
          setRouteInfo(`${event.model_tier.toUpperCase()} · ${event.model_name} — ${event.route_reason}`);
        } else if (event.type === "tool") {
          setToolActivity(`${event.tool.replaceAll("_", " ")}: ${event.status}${event.message ? ` — ${event.message}` : ""}`);
        } else if (event.type === "confirmation_required") {
          if (event.conversation_id) setActiveConversationId(event.conversation_id);
          setPendingConfirmation({
            tool: event.tool, action: event.action, message: event.message, query,
            confirmationId: event.confirmation_id,
            attachmentIds: event.attachment_ids, arguments: event.arguments,
          });
          streamedError = event.message;
        } else if (event.type === "delta") {
          setMessages(current => current.map(message => message.id === temporaryAssistantId
            ? { ...message, content: message.content + event.content } : message));
        } else if (event.type === "done" && event.message) {
          setSelectedAttachmentIds(current => preserveComposerAttachmentIds(current));
          const offer = event.message.metadata?.pending_prediction_offer as {
            tool: string; action: string; arguments: Record<string, unknown>;
            attachment_ids: string[]; missing_fields: string[];
            candidates: Array<Record<string, unknown>>; prompt: string; original_action: string;
          } | undefined;
          setPendingResolution(offer ? {
            tool: offer.tool, action: offer.action, arguments: offer.arguments,
            attachmentIds: offer.attachment_ids, missingFields: offer.missing_fields,
            candidates: offer.candidates, message: offer.prompt, query: offer.original_action,
          } : null);
          setPendingConfirmation(null);
          setMessages(current => current.map(message => message.id === temporaryAssistantId ? event.message! : message));
        } else if (event.type === "error") {
          setSelectedAttachmentIds(current => preserveComposerAttachmentIds(current));
          setToolActivity("");
          streamedError = event.message;
          setError(event.message);
          if (event.details?.conversation_id) setActiveConversationId(event.details.conversation_id);
          if (event.details?.resume) {
            setPendingResolution({
              tool: event.details.resume.tool, action: event.details.resume.action,
              attachmentIds: event.details.resume.attachment_ids,
              arguments: event.details.resume.arguments, query: event.details.resume.query,
              candidates: event.details.candidates ?? [], missingFields: event.details.missing_fields ?? [],
              message: event.details.prompt,
            });
          } else if (resolved && ["automl", "autonlp", "autodl"].includes(resolved.tool)) {
            setPendingResolution(null);
            setPendingConfirmation(null);
          }
        }
      }, controller.signal);
      if (!streamedError) await refreshConversations();
    } catch (reason: unknown) {
      if (!(reason instanceof DOMException && reason.name === "AbortError")) {
        setError(reason instanceof Error ? reason.message : "The assistant could not generate a response.");
      }
    } finally {
      controllerRef.current = null; generationRef.current = null; setIsLoading(false);
      setMessages(current => current.filter(message => message.id !== temporaryAssistantId || message.content));
    }
  }, [activeConversationId, activeProjectId, isLoading, pendingResolution, pendingConfirmation, projectDocumentsOnly, reasoning, refreshConversations, selectedAttachmentIds, tier]);

  const stopGeneration = useCallback(async () => {
    const generationId = generationRef.current;
    controllerRef.current?.abort();
    if (generationId) await GenAIService.cancelGeneration(generationId).catch(() => undefined);
    setIsLoading(false);
  }, []);

  const regenerate = useCallback(async () => {
    const lastUser = [...messages].reverse().find(message => message.role === "user");
    if (lastUser) await sendMessage(lastUser.content, true);
  }, [messages, sendMessage]);

  const renameConversation = useCallback(async (id: string, title: string) => {
    await GenAIService.renameConversation(id, title); await refreshConversations();
  }, [refreshConversations]);

  const deleteConversation = useCallback(async (id: string) => {
    await GenAIService.deleteConversation(id);
    if (activeConversationId === id) newChat();
    await refreshConversations();
  }, [activeConversationId, newChat, refreshConversations]);

  const savePreferences = useCallback(async (values: Preferences) => setPreferences(await GenAIService.savePreferences(values)), []);
  const addMemory = useCallback(async (content: string) => {
    const memory = await GenAIService.createMemory(content);
    setMemories(current => [memory, ...current]);
  }, []);
  const deleteMemory = useCallback(async (id: string) => {
    await GenAIService.deleteMemory(id); setMemories(current => current.filter(memory => memory.id !== id));
  }, []);

  const selectProject = useCallback(async (projectId: string | null) => {
    attachmentScopeRef.current += 1;
    setProjectDocumentsOnly(false);
    if (activeConversationId) await GenAIService.setConversationProject(activeConversationId, projectId);
    setActiveProjectId(projectId);
    setAttachments(activeConversationId || projectId ? await GenAIService.attachments(activeConversationId, projectId) : []);
    setSelectedAttachmentIds([]);
  }, [activeConversationId]);

  const createProject = useCallback(async (values: ProjectInput) => {
    const project = await GenAIService.createProject(values);
    setProjects(current => [project, ...current]);
    await selectProject(project.id);
  }, [selectProject]);

  const deleteProject = useCallback(async (id: string) => {
    await GenAIService.deleteProject(id);
    setProjects(current => current.filter(project => project.id !== id));
    if (activeProjectId === id) await selectProject(null);
  }, [activeProjectId, selectProject]);

  const uploadAttachment = useCallback(async (file: File) => {
    const scope = attachmentScopeRef.current;
    setError(null); setToolActivity(`Reading ${file.name}…`);
    try {
      const attachment = await GenAIService.uploadAttachment(file, activeConversationId, activeProjectId);
      if (scope !== attachmentScopeRef.current) return;
      setSelectedAttachmentIds(current => pendingResolution?.action === "predict"
        && pendingResolution.arguments.prediction_mode === "image_batch"
        && supportedPredictionImage.test(file.name)
        ? addComposerAttachment(current, attachment.id)
        : (pendingResolution?.action === "prediction_mode" || pendingResolution?.action === "predict"
          && pendingResolution.arguments.prediction_mode === "csv")
          && file.name.toLowerCase().endsWith(".csv")
          ? addComposerAttachment(current, attachment.id)
        : (pendingResolution?.action === "prediction_mode" || pendingResolution?.action === "predict"
          && pendingResolution.arguments.prediction_mode === "image")
          && supportedPredictionImage.test(file.name)
          ? [attachment.id] : addComposerAttachment(current, attachment.id));
      setAttachments(current => [...current.filter(item => item.id !== attachment.id), attachment]);
      if (pendingResolution?.tool === "automl" && pendingResolution.action === "predict"
          && pendingResolution.arguments.prediction_mode === "csv" && file.name.toLowerCase().endsWith(".csv")) {
        setPendingResolution(current => current && current.tool === "automl" && current.action === "predict" ? {
          ...current, attachmentIds: [attachment.id],
          arguments: { ...current.arguments, prediction_mode: "csv", attachment_id: attachment.id,
            prediction_attachment_id: attachment.id },
        } : current);
      }
      if (activeConversationId) {
        const save = attachmentSaveRef.current.catch(() => undefined).then(async () => {
          if (scope === attachmentScopeRef.current) {
            await GenAIService.setActiveAttachments(activeConversationId, selectedAttachmentIdsRef.current);
          }
        });
        attachmentSaveRef.current = save;
        await save;
      }
      setToolActivity(`${file.name} is ready.`);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The file could not be attached."); setToolActivity("");
    }
  }, [activeConversationId, activeProjectId, pendingResolution, setSelectedAttachmentIds]);

  const deleteAttachment = useCallback(async (id: string) => {
    const nextSelection = removeComposerAttachment(selectedAttachmentIds, id);
    if (activeConversationId) await GenAIService.setActiveAttachments(activeConversationId, nextSelection);
    try {
      await GenAIService.deleteAttachment(id);
    } catch (reason) {
      if (activeConversationId) {
        await GenAIService.setActiveAttachments(activeConversationId, selectedAttachmentIds).catch(() => undefined);
      }
      throw reason;
    }
    setAttachments(current => current.filter(item => item.id !== id));
    setSelectedAttachmentIds(nextSelection);
  }, [activeConversationId, selectedAttachmentIds]);

  const toggleAttachment = useCallback((id: string) => {
    const nextSelection = selectedAttachmentIds.includes(id)
      ? removeComposerAttachment(selectedAttachmentIds, id)
      : pendingResolution?.tool === "autodl" && pendingResolution.arguments.prediction_mode === "image_batch"
        ? addComposerAttachment(selectedAttachmentIds, id)
        : pendingResolution ? [id] : addComposerAttachment(selectedAttachmentIds, id);
    setSelectedAttachmentIds(nextSelection);
    if (activeConversationId) {
      void GenAIService.setActiveAttachments(activeConversationId, nextSelection).catch(
        reason => {
          setSelectedAttachmentIds(selectedAttachmentIds);
          setError(reason instanceof Error ? reason.message : "Attachment selection could not be saved.");
        },
      );
    }
  }, [activeConversationId, pendingResolution, selectedAttachmentIds]);

  const confirmTool = useCallback(async () => {
    const pending = pendingConfirmation;
    if (!pending) return;
    setPendingConfirmation(null);
    await sendMessage(pending.query, false, null, true, pending.confirmationId);
  }, [pendingConfirmation, sendMessage]);

  const choosePredictionResource = useCallback(async (candidate: Record<string, unknown>) => {
    const pending = pendingResolution;
    if (!pending) return;
    const identifiers = ["model_filename", "model_id", "run_id", "attachment_id", "target_column", "target_confirmed_by_user", "target_detection_source", "target_detection_confidence"];
    const selected = Object.fromEntries(identifiers.filter(key => candidate[key]).map(key => [key, candidate[key]]));
    setPendingResolution(null); setError(null);
    await sendMessage(selected.target_column ? `target_column: ${selected.target_column}` : pending.query, false, {
      tool: pending.tool, action: pending.action,
      attachmentIds: selected.attachment_id ? [String(selected.attachment_id)] : pending.attachmentIds,
      arguments: { ...pending.arguments, ...selected },
    }, true);
  }, [pendingResolution, sendMessage]);

  const cancelPendingPrediction = useCallback(async () => {
    setPendingResolution(null); setPendingConfirmation(null); setError(null);
    await sendMessage("cancel");
  }, [sendMessage]);

  return {
    conversations, activeConversationId, messages, tier, setTier, reasoning, setReasoning,
    projectDocumentsOnly, setProjectDocumentsOnly,
    health, preferences, memories, projects, activeProjectId, attachments, selectedAttachmentIds, tools,
    routeInfo, toolActivity, pendingConfirmation, pendingResolution, isLoading, error,
    newChat, openConversation, sendMessage, stopGeneration, regenerate,
    renameConversation, deleteConversation, savePreferences, addMemory, deleteMemory,
    selectProject, createProject, deleteProject, uploadAttachment, deleteAttachment, toggleAttachment,
    confirmTool,
    dismissConfirmation: () => {
      void cancelPendingPrediction();
    },
    choosePredictionResource,
    dismissResolution: () => void cancelPendingPrediction(),
  };
}
