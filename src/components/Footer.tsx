import { Link } from "react-router-dom";

/**
 * Wspólna stopka. Markup ze szkieletu bez zmian; jedynie link "conduit" zamieniony
 * na <Link> (nawigacja klienta) zamiast <a href="/#">.
 */
export default function Footer() {
  return (
    <footer>
      <div className="container">
        <Link to="/" className="logo-font">
          conduit
        </Link>
        <span className="attribution">
          An interactive learning project from <a href="https://thinkster.io">Thinkster</a>. Code &amp; design
          licensed under MIT.
        </span>
      </div>
    </footer>
  );
}
