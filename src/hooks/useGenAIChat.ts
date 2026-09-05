"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import GenAIService from "@/services/genai.service";
import type {
  Attachment, ChatMessage, ConversationSummary, GenAIHealth, Memory, ModelTier,
  Preferences, Project, ProjectInput, ReasoningLevel, StreamEvent, ToolStatus,
} from "@/types/genai";


const now = () => new Date().toISOString();

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

function resolveToolRequest(query: string, attachmentIds: string[]): ResolvedTool | null {
  let tool = "";
  if (/\b(python lab|inspect (?:my )?notebook|notebook cells?|run (?:this )?(?:python|cell)|execute (?:this )?(?:python|cell))\b/i.test(query)) tool = "python_lab";
  else if (/\b(sql lab|database schema|run (?:this )?(?:sql|query)|execute (?:this )?(?:sql|query)|query (?:my|the) database)\b/i.test(query)) tool = "sql_lab";
  else if (/\b(autonlp|natural language processing|text classification|sentiment(?: analysis)?|intent(?: classification)?|spam(?: classification)?)\b/i.test(query)) tool = "autonlp";
  else if (/\b(autodl|deep learning|image classification|time[- ]series neural)\b/i.test(query)) tool = "autodl";
  else if (/\b(automl|machine learning|clustering)\b/i.test(query)) tool = "automl";
  else if (/\b(eda|exploratory data analysis|data quality|data profiling)\b/i.test(query)) tool = "eda";
  if (!tool && (/\btrain\b/i.test(query) || (/\b(retrain|build|create|fit)\b/i.test(query) && /\bmodel\b/i.test(query)))) {
    if (/\b(sentiment|intent|spam|text\s+classif)\b/i.test(query)) tool = "autonlp";
    else if (/\b(deep learning|neural|image\s+classif\w*|time[- ]series|tabular\s+(?:classif\w*|regress\w*))\b/i.test(query)) tool = "autodl";
    else if (/\b(churn|classif|regress|cluster|machine learning)\b/i.test(query)) tool = "automl";
  }
  if (!tool) return null;

  const trainingIntent = /\b(train|retrain)\b/i.test(query)
    || (/\b(build|create|fit)\b/i.test(query) && /\bmodel\b/i.test(query));
  const predictionIntent = /\bpredict(?:ion)?\b/i.test(query);
  if (trainingIntent && predictionIntent) {
    return { tool, action: "ambiguous", attachmentIds, arguments: { action: "ambiguous" } };
  }

  const actionRules: Record<string, Array<[RegExp, string]>> = {
    python_lab: [[/\b(execute|run)\b/i, "execute"], [/\b(inspect|notebook|cells?)\b/i, "inspect"], [/\bstatus\b/i, "status"], [/\bruntime\b/i, "runtime"]],
    sql_lab: [[/\bschema\b/i, "schema"], [/\bstatistics\b/i, "statistics"], [/\b(execute|run|query|select|with|explain|insert|update|delete|create|alter|drop|truncate)\b/i, "query"]],
    eda: [[/\btransform/i, "transform"], [/\breport\b/i, "report"], [/\bquality\b/i, "quality"], [/\bprofile\b/i, "profile"], [/\bpreview\b/i, "preview"], [/\boverview\b/i, "overview"], [/\b(upload|import)\b/i, "import"], [/\b(analy[sz]e|perform)\b/i, "analyze"], [/\blist\b/i, "list"]],
    automl: [[/\bpredict\b/i, "predict"], [/\b(train|retrain|build|create|fit)\b/i, "train"], [/\bpreview\b/i, "preview"], [/\b(inspect|analy[sz]e)\b/i, "inspect"], [/\bmodel\b/i, "models"]],
    autonlp: [[/\bpredict\b/i, "predict"], [/\b(train|retrain|build|create|fit)\b/i, "train"], [/\b(inspect|analy[sz]e)\b/i, "inspect"], [/\bmonitor/i, "monitoring"], [/\bmodel\b/i, "models"]],
    autodl: [[/\bpredict\b/i, "predict"], [/\bresults?\b/i, "result"], [/\b(status|progress|ready|latest|last)\b/i, "status"], [/\bcancel\b/i, "cancel"], [/\b(train|retrain|build|create|fit)\b/i, "train"], [/\b(inspect|analy[sz]e)\b/i, "inspection"], [/\breadiness\b/i, "readiness"], [/\bmodel\b/i, "models"]],
  };
  const nlpPredictionIntent = tool === "autonlp" && !trainingIntent
    && /\b(sentiment|intent|spam)\b/i.test(query)
    && /\b(analy[sz]e|classif(?:y|ication)|predict)\b/i.test(query);
  const action = nlpPredictionIntent
    ? "predict"
    : actionRules[tool]?.find(([pattern]) => pattern.test(query))?.[1];
  if (!action) return null;
  const args: Record<string, unknown> = {};
  if (action) args.action = action;
  if (attachmentIds.length === 1) args.attachment_id = attachmentIds[0];
  for (const key of ["notebook_id", "cell_id", "project_id", "eda_id", "run_id", "model_id", "model_filename"] as const) {
    const value = query.match(new RegExp(`\\b${key}\\s*[:=]\\s*([A-Za-z0-9._-]{1,200})`, "i"))?.[1];
    if (value) args[key] = value;
  }
  for (const key of ["text_column", "target_column", "task", "confirmed_task", "confirmed_target", "confirmed_timestamp"] as const) {
    const match = query.match(new RegExp(`\\b${key}\\s*[:=]\\s*(?:"([^"]+)"|'([^']+)'|([^,;\\s]+))`, "i"));
    const value = match?.slice(1).find(Boolean);
    if (value) args[key] = value;
  }
  const jsonBlock = query.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/i)?.[1];
  if (jsonBlock) {
    try { Object.assign(args, JSON.parse(jsonBlock) as Record<string, unknown>); } catch { /* backend returns a clear missing-input error */ }
  }
  if (tool === "sql_lab" && action === "query" && !args.query) {
    const sql = query.match(/```(?:sql)?\s*([\s\S]*?)```/i)?.[1]?.trim();
    const inline = query.match(/\b((?:select|with|explain|insert|update|delete|create|alter|drop|truncate)\b[\s\S]*)$/i)?.[1]?.trim();
    if (sql || inline) args.query = sql || inline;
  }
  return { tool, action, attachmentIds, arguments: args };
}


