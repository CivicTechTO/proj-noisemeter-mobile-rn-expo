import { useCallback, useEffect, useRef, useState } from "react";
import { Audio } from "expo-av";
import type { RecordingStatus } from "expo-av/build/Audio";
import * as FileSystem from "expo-file-system";

import {
  getDbSplFromAudioMeasurement,
  getMeasurementFromExpoMetering,
  wait,
} from "../utils";

const useAudioRecording = () => {
  const [currentAudioReading, setCurrentAudioReading] = useState<number | null>(
    null
  );
  const [inProgress, setInProgress] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const [permissionResponse, requestPermission] = Audio.usePermissions();
  const audioSamples = useRef<number[]>([]);

  async function startRecording() {
    try {
      console.log("Requesting permissions..");
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      audioSamples.current = [];

      console.log("Starting recording..");
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.LOW_QUALITY,
        (status: RecordingStatus) => {
          const meter = status.metering ?? 0;
          const float = getMeasurementFromExpoMetering(meter);
          audioSamples.current.push(float);
        },
        50
      );
      recordingRef.current = recording;
      setInProgress(true);
      console.log("Recording started");
    } catch (err) {
      console.error("Failed to start recording", err);
      setError(JSON.stringify(err));
    }
  }

  async function stopRecording() {
    console.log("Stopping recording..");
    if (recordingRef.current !== null) {
      await recordingRef.current?.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });
      const uri = recordingRef.current.getURI();
      console.log("Recording stopped and stored at", uri);

      const averageMeasurement =
        audioSamples.current.reduce(
          (acc: number, curr: number) => acc + curr,
          0
        ) / audioSamples.current.length;
      const db = getDbSplFromAudioMeasurement(averageMeasurement);
      console.log(`Average db: ${db.toFixed(1)}dB (SPL)`);
      setCurrentAudioReading(db);
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
      recordingRef.current = null;
      setInProgress(false);
    }
  }

  const takeSample = useCallback(async () => {
    await startRecording();
    await wait(1000);
    await stopRecording();
  }, [recordingRef.current]);

  useEffect(() => {
    if (!permissionResponse?.granted) {
      void requestPermission().then((response: Audio.PermissionResponse) => {
        // {"canAskAgain": true, "expires": "never", "granted": false, "status": "undetermined"}
        console.log(response);
      });
    }
  }, [permissionResponse, requestPermission]);

  return {
    currentAudioReading,
    hasAudioPermissions: !!permissionResponse?.granted,
    permissionResponse,
    requestPermission,
    startRecording,
    stopRecording,
    takeSample,
    inProgress,
    error,
  };
};

export default useAudioRecording;
