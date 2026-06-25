import { useState } from "react";
import { useHistory } from "react-router-dom";

import client from "../api/client";
import { useAuthStore } from "../context/authStore";
import type { ProfileResponse } from "../types/api";

interface FollowButtonProps {
  username: string;
  following: boolean;
}

/**
 * Przycisk "obserwuj autora" z optymistycznym UI (analogicznie do FavoriteButton).
 * Follow nie ma licznika w API, więc obsługujemy tylko flagę `following`.
 */
export default function FollowButton({ username, following }: FollowButtonProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const history = useHistory();

  const [isFollowing, setIsFollowing] = useState(following);
  const [pending, setPending] = useState(false);

  const toggleFollow = async () => {
    if (!isAuthenticated) {
      history.push("/login");
      return;
    }
    if (pending) return;

    const previousFollowing = isFollowing; // do rollbacku

    // Optymistycznie przełączamy stan, zanim serwer odpowie.
    const nextFollowing = !isFollowing;
    setIsFollowing(nextFollowing);
    setPending(true);

    try {
      // POST = obserwuj, DELETE = przestań obserwować.
      const response = nextFollowing
        ? await client.post<ProfileResponse>(`/profiles/${username}/follow`)
        : await client.delete<ProfileResponse>(`/profiles/${username}/follow`);

      // Synchronizacja z prawdą serwera.
      setIsFollowing(response.data.profile.following);
    } catch {
      setIsFollowing(previousFollowing); // rollback przy błędzie
    } finally {
      setPending(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggleFollow}
      disabled={pending}
      // Obserwowany -> wypełniony (btn-secondary); nieobserwowany -> obrys (btn-outline-secondary).
      className={`btn btn-sm ${isFollowing ? "btn-secondary" : "btn-outline-secondary"} action-btn`}
    >
      <i className="ion-plus-round" />
      &nbsp; {isFollowing ? "Unfollow" : "Follow"} {username}
    </button>
  );
}
