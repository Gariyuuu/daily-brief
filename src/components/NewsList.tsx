import { Article, NewsData, Section } from "@/lib/types";
import { SectionCard, Unavailable } from "./SectionCard";

function ArticleRow({ article }: { article: Article }) {
  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex gap-3 py-2 group"
    >
      {article.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={article.image}
          alt=""
          className="w-20 h-14 object-cover rounded-lg shrink-0 bg-black/5 dark:bg-white/5"
        />
      ) : (
        <div className="w-20 h-14 rounded-lg shrink-0 bg-black/5 dark:bg-white/5" />
      )}
      <div className="min-w-0">
        <p className="text-sm font-medium leading-snug group-hover:underline">
          {article.title}
        </p>
        <p className="text-xs text-black/50 dark:text-white/50">{article.source}</p>
      </div>
    </a>
  );
}

function ArticleGroup({ title, articles }: { title: string; articles: Article[] }) {
  if (articles.length === 0) return null;
  return (
    <div className="mb-4 last:mb-0">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-black/50 dark:text-white/50 mb-1">
        {title}
      </h3>
      <div className="divide-y divide-black/5 dark:divide-white/5">
        {articles.map((a) => (
          <ArticleRow key={a.url} article={a} />
        ))}
      </div>
    </div>
  );
}

export function NewsList({ news }: { news: Section<NewsData> }) {
  return (
    <SectionCard title="News & Politics" icon="📰">
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
