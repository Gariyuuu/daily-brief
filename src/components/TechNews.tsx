import { Terminal } from "lucide-react";
import { Section, TechData, TechStory } from "@/lib/types";
import { SectionCard, Unavailable } from "./SectionCard";

function StoryRow({ story, rank }: { story: TechStory; rank: number }) {
  return (
    <li className="flex gap-2 rounded-md px-1 py-0.5 text-sm transition-colors hover:bg-foreground/[.04]">
      {/* Rank and score are both numeric columns in a two-up list: tabular
          figures keep the titles on one left edge across all twenty rows. */}
      <span className="num w-6 shrink-0 text-right text-muted-foreground">{rank}</span>
      <a
        href={story.url}
        target="_blank"
        rel="noopener noreferrer"
        className="min-w-0 flex-1 decoration-from-font underline-offset-2 hover:underline"
      >
        {story.title}
      </a>
      <span className="num shrink-0 text-xs text-muted-foreground">{story.score} pts</span>
    </li>
  );
}

export function TechNews({ tech }: { tech: Section<TechData> }) {
  return (
    <SectionCard title="Tech / Hacker News" icon={Terminal}>
      {!tech.ok ? (
        <Unavailable section={tech} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
          <ol className="space-y-1">
            {tech.stories.slice(0, 10).map((s, i) => (
              <StoryRow key={s.url + i} story={s} rank={i + 1} />
            ))}
          </ol>
          <ol className="space-y-1">
            {tech.stories.slice(10, 20).map((s, i) => (
              <StoryRow key={s.url + i} story={s} rank={i + 11} />
            ))}
          </ol>
        </div>
      )}
    </SectionCard>
  );
}
