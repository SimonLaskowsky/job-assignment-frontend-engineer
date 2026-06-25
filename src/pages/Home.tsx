import { useEffect, useState } from "react";

import client from "../api/client";
import ArticlePreview from "../components/ArticlePreview";
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
                <ArticlePreview key={article.slug} article={article} />
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
