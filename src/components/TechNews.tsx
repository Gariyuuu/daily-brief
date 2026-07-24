import { Section, TechData, TechStory } from "@/lib/types";
import { SectionCard, Unavailable } from "./SectionCard";

function StoryRow({ story, rank }: { story: TechStory; rank: number }) {
  return (
    <li className="text-sm flex gap-2">
      <span className="text-black/40 dark:text-white/40 w-6 text-right shrink-0">{rank}</span>
      <a
        href={story.url}
        target="_blank"
        rel="noopener noreferrer"
        className="hover:underline flex-1"
      >
        {story.title}
      </a>
      <span className="text-xs text-black/50 dark:text-white/50 shrink-0">{story.score} pts</span>
    </li>
  );
}

export function TechNews({ tech }: { tech: Section<TechData> }) {
  return (
    <SectionCard title="Tech / Hacker News" icon="💻">
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
