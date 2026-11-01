const STORAGE_KEY = "dezavu_player_id";

//a stable per-browser id so a refresh or reconnect keeps your seat and score
export const getPlayerId = () => {
  if (typeof window === "undefined") return "";

  let playerId = window.localStorage.getItem(STORAGE_KEY);
  if (!playerId) {
    playerId = crypto.randomUUID();
    window.localStorage.setItem(STORAGE_KEY, playerId);
  }
  return playerId;
};
