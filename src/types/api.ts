/**
 * Typy encji API (Conduit / RealWorld), spisane ręcznie na podstawie
 * `docs/schema/swagger.json`.
 *
 * Dlaczego ręcznie, a nie generator? Przy tej skali (kilka encji) ręczne typy
 * są czytelniejsze, w pełni je rozumiem i mogę je obronić, a nie wprowadzam
 * dodatkowego narzędzia/build-stepu do projektu na 4-8h.
 *
 * Zasada: trzymamy się ściśle Swaggera. Wszystkie pola tych encji są w spec
 * oznaczone jako `required`, więc NIE używamy `?` (opcjonalności) — dzięki temu
 * TypeScript wymusi, że zawsze mamy komplet danych. Zero `any`.
 */

/**
 * Zalogowany użytkownik — to "my" (aktualnie zalogowane konto).
 * Kluczowa różnica względem `Profile`: `User` zawiera prywatne pola
 * `email` oraz `token` (JWT), których nie widać u innych użytkowników.
 * Zwracany m.in. przez POST /users/login, POST /users, GET /user.
 */
export interface User {
  email: string;
  token: string;
  username: string;
  bio: string;
  image: string;
}

/**
 * Publiczny profil dowolnego użytkownika — to "ktoś inny" widziany z perspektywy
 * zalogowanego konta. Brak `email`/`token`; za to dochodzi `following`,
 * czyli czy JA obserwuję tę osobę (stan przycisku Follow).
 * Zwracany m.in. przez GET /profiles/{username}.
 */
export interface Profile {
  username: string;
  bio: string;
  image: string;
  following: boolean;
}

/**
 * Autor artykułu. W Swaggerze pole `Article.author` ma DOKŁADNIE kształt
 * `Profile` — nie ma osobnej definicji "Author". Robimy więc alias: to ta sama
 * struktura, ale nazwa `Author` lepiej opisuje intencję w kodzie artykułu.
 */
export type Author = Profile;

/**
 * Artykuł. `author` to zagnieżdżony profil autora (stąd `Author`).
 * `favorited`/`favoritesCount` obsługują przycisk Favorite, a daty przychodzą
 * jako stringi ISO 8601 (format date-time) — sformatujemy je dopiero w UI (dayjs).
 * Zwracany przez GET /articles, GET /articles/{slug} itd.
 */
export interface Article {
  slug: string;
  title: string;
  description: string;
  body: string;
  tagList: string[];
  createdAt: string; // ISO 8601 date-time, np. "2021-01-20T08:30:00.000Z"
  updatedAt: string; // ISO 8601 date-time
  favorited: boolean;
  favoritesCount: number;
  author: Author;
}
