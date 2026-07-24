import { MusicData, Section } from "@/lib/types";
import { SectionCard, Unavailable } from "./SectionCard";

export function MusicReleases({ music }: { music: Section<MusicData> }) {
  return (
    <SectionCard title="New Music" icon="🎵">
      {!music.ok ? (
        <Unavailable section={music} />
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {music.releases.map((r) => (
            <a
              key={r.url || r.title}
              href={r.url || undefined}
              target="_blank"
              rel="noopener noreferrer"
              className="group"
            >
              {r.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={r.image}
                  alt={r.title}
                  className="aspect-square w-full object-cover rounded-lg bg-black/5 dark:bg-white/5"
                />
              ) : (
                <div className="aspect-square w-full rounded-lg bg-black/5 dark:bg-white/5" />
              )}
              <p className="mt-1 text-xs font-medium leading-snug group-hover:underline truncate">
                {r.title}
              </p>
              <p className="text-xs text-black/50 dark:text-white/50 truncate">{r.artists}</p>
            </a>
          ))}
        </div>
      )}
    </SectionCard>
  );
}
