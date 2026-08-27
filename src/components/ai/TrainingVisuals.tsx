"use client";

import {
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";


export function TrainingCurves({ history, showAccuracy = true }: { history?: {
    train_loss?: number[];
    validation_loss?: number[];
    train_accuracy?: number[];
    validation_accuracy?: number[];
} | null; showAccuracy?: boolean }) {
    const hasLoss = Boolean(history?.train_loss?.length || history?.validation_loss?.length);
    const hasAccuracy = Boolean(
        showAccuracy && (history?.train_accuracy?.length || history?.validation_accuracy?.length)
    );
    const length = Math.max(
        history?.train_loss?.length ?? 0,
        history?.validation_loss?.length ?? 0,
        showAccuracy ? history?.train_accuracy?.length ?? 0 : 0,
        showAccuracy ? history?.validation_accuracy?.length ?? 0 : 0,
    );
    if (!length) return null;
    const data = Array.from({ length }, (_, index) => ({
        epoch: index + 1,
        trainLoss: history?.train_loss?.[index],
        validationLoss: history?.validation_loss?.[index],
        trainAccuracy: history?.train_accuracy?.[index],
        validationAccuracy: history?.validation_accuracy?.[index],
    }));

    return (
        <div className="grid gap-5 xl:grid-cols-2">
            {hasLoss && <Curve title="Loss by Epoch" data={data} keys={[
                ["trainLoss", "Train loss", "#818cf8"],
                ["validationLoss", "Validation loss", "#f59e0b"],
            ]} />}
            {hasAccuracy && <Curve title="Accuracy by Epoch" data={data} keys={[
                ["trainAccuracy", "Train accuracy", "#34d399"],
                ["validationAccuracy", "Validation accuracy", "#60a5fa"],
            ]} />}
        </div>
    );
}


function Curve({ title, data, keys }: {
    title: string;
    data: Record<string, number | undefined>[];
    keys: [string, string, string][];
}) {
    return (
        <div className="rounded-xl border border-slate-700 bg-slate-950 p-4">
            <h3 className="mb-4 font-semibold text-white">{title}</h3>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="epoch" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip contentStyle={{ background: "#0f172a", borderColor: "#334155" }} />
                        <Legend />
                        {keys.map(([key, label, color]) => (
                            <Line key={key} dataKey={key} name={label} stroke={color} dot={false} />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}


export function ConfusionMatrixView({ labels, matrix }: {
    labels?: string[];
    matrix?: number[][];
}) {
    if (!labels?.length || !matrix?.length) return null;
    return (
        <div className="overflow-x-auto rounded-xl border border-slate-700 bg-slate-950 p-4">
            <h3 className="mb-4 font-semibold text-white">Confusion Matrix</h3>
            <table className="min-w-full text-center text-sm">
                <thead><tr><th className="p-2 text-slate-500">Actual \ Predicted</th>{labels.map(label => <th key={label} className="p-2 text-slate-300">{label}</th>)}</tr></thead>
                <tbody>{matrix.map((row, rowIndex) => (
                    <tr key={labels[rowIndex] ?? rowIndex}>
                        <th className="p-2 text-left text-slate-300">{labels[rowIndex] ?? rowIndex}</th>
                        {row.map((value, columnIndex) => <td key={columnIndex} className="border border-slate-800 p-3 text-white">{value}</td>)}
                    </tr>
                ))}</tbody>
            </table>
        </div>
    );
}


export function ClassMetricsChart({ metrics }: { metrics?: Array<{
    label?: string | null;
    precision: number;
    recall: number;
    f1_score: number;
}> }) {
    if (!metrics?.length) return null;
    const data = metrics.map(item => ({
        label: item.label ?? "Unknown",
        precision: item.precision,
        recall: item.recall,
        f1: item.f1_score,
    }));
    return (
        <div className="h-80 rounded-xl border border-slate-700 bg-slate-950 p-4">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="label" stroke="#94a3b8" />
                    <YAxis domain={[0, 1]} stroke="#94a3b8" />
                    <Tooltip contentStyle={{ background: "#0f172a", borderColor: "#334155" }} />
                    <Legend />
                    <Bar dataKey="precision" fill="#818cf8" />
                    <Bar dataKey="recall" fill="#34d399" />
                    <Bar dataKey="f1" fill="#f59e0b" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}


export function RocCurveView({ curve, auc }: {
    curve?: { false_positive_rate: number[]; true_positive_rate: number[] } | null;
    auc?: number | null;
}) {
    if (!curve?.false_positive_rate?.length || !curve.true_positive_rate?.length) return null;
    const data = curve.false_positive_rate.map((value, index) => ({
        falsePositiveRate: value,
        truePositiveRate: curve.true_positive_rate[index],
    }));
    return (
        <div className="h-80 rounded-xl border border-slate-700 bg-slate-950 p-4">
            <h3 className="mb-2 font-semibold text-white">ROC Curve{auc == null ? "" : ` · AUC ${auc.toFixed(3)}`}</h3>
            <ResponsiveContainer width="100%" height="90%">
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis type="number" dataKey="falsePositiveRate" domain={[0, 1]} stroke="#94a3b8" />
                    <YAxis type="number" dataKey="truePositiveRate" domain={[0, 1]} stroke="#94a3b8" />
                    <Tooltip contentStyle={{ background: "#0f172a", borderColor: "#334155" }} />
                    <Line dataKey="truePositiveRate" stroke="#34d399" dot={false} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
