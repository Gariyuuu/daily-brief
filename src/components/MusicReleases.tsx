import { Disc3 } from "lucide-react";
import { MusicData, Section } from "@/lib/types";
import { SectionCard, Unavailable } from "./SectionCard";

export function MusicReleases({ music }: { music: Section<MusicData> }) {
  return (
    <SectionCard title="New Music" icon={Disc3}>
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
              className="group rounded-lg outline-offset-4"
            >
              {r.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={r.image}
                  alt=""
                  loading="lazy"
                  className="aspect-square w-full rounded-lg bg-foreground/5 object-cover transition-transform duration-200 ease-out group-hover:scale-[1.02]"
                />
              ) : (
                <div className="aspect-square w-full rounded-lg bg-foreground/5" aria-hidden="true" />
              )}
              <p className="mt-1 text-xs font-medium leading-snug group-hover:underline truncate">
                {r.title}
              </p>
              <p className="truncate text-xs text-muted-foreground">{r.artists}</p>
            </a>
          ))}
        </div>
      )}
    </SectionCard>
  );
}
