import { atomWithStorage } from "jotai/utils";
import { Reading } from "../hooks/useAudioRecording";

export const readingsCacheAtom = atomWithStorage<Reading[]>("readingCache", []);
