"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export type CollectionStatus = "owned" | "wanted";

export interface CollectionEntry {
  status: CollectionStatus;
  phase?: string | null;
}

export type CollectionMap = Record<string, CollectionEntry>;

const LOCAL_KEY = "sprunkfind.collection.v1";

const SUPABASE_CONFIGURED =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function readLocal(): CollectionMap {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(LOCAL_KEY) || "{}");
  } catch {
    return {};
  }
}

function writeLocal(map: CollectionMap) {
  try {
    window.localStorage.setItem(LOCAL_KEY, JSON.stringify(map));
  } catch {
    /* storage full or blocked — UI still works for this session */
  }
}

/**
 * Collection state with two backends:
 *  - Guest mode (default): saved on this device via localStorage. Zero setup.
 *  - Synced mode: when Supabase is configured AND the visitor is signed in,
 *    rows live in the `collections` table (RLS-scoped per user) so the
 *    collection follows them across devices.
 */
export function useCollection() {
  const [collection, setCollection] = useState<CollectionMap>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [synced, setSynced] = useState(false);

  useEffect(() => {
    let active = true;

    (async () => {
      // Guest mode when Supabase isn't set up at all.
      if (!SUPABASE_CONFIGURED) {
        if (active) {
          setCollection(readLocal());
          setSynced(false);
          setLoading(false);
        }
        return;
      }

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Configured but signed out → still usable, just local.
      if (!user) {
        if (active) {
          setCollection(readLocal());
          setSynced(false);
          setLoading(false);
        }
        return;
      }

      const { data, error } = await supabase
        .from("collections")
        .select("character_id, status, phase");

      if (!active) return;
      if (error) {
        // Fall back to local rather than showing an empty broken grid.
        setError(error.message);
        setCollection(readLocal());
        setSynced(false);
      } else {
        const map: CollectionMap = {};
        for (const row of data ?? []) {
          map[row.character_id] = {
            status: row.status as CollectionStatus,
            phase: row.phase,
          };
        }
        setCollection(map);
        setSynced(true);
      }
      setLoading(false);
    })();

    return () => {
      active = false;
    };
  }, []);

  const setStatus = useCallback(
    async (
      itemKey: string,
      status: CollectionStatus | null,
      phase?: string | null,
    ) => {
      const previous = collection;

      // Optimistic update (and the source of truth for guest mode).
      const next: CollectionMap = { ...previous };
      if (status === null) delete next[itemKey];
      else
        next[itemKey] = {
          status,
          phase: phase !== undefined ? phase : (previous[itemKey]?.phase ?? null),
        };
      setCollection(next);

      if (!synced) {
        writeLocal(next);
        return;
      }

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        // Session expired mid-use — keep the change locally.
        writeLocal(next);
        setSynced(false);
        return;
      }

      const result =
        status === null
          ? await supabase
              .from("collections")
              .delete()
              .eq("character_id", itemKey)
              .eq("user_id", user.id)
          : await supabase.from("collections").upsert(
              {
                user_id: user.id,
                character_id: itemKey,
                status,
                phase: next[itemKey]?.phase ?? null,
                updated_at: new Date().toISOString(),
              },
              { onConflict: "user_id,character_id" },
            );

      if (result.error) {
        setError(result.error.message);
        setCollection(previous);
      } else {
        setError(null);
      }
    },
    [collection, synced],
  );

  return { collection, loading, error, setStatus, synced };
}
