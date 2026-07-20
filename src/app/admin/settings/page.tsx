export default function SettingsPage() {
  return (
    <main className="max-w-7xl mx-auto p-8">

      <h1 className="text-5xl font-bold mb-8">
        CRM Settings
      </h1>

      <div className="space-y-6">

        <div className="bg-slate-900 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-3">
            WhatsApp Settings
          </h2>

          <input
            placeholder="Default Country Code"
            className="w-full bg-slate-800 rounded-lg p-3"
          />
        </div>

        <div className="bg-slate-900 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-3">
            Lead Preferences
          </h2>

          <label className="flex gap-2">
            <input type="checkbox" />
            Auto Save Notes
          </label>
        </div>

      </div>

    </main>
  );
}