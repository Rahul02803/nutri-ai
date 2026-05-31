import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Switch, TextInput } from "react-native";
import { useStore, UserProfile } from "../../store/useStore";
import { useRouter } from "expo-router";
import { 
  User as LucideUser, 
  LogOut as LucideLogOut, 
  Heart as LucideHeart, 
  Activity as LucideActivity, 
  Target as LucideTarget, 
  Award as LucideAward, 
  Sparkles as LucideSparkles, 
  Scale as LucideScale, 
  RefreshCw as LucideRefreshCw 
} from "lucide-react-native";

const User = LucideUser as any;
const LogOut = LucideLogOut as any;
const Heart = LucideHeart as any;
const Activity = LucideActivity as any;
const Target = LucideTarget as any;
const Award = LucideAward as any;
const Sparkles = LucideSparkles as any;
const Scale = LucideScale as any;
const RefreshCw = LucideRefreshCw as any;

export default function ProfileScreen() {
  const router = useRouter();
  const {
    user,
    saveOnboarding,
    logout,
    subscriptionPlan,
    upgradeSubscription,
    weightUnit,
    toggleWeightUnit,
    isDarkMode
  } = useStore();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [age, setAge] = useState(user?.age?.toString() || "");
  const [height, setHeight] = useState(user?.height?.toString() || "");
  const [weight, setWeight] = useState(user?.current_weight?.toString() || "");
  const [targetWeight, setTargetWeight] = useState(user?.target_weight?.toString() || "");
  const [goal, setGoal] = useState<"cut" | "maintain" | "bulk">(user?.goal || "maintain");
  const [activity, setActivity] = useState<UserProfile["activity_level"]>(user?.activity_level || "moderate");

  if (!user) return null;

  const handleSave = () => {
    saveOnboarding({
      name: name,
      age: parseInt(age) || user.age,
      height: parseFloat(height) || user.height,
      current_weight: parseFloat(weight) || user.current_weight,
      target_weight: parseFloat(targetWeight) || user.target_weight,
      goal: goal,
      activity_level: activity
    });
    setIsEditing(false);
    Alert.alert("Success", "Profile updated and nutrition goals recalculated successfully!");
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to log out of ZenLog?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: () => {
          logout();
          router.replace("/");
        }
      }
    ]);
  };

  const handleUpgrade = () => {
    if (subscriptionPlan === "premium") {
      Alert.alert("Already Premium", "You are already a ZenLog Premium member! 💎");
    } else {
      upgradeSubscription("premium");
      Alert.alert("Congratulations!", "You have upgraded to ZenLog Premium! Weekly PDF Coach Reports and vision scanner limits are unlocked. 💎");
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      
      {/* Header bar */}
      <View style={styles.header}>
        <Text style={styles.brandTitle}>ZenLog Account</Text>
        <Text style={styles.headerSub}>Settings & Parameters</Text>
      </View>

      {/* User Card Profile details */}
      <View style={styles.userCard}>
        <View style={styles.avatarWrapper}>
          <User size={32} color="#111827" />
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user.name || "ZenLog Member"}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          
          <TouchableOpacity 
            style={[styles.premiumChip, subscriptionPlan === "premium" && styles.premiumChipActive]}
            onPress={handleUpgrade}
          >
            <Sparkles size={10} color={subscriptionPlan === "premium" ? "#FFFFFF" : "#6B7280"} />
            <Text style={[styles.premiumChipText, subscriptionPlan === "premium" && styles.premiumChipTextActive]}>
              {subscriptionPlan === "premium" ? "PREMIUM MEMBER" : "FREE PLAN (UPGRADE)"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Edit sheet / parameters list */}
      <View style={styles.cardSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.cardSectionTitle}>Physical Metrics</Text>
          <TouchableOpacity onPress={() => isEditing ? handleSave() : setIsEditing(true)}>
            <Text style={styles.editButtonText}>{isEditing ? "SAVE CHANGES" : "EDIT PROFILE"}</Text>
          </TouchableOpacity>
        </View>

        {isEditing ? (
          <View style={styles.formContainer}>
            <View style={styles.formRow}>
              <Text style={styles.formLabel}>Name</Text>
              <TextInput style={styles.formInput} value={name} onChangeText={setName} placeholder="Name" />
            </View>

            <View style={styles.formRow}>
              <Text style={styles.formLabel}>Age (years)</Text>
              <TextInput style={styles.formInput} value={age} onChangeText={setAge} keyboardType="numeric" placeholder="Age" />
            </View>

            <View style={styles.formRow}>
              <Text style={styles.formLabel}>Height (cm)</Text>
              <TextInput style={styles.formInput} value={height} onChangeText={setHeight} keyboardType="numeric" placeholder="Height" />
            </View>

            <View style={styles.formRow}>
              <Text style={styles.formLabel}>Weight ({weightUnit})</Text>
              <TextInput style={styles.formInput} value={weight} onChangeText={setWeight} keyboardType="numeric" placeholder="Weight" />
            </View>

            <View style={styles.formRow}>
              <Text style={styles.formLabel}>Target Weight ({weightUnit})</Text>
              <TextInput style={styles.formInput} value={targetWeight} onChangeText={setTargetWeight} keyboardType="numeric" placeholder="Target Weight" />
            </View>

            <View style={styles.formRow}>
              <Text style={styles.formLabel}>Goal</Text>
              <View style={styles.toggleRow}>
                {(["cut", "maintain", "bulk"] as const).map((g) => (
                  <TouchableOpacity
                    key={g}
                    style={[styles.toggleOption, goal === g && styles.toggleOptionActive]}
                    onPress={() => setGoal(g)}
                  >
                    <Text style={[styles.toggleOptionText, goal === g && styles.toggleOptionTextActive]}>
                      {g.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formRow}>
              <Text style={styles.formLabel}>Activity</Text>
              <View style={styles.toggleRow}>
                {(["sedentary", "light", "moderate", "active"] as const).map((a) => (
                  <TouchableOpacity
                    key={a}
                    style={[styles.toggleOption, activity === a && styles.toggleOptionActive]}
                    onPress={() => setActivity(a)}
                  >
                    <Text style={[styles.toggleOptionText, activity === a && styles.toggleOptionTextActive]}>
                      {a.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.infoList}>
            <View style={styles.infoRow}>
              <View style={styles.infoIconWrapper}>
                <Award size={14} color="#6B7280" />
              </View>
              <Text style={styles.infoLabel}>Age & Sex</Text>
              <Text style={styles.infoValue}>{user.age || 24} years • {user.gender || "Male"}</Text>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoIconWrapper}>
                <Activity size={14} color="#6B7280" />
              </View>
              <Text style={styles.infoLabel}>Height & Weight</Text>
              <Text style={styles.infoValue}>{user.height || 175} cm • {user.current_weight || 70} {weightUnit}</Text>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoIconWrapper}>
                <Target size={14} color="#6B7280" />
              </View>
              <Text style={styles.infoLabel}>Transform Goal</Text>
              <Text style={[styles.infoValue, { textTransform: "capitalize" }]}>{user.goal || "Maintain"} (Target: {user.target_weight || 65} {weightUnit})</Text>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoIconWrapper}>
                <Heart size={14} color="#6B7280" />
              </View>
              <Text style={styles.infoLabel}>Activity Status</Text>
              <Text style={[styles.infoValue, { textTransform: "capitalize" }]}>{user.activity_level || "moderate"}</Text>
            </View>
          </View>
        )}
      </View>

      {/* Recalculated Caloric Targets */}
      <View style={styles.metricsBanner}>
        <View style={styles.macroBannerHeader}>
          <Text style={styles.macroBannerTitle}>Target Caloric Allowance</Text>
          <Text style={styles.macroBannerVal}>{user.target_calories || 2000} kcal/day</Text>
        </View>
        
        <View style={styles.macroBreakdown}>
          <View style={styles.macroPill}>
            <Text style={styles.macroPillLabel}>PROTEIN</Text>
            <Text style={styles.macroPillVal}>{user.target_protein || 140}g</Text>
          </View>
          <View style={styles.macroPill}>
            <Text style={styles.macroPillLabel}>CARBS</Text>
            <Text style={styles.macroPillVal}>{user.target_carbs || 210}g</Text>
          </View>
          <View style={styles.macroPill}>
            <Text style={styles.macroPillLabel}>FAT</Text>
            <Text style={styles.macroPillVal}>{user.target_fat || 65}g</Text>
          </View>
        </View>
      </View>

      {/* App configuration options */}
      <View style={styles.cardSection}>
        <Text style={styles.cardSectionTitle}>Application Settings</Text>
        
        <View style={styles.settingsRow}>
          <View style={styles.settingsLabelWrapper}>
            <Scale size={16} color="#4B5563" />
            <Text style={styles.settingsLabel}>Display weight in LB</Text>
          </View>
          <Switch 
            value={weightUnit === "lb"} 
            onValueChange={toggleWeightUnit}
            trackColor={{ false: "#E5E7EB", true: "#111827" }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View style={styles.settingsRow}>
          <View style={styles.settingsLabelWrapper}>
            <RefreshCw size={16} color="#4B5563" />
            <Text style={styles.settingsLabel}>Reset Weekly Coach report</Text>
          </View>
          <TouchableOpacity 
            style={styles.actionChip}
            onPress={() => Alert.alert("Coach Aggregator Reset", "AI coach model has successfully refreshed log aggregations for next Sunday.")}
          >
            <Text style={styles.actionChipText}>RESET</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Secure Sign out widget */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <LogOut size={16} color="#EF4444" />
        <Text style={styles.logoutButtonText}>Secure Logout Session</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8FA",
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 120,
  },
  header: {
    alignItems: "flex-start",
    marginBottom: 24,
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: "900",
    color: "#111827",
  },
  headerSub: {
    fontSize: 10,
    color: "#9CA3AF",
    fontWeight: "bold",
    marginTop: 2,
    textTransform: "uppercase",
  },
  userCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 20,
    alignItems: "center",
    marginBottom: 16,
  },
  avatarWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
    alignItems: "flex-start",
  },
  userName: {
    fontSize: 18,
    fontWeight: "900",
    color: "#111827",
  },
  userEmail: {
    fontSize: 11,
    color: "#9CA3AF",
    fontWeight: "bold",
    marginTop: 2,
  },
  premiumChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  premiumChipActive: {
    backgroundColor: "#111827",
    borderColor: "#111827",
  },
  premiumChipText: {
    fontSize: 8,
    fontWeight: "900",
    color: "#6B7280",
    marginLeft: 4,
  },
  premiumChipTextActive: {
    color: "#FFFFFF",
  },
  cardSection: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 28,
    padding: 20,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  cardSectionTitle: {
    fontSize: 11,
    fontWeight: "900",
    color: "#9CA3AF",
    textTransform: "uppercase",
    textAlign: "left",
  },
  editButtonText: {
    fontSize: 9,
    fontWeight: "900",
    color: "#111827",
    textTransform: "uppercase",
  },
  infoList: {
    width: "100%",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  infoIconWrapper: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  infoLabel: {
    flex: 1,
    fontSize: 11,
    fontWeight: "900",
    color: "#4B5563",
    textAlign: "left",
  },
  infoValue: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#111827",
  },
  formContainer: {
    width: "100%",
  },
  formRow: {
    marginBottom: 12,
  },
  formLabel: {
    fontSize: 9,
    fontWeight: "900",
    color: "#9CA3AF",
    textTransform: "uppercase",
    marginBottom: 4,
    textAlign: "left",
  },
  formInput: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
    color: "#111827",
    fontWeight: "bold",
  },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginTop: 4,
  },
  toggleOption: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    marginRight: 6,
  },
  toggleOptionActive: {
    backgroundColor: "#111827",
    borderColor: "#111827",
  },
  toggleOptionText: {
    fontSize: 9,
    fontWeight: "900",
    color: "#6B7280",
  },
  toggleOptionTextActive: {
    color: "#FFFFFF",
  },
  metricsBanner: {
    backgroundColor: "#111827",
    borderRadius: 28,
    padding: 20,
    marginBottom: 16,
  },
  macroBannerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  macroBannerTitle: {
    fontSize: 10,
    fontWeight: "900",
    color: "#9CA3AF",
    textTransform: "uppercase",
  },
  macroBannerVal: {
    fontSize: 16,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  macroBreakdown: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  macroPill: {
    width: "31%",
    backgroundColor: "#1F2937",
    borderRadius: 12,
    padding: 8,
    alignItems: "center",
  },
  macroPillLabel: {
    fontSize: 7,
    fontWeight: "900",
    color: "#9CA3AF",
  },
  macroPillVal: {
    fontSize: 11,
    fontWeight: "900",
    color: "#FFFFFF",
    marginTop: 2,
  },
  settingsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  settingsLabelWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingsLabel: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#4B5563",
    marginLeft: 10,
  },
  actionChip: {
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  actionChipText: {
    fontSize: 8,
    fontWeight: "900",
    color: "#111827",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FEE2E2",
    borderRadius: 24,
    paddingVertical: 16,
    marginBottom: 40,
  },
  logoutButtonText: {
    fontSize: 12,
    fontWeight: "900",
    color: "#EF4444",
    marginLeft: 8,
  },
});
