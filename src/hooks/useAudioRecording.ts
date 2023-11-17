import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Audio } from "expo-av";
import type { RecordingStatus } from "expo-av/build/Audio";
import * as FileSystem from "expo-file-system";
import { useAtom } from "jotai/react";

import {
  getDbSplFromAudioMeasurement,
  getMeasurementFromExpoMetering,
  wait,
} from "../utils";
import { readingsCacheAtom } from "../atoms";
import usePrevious from "./usePrevious";

export type Reading = {
  db: number;
  meter: number;
  float: number;
};

const SAMPLE_LENGTH_MS = 2000;

const useAudioRecording = () => {
  const [readingCache, setReadingCache] = useAtom(readingsCacheAtom);
  const numberOfReadings = readingCache.length;
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isTakingSample, setIsTakingSample] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const [permissionResponse, requestPermission] = Audio.usePermissions();
  const prevIsTakingSample = usePrevious(isTakingSample);
  const audioSamples = useRef<number[]>([]);
  const meterSamples = useRef<number[]>([]);

  async function startSampling() {
    try {
      audioSamples.current = [];
      console.log("Starting sample..");
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.LOW_QUALITY,
        (status: RecordingStatus) => {
          const meter = status.metering ?? 0;
          const float = getMeasurementFromExpoMetering(meter);
          audioSamples.current.push(float);

          meterSamples.current.push(meter);
        },
        50
      );
      recordingRef.current = recording;
      setIsTakingSample(true);
      console.log("Recording started");
    } catch (err) {
      console.error("Failed to start recording", err);
      setError(JSON.stringify(err));
    }
  }

  async function stopSampling() {
    console.log("Stopping sample..");
    console.log(recordingRef.current);
    if (recordingRef.current !== null) {
      // console.log(recordingRef?.current);
      await recordingRef.current.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });
      const uri = recordingRef.current.getURI();
      console.log("Recording stopped and stored at", uri);

      const float =
        audioSamples.current.reduce(
          (acc: number, curr: number) => acc + curr,
          0
        ) / audioSamples.current.length;
      const meter =
        meterSamples.current.reduce(
          (acc: number, curr: number) => acc + curr,
          0
        ) / meterSamples.current.length;
      const db = getDbSplFromAudioMeasurement(float);
      console.log(`Average db: ${db.toFixed(1)}dB (SPL)`);
      audioSamples.current = [];

      try {
        if (uri !== null) {
          console.log(`Deleting file at ${uri}...`);
          await FileSystem.deleteAsync(uri, { idempotent: false });
          console.log("File deleted");
        } else {
          console.log("No URI found for recorded file");
        }
      } catch (e) {
        console.warn("Error deleting file.");
        console.error(e);
        setError(JSON.stringify(e));
      }
      setIsTakingSample(false);
      recordingRef.current = null;
      return { db, float, meter } as Reading;
    }
  }

  const dummyref = {
    _canRecord: true,
    _cleanupForUnloadedRecorder: "[Function anonymous]",
    _finalDurationMillis: 0,
    _isDoneRecording: false,
    _onRecordingStatusUpdate: "[Function anonymous]",
    _options: {
      android: {
        audioEncoder: 1,
        bitRate: 128000,
        extension: ".3gp",
        numberOfChannels: 2,
        outputFormat: 1,
        sampleRate: 44100,
      },
      ios: {
        audioQuality: 0,
        bitRate: 128000,
        extension: ".caf",
        linearPCMBitDepth: 16,
        linearPCMIsBigEndian: false,
        linearPCMIsFloat: false,
        numberOfChannels: 2,
        sampleRate: 44100,
      },
      isMeteringEnabled: true,
      keepAudioActiveHint: true,
      web: { bitsPerSecond: 128000, mimeType: "audio/webm" },
    },
    _pollingLoop: "[Function anonymous]",
    _progressUpdateIntervalMillis: 50,
    _progressUpdateTimeoutVariable: 182,
    _subscription: {
      "@@nativeEmitterSubscription@@": { remove: "[Function remove]" },
      remove: "[Function remove]",
    },
    _uri: "file:///data/user/0/host.exp.exponent/cache/ExperienceData/%2540barnardnicholas%252Fpn-expo/Audio/recording-8f9c3419-d75b-4fe6-b0c9-d41d930eb9c1.3gp",
    getStatusAsync: "[Function anonymous]",
  };

  const takeSample = async () => {
    await startSampling();
    await wait(SAMPLE_LENGTH_MS);
    console.log(recordingRef.current);
    const reading = await stopSampling();
    console.log(reading);
    if (!!reading) {
      // setCurrentReading(reading)
      setReadingCache([...readingCache, reading]);
    }
  };

  const startRecording = async () => {
    setIsRecording(true);
    takeSample();
  };

  const stopRecording = useCallback(async () => {
    setIsRecording(false);
    // if (isTakingSample) {
    //   const reading = await stopSampling();
    //   console.log(reading);
    //   if (!!reading) {
    //     // setCurrentReading(reading)
    //     setReadingCache([...readingCache, reading]);
    //   }
    // }
  }, []);

  useEffect(() => {
    if (isRecording && !isTakingSample && prevIsTakingSample) {
      takeSample();
    }
  }, [isRecording, isTakingSample, prevIsTakingSample]);

  useEffect(() => {
    if (!permissionResponse?.granted) {
      void requestPermission().then((response: Audio.PermissionResponse) => {
        // {"canAskAgain": true, "expires": "never", "granted": false, "status": "undetermined"}
        console.log(response);
      });
    }
  }, [permissionResponse, requestPermission]);

  const currentReading = useMemo<Reading | null>(() => {
    if (!readingCache?.length) return null;
    return readingCache.pop() as Reading;
  }, [readingCache]);

  return {
    currentReading,
    readingCache,
    hasAudioPermissions: !!permissionResponse?.granted,
    permissionResponse,
    requestPermission,
    startRecording,
    stopRecording,
    startSampling,
    stopSampling,
    takeSample,
    isTakingSample,
    isRecording,
    error,
    numberOfReadings,
  };
};

export default useAudioRecording;
