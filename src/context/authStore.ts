import { create } from "zustand";

import client, { JWT_STORAGE_KEY } from "../api/client";
import type { User, UserResponse } from "../types/api";

/**
 * Kształt naszego globalnego store'a uwierzytelniania.
 * Trzymamy tu zarówno DANE (user, isAuthenticated), jak i AKCJE (login, logout),
 * bo w Zustand store to "stan + metody, które go zmieniają" w jednym miejscu.
 */
interface AuthState {
  user: User | null; // null = gość (niezalogowany)
  isAuthenticated: boolean; // wygodny "skrót" zamiast wszędzie sprawdzać user !== null
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

/**
 * Czy w localStorage leży już token? Czytamy to RAZ, przy tworzeniu store'a,
 * żeby po odświeżeniu strony nie wylogowywać usera, który ma ważny token.
 *
 * TODO (produkcja): tu wiemy tylko, że token ISTNIEJE, ale nie mamy danych usera
 * (przechowujemy sam token, nie cały obiekt). Docelowo przy starcie aplikacji
 * należałoby strzelić GET /user, żeby odtworzyć obiekt `user` na podstawie tokenu
 * (i przy okazji zweryfikować, czy token nie wygasł). Pomijam to teraz dla zwięzłości.
 */
const hasStoredToken = Boolean(localStorage.getItem(JWT_STORAGE_KEY));

/**
 * `create<AuthState>()(...)` — zwróć uwagę na PODWÓJNE wywołanie (puste `()`).
 * To wymóg Zustand v5 dla TypeScriptu: najpierw "zamrażamy" typ stanu w <AuthState>,
 * a potem przekazujemy właściwą funkcję tworzącą store. Dzięki temu `set`/`get`
 * są poprawnie otypowane i nie musimy nic rzutować ręcznie.
 *
 * `set` to odpowiednik setState — to JEDYNY sposób zmiany stanu, który powiadamia
 * React, że komponenty czytające ten store mają się przerenderować.
 */
export const useAuthStore = create<AuthState>()((set) => ({
  // --- STAN POCZĄTKOWY ---
  user: null,
  isAuthenticated: hasStoredToken,

  // --- AKCJE ---

  /**
   * Logowanie. Świadomie NIE łapiemy tu błędu (try/catch):
   * jeśli backend zwróci 401/422 (złe dane), axios rzuci wyjątek, a my pozwalamy mu
   * "wybić się" do komponentu formularza. To komponent wie, jak pokazać błąd
   * użytkownikowi (lista .error-messages w HTML) — store ma tylko logikę auth.
   */
  login: async (email, password) => {
    // POST /users/login z body w "kopercie": { user: { email, password } } — tak chce API.
    const response = await client.post<UserResponse>("/users/login", {
      user: { email, password },
    });

    const user = response.data.user;

    // Token trafia do localStorage, żeby interceptor w client.ts mógł go potem
    // automatycznie doklejać do każdego kolejnego żądania (i żeby przetrwał odświeżenie).
    localStorage.setItem(JWT_STORAGE_KEY, user.token);

    // Aktualizujemy stan globalny -> Navbar i reszta apki od razu "widzą" zalogowanego usera.
    set({ user, isAuthenticated: true });
  },

  /**
   * Wylogowanie: sprzątamy token, zerujemy stan i wracamy na stronę główną.
   */
  logout: () => {
    localStorage.removeItem(JWT_STORAGE_KEY);
    set({ user: null, isAuthenticated: false });

    // Szkielet używa HashRouter, więc adresy mają postać "#/...". Ustawienie hasha
    // na "#/" przenosi nas na stronę główną.
    // TODO (produkcja): nawigacja ze store'a to uproszczenie — miesza logikę stanu
    // z routingiem. Czyściej: logout() tylko czyści stan, a komponent po jego wywołaniu
    // sam przekierowuje przez useHistory().push("/") z react-router.
    window.location.hash = "#/";
  },
}));
