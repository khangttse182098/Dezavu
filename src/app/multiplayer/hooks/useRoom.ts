"use client";

import { useCallback, useState } from "react";
import usePartySocket from "partysocket/react";
import {
  TClientMessage,
  TRoomState,
  TServerMessage,
} from "@/shared/multiplayer";

export const PARTYKIT_HOST =
  process.env.NEXT_PUBLIC_PARTYKIT_HOST || "127.0.0.1:1999";

export const useRoom = ({
  code,
  playerId,
  name,
  image,
}: {
  code: string;
  playerId: string;
  name: string;
  image: string | null;
}) => {
  const [roomState, setRoomState] = useState<TRoomState | null>(null);
  const [error, setError] = useState("");

  const socket = usePartySocket({
    host: PARTYKIT_HOST,
    room: code,
    onOpen() {
      //(re)introduce ourselves on every connect so reconnects restore the same player
      const message: TClientMessage = { type: "join", playerId, name, image };
      socket.send(JSON.stringify(message));
    },
    onMessage(event) {
      const message: TServerMessage = JSON.parse(event.data);
      if (message.type === "state") {
        setRoomState(message.state);
      } else if (message.type === "error") {
        setError(message.message);
      }
    },
  });

  const send = useCallback(
    (message: TClientMessage) => {
      socket.send(JSON.stringify(message));
    },
    [socket]
  );

  return { roomState, error, clearError: () => setError(""), send };
};
