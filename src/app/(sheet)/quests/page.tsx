import { getQuests, getSessionLogs } from "@/lib/data";
import { Card, CardTitle, Pill } from "@/components/ui";
import { addQuest, deleteQuest } from "@/lib/actions/quests";
import { QuestStatusButtons } from "@/components/quests/QuestStatusButtons";
import { addSessionLog, deleteSessionLog } from "@/lib/actions/quests";

const STATUS_TONE = { active: "gold", completed: "success", failed: "danger" } as const;

export default async function QuestsPage() {
  const [quests, logs] = await Promise.all([getQuests(), getSessionLogs()]);
  const ordered = [...quests].sort((a, b) => {
    const order = { active: 0, completed: 1, failed: 2 };
    return order[a.status] - order[b.status];
  });

  return (
    <div className="flex flex-col gap-4 pb-4">
      <Card>
        <CardTitle>Quests</CardTitle>
        <div className="flex flex-col gap-2">
          {ordered.length === 0 && <p className="text-sm text-muted">No quests yet.</p>}
          {ordered.map((quest) => (
            <div key={quest.id} className="rounded-lg border border-border bg-surface-2 p-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-foreground">{quest.title}</p>
                  {quest.description && (
                    <p className="mt-1 text-xs text-muted">{quest.description}</p>
                  )}
                </div>
                <Pill tone={STATUS_TONE[quest.status]}>{quest.status}</Pill>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <QuestStatusButtons id={quest.id} status={quest.status} />
                <form action={deleteQuest.bind(null, quest.id)}>
                  <button
                    type="submit"
                    className="rounded-md border border-border px-2 py-1 text-xs text-muted hover:border-blood-strong hover:text-blood-strong"
                  >
                    Remove
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>

        <form action={addQuest} className="mt-4 flex flex-col gap-2">
          <input
            name="title"
            required
            placeholder="Quest title"
            className="rounded-md border border-border bg-surface-2 px-3 py-2 text-sm focus:border-gold focus:outline-none"
          />
          <textarea
            name="description"
            placeholder="Details (optional)"
            rows={2}
            className="rounded-md border border-border bg-surface-2 px-3 py-2 text-sm focus:border-gold focus:outline-none"
          />
          <button
            type="submit"
            className="self-start rounded-md border border-gold bg-gold/10 px-4 py-2 text-sm text-gold-strong hover:bg-gold/20"
          >
            Add Quest
          </button>
        </form>
      </Card>

      <Card>
        <CardTitle>Session Log</CardTitle>
        <div className="flex flex-col gap-2">
          {logs.length === 0 && <p className="text-sm text-muted">No entries yet.</p>}
          {logs.map((log) => (
            <div
              key={log.id}
              className="rounded-lg border border-border bg-surface-2 p-3"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs text-muted">{log.logged_on}</p>
                <form action={deleteSessionLog.bind(null, log.id)}>
                  <button
                    type="submit"
                    className="rounded-md border border-border px-2 py-0.5 text-xs text-muted hover:border-blood-strong hover:text-blood-strong"
                  >
                    ✕
                  </button>
                </form>
              </div>
              <p className="mt-1 whitespace-pre-wrap text-sm text-foreground">{log.entry}</p>
            </div>
          ))}
        </div>

        <form action={addSessionLog} className="mt-4 flex flex-col gap-2">
          <input
            name="logged_on"
            type="date"
            defaultValue={new Date().toISOString().slice(0, 10)}
            className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm focus:border-gold focus:outline-none sm:w-40"
          />
          <textarea
            name="entry"
            required
            placeholder="What happened this session…"
            rows={3}
            className="rounded-md border border-border bg-surface-2 px-3 py-2 text-sm focus:border-gold focus:outline-none"
          />
          <button
            type="submit"
            className="self-start rounded-md border border-gold bg-gold/10 px-4 py-2 text-sm text-gold-strong hover:bg-gold/20"
          >
            Add Entry
          </button>
        </form>
      </Card>
    </div>
  );
}
