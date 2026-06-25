import { HashRouter as Router, Switch, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Article from "./pages/Article";
import Profile from "./pages/Profile";
import Login from "./pages/Login";

function App() {
  return (
    <Router>
      {/* Navbar i Footer są POZA <Switch> — wspólny layout renderowany na każdej
          podstronie. Wewnątrz <Switch> zmienia się tylko środek, zależnie od trasy. */}
      <Navbar />
      <Switch>
        {/* `exact` na "/", żeby strona główna nie "łapała" wszystkich innych ścieżek. */}
        <Route path="/" exact component={Home} />
        <Route path="/article/:slug" exact component={Article} />
        <Route path="/profile/:username" exact component={Profile} />
        <Route path="/login" exact component={Login} />
      </Switch>
      <Footer />
    </Router>
  );
}

export default App;
