"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  editableImageDefaults,
  EDITABLE_CONTENT_STORAGE_KEY,
  EDITABLE_IMAGE_KEYS,
  type EditableImageKey,
  type EditableImageSlot,
} from "@/data/editableContent";

type EditableImageMap = Record<EditableImageKey, EditableImageSlot>;

function getDefaultMap(): EditableImageMap {
  return EDITABLE_IMAGE_KEYS.reduce((acc, key) => {
    acc[key] = { ...editableImageDefaults[key] };
    return acc;
  }, {} as EditableImageMap);
}

function getInitialMap(): EditableImageMap {
  const defaults = getDefaultMap();
  if (typeof window === "undefined") {
    return defaults;
  }

  const stored = window.localStorage.getItem(EDITABLE_CONTENT_STORAGE_KEY);
  if (!stored) {
    return defaults;
  }

  try {
    const parsed = JSON.parse(stored) as Partial<EditableImageMap>;
    const next = { ...defaults };
    for (const key of EDITABLE_IMAGE_KEYS) {
      const incoming = parsed[key];
      if (!incoming) {
        continue;
      }
      next[key] = {
        ...next[key],
        src: incoming.src ?? next[key].src,
        alt: incoming.alt ?? next[key].alt,
      };
    }
    return next;
  } catch {
    console.warn("Prototype editable content in localStorage was invalid and has been reset.");
    window.localStorage.removeItem(EDITABLE_CONTENT_STORAGE_KEY);
    return defaults;
  }
}

export default function useEditableContent() {
  const [images, setImages] = useState<EditableImageMap>(getInitialMap);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(EDITABLE_CONTENT_STORAGE_KEY, JSON.stringify(images));
  }, [images]);

  const updateImageSource = useCallback((key: EditableImageKey, src: string) => {
    setImages((previous) => ({
      ...previous,
      [key]: {
        ...previous[key],
        src,
      },
    }));
  }, []);

  const updateImageAlt = useCallback((key: EditableImageKey, alt: string) => {
    setImages((previous) => ({
      ...previous,
      [key]: {
        ...previous[key],
        alt,
      },
    }));
  }, []);

  const restoreImageDefault = useCallback((key: EditableImageKey) => {
    setImages((previous) => ({
      ...previous,
      [key]: {
        ...editableImageDefaults[key],
      },
    }));
  }, []);

  const restoreAllDefaults = useCallback(() => {
    setImages(getDefaultMap());
  }, []);

  const imageList = useMemo(() => EDITABLE_IMAGE_KEYS.map((key) => images[key]), [images]);

  return {
    images,
    imageList,
    updateImageSource,
    updateImageAlt,
    restoreImageDefault,
    restoreAllDefaults,
  };
}
