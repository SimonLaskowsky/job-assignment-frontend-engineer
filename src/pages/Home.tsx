import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import dayjs from "dayjs";

import client from "../api/client";
import AuthorImage from "../components/AuthorImage";
import type { Article, MultipleArticlesResponse } from "../types/api";

export default function Home() {
  // Trzy stany opisujące cykl życia pobierania danych:
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  /**
   * useEffect z pustą tablicą zależności [] = uruchom RAZ, po pierwszym wyrenderowaniu.
   * To właściwe miejsce na "efekty uboczne" (side effects) jak zapytanie do API —
   * NIE robimy tego w trakcie renderu, bo render ma być czystą funkcją UI = f(stan).
   */
  useEffect(() => {
    // Guard `active` chroni przed aktualizacją stanu po odmontowaniu komponentu
    // (gdyby user zdążył odejść ze strony, zanim odpowiedź wróci) -> brak ostrzeżeń i wycieków.
    let active = true;

    client
      .get<MultipleArticlesResponse>("/articles")
      .then((response) => {
        if (active) setArticles(response.data.articles);
      })
      .catch(() => {
        if (active) setError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    // Funkcja czyszcząca: React wywoła ją przy odmontowaniu komponentu.
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="home-page">
      <div className="banner">
        <div className="container">
          <h1 className="logo-font">conduit</h1>
          <p>A place to share your knowledge.</p>
        </div>
      </div>

      <div className="container page">
        <div className="row">
          <div className="col-md-9">
            <div className="feed-toggle">
              <ul className="nav nav-pills outline-active">
                {/* TODO: przełącznik Your Feed / Global Feed podepniemy przy obsłudze
                    /articles/feed (wymaga zalogowania). Na razie statycznie. */}
                <li className="nav-item">
                  <a className="nav-link disabled" href="">
                    Your Feed
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link active" href="">
                    Global Feed
                  </a>
                </li>
              </ul>
            </div>

            {/* Trzy wzajemnie wykluczające się widoki: ładowanie / błąd / dane. */}
            {loading && <div className="article-preview">Loading articles...</div>}
            {error && <div className="article-preview">Failed to load articles.</div>}
            {!loading && !error && articles.length === 0 && (
              <div className="article-preview">No articles are here... yet.</div>
            )}

            {!loading &&
              !error &&
              articles.map((article) => (
                // key = slug: unikalny identyfikator artykułu. React używa go,
                // by efektywnie śledzić elementy listy między renderami.
                <div className="article-preview" key={article.slug}>
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
                      className={`btn btn-sm pull-xs-right ${
                        article.favorited ? "btn-primary" : "btn-outline-primary"
                      }`}
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
              ))}
          </div>

          <div className="col-md-3">
            {/* TODO: lista Popular Tags (GET /tags) — pomijamy zgodnie z zakresem zadania. */}
            <div className="sidebar">
              <p>Popular Tags</p>
              <div className="tag-list" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
