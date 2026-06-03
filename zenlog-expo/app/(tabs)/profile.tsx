import React, { useState, useEffect, useRef } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert, 
  Switch, 
  TextInput, 
  SafeAreaView, 
  Modal, 
  RefreshControl,
  Animated,
  Platform
} from "react-native";
import { useStore, UserProfile } from "../../store/useStore";
import { useRouter } from "expo-router";
import { 
  LogOut as LucideLogOut,
  Edit2 as LucideEdit2,
  ChevronRight as LucideChevronRight,
  CheckCircle2 as LucideCheckCircle2,
  X as LucideX,
  Sparkles as LucideSparkles,
  User as LucideUser,
  Activity as LucideActivity,
  Flame as LucideFlame
} from "lucide-react-native";

const LogOut = LucideLogOut as any;
const Edit2 = LucideEdit2 as any;
const ChevronRight = LucideChevronRight as any;
const CheckCircle2 = LucideCheckCircle2 as any;
const X = LucideX as any;
const Sparkles = LucideSparkles as any;
const UserIcon = LucideUser as any;
const ActivityIcon = LucideActivity as any;
const FlameIcon = LucideFlame as any;

interface ExtendedUserProfile extends UserProfile {
  avatar?: string;
}

const AVATARS = ["🥑", "🥗", "🥩", "🏃", "🏋️"];