export default function useGenAIChat() {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [tier, setTier] = useState<ModelTier>("auto");
  const [reasoning, setReasoning] = useState<ReasoningLevel>("standard");
  const [health, setHealth] = useState<GenAIHealth | null>(null);
  const [preferences, setPreferences] = useState<Preferences>({ custom_preferences: {} });
  const [memories, setMemories] = useState<Memory[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [selectedAttachmentIds, setSelectedAttachmentIds] = useState<string[]>([]);
  const [tools, setTools] = useState<ToolStatus[]>([]);
  const [routeInfo, setRouteInfo] = useState("");
  const [toolActivity, setToolActivity] = useState("");
  const [pendingConfirmation, setPendingConfirmation] = useState<PendingConfirmation | null>(null);
  const [pendingResolution, setPendingResolution] = useState<PendingResolution | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
    setError(null);
    const conversation = await GenAIService.getConversation(id);
    setActiveConversationId(id);
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
    setSelectedAttachmentIds(
      pending?.attachment_ids ?? confirmation?.attachment_ids ?? [],
    );
    setPendingConfirmation(confirmation ? {
      tool: confirmation.tool, action: confirmation.action,
      attachmentIds: confirmation.attachment_ids ?? [], arguments: confirmation.arguments ?? {},
      query: pending?.original_action ?? "Continue confirmed action",
      confirmationId: confirmation.id,
      message: `Confirm before allowing ${confirmation.tool.replaceAll("_", " ")} to continue.`,
    } : null);
  }, [isLoading]);

  const newChat = useCallback(() => {
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
    let completed = false;
    const continuationAttachments = pendingResolution && selectedAttachmentIds.length > 0
      ? selectedAttachmentIds : pendingResolution?.attachmentIds ?? [];
    const continuationArguments: Record<string, unknown> = pendingResolution ? { ...pendingResolution.arguments } : {};
    if (pendingResolution && continuationAttachments.length === 1
      && continuationAttachments[0] !== pendingResolution.attachmentIds[0]) {
      continuationArguments.attachment_id = continuationAttachments[0];
    }
    const continuation = !resolvedOverride && !confirmationId && pendingResolution ? {
      tool: pendingResolution.tool, action: pendingResolution.action,
      attachmentIds: continuationAttachments,
      arguments: continuationArguments,
    } : null;
    const resolved = resolvedOverride ?? continuation ?? resolveToolRequest(query, selectedAttachmentIds);
    const messageAttachmentIds = resolved?.attachmentIds ?? selectedAttachmentIds;
    if (continuation) setPendingResolution(null);
    try {
      await GenAIService.streamChat({
        conversation_id: activeConversationId, message: query, tier, reasoning, regenerate,
        tools: resolved ? [resolved.tool] : [], attachment_ids: messageAttachmentIds,
        project_id: activeProjectId, confirmation_id: confirmationId,
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
          completed = true;
          setPendingResolution(null);
          setPendingConfirmation(null);
          setMessages(current => current.map(message => message.id === temporaryAssistantId ? event.message! : message));
        } else if (event.type === "error") {
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
            setSelectedAttachmentIds([]);
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
      if (completed) setSelectedAttachmentIds([]);
      setMessages(current => current.filter(message => message.id !== temporaryAssistantId || message.content));
    }
  }, [activeConversationId, activeProjectId, isLoading, pendingResolution, reasoning, refreshConversations, selectedAttachmentIds, tier]);

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
    setError(null); setToolActivity(`Reading ${file.name}…`);
    try {
      const attachment = await GenAIService.uploadAttachment(file, activeConversationId, activeProjectId);
      setAttachments(current => [...current.filter(item => item.id !== attachment.id), attachment]);
      setSelectedAttachmentIds(current => [...new Set([...current, attachment.id])]);
      setToolActivity(`${file.name} is ready.`);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The file could not be attached."); setToolActivity("");
    }
  }, [activeConversationId, activeProjectId]);

  const deleteAttachment = useCallback(async (id: string) => {
    await GenAIService.deleteAttachment(id); setAttachments(current => current.filter(item => item.id !== id));
    setSelectedAttachmentIds(current => current.filter(item => item !== id));
  }, []);

  const toggleAttachment = useCallback((id: string) => {
    setSelectedAttachmentIds(current => current.includes(id)
      ? current.filter(item => item !== id)
      : pendingResolution ? [id] : [...current, id]);
  }, [pendingResolution]);

  const confirmTool = useCallback(async () => {
    const pending = pendingConfirmation;
    if (!pending) return;
    setPendingConfirmation(null);
    await sendMessage(pending.query, false, null, true, pending.confirmationId);
  }, [pendingConfirmation, sendMessage]);

  const choosePredictionResource = useCallback(async (candidate: Record<string, unknown>) => {
    const pending = pendingResolution;
    if (!pending) return;
    const identifiers = ["model_filename", "model_id", "run_id", "attachment_id"];
    const selected = Object.fromEntries(identifiers.filter(key => candidate[key]).map(key => [key, candidate[key]]));
    setPendingResolution(null); setError(null);
    await sendMessage(pending.query, false, {
      tool: pending.tool, action: pending.action, attachmentIds: pending.attachmentIds,
      arguments: { ...pending.arguments, ...selected },
    }, true);
  }, [pendingResolution, sendMessage]);

  const cancelPendingPrediction = useCallback(async () => {
    setPendingResolution(null); setPendingConfirmation(null); setError(null);
    await sendMessage("cancel");
  }, [sendMessage]);

  return {
    conversations, activeConversationId, messages, tier, setTier, reasoning, setReasoning,
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
