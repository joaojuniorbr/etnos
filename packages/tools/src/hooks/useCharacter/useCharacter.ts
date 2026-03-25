"use client";

import { useEffect, useRef, useState } from "react";

import { useQuery } from "@tanstack/react-query";
import type { CharacterInterface } from "@etnos/types";
import { charactersService } from "../../services";

const CHARACTER_STORAGE_KEY = "selectedCharacter";
const CHARACTER_CHANGE_EVENT = "etnos:selected-character-change";

type UseCharacterOptions = {
  fetchList?: boolean;
};

export const useCharacter = (options?: UseCharacterOptions) => {
  const fetchList = options?.fetchList ?? true;

  const [selectedCharacter, setSelectedCharacter] =
    useState<CharacterInterface>();
  const requestSequenceRef = useRef(0);

  const setCharacter = (slug: string) => {
    const requestId = ++requestSequenceRef.current;

    if (!slug) {
      setSelectedCharacter(undefined);
      return;
    }

    void charactersService
      .getCharacterBySlug(slug)
      .then((res) => {
        if (requestId !== requestSequenceRef.current) {
          return;
        }

        setSelectedCharacter(res ?? undefined);
      })
      .catch(() => {
        if (requestId !== requestSequenceRef.current) {
          return;
        }

        setSelectedCharacter(undefined);
      });
  };

  const selectCharacter = (character: string) => {
    localStorage.setItem(CHARACTER_STORAGE_KEY, character);
    globalThis.window.dispatchEvent(
      new CustomEvent(CHARACTER_CHANGE_EVENT, {
        detail: { slug: character },
      }),
    );
  };

  useEffect(() => {
    const syncSelectedCharacter = (slug?: string | null) => {
      setCharacter(slug ?? "");
    };

    syncSelectedCharacter(localStorage.getItem(CHARACTER_STORAGE_KEY));

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== CHARACTER_STORAGE_KEY) {
        return;
      }

      syncSelectedCharacter(event.newValue);
    };

    const handleCharacterChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ slug?: string }>;
      syncSelectedCharacter(customEvent.detail?.slug);
    };

    globalThis.window.addEventListener("storage", handleStorage);
    globalThis.window.addEventListener(
      CHARACTER_CHANGE_EVENT,
      handleCharacterChange,
    );

    return () => {
      globalThis.window.removeEventListener("storage", handleStorage);
      globalThis.window.removeEventListener(
        CHARACTER_CHANGE_EVENT,
        handleCharacterChange,
      );
    };
  }, []);

  return {
    selectedCharacter,
    selectCharacter,
    ...useQuery<CharacterInterface[]>({
      queryKey: ["character", "all"],
      enabled: fetchList,
      queryFn: () => charactersService.getCharacters(),
    }),
  };
};