export default function ProfileScreen() {
  const router = useRouter();
  const {
    user,
    saveOnboarding,
    logout,
    weightUnit,
    toggleWeightUnit,
    setTabBarHidden
  } = useStore() as any;

  const [refreshing, setRefreshing] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const toastY = useRef(new Animated.Value(-120)).current;

  // Profile Form States
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [targetWeight, setTargetWeight] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "other">("male");
  const [goal, setGoal] = useState<"cut" | "maintain" | "bulk">("maintain");
  const [activityLevel, setActivityLevel] = useState<"sedentary" | "light" | "moderate" | "active" | "extreme">("moderate");
  const [dietPreference, setDietPreference] = useState<"vegetarian" | "non-vegetarian" | "vegan">("vegetarian");

  // Load user data on mount/update
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setAge(user.age?.toString() || "");
      setHeight(user.height?.toString() || "");
      setWeight(user.current_weight?.toString() || "");
      setTargetWeight(user.target_weight?.toString() || "");
      setGender(user.gender || "male");
      setGoal(user.goal || "maintain");
      setActivityLevel(user.activity_level || "moderate");
      setDietPreference(user.diet_preference || "vegetarian");
    }
  }, [user]);

  if (!user) return null;

  // Success Toast Animation
  const triggerSuccessToast = () => {
    setToastVisible(true);
    Animated.sequence([
      Animated.timing(toastY, {
        toValue: Platform.OS === "ios" ? 50 : 20,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.delay(2200),
      Animated.timing(toastY, {
        toValue: -120,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start(() => {
      setToastVisible(false);
    });
  };

  const handleCycleAvatar = () => {
    const currentAvatar = user.avatar || "🥑";
    const currentIndex = AVATARS.indexOf(currentAvatar);
    const nextIndex = (currentIndex + 1) % AVATARS.length;
    const nextAvatar = AVATARS[nextIndex];
    
    saveOnboarding({
      ...user,
      avatar: nextAvatar
    });
    triggerSuccessToast();
  };

  const handleOpenEditModal = () => {
    setTabBarHidden(true);
    setIsEditModalVisible(true);
  };

  const handleCloseEditModal = () => {
    setTabBarHidden(false);
    setIsEditModalVisible(false);
  };

  const handleSaveProfile = () => {
    const ageNum = parseInt(age);
    const heightNum = parseInt(height);
    const weightNum = parseFloat(weight);
    const targetWeightNum = parseFloat(targetWeight);

    if (!name.trim()) {
      Alert.alert("Invalid Input", "Please enter a valid name.");
      return;
    }
    if (isNaN(ageNum) || ageNum <= 0) {
      Alert.alert("Invalid Input", "Please enter a valid age.");
      return;
    }
    if (isNaN(heightNum) || heightNum <= 0) {
      Alert.alert("Invalid Input", "Please enter a valid height.");
      return;
    }
    if (isNaN(weightNum) || weightNum <= 0) {
      Alert.alert("Invalid Input", "Please enter a valid weight.");
      return;
    }

    saveOnboarding({
      name,
      age: ageNum,
      gender,
      height: heightNum,
      current_weight: weightNum,
      target_weight: isNaN(targetWeightNum) ? weightNum : targetWeightNum,
      goal,
      activity_level: activityLevel,
      diet_preference: dietPreference
    });

    handleCloseEditModal();
    // Allow sheet closing transition to complete before showing toast
    setTimeout(() => {
      triggerSuccessToast();
    }, 400);
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 850);
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

  return (
    <SafeAreaView style={styles.safeArea}>
      
      {/* Animated Floating Success Toast */}
      {toastVisible && (
        <Animated.View style={[styles.toastContainer, { transform: [{ translateY: toastY }] }]}>
          <View style={styles.toast}>
            <CheckCircle2 size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.toastText}>Profile & goals synced successfully!</Text>
          </View>
        </Animated.View>
      )}

      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3B82F6" />
        }
      >
        
        {/* Brand Header */}
        <View style={styles.header}>
          <Text style={styles.brandTitle}>Profile</Text>
          <Text style={styles.headerSub}>PHYSIQUE & NUTRITION INTEL</Text>
        </View>

        {/* 1. PREMIUM AVATAR CYCLER & NAME CARD */}
        <View style={styles.avatarCard}>
          <TouchableOpacity 
            style={styles.avatarCircle} 
            onPress={handleCycleAvatar}
            activeOpacity={0.85}
          >
            <Text style={styles.avatarEmoji}>{user.avatar || "🥑"}</Text>
            <View style={styles.avatarBadge}>
              <Text style={styles.avatarBadgeText}>🔄</Text>
            </View>
          </TouchableOpacity>
          <Text style={styles.profileName}>{user.name || "ZenLog Member"}</Text>
          <Text style={styles.profileEmail}>{user.email}</Text>
          
          <TouchableOpacity 
            style={styles.editProfileBtn} 
            onPress={handleOpenEditModal}
            activeOpacity={0.8}
          >
            <Edit2 size={12} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.editProfileBtnText}>Edit Profile Card</Text>
          </TouchableOpacity>
        </View>

        {/* 2. LIVE NUTRITION TARGETS OVERVIEW CARD */}
        <View style={styles.grayCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.fieldLabel}>Current Nutrition Targets</Text>
            <FlameIcon size={14} color="#6B7280" />
          </View>
          
          <View style={styles.goalsOverview}>
            <View style={styles.targetRow}>
              <Text style={styles.targetLabel}>Calorie Budget</Text>
              <Text style={styles.targetVal}>{user.target_calories || 2000} kcal/day</Text>
            </View>
            <View style={styles.targetRow}>
              <Text style={styles.targetLabel}>Protein Limit</Text>
              <Text style={styles.targetVal}>{user.target_protein || 140}g/day</Text>
            </View>
            <View style={styles.targetRow}>
              <Text style={styles.targetLabel}>Carbohydrates</Text>
              <Text style={styles.targetVal}>{user.target_carbs || 210}g/day</Text>
            </View>
            <View style={styles.targetRow}>
              <Text style={styles.targetLabel}>Fat Limit</Text>
              <Text style={styles.targetVal}>{user.target_fat || 65}g/day</Text>
            </View>
          </View>
        </View>

        {/* 3. BIOMETRICS STATS CARD */}
        <View style={styles.grayCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.fieldLabel}>Physical Biometrics</Text>
            <UserIcon size={14} color="#6B7280" />
          </View>
          
          <View style={styles.biometricsGrid}>
            <View style={styles.bioCol}>
              <Text style={styles.bioLabel}>Age</Text>
              <Text style={styles.bioVal}>{user.age || "N/A"} yrs</Text>
            </View>
            <View style={styles.bioCol}>
              <Text style={styles.bioLabel}>Height</Text>
              <Text style={styles.bioVal}>{user.height || "N/A"} cm</Text>
            </View>
            <View style={styles.bioCol}>
              <Text style={styles.bioLabel}>Weight</Text>
              <Text style={styles.bioVal}>{user.current_weight || "N/A"} kg</Text>
            </View>
            <View style={styles.bioCol}>
              <Text style={styles.bioLabel}>Goal Weight</Text>
              <Text style={styles.bioVal}>{user.target_weight || "N/A"} kg</Text>
            </View>
          </View>
        </View>

        {/* 4. DIET & GOALS SUMMARY CARD */}
        <View style={styles.grayCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.fieldLabel}>Dietary Preferences & Goal</Text>
            <ActivityIcon size={14} color="#6B7280" />
          </View>

          <View style={styles.prefRow}>
            <Text style={styles.prefLabel}>Goal Mode</Text>
            <Text style={styles.prefVal}>
              {user.goal === "cut" ? "Fat Loss (Deficit)" : user.goal === "bulk" ? "Muscle Bulk (Surplus)" : "Maintenance"}
            </Text>
          </View>
          <View style={styles.prefRow}>
            <Text style={styles.prefLabel}>Activity Tier</Text>
            <Text style={[styles.prefVal, { textTransform: "capitalize" }]}>{user.activity_level || "Moderate"}</Text>
          </View>
          <View style={styles.prefRow}>
            <Text style={styles.prefLabel}>Diet Preference</Text>
            <Text style={[styles.prefVal, { textTransform: "capitalize" }]}>{user.diet_preference || "Vegetarian"}</Text>
          </View>
        </View>

        {/* 5. SYSTEM SETTINGS CARD */}
        <View style={styles.grayCard}>
          <Text style={styles.fieldLabel}>System Preferences</Text>
          
          <View style={styles.settingsRow}>
            <Text style={styles.settingsLabel}>Display weight in LBs</Text>
            <Switch 
              value={weightUnit === "lb"} 
              onValueChange={toggleWeightUnit}
              trackColor={{ false: "#E5E7EB", true: "#3B82F6" }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Logout Session Button */}
        <TouchableOpacity 
          style={styles.logoutButton} 
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <LogOut size={16} color="#EF4444" style={{ marginRight: 8 }} />
          <Text style={styles.logoutButtonText}>Log Out Session</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* FULL SCREEN EDIT PROFILE MODAL SHEET */}
      <Modal
        animationType="slide"
        visible={isEditModalVisible}
        transparent={false}
        onRequestClose={handleCloseEditModal}
      >
        <SafeAreaView style={styles.modalContainer}>
          
          <View style={styles.modalHeaderBar}>
            <TouchableOpacity onPress={handleCloseEditModal} style={styles.modalCloseBtn}>
              <X size={20} color="#111827" />
            </TouchableOpacity>
            <Text style={styles.modalHeaderTitle}>Edit Profile Card</Text>
            <TouchableOpacity onPress={handleSaveProfile} style={styles.modalSaveBtn}>
              <Text style={styles.modalSaveBtnText}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalForm} contentContainerStyle={styles.modalFormContent} showsVerticalScrollIndicator={false}>
            
            {/* Field: Name */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Name</Text>
              <TextInput 
                style={styles.formInput} 
                value={name} 
                onChangeText={setName} 
                placeholder="Name"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* Row Fields: Age & Gender */}
            <View style={styles.formRow}>
              <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.formLabel}>Age (years)</Text>
                <TextInput 
                  style={styles.formInput} 
                  value={age} 
                  onChangeText={setAge} 
                  keyboardType="numeric"
                  placeholder="Age"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
              <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.formLabel}>Gender</Text>
                <View style={styles.segmentedControl}>
                  {(["male", "female"] as const).map((g) => (
                    <TouchableOpacity
                      key={g}
                      style={[styles.segmentBtn, gender === g && styles.segmentBtnActive]}
                      onPress={() => setGender(g)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.segmentText, gender === g && styles.segmentTextActive]}>
                        {g}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            {/* Row Fields: Height & Weight */}
            <View style={styles.formRow}>
              <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.formLabel}>Height (cm)</Text>
                <TextInput 
                  style={styles.formInput} 
                  value={height} 
                  onChangeText={setHeight} 
                  keyboardType="numeric"
                  placeholder="Height"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
              <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.formLabel}>Weight (kg)</Text>
                <TextInput 
                  style={styles.formInput} 
                  value={weight} 
                  onChangeText={setWeight} 
                  keyboardType="numeric"
                  placeholder="Weight"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            {/* Field: Target Weight */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Target Weight (kg)</Text>
              <TextInput 
                style={styles.formInput} 
                value={targetWeight} 
                onChangeText={setTargetWeight} 
                keyboardType="numeric"
                placeholder="Target Weight"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* Field: Transformation Goal */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Transformation Goal</Text>
              <View style={styles.pickerGrid}>
                {[
                  { id: "cut", title: "Fat Loss (Cut)" },
                  { id: "maintain", title: "Maintenance" },
                  { id: "bulk", title: "Muscle Bulk" }
                ].map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.pickerCell, goal === item.id && styles.pickerCellActive]}
                    onPress={() => setGoal(item.id as any)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.pickerCellText, goal === item.id && styles.pickerCellTextActive]}>
                      {item.title}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Field: Activity Level */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Daily Activity Level</Text>
              <View style={styles.pickerGridWrap}>
                {[
                  { id: "sedentary", label: "Sedentary" },
                  { id: "light", label: "Light Active" },
                  { id: "moderate", label: "Moderate" },
                  { id: "active", label: "Active" },
                  { id: "extreme", label: "Extreme" }
                ].map((act) => (
                  <TouchableOpacity
                    key={act.id}
                    style={[styles.pickerChip, activityLevel === act.id && styles.pickerChipActive]}
                    onPress={() => setActivityLevel(act.id as any)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.pickerChipText, activityLevel === act.id && styles.pickerChipTextActive]}>
                      {act.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Field: Diet Preference */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Diet Preference</Text>
              <View style={styles.pickerGrid}>
                {[
                  { id: "vegetarian", title: "Vegetarian" },
                  { id: "non-vegetarian", title: "Non-Veg" },
                  { id: "vegan", title: "Vegan" }
                ].map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.pickerCell, dietPreference === item.id && styles.pickerCellActive]}
                    onPress={() => setDietPreference(item.id as any)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.pickerCellText, dietPreference === item.id && styles.pickerCellTextActive]}>
                      {item.title}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Save Button */}
            <TouchableOpacity 
              style={styles.saveSubmitBtn} 
              onPress={handleSaveProfile}
              activeOpacity={0.9}
            >
              <Text style={styles.saveSubmitBtnText}>Apply & Recalculate Targets</Text>
            </TouchableOpacity>

          </ScrollView>
        </SafeAreaView>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
  },
  header: {
    alignItems: "flex-start",
    marginBottom: 28,
  },
  brandTitle: {
    fontSize: 32,
    fontWeight: "900",
    color: "#111827",
    letterSpacing: -1,
  },
  headerSub: {
    fontSize: 10,
    color: "#6B7280",
    fontWeight: "900",
    marginTop: 2,
    letterSpacing: 1.5,
  },
  avatarCard: {
    backgroundColor: "#F4F4F5",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    marginBottom: 16,
  },
  avatarCircle: {
    height: 90,
    width: 90,
    borderRadius: 45,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    borderWidth: 1,
    borderColor: "#E5E7EB",
    position: "relative",
    marginBottom: 12,
  },
  avatarEmoji: {
    fontSize: 44,
  },
  avatarBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    height: 28,
    width: 28,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  avatarBadgeText: {
    fontSize: 12,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "900",
    color: "#111827",
    letterSpacing: -0.5,
  },
  profileEmail: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6B7280",
    marginTop: 2,
    marginBottom: 16,
  },
  editProfileBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111827",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  editProfileBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
  },
  grayCard: {
    backgroundColor: "#F4F4F5",
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: "900",
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    textAlign: "left",
  },
  goalsOverview: {
    width: "100%",
  },
  targetRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  targetLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: "#111827",
  },
  targetVal: {
    fontSize: 13,
    fontWeight: "900",
    color: "#111827",
  },
  biometricsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  bioCol: {
    width: "23%",
    alignItems: "flex-start",
  },
  bioLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#6B7280",
  },
  bioVal: {
    fontSize: 13,
    fontWeight: "900",
    color: "#111827",
    marginTop: 4,
  },
  prefRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  prefLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: "#111827",
  },
  prefVal: {
    fontSize: 13,
    fontWeight: "900",
    color: "#111827",
  },
  settingsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  settingsLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: "#111827",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEE2E2",
    borderRadius: 24,
    paddingVertical: 16,
    marginTop: 8,
  },
  logoutButtonText: {
    fontSize: 13,
    fontWeight: "900",
    color: "#EF4444",
  },
  toastContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 9999,
    alignItems: "center",
  },
  toast: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111827",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  toastText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  modalHeaderBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: "#ECECEF",
  },
  modalCloseBtn: {
    height: 40,
    width: 40,
    borderRadius: 20,
    backgroundColor: "#F4F4F5",
    alignItems: "center",
    justifyContent: "center",
  },
  modalHeaderTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#111827",
  },
  modalSaveBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: "#111827",
  },
  modalSaveBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
  },
  modalForm: {
    flex: 1,
  },
  modalFormContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  formGroup: {
    marginBottom: 20,
    width: "100%",
    alignItems: "flex-start",
  },
  formRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  formLabel: {
    fontSize: 11,
    fontWeight: "900",
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  formInput: {
    width: "100%",
    backgroundColor: "#F4F4F5",
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 48,
    fontSize: 14,
    fontWeight: "800",
    color: "#111827",
  },
  segmentedControl: {
    flexDirection: "row",
    backgroundColor: "#F4F4F5",
    borderRadius: 16,
    padding: 3,
    width: "100%",
    height: 48,
  },
  segmentBtn: {
    flex: 1,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentBtnActive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  segmentText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#6B7280",
    textTransform: "capitalize",
  },
  segmentTextActive: {
    color: "#111827",
  },
  pickerGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  pickerCell: {
    width: "31%",
    backgroundColor: "#F4F4F5",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
  },
  pickerCellActive: {
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#111827",
  },
  pickerCellText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#6B7280",
  },
  pickerCellTextActive: {
    color: "#111827",
    fontWeight: "900",
  },
  pickerGridWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: "100%",
    marginBottom: -8,
  },
  pickerChip: {
    backgroundColor: "#F4F4F5",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    marginBottom: 8,
  },
  pickerChipActive: {
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#111827",
  },
  pickerChipText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#6B7280",
  },
  pickerChipTextActive: {
    color: "#111827",
    fontWeight: "900",
  },
  saveSubmitBtn: {
    width: "100%",
    backgroundColor: "#3B82F6",
    borderRadius: 20,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
  },
  saveSubmitBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
  },
});
