import { Link } from "react-router-dom";
import dayjs from "dayjs";

import AuthorImage from "./AuthorImage";
import type { Article } from "../types/api";

interface ArticlePreviewProps {
  article: Article;
}

/**
 * Pojedynczy "kafelek" artykułu na listach (strona główna, profil autora).
 * Wydzielony do osobnego komponentu, bo dokładnie ten sam markup pojawia się
 * w kilku miejscach — jedno źródło prawdy zamiast kopiuj-wklej (DRY).
 */
export default function ArticlePreview({ article }: ArticlePreviewProps) {
  return (
    <div className="article-preview">
      <div className="article-meta">
        <Link to={`/profile/${article.author.username}`}>
          <AuthorImage src={article.author.image} alt={article.author.username} />
        </Link>
        <div className="info">
          <Link to={`/profile/${article.author.username}`} className="author">
            {article.author.username}
          </Link>
          {/* Data jako string ISO z API -> dayjs formatuje do czytelnej postaci. */}
          <span className="date">{dayjs(article.createdAt).format("MMMM D, YYYY")}</span>
        </div>
        {/* Przycisk ulubionych: klasa zależy od tego, czy artykuł jest już polubiony.
            TODO (Etap 5): podpiąć onClick -> POST/DELETE /articles/{slug}/favorite. */}
        <button
          type="button"
          className={`btn btn-sm pull-xs-right ${article.favorited ? "btn-primary" : "btn-outline-primary"}`}
        >
          <i className="ion-heart" /> {article.favoritesCount}
        </button>
      </div>
      <Link to={`/article/${article.slug}`} className="preview-link">
        <h1>{article.title}</h1>
        <p>{article.description}</p>
        <span>Read more...</span>
      </Link>
    </div>
  );
}
