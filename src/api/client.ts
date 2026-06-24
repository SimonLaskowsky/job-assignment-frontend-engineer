import axios, { InternalAxiosRequestConfig } from "axios";

/**
 * Klucz, pod którym trzymamy token JWT w localStorage.
 * Wyciągnięty do stałej, żeby cała aplikacja używała dokładnie tej samej nazwy
 * (literówka typu "jwttoken" vs "jwtToken" to klasyczne, trudne do wyłapania źródło bugów).
 */
export const JWT_STORAGE_KEY = "jwtToken";

/**
 * Centralna instancja axios używana w całej aplikacji.
 *
 * Dlaczego osobna instancja (axios.create), a nie globalny `axios`?
 * Bo dzięki temu konfiguracja (baseURL, interceptory) dotyczy TYLKO naszych
 * zapytań do API Conduit, a nie przypadkiem każdego żądania axios w projekcie.
 *
 * `baseURL` sprawia, że w kodzie piszemy krótkie ścieżki, np. api.get("/articles"),
 * a axios sam dokleja przedrostek -> http://localhost:3000/api/articles.
 */
// TODO (produkcja): nie hardkodować adresu API. Wczytać z process.env.REACT_APP_API_URL,
// żeby dev/staging/prod mogły wskazywać na różne backendy bez zmiany kodu.
const client = axios.create({
  baseURL: "http://localhost:3000/api",
});

/**
 * REQUEST INTERCEPTOR — "wtyczka" uruchamiana automatycznie PRZED wysłaniem
 * każdego żądania przez tę instancję.
 *
 * Jak to działa pod maską: rejestrujemy funkcję, którą axios wywoła dla każdego
 * requestu, przekazując mu obiekt konfiguracji (`config`). Możemy ten obiekt
 * zmodyfikować (tu: dołożyć nagłówek) i MUSIMY go zwrócić — axios użyje tej
 * zwróconej wersji do faktycznego wysłania zapytania.
 *
 * Po co to robimy: zamiast pamiętać o ręcznym dodawaniu nagłówka Authorization
 * w każdym wywołaniu API (i ryzykować, że gdzieś zapomnimy), robimy to w JEDNYM
 * miejscu. To jest sens interceptora: logika przekrojowa (cross-cutting) w jednym punkcie.
 */
client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem(JWT_STORAGE_KEY);

  // Dokładamy nagłówek tylko gdy token istnieje (gość wysyła żądania bez niego).
  if (token) {
    // Uwaga: Conduit wymaga schematu "Token <jwt>", a NIE popularnego "Bearer <jwt>".
    config.headers.set("Authorization", `Token ${token}`);
  }

  return config;
});

export default client;
