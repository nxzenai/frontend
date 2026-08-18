export function kernelControlState(status: string, working: boolean, saveStatus: "saved" | "saving" | "error") {
  const transitional = ["busy", "starting", "restarting"].includes(status);
  return {
    runDisabled: working || saveStatus === "saving" || transitional,
    restartDisabled: working || transitional,
    interruptDisabled: working || !transitional,
    shutdownDisabled: working || status === "stopped",
  };
}
