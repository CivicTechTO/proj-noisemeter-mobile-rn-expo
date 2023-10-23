import { StatusBar } from "expo-status-bar";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import useAudioRecording from "./src/hooks/useAudioRecording";
import { useState } from "react";

export default function App() {
  const [list, setList] = useState<number[]>([]);
  const {
    error,
    currentAudioReading,
    hasAudioPermissions,
    takeSample,
    inProgress,
  } = useAudioRecording();

  const buttonDisabled = !hasAudioPermissions || inProgress;
  // const inProgress = false;
  // const buttonDisabled = false;
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Audio Meter App</Text>
      {!inProgress && (
        <Text style={styles.dbReading}>
          {currentAudioReading ? currentAudioReading.toFixed(2) + "dB" : ""}
        </Text>
        // <Text style={styles.dbReading}>{list.join(",")}</Text>
      )}
      {inProgress && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
        </View>
      )}
      <TouchableOpacity
        // onPress={() => {
        //   const newList = [...list, list.length];
        //   setList(newList);
        // }}
        onPressOut={takeSample}
        disabled={buttonDisabled}
      >
        <View
          style={[
            styles.button,
            buttonDisabled && { backgroundColor: "#666666" },
          ]}
        >
          <Text
            style={[styles.buttonText, buttonDisabled && { color: "#888888" }]}
          >
            {!inProgress ? "TAKE SAMPLE" : "READING..."}
          </Text>
        </View>
      </TouchableOpacity>
      {error && <Text style={[styles.title, { fontSize: 16 }]}>{error}</Text>}
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
