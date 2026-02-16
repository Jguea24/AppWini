import { StyleSheet } from "react-native";

export const registerStyles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
  },
  scroll: {
    flex: 1,
    backgroundColor: "#283b58",
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 24,
    justifyContent: "flex-start",
  },
  header: {
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
    marginTop: 8,
    marginBottom: 18,
    alignItems: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#f9f9fa",
  },
  subtitle: {
    fontSize: 14,
    color: "#f8fafc",
    marginTop: 6,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 20,
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
    elevation: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#1b59b6",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: 14,
    color: "#111827",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    marginBottom: 14,
    backgroundColor: "#fff",
  },
  inputIcon: {
    marginLeft: 12,
    marginRight: 8,
  },
  inputWithIcon: {
    flex: 1,
    paddingRight: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#111827",
  },
  inputWithoutLeftIcon: {
    paddingLeft: 14,
  },
  passwordToggle: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  button: {
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: "#9ca3af",
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 16,
  },
  error: {
    color: "#dc2626",
    fontSize: 13,
    marginBottom: 8,
    textAlign: "center",
  },
  backText: {
    color: "#2563eb",
    textAlign: "center",
    marginTop: 16,
    fontSize: 14,
    fontWeight: "500",
  },

  logo: {
    width: 110,
    height: 110,
    marginBottom: 10,
    resizeMode: "contain",
  },
});
