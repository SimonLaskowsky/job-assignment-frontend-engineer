import { useState } from "react";
import { useHistory } from "react-router-dom";

import client from "../api/client";
import { useAuthStore } from "../context/authStore";
import type { SingleArticleResponse } from "../types/api";

interface FavoriteButtonProps {
  slug: string;
  favorited: boolean;
  favoritesCount: number;
  /** true = wariant kompaktowy na listach (samo serce + liczba); false = pełny na stronie artykułu. */
  compact?: boolean;
}

/**
 * Przycisk "polub artykuł" z OPTYMISTYCZNYM UI.
 *
 * Idea optymistycznego UI: zamiast czekać na odpowiedź serwera, od razu zmieniamy
 * wygląd (zakładając sukces) -> interfejs reaguje natychmiast. Jeśli serwer zwróci
 * błąd, COFAMY zmianę (rollback). To standard w nowoczesnych aplikacjach (lajki, follow).
 */
export default function FavoriteButton({ slug, favorited, favoritesCount, compact = false }: FavoriteButtonProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const history = useHistory();

  // Lokalny stan przycisku, zasiany wartościami z propsów. Od kliknięcia to on jest
  // "źródłem prawdy" dla tego przycisku (serwer go potem potwierdza/koryguje).
  const [isFavorited, setIsFavorited] = useState(favorited);
  const [count, setCount] = useState(favoritesCount);
  const [pending, setPending] = useState(false); // blokada przed podwójnym kliknięciem

  const toggleFavorite = async () => {
    // Favorite wymaga zalogowania — gościa odsyłamy do logowania zamiast wysyłać żądanie skazane na 401.
    if (!isAuthenticated) {
      history.push("/login");
      return;
    }
    if (pending) return;

    // Zapamiętujemy poprzedni stan na wypadek rollbacku.
    const previousFavorited = isFavorited;
    const previousCount = count;

    // 1) OPTYMISTYCZNIE: zmieniamy UI natychmiast.
    const nextFavorited = !isFavorited;
    setIsFavorited(nextFavorited);
    setCount(nextFavorited ? count + 1 : count - 1);
    setPending(true);

    try {
      // 2) Wysyłamy właściwe żądanie: POST = polub, DELETE = cofnij polubienie.
      const response = nextFavorited
        ? await client.post<SingleArticleResponse>(`/articles/${slug}/favorite`)
        : await client.delete<SingleArticleResponse>(`/articles/${slug}/favorite`);

      // 3) Serwer jest ostatecznym źródłem prawdy — synchronizujemy licznik z odpowiedzią
      //    (np. gdy inni też lajkowali w międzyczasie, liczba będzie dokładna).
      setIsFavorited(response.data.article.favorited);
      setCount(response.data.article.favoritesCount);
    } catch {
      // 4) ROLLBACK: błąd -> cofamy optymistyczną zmianę do stanu sprzed kliknięcia.
      setIsFavorited(previousFavorited);
      setCount(previousCount);
    } finally {
      setPending(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggleFavorite}
      disabled={pending}
      // Wygląd zależy od stanu: polubiony -> pełny (btn-primary), inaczej -> obrys (btn-outline-primary).
      className={`btn btn-sm ${compact ? "pull-xs-right " : ""}${isFavorited ? "btn-primary" : "btn-outline-primary"}`}
    >
      <i className="ion-heart" />
      {compact ? (
        <> {count}</>
      ) : (
        <>
          &nbsp; {isFavorited ? "Unfavorite" : "Favorite"} Post <span className="counter">({count})</span>
        </>
      )}
    </button>
  );
}
