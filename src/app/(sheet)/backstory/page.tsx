import { Card, CardTitle } from "@/components/ui";
import { HOUSE_VALEMONT, PUBLIC_VS_SECRET, TIMELINE, BACKSTORY_SECTIONS } from "@/lib/dnd/backstory";

export default function BackstoryPage() {
  return (
    <div className="flex flex-col gap-4 pb-4">
      <Card className="text-center">
        <div className="mx-auto mb-2 flex size-14 items-center justify-center rounded-full border border-gold text-2xl">
          🐺
        </div>
        <h1 className="text-lg font-semibold text-gold-strong">House Valemont</h1>
        <p className="mt-1 text-sm italic text-muted">&ldquo;{HOUSE_VALEMONT.motto}&rdquo;</p>
        <p className="mt-1 text-xs text-muted">{HOUSE_VALEMONT.crest}</p>
      </Card>

      <Card>
        <CardTitle>Public Reputation vs. Secret History</CardTitle>
        <div className="flex flex-col gap-2">
          {PUBLIC_VS_SECRET.map((row, i) => (
            <div key={i} className="grid grid-cols-2 gap-2 rounded-lg border border-border bg-surface-2 p-2 text-xs">
              <div>
                <p className="mb-1 text-[10px] uppercase tracking-wide text-muted">Public</p>
                <p className="text-foreground">{row.publicReputation}</p>
              </div>
              <div className="border-l border-border pl-2">
                <p className="mb-1 text-[10px] uppercase tracking-wide text-blood-strong">Secret</p>
                <p className="text-foreground">{row.secretHistory}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <CardTitle>Timeline</CardTitle>
        <ol className="flex flex-col gap-2 border-l border-border pl-4">
          {TIMELINE.map((entry) => (
            <li key={`${entry.year}-${entry.event}`} className="relative text-sm">
              <span className="absolute -left-[21px] top-1.5 size-2 rounded-full bg-gold" />
              <span className="font-medium text-gold-strong">{entry.year}.</span>{" "}
              <span className="text-foreground">{entry.event}</span>
            </li>
          ))}
        </ol>
      </Card>

      {BACKSTORY_SECTIONS.map((section) => (
        <Card key={section.heading}>
          <CardTitle>{section.heading}</CardTitle>
          <div className="flex flex-col gap-2">
            {section.paragraphs.map((p, i) => (
              <p key={i} className="text-sm leading-relaxed text-foreground/90">
                {p}
              </p>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}
