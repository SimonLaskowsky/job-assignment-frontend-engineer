import { Link } from "react-router-dom";
import dayjs from "dayjs";

import AuthorImage from "./AuthorImage";
import FavoriteButton from "./FavoriteButton";
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
        <FavoriteButton
          slug={article.slug}
          favorited={article.favorited}
          favoritesCount={article.favoritesCount}
          compact
        />
      </div>
      <Link to={`/article/${article.slug}`} className="preview-link">
        <h1>{article.title}</h1>
        <p>{article.description}</p>
        <span>Read more...</span>
      </Link>
    </div>
  );
}
