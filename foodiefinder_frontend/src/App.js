import React, { useEffect, useMemo, useState } from "react";
import "./App.css";
import Button from "./components/ui/Button";
import Input from "./components/ui/Input";
import Toast from "./components/ui/Toast";
import AuthModal from "./components/auth/AuthModal";
import Spinner from "./components/ui/Spinner";
import { apiRequest, getApiBaseUrl } from "./api/client";
import { clearToken, getToken, setToken } from "./state/auth";

// PUBLIC_INTERFACE
function App() {
  const [theme, setTheme] = useState("light");

  const [nav, setNav] = useState("discover"); // discover | favorites | admin
  const [authMode, setAuthMode] = useState(null); // null | login | signup
  const [token, setAuthToken] = useState(() => getToken());

  // Discover/search state
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [minRating, setMinRating] = useState("0");
  const [showMap, setShowMap] = useState(true);

  // Data state
  const [restaurants, setRestaurants] = useState([]);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState({ message: "", kind: "info" });

  // Effect to apply theme
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const apiBaseUrl = useMemo(() => getApiBaseUrl(), []);
  const apiReady = useMemo(() => {
    // Current backend OpenAPI shows only "/". Until more endpoints exist, treat as not ready.
    return false;
  }, []);

  // PUBLIC_INTERFACE
  const toggleTheme = () => setTheme((t) => (t === "light" ? "dark" : "light"));

  function showToast(message, kind = "info") {
    setToast({ message, kind });
  }

  function onAuthed(newToken) {
    setToken(newToken);
    setAuthToken(newToken);
    showToast("Signed in successfully.", "success");
  }

  function logout() {
    clearToken();
    setAuthToken(null);
    showToast("Signed out.", "info");
  }

  async function search() {
    setBusy(true);
    try {
      if (!apiReady) {
        throw new Error(
          "Backend restaurant search endpoints are not available yet. UI is ready to integrate."
        );
      }

      // Expected future endpoint shape:
      // GET /restaurants?query=&location=&cuisine=&min_rating=
      const data = await apiRequest(
        `/restaurants?query=${encodeURIComponent(query)}&location=${encodeURIComponent(
          location
        )}&cuisine=${encodeURIComponent(cuisine)}&min_rating=${encodeURIComponent(minRating)}`,
        { token }
      );
      setRestaurants(Array.isArray(data) ? data : data?.items || []);
    } catch (e) {
      setRestaurants([]);
      showToast(e?.message || "Search failed.", "error");
    } finally {
      setBusy(false);
    }
  }

  const filteredRestaurants = useMemo(() => {
    // While backend is not available, keep a small in-memory demo dataset for UX.
    const demo = [
      {
        id: "demo-1",
        name: "Bluefin Sushi",
        cuisine: "Japanese",
        rating: 4.6,
        address: "123 Ocean Ave",
        price: "$$"
      },
      {
        id: "demo-2",
        name: "Casa Verde",
        cuisine: "Mexican",
        rating: 4.3,
        address: "77 Market St",
        price: "$"
      },
      {
        id: "demo-3",
        name: "Trattoria Luna",
        cuisine: "Italian",
        rating: 4.8,
        address: "9 Crescent Rd",
        price: "$$$"
      }
    ];

    const base = apiReady ? restaurants : demo;

    const q = query.trim().toLowerCase();
    const loc = location.trim().toLowerCase();
    const cuis = cuisine.trim().toLowerCase();
    const mr = Number(minRating || 0);

    return base.filter((r) => {
      const matchesQuery = !q || r.name.toLowerCase().includes(q);
      const matchesCuisine = !cuis || r.cuisine.toLowerCase().includes(cuis);
      // demo location filter is best-effort (address includes)
      const matchesLocation = !loc || (r.address || "").toLowerCase().includes(loc);
      const matchesRating = !mr || Number(r.rating || 0) >= mr;
      return matchesQuery && matchesCuisine && matchesLocation && matchesRating;
    });
  }, [apiReady, restaurants, query, location, cuisine, minRating]);

  return (
    <div className="App">
      <div className="shell">
        <aside className="sidebar" aria-label="Sidebar navigation">
          <div className="brand">
            <div className="brand-mark">FF</div>
            <div className="brand-text">
              <div className="brand-title">FoodieFinder</div>
              <div className="brand-subtitle">Discover great eats</div>
            </div>
          </div>

          <nav className="nav">
            <button
              className={`nav-item ${nav === "discover" ? "active" : ""}`}
              onClick={() => setNav("discover")}
            >
              Discover
            </button>
            <button
              className={`nav-item ${nav === "favorites" ? "active" : ""}`}
              onClick={() => setNav("favorites")}
            >
              Favorites
            </button>
            <button
              className={`nav-item ${nav === "admin" ? "active" : ""}`}
              onClick={() => setNav("admin")}
            >
              Admin
            </button>
          </nav>

          <div className="sidebar-footer">
            <div className="small-muted">API: {apiBaseUrl || "(same origin)"}</div>
            {token ? (
              <Button variant="ghost" onClick={logout}>
                Sign out
              </Button>
            ) : (
              <div className="row row-gap">
                <Button variant="ghost" onClick={() => setAuthMode("login")}>
                  Log in
                </Button>
                <Button variant="primary" onClick={() => setAuthMode("signup")}>
                  Sign up
                </Button>
              </div>
            )}
          </div>
        </aside>

        <main className="content">
          <header className="topbar">
            <div className="topbar-left">
              <div className="page-title">
                {nav === "discover" ? "Discover" : nav === "favorites" ? "Favorites" : "Admin"}
              </div>
              <div className="page-subtitle">
                Search restaurants by location, cuisine, and rating.
              </div>
            </div>

            <div className="topbar-actions">
              <Button
                variant="ghost"
                onClick={toggleTheme}
                ariaLabel={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
              >
                {theme === "light" ? "Dark" : "Light"}
              </Button>
            </div>
          </header>

          {nav === "discover" ? (
            <section className="panel">
              <div className="searchbar">
                <Input
                  id="q"
                  label="Search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g. pizza, sushi..."
                  helper="Try filtering cuisine and rating."
                />
                <Input
                  id="loc"
                  label="Location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="City or neighborhood"
                />
                <div className="field">
                  <label className="field-label" htmlFor="cuisine">
                    Cuisine
                  </label>
                  <select
                    id="cuisine"
                    className="select"
                    value={cuisine}
                    onChange={(e) => setCuisine(e.target.value)}
                  >
                    <option value="">Any</option>
                    <option value="Italian">Italian</option>
                    <option value="Mexican">Mexican</option>
                    <option value="Japanese">Japanese</option>
                    <option value="Indian">Indian</option>
                    <option value="Thai">Thai</option>
                  </select>
                </div>

                <div className="field">
                  <label className="field-label" htmlFor="minRating">
                    Min rating
                  </label>
                  <select
                    id="minRating"
                    className="select"
                    value={minRating}
                    onChange={(e) => setMinRating(e.target.value)}
                  >
                    <option value="0">Any</option>
                    <option value="3">3.0+</option>
                    <option value="4">4.0+</option>
                    <option value="4.5">4.5+</option>
                  </select>
                </div>

                <div className="row row-end row-gap">
                  <Button variant="ghost" onClick={() => setShowMap((v) => !v)}>
                    {showMap ? "Hide map" : "Show map"}
                  </Button>
                  <Button variant="primary" onClick={search} disabled={busy} ariaLabel="Search">
                    {busy ? <Spinner label="Searching" /> : "Search"}
                  </Button>
                </div>
              </div>

              {!apiReady ? (
                <div className="callout callout-warn">
                  Backend API is not implemented yet (OpenAPI currently only has <code>/</code>).
                  Showing demo results; once backend adds restaurant endpoints, the UI will switch to
                  real data.
                </div>
              ) : null}

              <div className={`grid ${showMap ? "grid-2" : "grid-1"}`}>
                <div className="card">
                  <div className="card-title">Results</div>
                  <div className="card-body">
                    {filteredRestaurants.length === 0 ? (
                      <div className="empty">
                        No restaurants match your filters. Try a different query.
                      </div>
                    ) : (
                      <div className="list" role="list">
                        {filteredRestaurants.map((r) => (
                          <div key={r.id} className="list-item" role="listitem">
                            <div className="list-item-main">
                              <div className="list-item-title">{r.name}</div>
                              <div className="list-item-sub">
                                {r.cuisine} · {r.address} · {r.price}
                              </div>
                            </div>
                            <div className="badge" aria-label={`Rating ${r.rating}`}>
                              {r.rating.toFixed(1)}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {showMap ? (
                  <div className="card">
                    <div className="card-title">Map</div>
                    <div className="card-body">
                      <div className="map-placeholder" aria-label="Map view placeholder">
                        Map view will appear here once backend provides coordinates / map integration.
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </section>
          ) : null}

          {nav === "favorites" ? (
            <section className="panel">
              <div className="card">
                <div className="card-title">Your favorites</div>
                <div className="card-body">
                  {token ? (
                    <div className="empty">
                      Favorites API not wired yet. Once backend adds favorites endpoints, this page
                      will list saved restaurants.
                    </div>
                  ) : (
                    <div className="callout callout-warn">
                      Please log in to view and save favorites.
                      <div className="row row-gap" style={{ marginTop: 10 }}>
                        <Button variant="primary" onClick={() => setAuthMode("login")}>
                          Log in
                        </Button>
                        <Button variant="ghost" onClick={() => setAuthMode("signup")}>
                          Sign up
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>
          ) : null}

          {nav === "admin" ? (
            <section className="panel">
              <div className="card">
                <div className="card-title">Admin dashboard</div>
                <div className="card-body">
                  <div className="empty">
                    Admin management UI shell is ready. Once backend provides admin endpoints (e.g.
                    create/update restaurants), this section will enable listing management.
                  </div>
                </div>
              </div>
            </section>
          ) : null}
        </main>
      </div>

      <AuthModal
        open={Boolean(authMode)}
        mode={authMode || "login"}
        onClose={() => setAuthMode(null)}
        onAuthed={onAuthed}
        apiReady={apiReady}
      />

      <Toast message={toast.message} kind={toast.kind} onClose={() => setToast({ message: "" })} />
    </div>
  );
}

export default App;
