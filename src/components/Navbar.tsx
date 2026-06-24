import { Link, NavLink } from "react-router-dom";

import { useAuthStore } from "../context/authStore";

/**
 * Wspólny pasek nawigacji. Markup (klasy CSS) pochodzi 1:1 ze szkieletu — zmieniamy
 * tylko, KTÓRE elementy się renderują, w zależności od stanu zalogowania.
 *
 * Navbar "reaguje" na auth, bo czyta dane bezpośrednio ze store'a (useAuthStore).
 * Gdy login()/logout() zmieni stan, Zustand powiadomi ten komponent i React go przerysuje.
 */
export default function Navbar() {
  // Selektory: bierzemy ze store'a tylko to, czego naprawdę używamy.
  // Dzięki temu Navbar przerysuje się, gdy zmieni się `user` — a nie przy każdej zmianie store'a.
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  return (
    <nav className="navbar navbar-light">
      <div className="container">
        {/* Link zamiast <a href>: nawigacja po stronie klienta, bez przeładowania strony. */}
        <Link className="navbar-brand" to="/">
          conduit
        </Link>
        <ul className="nav navbar-nav pull-xs-right">
          <li className="nav-item">
            {/* NavLink sam dopina klasę "active", gdy adres pasuje do `to` —
                realizuje komentarz ze szkieletu "Add active class when you're on that page".
                `exact`, bo inaczej "/" pasowałoby do każdej trasy. */}
            <NavLink exact className="nav-link" activeClassName="active" to="/">
              Home
            </NavLink>
          </li>

          {user ? (
            /* ----- UŻYTKOWNIK ZALOGOWANY: avatar + nazwa (link do profilu) oraz Wyloguj ----- */
            <>
              <li className="nav-item">
                <NavLink className="nav-link" activeClassName="active" to={`/profile/${user.username}`}>
                  <img src={user.image} className="user-pic" alt={user.username} />
                  {user.username}
                </NavLink>
              </li>
              <li className="nav-item">
                {/* Wylogowanie to AKCJA (zmiana stanu), nie nawigacja — stąd <button>, nie <a>.
                    Klasy nav-link zachowują wygląd linku ze szkieletu; logout() sam przekieruje. */}
                <button type="button" className="nav-link btn btn-link" onClick={logout}>
                  <i className="ion-log-out" />
                  &nbsp;Wyloguj
                </button>
              </li>
            </>
          ) : (
            /* ----- GOŚĆ: tylko przycisk logowania ----- */
            <li className="nav-item">
              <NavLink className="nav-link" activeClassName="active" to="/login">
                Zaloguj
              </NavLink>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
}
