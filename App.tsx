import { StatusBar } from "expo-status-bar";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import useAudioRecording from "./src/hooks/useAudioRecording";

export default function App() {
  const { currentAudioReading, hasAudioPermissions, takeSample, inProgress } =
    useAudioRecording();

  const buttonDisabled = !hasAudioPermissions || inProgress;
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Audio Meter App</Text>
      {!inProgress && (
        <Text style={styles.dbReading}>
          {currentAudioReading ? currentAudioReading.toFixed(2) + "dB" : ""}
        </Text>
      )}
      {inProgress && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
        </View>
      )}
      <TouchableOpacity onPress={takeSample} disabled={buttonDisabled}>
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
