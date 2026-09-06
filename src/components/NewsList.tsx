import { Newspaper } from "lucide-react";
import { Article, NewsData, Section } from "@/lib/types";
import { SectionCard, Unavailable } from "./SectionCard";
import { FeedItem } from "./FeedItem";

function ArticleGroup({ title, articles }: { title: string; articles: Article[] }) {
  if (articles.length === 0) return null;
  return (
    <div className="mb-4 last:mb-0">
      <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h3>
      <div className="divide-y divide-border/60">
        {articles.map((a) => (
          <FeedItem key={a.url} href={a.url} title={a.title} thumbnail={a.image ?? null} source={a.source} />
        ))}
      </div>
    </div>
  );
}

export function NewsList({ news }: { news: Section<NewsData> }) {
  return (
    <SectionCard title="News & Politics" icon={Newspaper}>
      {!news.ok ? (
        <Unavailable section={news} />
      ) : (
        <div>
          <ArticleGroup title="Top US" articles={news.topUS} />
          <ArticleGroup title="Politics" articles={news.politics} />
          <ArticleGroup title="World" articles={news.world} />
        </div>
      )}
    </SectionCard>
  );
}
