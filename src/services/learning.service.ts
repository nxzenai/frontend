import { api } from "@/lib/api";
import notebookService from "@/services/notebook.service";
import type { CapstoneLifecycle, InterviewSession, LearningAssessment, LearningBusinessReport, LearningCase, LearningDashboard, LearningExperiment, LearningModelCard, LearningPath, LearningTopic, TopicProgress } from "@/types/learning";

const root = "/api/v1/learning";
export const learningService = {
  paths: async () => (await api.get<LearningPath[]>(`${root}/paths`)).data,
  path: async (module: string) => (await api.get<LearningPath>(`${root}/paths/${encodeURIComponent(module)}`)).data,
  topic: async (module: string, id: string) => (await api.get<LearningTopic>(`${root}/paths/${encodeURIComponent(module)}/topics/${encodeURIComponent(id)}`)).data,
  journey: async (topic_id: string) => (await api.get<import("@/types/learning").TopicJourney>(`${root}/topics/${encodeURIComponent(topic_id)}/journey`)).data,
  saveReflection: async (topic_id: string, response: string) => (await api.post<{ feedback: string }>(`${root}/topics/${encodeURIComponent(topic_id)}/reflection`, { response })).data,
  tutor: async (topic_id: string, question: string) => (await api.post<{ answer: string; status: string; active_exercise?: boolean }>(`${root}/topics/${encodeURIComponent(topic_id)}/tutor`, { question })).data,
  progress: async () => (await api.get<Record<string, TopicProgress>>(`${root}/progress`)).data,
  startTopic: async (topic_id: string) => (await api.post(`${root}/progress`, { topic_id })).data,
  capstone: async (topic_id: string) => (await api.get<CapstoneLifecycle>(`${root}/capstones/${encodeURIComponent(topic_id)}`)).data,
  modelCard: async (topic_id: string) => (await api.get<LearningModelCard>(`${root}/capstones/${encodeURIComponent(topic_id)}/model-card`)).data,
  businessReport: async (topic_id: string) => (await api.get<LearningBusinessReport>(`${root}/capstones/${encodeURIComponent(topic_id)}/report`)).data,
  experiments: async (topic_id: string) => (await api.get<LearningExperiment[]>(`${root}/capstones/${encodeURIComponent(topic_id)}/experiments`)).data,
  downloadModelPackage: async (topic_id: string) => (await api.get<Blob>(`${root}/capstones/${encodeURIComponent(topic_id)}/model-package`, { responseType: "blob" })).data,
  completeCapstoneStage: async (topic_id: string, stage_id: string, payload: { draft?: boolean; choice?: string; metric?: string; response?: string; reference?: string }) =>
    (await api.post<CapstoneLifecycle>(`${root}/capstones/${encodeURIComponent(topic_id)}/stages/${encodeURIComponent(stage_id)}`, payload)).data,
  answer: async (topic_id: string, answer_index: number) => (await api.post(`${root}/attempts`, { topic_id, answer_index, activity_type: "mcq" })).data,
  checkActivity: async (topic_id: string, kind: "concept" | "reasoning" | "quiz" | "code_reading", answer_index: number, explanation = "") =>
    (await api.post(`${root}/activities/check`, { topic_id, kind, answer_index, explanation })).data,
  labAttempt: async (topic_id: string, activity_type: string, lab_reference: string, text: string) => (await api.post(`${root}/attempts`, { topic_id, activity_type, lab_reference, text })).data,
  createPythonChallenge: async (title: string, objective: string, starterCode = "# Write your solution here\n") => {
    const notebook = await notebookService.create({ title: `Practice: ${title}`, description: objective, visibility: "private", tags: ["learning-practice"] }) as { id: string };
    await api.post(`/api/v1/notebooks/${encodeURIComponent(notebook.id)}/cells`, { cell_type: "markdown", source: `# ${title}\n\n${objective}\n\nWrite code below, run it, and explain your result.` });
    await api.post(`/api/v1/notebooks/${encodeURIComponent(notebook.id)}/cells`, { cell_type: "code", source: starterCode });
    return notebook.id;
  },
  notebookCode: async (id: string) => {
    const response = await api.get<{ data: Array<{ cell_type: string; source: string }> }>(`/api/v1/notebooks/${encodeURIComponent(id)}/cells`);
    return response.data.data.filter((cell) => cell.cell_type === "code").map((cell) => cell.source).join("\n\n");
  },
  dashboard: async () => (await api.get<LearningDashboard>(`${root}/dashboard`)).data,
  cases: async () => (await api.get<LearningCase[]>(`${root}/case-studies`)).data,
  assessments: async (module?: string) => (await api.get<LearningAssessment[]>(`${root}/assessments`, { params: module ? { module } : {} })).data,
  submitAssessment: async (activity_id: string, selected_indices: number[]) => (await api.post(`${root}/assessments`, { activity_id, selected_indices })).data,
  caseProgress: async (id: string, completed_steps: string[], lab_references: string[]) => (await api.post(`${root}/case-studies/${encodeURIComponent(id)}/progress`, { completed_steps, lab_references })).data,
  verifyCase: async (id: string, attempt_id: string) => (await api.post(`${root}/case-studies/${encodeURIComponent(id)}/verify`, { attempt_id })).data,
  attempts: async () => (await api.get<Array<{ id: string; evidence_type?: string; verified?: boolean; combined_score?: number; source_reference?: string; topic_id: string; task_type?: string; target_column?: string }>>(`${root}/attempts`)).data,
  interviewStart: async (module: string, mode: "practice" | "mock", question_count: number, level: number, target_role: string, topic_id?: string, question_type?: string) =>
    (await api.post<InterviewSession>(`${root}/interviews`, { module, mode, question_count, level, target_role, topic_id, question_type })).data,
  interviewQuestion: async (id: string) => (await api.post<InterviewSession>(`${root}/interviews/${encodeURIComponent(id)}/question`)).data,
  interviewAnswer: async (id: string, answer: string) => (await api.post<{ answer?: InterviewSession["answers"][number]; session?: InterviewSession; status?: string; message?: string }>(`${root}/interviews/${encodeURIComponent(id)}/answer`, { answer })).data,
  interviewRetry: async (id: string) => (await api.post<InterviewSession>(`${root}/interviews/${encodeURIComponent(id)}/retry`)).data,
  interview: async (id: string) => (await api.get<InterviewSession>(`${root}/interviews/${encodeURIComponent(id)}`)).data,
  interviewHistory: async () => (await api.get<InterviewSession[]>(`${root}/interviews/history`)).data,
  readiness: async () => (await api.get<Record<string, { score: number; sessions: number; competencies: Record<string, number>; weakest_competency: string | null }>>(`${root}/interview-readiness`)).data,
  faculty: async () => (await api.get<{ learner_count: number; module_averages: Record<string, number>; interview_readiness: number | null; assessment_average: number | null; assessment_participation?: number; common_weak_topics: string[] }>(`${root}/faculty/overview`)).data,
  pendingReviews: async () => (await api.get<Array<{ id: string; owner_id?: string; topic_id: string; activity_type: string; lab_reference: string; response: string; created_at: string }>>(`${root}/faculty/reviews`)).data,
  review: async (id: string, category: "coding" | "practical", score: number, feedback: string) => (await api.post(`${root}/faculty/reviews/${encodeURIComponent(id)}`, { category, score, feedback })).data,
  pythonChallenge: async (id: string) => (await api.get<{ topic_id: string; instruction: string; starter_code: string; score: number; max_attempts: number }>(`${root}/python-challenges/${encodeURIComponent(id)}`)).data,
  submitPython: async (id: string, code: string) => (await api.post<
    { grading_available: false; reason: string } |
    { grading_available: true; passed: number; total: number; verified_score: number; execution_success: boolean; attempt: { feedback: string } }
  >(`${root}/python-challenges/${encodeURIComponent(id)}/submit`, { code })).data,
  sqlChallenge: async (id: string) => (await api.get<{ topic_id: string; instruction: string; starter_query: string; fixture_schema: string; order_sensitive: boolean; score: number; max_attempts: number }>(`${root}/sql-challenges/${encodeURIComponent(id)}`)).data,
  submitSQL: async (id: string, query: string) => (await api.post<{ passed: boolean; verified_score: number; feedback: string }>(`${root}/sql-challenges/${encodeURIComponent(id)}/submit`, { query })).data,
  verifyAutoML: async (topic_id: string, filename: string) => (await api.post(`${root}/automl-evidence`, { topic_id, filename })).data,
  evidenceOptions: async (module: string, topic_id?: string) => (await api.get<Array<{ id: string; label: string; task?: string }>>(`${root}/evidence/options`, { params: { module, topic_id } })).data,
  verifyEvidence: async (topic_id: string, reference_id: string) => (await api.post(`${root}/evidence/verify`, { topic_id, reference_id })).data,
  referenceOptions: async (type: string) => (await api.get<Array<{ id: string; label: string }>>(`${root}/faculty/reference-options`, { params: { type } })).data,
  batches: async () => (await api.get<Array<{ id: string; label: string }>>(`${root}/faculty/batches`)).data,
  assignments: async () => (await api.get<Array<{ id: string; title: string; type: string; reference_id: string; due_date?: string | null; status: string }>>(`${root}/assignments`)).data,
  assign: async (payload: { title: string; type: string; reference_id: string; batch_id?: string; due_date?: string }) => (await api.post(`${root}/assignments`, payload)).data,
  cohortSummary: async (batch_id?: string) => (await api.get<{ learner_count: number; average_overall_mastery: number; module_averages: Record<string, number>; foundation_mastery?: Record<string, number>; capstone_completion?: Record<string, { completed: number; possible: number }>; capstone_lifecycle?: Record<string, { assigned: number; started: number; completed: number; average_completion_percent: number; most_incomplete_stage: string | null }>; assessment_completion: number | null; assessment_participation: number; assignment_completion: { assigned: number; completed: number; overdue: number }; interview_readiness_average: number | null; skill_distribution: Record<string, number>; common_weak_topics: string[]; learners_needing_attention: number; attention_list: Array<{ learner_id: string; learner_name: string; mastery: number; weak_topics: string[] }> }>(`${root}/faculty/cohort-summary`, { params: batch_id ? { batch_id } : {} })).data,
};
