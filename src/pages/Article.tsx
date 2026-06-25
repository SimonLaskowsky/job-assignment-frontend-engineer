import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import dayjs from "dayjs";

import client from "../api/client";
import AuthorImage from "../components/AuthorImage";
import type { Article as ArticleType, SingleArticleResponse } from "../types/api";

/**
 * Blok meta autora (avatar, nazwa, data + przyciski Follow/Favorite).
 * W szablonie pojawia się DWA razy (w bannerze i pod treścią), więc wydzielam go
 * lokalnie, żeby nie kopiować markupu. Lokalnie — bo to detal tylko tej strony.
 */
function ArticleMeta({ article }: { article: ArticleType }) {
  return (
    <div className="article-meta">
      <Link to={`/profile/${article.author.username}`}>
        <AuthorImage src={article.author.image} alt={article.author.username} />
      </Link>
      <div className="info">
        <Link to={`/profile/${article.author.username}`} className="author">
          {article.author.username}
        </Link>
        <span className="date">{dayjs(article.createdAt).format("MMMM D, YYYY")}</span>
      </div>
      {/* TODO (Etap 5): podpiąć Follow -> POST/DELETE /profiles/{username}/follow. */}
      <button type="button" className="btn btn-sm btn-outline-secondary">
        <i className="ion-plus-round" />
        &nbsp; Follow {article.author.username}
      </button>
      &nbsp;&nbsp;
      {/* TODO (Etap 5): podpiąć Favorite -> POST/DELETE /articles/{slug}/favorite. */}
      <button
        type="button"
        className={`btn btn-sm ${article.favorited ? "btn-primary" : "btn-outline-primary"}`}
      >
        <i className="ion-heart" />
        &nbsp; Favorite Post <span className="counter">({article.favoritesCount})</span>
      </button>
    </div>
  );
}

export default function Article() {
  // useParams (react-router v5) wyciąga :slug z adresu /article/:slug.
  const { slug } = useParams<{ slug: string }>();

  const [article, setArticle] = useState<ArticleType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(false);

    client
      .get<SingleArticleResponse>(`/articles/${slug}`)
      .then((response) => {
        if (active) setArticle(response.data.article);
      })
      .catch(() => {
        if (active) setError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
    // Zależność [slug]: jeśli user przejdzie z jednego artykułu na inny (zmiana slug),
    // efekt uruchomi się ponownie i pobierze właściwy artykuł.
  }, [slug]);

  if (loading) {
    return <div className="article-page container page">Loading article...</div>;
  }
  if (error || !article) {
    return <div className="article-page container page">Failed to load article.</div>;
  }

  return (
    <div className="article-page">
      <div className="banner">
        <div className="container">
          <h1>{article.title}</h1>
          <ArticleMeta article={article} />
        </div>
      </div>

      <div className="container page">
        <div className="row article-content">
          <div className="col-md-12">
            {/* react-markdown konwertuje Markdown z pola `body` na bezpieczny HTML.
                Domyślnie NIE renderuje surowego HTML zaszytego w treści -> chroni przed XSS. */}
            <ReactMarkdown>{article.body}</ReactMarkdown>
          </div>
        </div>

        <hr />

        <div className="article-actions">
          <ArticleMeta article={article} />
        </div>

        {/* TODO: sekcja komentarzy (GET/POST/DELETE /articles/{slug}/comments) — poza bieżącym zakresem. */}
      </div>
    </div>
  );
}
