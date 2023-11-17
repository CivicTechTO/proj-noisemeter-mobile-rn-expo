import { useEffect } from "react";
import * as FileSystem from "expo-file-system";

const dummyUri = "file:///data/user/0/host.exp.exponent/files/";
const dummyResults = {
  results: [
    ".com.google.firebase.crashlytics.files.v2:host.exp.exponent",
    "generatefid.lock",
    "ExperienceData",
    ".expo-internal",
    "UNVERSIONED",
    "PersistedInstallation.W0RFRkFVTFRd+MTozNjczMTUxNzQ2OTM6YW5kcm9pZDpmOTY4ZWZiYjQxZDFmYTdh.json",
    "profileinstaller_profileWrittenFor_lastUpdateTime.dat",
    "profileInstalled",
    "BridgeReactNativeDevBundle.js",
    "dev.expo.modules.core.logging.dev.expo.updates",
  ],
};
const dummyResults2 = {
  results: [
    ".com.google.firebase.crashlytics.files.v2:host.exp.exponent",
    "generatefid.lock",
    "ExperienceData",
    ".expo-internal",
    "UNVERSIONED",
    "PersistedInstallation.W0RFRkFVTFRd+MTozNjczMTUxNzQ2OTM6YW5kcm9pZDpmOTY4ZWZiYjQxZDFmYTdh.json",
    "profileinstaller_profileWrittenFor_lastUpdateTime.dat",
    "profileInstalled",
    "BridgeReactNativeDevBundle.js",
    "dev.expo.modules.core.logging.dev.expo.updates",
  ],
};

const useFileSystemCheck = () => {
  async function getRecordingsInfo() {
    const directoryUri = FileSystem.documentDirectory;
    console.log({ directoryUri });
    if (!!directoryUri) {
      const results = await FileSystem.readDirectoryAsync(directoryUri);

      console.log({ results });
    }
  }

  useEffect(() => {
    getRecordingsInfo();
  }, []);
};

export default useFileSystemCheck;
