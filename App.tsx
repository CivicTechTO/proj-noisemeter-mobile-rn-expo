import { StatusBar } from "expo-status-bar";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import useAudioRecording from "./src/hooks/useAudioRecording";
import useFileSystemCheck from "./src/hooks/useFileSystemCheck";

export default function App() {
  useFileSystemCheck();
  const {
    error,
    readingCache,
    currentReading,
    hasAudioPermissions,
    startRecording,
    stopRecording,
    isRecording,
    numberOfReadings,
  } = useAudioRecording();

  // const buttonDisabled = !hasAudioPermissions || isRecording;

  return (
    <View style={styles.container}>
      <View style={styles.resultsContainer}>
        <Text style={styles.title}>Audio Meter App</Text>
        <Text style={[styles.dbReading, { fontSize: 16 }]}>
          {numberOfReadings} samples taken
        </Text>
        {!isRecording && (
          <Text style={styles.dbReading}>
            {currentReading?.db ? currentReading.db.toFixed(2) + "dB" : ""}
          </Text>
        )}
        {!isRecording && (
          <Text style={[styles.dbReading, { fontSize: 16 }]}>
            {currentReading?.meter
              ? "Meter: " + currentReading.meter.toFixed(2)
              : ""}
          </Text>
        )}
        {!isRecording && (
          <Text style={[styles.dbReading, { fontSize: 16 }]}>
            {currentReading?.float
              ? "Float: " + currentReading.float.toFixed(2)
              : ""}
          </Text>
        )}
        {isRecording && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" />
          </View>
        )}
      </View>
      <TouchableOpacity
        onPressOut={isRecording ? stopRecording : startRecording}
      >
        <View style={[styles.button]}>
          <Text style={[styles.buttonText]}>
            {!isRecording ? "TAKE SAMPLE" : "READING..."}
          </Text>
        </View>
      </TouchableOpacity>
      {error && <Text style={[styles.title, { fontSize: 16 }]}>{error}</Text>}

      <Text style={[styles.title, { fontSize: 16 }]}>
        {JSON.stringify(readingCache)}
      </Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    alignItems: "center",
    justifyContent: "center",
  },
  resultsContainer: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 300,
  },
  title: {
    color: "#f7f7f7",
    textAlign: "center",
    fontSize: 30,
  },
  dbReading: { color: "#f7f7f7", fontSize: 60, fontWeight: "bold" },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
    minHeight: 80,
  },
  button: {
    backgroundColor: "red",
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    elevation: 3,
  },
  buttonText: {
    textAlign: "center",
    color: "#f7f7f7",
    fontSize: 30,
    fontWeight: "bold",
  },
});
