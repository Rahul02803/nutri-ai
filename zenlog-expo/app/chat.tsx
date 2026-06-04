import React, { useState, useRef, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native";
import { useStore } from "../store/useStore";
import { useRouter } from "expo-router";
import { 
  ArrowLeft as LucideArrowLeft, 
  Send as LucideSend, 
  Sparkles as LucideSparkles 
} from "lucide-react-native";

const ArrowLeft = LucideArrowLeft as any;
const Send = LucideSend as any;
const Sparkles = LucideSparkles as any;
import { askGeminiCoach } from "../services/gemini";

export default function ChatScreen() {
  const router = useRouter();
  const {
    user,
    meals,
    weightLogs,
    chatHistory,
    sendChatMessage,
    receiveChatCoachMessage
  } = useStore();

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  if (!user) return null;

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [chatHistory, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const query = input.trim();
    setInput("");
    
    // Add user message to local state
    sendChatMessage(query);
    setLoading(true);

    try {
      // Call official Gemini REST Coach model
      const reply = await askGeminiCoach(query, user, meals, weightLogs);
      receiveChatCoachMessage(reply);
    } catch (err) {
      console.error(err);
      receiveChatCoachMessage("Sorry, I had a small connection issue. But keep pushing towards your calories target! 🥑");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      {/* Navigation Topbar */}
      <View style={styles.topbar}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={20} color="#111827" />
        </TouchableOpacity>
        
        <View style={styles.coachNameWrapper}>
          <Text style={styles.coachTitle}>ZenLog AI Coach</Text>
          <View style={styles.onlineBadge}>
            <View style={styles.greenDot} />
            <Text style={styles.onlineText}>Active Support</Text>
          </View>
        </View>

        <View style={styles.logoPill}>
          <Sparkles size={12} color="#14B8A6" />
        </View>
      </View>

      {/* Messages Scroll Area */}
      <ScrollView 
        ref={scrollViewRef}
        style={styles.messageScroll} 
        contentContainerStyle={styles.messageContent}
        showsVerticalScrollIndicator={false}
      >
        {chatHistory.map((msg, idx) => {
          const isUser = msg.role === "user";
          return (
            <View 
              key={idx} 
              style={[
                styles.bubbleRow, 
                isUser ? styles.bubbleRowUser : styles.bubbleRowCoach
              ]}
            >
              {!isUser && <Text style={styles.bubbleAvatar}>🤖</Text>}
              <View 
                style={[
                  styles.bubble, 
                  isUser ? styles.bubbleUser : styles.bubbleCoach
                ]}
              >
                <Text style={[styles.bubbleText, isUser ? styles.bubbleTextUser : styles.bubbleTextCoach]}>
                  {msg.text}
                </Text>
                <Text style={[styles.bubbleTime, isUser ? styles.bubbleTimeUser : styles.bubbleTimeCoach]}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            </View>
          );
        })}

        {loading && (
          <View style={[styles.bubbleRow, styles.bubbleRowCoach]}>
            <Text style={styles.bubbleAvatar}>🤖</Text>
            <View style={[styles.bubble, styles.bubbleCoach, styles.loadingBubble]}>
              <ActivityIndicator size="small" color="#6B7280" />
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom Message Input Bar */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Ask Coach: 'Suggest a high-protein Indian snack'..."
          placeholderTextColor="#9CA3AF"
          multiline={false}
          onSubmitEditing={handleSend}
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
          <Send size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8FA",
  },
  topbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingHorizontal: 20,
    paddingTop: 54,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
  },
  coachNameWrapper: {
    alignItems: "center",
  },
  coachTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: "#111827",
    letterSpacing: -0.2,
  },
  onlineBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#10B981",
    marginRight: 4,
  },
  onlineText: {
    fontSize: 8,
    fontWeight: "900",
    color: "#9CA3AF",
    textTransform: "uppercase",
  },
  logoPill: {
    padding: 8,
    backgroundColor: "#E6F4F1",
    borderRadius: 12,
  },
  messageScroll: {
    flex: 1,
  },
  messageContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  bubbleRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 16,
    width: "100%",
  },
  bubbleRowUser: {
    justifyContent: "flex-end",
  },
  bubbleRowCoach: {
    justifyContent: "flex-start",
  },
  bubbleAvatar: {
    fontSize: 18,
    marginRight: 8,
    marginBottom: 4,
  },
  bubble: {
    maxWidth: "75%",
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.01,
    shadowRadius: 4,
    elevation: 0.5,
  },
  bubbleUser: {
    backgroundColor: "#111827",
    borderTopRightRadius: 4,
  },
  bubbleCoach: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderTopLeftRadius: 4,
  },
  loadingBubble: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  bubbleText: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "bold",
    textAlign: "left",
  },
  bubbleTextUser: {
    color: "#FFFFFF",
  },
  bubbleTextCoach: {
    color: "#374151",
  },
  bubbleTime: {
    fontSize: 7,
    fontWeight: "900",
    marginTop: 6,
    alignSelf: "flex-end",
  },
  bubbleTimeUser: {
    color: "#9CA3AF",
  },
  bubbleTimeCoach: {
    color: "#9CA3AF",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: Platform.OS === "ios" ? 34 : 16,
  },
  input: {
    flex: 1,
    height: 44,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 11,
    color: "#111827",
    fontWeight: "bold",
    marginRight: 10,
  },
  sendButton: {
    width: 44,
    height: 44,
    backgroundColor: "#111827",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
});
