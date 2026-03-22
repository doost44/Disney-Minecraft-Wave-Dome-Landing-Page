"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import type { EditableImageKey } from "@/data/editableContent";
import { useEditableContentContext } from "./EditableContentContext";

const PROTOTYPE_PASSCODE = "123456";

interface ContentEditorModalProps {
  enabled: boolean;
}

export default function ContentEditorModal({ enabled }: ContentEditorModalProps) {
  const {
    imageList,
    updateImageSource,
    updateImageAlt,
    restoreImageDefault,
    restoreAllDefaults,
  } = useEditableContentContext();

  const [open, setOpen] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  const grouped = useMemo(() => {
    return imageList.reduce<Record<string, typeof imageList>>((acc, item) => {
      if (!acc[item.section]) {
        acc[item.section] = [];
      }
      acc[item.section].push(item);
      return acc;
    }, {});
  }, [imageList]);

  const onUnlock = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (passcode === PROTOTYPE_PASSCODE) {
      setUnlocked(true);
      setErrorMessage("");
      setPasscode("");
      return;
    }
    setErrorMessage("That prototype passcode didn't match. Please try again.");
  };

  const onFileUpload = (key: EditableImageKey, file: File | null) => {
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const nextSource = typeof reader.result === "string" ? reader.result : "";
      if (nextSource) {
        updateImageSource(key, nextSource);
        setStatusMessage("Changes saved for this browser.");
      }
    };
    reader.readAsDataURL(file);
  };

  if (!enabled) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-50 rounded-full border border-white/30 bg-[#0A1628]/85 px-4 py-2 text-xs font-semibold tracking-wide text-white shadow-lg backdrop-blur hover:bg-[#0E4D8B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00D4E8]"
      >
        Prototype Editor
      </button>

      {unlocked && (
        <div className="fixed bottom-20 right-5 z-40 rounded-full bg-[#00B5C5] px-3 py-1 text-[11px] font-bold text-white shadow-md">
          Prototype Content Editor Active
        </div>
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end justify-center bg-[#0A1628]/55 p-4 md:items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            aria-modal="true"
            role="dialog"
            aria-label="Prototype content editor"
          >
            <motion.div
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 24, opacity: 0 }}
              className="max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-3xl border border-white/20 bg-white shadow-2xl"
            >
              <div className="flex items-start justify-between gap-4 border-b border-[#E8D5A3]/60 bg-[#F8FFFE] px-6 py-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1B6CA8]">
                    Prototype tools only
                  </p>
                  <h2 className="mt-1 text-2xl font-bold text-[#0A1628]">Prototype Content Editor</h2>
                  <p className="mt-1 text-sm text-[#0A1628]/65">
                    Demo utility for local or staging concepts. This is not secure authentication.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg border border-[#1B6CA8]/20 px-3 py-1.5 text-sm font-medium text-[#0A1628]/70 hover:bg-[#1B6CA8]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00D4E8]"
                >
                  Close
                </button>
              </div>

              {!unlocked ? (
                <form onSubmit={onUnlock} className="p-6 sm:p-8">
                  <label htmlFor="prototype-passcode" className="mb-2 block text-sm font-semibold text-[#0A1628]">
                    Enter prototype passcode
                  </label>
                  <input
                    id="prototype-passcode"
                    type="password"
                    value={passcode}
                    onChange={(event) => setPasscode(event.target.value)}
                    className="w-full rounded-xl border border-[#1B6CA8]/25 px-4 py-3 text-sm text-[#0A1628] outline-none focus:border-[#00B5C5] focus:ring-2 focus:ring-[#00B5C5]/30"
                    autoComplete="off"
                    required
                  />
                  {errorMessage && (
                    <p className="mt-3 rounded-lg bg-[#FDF2F2] px-3 py-2 text-sm text-[#9F1239]">{errorMessage}</p>
                  )}
                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      type="submit"
                      className="rounded-xl bg-[#1B6CA8] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0E4D8B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00D4E8]"
                    >
                      Unlock Editor
                    </button>
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      className="rounded-xl border border-[#1B6CA8]/20 px-5 py-2.5 text-sm font-semibold text-[#0A1628]/70 hover:bg-[#1B6CA8]/10"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="max-h-[75vh] overflow-y-auto p-6 sm:p-8">
                  <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm text-[#0A1628]/70">
                      Changes are saved in localStorage for this browser and can be reset anytime.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        restoreAllDefaults();
                        setStatusMessage("Defaults restored.");
                      }}
                      className="rounded-xl border border-[#C9A40B]/30 bg-[#FDF8EE] px-4 py-2 text-sm font-semibold text-[#8B6914] hover:bg-[#F5E6C8]"
                    >
                      Restore All Defaults
                    </button>
                  </div>
                  {statusMessage && (
                    <p className="mb-5 rounded-lg bg-[#E6FFFA] px-3 py-2 text-sm text-[#0E4D8B]">
                      {statusMessage}
                    </p>
                  )}

                  <div className="space-y-8">
                    {Object.entries(grouped).map(([section, items]) => (
                      <div key={section} className="rounded-2xl border border-[#E8D5A3]/45 bg-[#F8FFFE] p-5">
                        <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-[#1B6CA8]">{section}</h3>
                        <div className="grid gap-4 md:grid-cols-2">
                          {items.map((slot) => (
                            <div key={slot.key} className="rounded-xl border border-[#1B6CA8]/15 bg-white p-4 shadow-sm">
                              <p className="text-sm font-semibold text-[#0A1628]">{slot.label}</p>
                              <Image
                                src={slot.src}
                                alt={slot.alt}
                                width={600}
                                height={240}
                                unoptimized
                                className="mt-3 h-28 w-full rounded-lg object-cover"
                              />
                              <label className="mt-3 block text-xs font-semibold uppercase tracking-wide text-[#1B6CA8]">
                                Use Image URL
                                <input
                                  type="url"
                                  value={slot.src}
                                  onChange={(event) => updateImageSource(slot.key, event.target.value)}
                                  className="mt-1 w-full rounded-lg border border-[#1B6CA8]/20 px-3 py-2 text-sm text-[#0A1628] focus:border-[#00B5C5] focus:outline-none focus:ring-2 focus:ring-[#00B5C5]/30"
                                  placeholder="https://..."
                                />
                              </label>
                              <label className="mt-3 block text-xs font-semibold uppercase tracking-wide text-[#1B6CA8]">
                                Alt Text
                                <input
                                  type="text"
                                  value={slot.alt}
                                    onChange={(event) => updateImageAlt(slot.key, event.target.value)}
                                  className="mt-1 w-full rounded-lg border border-[#1B6CA8]/20 px-3 py-2 text-sm text-[#0A1628] focus:border-[#00B5C5] focus:outline-none focus:ring-2 focus:ring-[#00B5C5]/30"
                                  placeholder="Describe the photo"
                                />
                              </label>
                              <div className="mt-3 flex flex-wrap items-center gap-2">
                                <label className="inline-flex cursor-pointer items-center rounded-lg bg-[#1B6CA8] px-3 py-2 text-xs font-semibold text-white hover:bg-[#0E4D8B]">
                                  Upload New Photo
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(event) => onFileUpload(slot.key, event.target.files?.[0] ?? null)}
                                    className="sr-only"
                                  />
                                </label>
                                <button
                                  type="button"
                                  onClick={() => {
                                    restoreImageDefault(slot.key);
                                    setStatusMessage("Image restored to default.");
                                  }}
                                  className="rounded-lg border border-[#1B6CA8]/20 px-3 py-2 text-xs font-semibold text-[#0A1628]/70 hover:bg-[#1B6CA8]/10"
                                >
                                  Restore Default
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
