import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import client from "../api/client";
import AuthorImage from "../components/AuthorImage";
import ArticlePreview from "../components/ArticlePreview";
import FollowButton from "../components/FollowButton";
import type { Article, Profile as ProfileType, ProfileResponse, MultipleArticlesResponse } from "../types/api";

export default function Profile() {
  // :username z adresu /profile/:username
  const { username } = useParams<{ username: string }>();

  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(false);

    // Dwa niezależne zapytania równolegle: dane profilu + artykuły tego autora.
    // Promise.all czeka, aż OBA się zakończą — dzięki temu mamy jeden, spójny moment
    // wyłączenia "loading" (zamiast migotania, gdyby kończyły się w różnym czasie).
    Promise.all([
      client.get<ProfileResponse>(`/profiles/${username}`),
      // axios sam zbuduje query string: { author: username } -> ?author=<username>
      client.get<MultipleArticlesResponse>("/articles", { params: { author: username } }),
    ])
      .then(([profileResponse, articlesResponse]) => {
        if (!active) return;
        setProfile(profileResponse.data.profile);
        setArticles(articlesResponse.data.articles);
      })
      .catch(() => {
        if (active) setError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [username]);

  if (loading) {
    return <div className="profile-page container">Loading profile...</div>;
  }
  if (error || !profile) {
    return <div className="profile-page container">Failed to load profile.</div>;
  }

  return (
    <div className="profile-page">
      <div className="user-info">
        <div className="container">
          <div className="row">
            <div className="col-xs-12 col-md-10 offset-md-1">
              <AuthorImage src={profile.image} alt={profile.username} className="user-img" />
              <h4>{profile.username}</h4>
              {/* bio bywa puste -> renderujemy <p> tylko, gdy faktycznie coś jest. */}
              {profile.bio && <p>{profile.bio}</p>}
              <FollowButton username={profile.username} following={profile.following} />
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="row">
          <div className="col-xs-12 col-md-10 offset-md-1">
            <div className="articles-toggle">
              <ul className="nav nav-pills outline-active">
                {/* TODO: "Favorited Articles" wymaga query ?favorited=username — poza zakresem. */}
                <li className="nav-item">
                  <a className="nav-link active" href="">
                    My Articles
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="">
                    Favorited Articles
                  </a>
                </li>
              </ul>
            </div>

            {articles.length === 0 ? (
              <div className="article-preview">No articles are here... yet.</div>
            ) : (
              articles.map((article) => <ArticlePreview key={article.slug} article={article} />)
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
