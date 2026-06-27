import { FormEvent, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import axios from "axios";

import { useAuthStore } from "../context/authStore";
import type { GenericErrorModel } from "../types/api";

/**
 * Wyciąga czytelne komunikaty błędów z wyjątku rzuconego przez axios.
 *
 * Trzymamy tę logikę w osobnej funkcji (poza komponentem), bo:
 * 1) nie zależy od stanu komponentu — to czysta transformacja "błąd -> teksty",
 * 2) komponent zostaje czytelny (handleSubmit nie puchnie od if-ów).
 *
 * `error: unknown` — w bloku catch typ jest `unknown` (tak jest bezpiecznie),
 * więc MUSIMY zawęzić typ, zanim sięgniemy po pola. Stąd axios.isAxiosError(...).
 */
function extractErrorMessages(error: unknown): string[] {
  if (axios.isAxiosError(error)) {
    // 422: API zwraca { errors: { body: ["..."] } } — pokazujemy te komunikaty wprost.
    // Adnotacja typu zamiast asercji `as`: axios typuje `data` jako any, więc cast jest zbędny.
    // (Przy okazji omijamy buga parsera Babel na składni `?.x as T` w starszym @babel/parser.)
    const data: GenericErrorModel | undefined = error.response?.data;
    if (data?.errors?.body?.length) {
      return data.errors.body;
    }
    // 401: złe dane logowania, odpowiedź bez ciała — dajemy komunikat ogólny.
    if (error.response?.status === 401) {
      return ["email or password is invalid"];
    }
  }
  // Cokolwiek innego (np. backend nie działa, brak sieci).
  return ["Something went wrong. Please try again."];
}

export default function Login() {
  // Ze store'a bierzemy tylko akcję login (selektor) — to wystarczy temu komponentowi.
  const login = useAuthStore((state) => state.login);
  // useHistory (react-router v5) pozwala przekierować imperatywnie po udanym logowaniu.
  const history = useHistory();

  // Pola formularza trzymamy jako stan lokalny (useState) — to "controlled inputs":
  // React jest jedynym źródłem prawdy o wartości pola, a input tylko ją wyświetla.
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  // Blokada podwójnego wysłania (i wyłączenie przycisku) w trakcie zapytania.
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // bez tego przeglądarka przeładowałaby stronę (domyślne zachowanie <form>)
    setErrors([]);
    setSubmitting(true);

    try {
      await login(email, password); // store: POST /users/login, zapis tokenu, ustawienie usera
      history.push("/"); // sukces -> strona główna
    } catch (error) {
      // login() nie łapie błędu u siebie (celowo) — obsługujemy go tu, w warstwie UI.
      setErrors(extractErrorMessages(error));
    } finally {
      setSubmitting(false); // niezależnie od wyniku odblokowujemy przycisk
    }
  };

  return (
    <div className="auth-page">
      <div className="container page">
        <div className="row">
          <div className="col-md-6 offset-md-3 col-xs-12">
            <h1 className="text-xs-center">Sign in</h1>
            <p className="text-xs-center">
              {/* TODO: trasa /register jeszcze nie istnieje (rejestracja poza bieżącym zakresem). */}
              <Link to="/register">Need an account?</Link>
            </p>

            {/* Listę błędów renderujemy tylko, gdy jakieś są (markup .error-messages ze szkieletu). */}
            {errors.length > 0 && (
              <ul className="error-messages">
                {errors.map((message) => (
                  <li key={message}>{message}</li>
                ))}
              </ul>
            )}

            <form onSubmit={handleSubmit}>
              <fieldset className="form-group">
                <input
                  className="form-control form-control-lg"
                  type="text"
                  placeholder="Email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </fieldset>
              <fieldset className="form-group">
                <input
                  className="form-control form-control-lg"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </fieldset>
              <button className="btn btn-lg btn-primary pull-xs-right" type="submit" disabled={submitting}>
                Sign in
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
