"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export type CollectionStatus = "owned" | "wanted";

export interface CollectionEntry {
  status: CollectionStatus;
  phase?: string | null;
}

export type CollectionMap = Record<string, CollectionEntry>;

/**
 * Loads the signed-in user's collection from the Supabase `collections` table
 * and exposes helpers to set/clear a character's status. Updates are optimistic
 * (UI first) and then persisted; Row-Level Security keeps each user's rows
 * isolated.
 */
export function useCollection() {
  const supabase = createClient();
  const [collection, setCollection] = useState<CollectionMap>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data, error } = await supabase
        .from("collections")
        .select("character_id, status, phase");

      if (!active) return;
      if (error) {
        setError(error.message);
      } else {
        const map: CollectionMap = {};
        for (const row of data ?? []) {
          map[row.character_id] = {
            status: row.status as CollectionStatus,
            phase: row.phase,
          };
        }
        setCollection(map);
      }
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [supabase]);

  const setStatus = useCallback(
    async (
      characterId: string,
      status: CollectionStatus | null,
      phase?: string | null,
    ) => {
      // Optimistic update.
      const previous = collection;
      setCollection((prev) => {
        const next = { ...prev };
        if (status === null) {
          delete next[characterId];
        } else {
          next[characterId] = { status, phase: phase ?? prev[characterId]?.phase ?? null };
        }
        return next;
      });

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setError("You must be signed in.");
        setCollection(previous);
        return;
      }

      let result;
      if (status === null) {
        result = await supabase
          .from("collections")
          .delete()
          .eq("character_id", characterId)
          .eq("user_id", user.id);
      } else {
        result = await supabase.from("collections").upsert(
          {
            user_id: user.id,
            character_id: characterId,
            status,
            phase: phase ?? collection[characterId]?.phase ?? null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id,character_id" },
        );
      }

      if (result.error) {
        // Roll back on failure.
        setError(result.error.message);
        setCollection(previous);
      } else {
        setError(null);
      }
    },
    [supabase, collection],
  );

  return { collection, loading, error, setStatus };
}
