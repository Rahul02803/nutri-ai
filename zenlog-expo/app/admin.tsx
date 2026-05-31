import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, Switch } from "react-native";
import { useStore, IndianFoodItem } from "../store/useStore";
import { useRouter } from "expo-router";
import { 
  ArrowLeft as LucideArrowLeft, 
  Plus as LucidePlus, 
  Edit2 as LucideEdit2, 
  Trash2 as LucideTrash2, 
  ShieldCheck as LucideShieldCheck, 
  Check as LucideCheck 
} from "lucide-react-native";

const ArrowLeft = LucideArrowLeft as any;
const Plus = LucidePlus as any;
const Edit2 = LucideEdit2 as any;
const Trash2 = LucideTrash2 as any;
const ShieldCheck = LucideShieldCheck as any;
const Check = LucideCheck as any;

export default function AdminDashboardScreen() {
  const router = useRouter();
  const {
    indianFoods,
    addIndianFood,
    editIndianFood,
    deleteIndianFood,
    verifyIndianFood
  } = useStore();

  const [activeTab, setActiveTab] = useState<"add" | "manage">("add");
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form States
  const [name, setName] = useState("");
  const [servingSize, setServingSize] = useState("100g");
  const [calories, setCalories] = useState("200");
  const [protein, setProtein] = useState("8");
  const [carbs, setCarbs] = useState("24");
  const [fat, setFat] = useState("6");
  
  // Micros
  const [fiber, setFiber] = useState("3");
  const [iron, setIron] = useState("1.5");
  const [calcium, setCalcium] = useState("60");
  const [vitaminD, setVitaminD] = useState("0");
  const [vitaminB12, setVitaminB12] = useState("0");
  
  const [category, setCategory] = useState<IndianFoodItem["category"]>("North Indian");
  const [isVerified, setIsVerified] = useState(false);

  const categories: IndianFoodItem["category"][] = ["North Indian", "South Indian", "Street Food", "Fast Food", "Restaurant Meals", "Vegetarian", "Non Vegetarian"];

  const handleSaveFood = () => {
    if (!name.trim()) {
      Alert.alert("Input Error", "Please provide a valid name for the Indian dish.");
      return;
    }

    const payload = {
      name: name.trim(),
      serving_size: servingSize,
      calories: parseInt(calories) || 0,
      protein: parseFloat(protein) || 0,
      carbs: parseFloat(carbs) || 0,
      fat: parseFloat(fat) || 0,
      fiber: parseFloat(fiber) || 0,
      iron: parseFloat(iron) || 0,
      calcium: parseFloat(calcium) || 0,
      vitamin_d: parseFloat(vitaminD) || 0,
      vitamin_b12: parseFloat(vitaminB12) || 0,
      category,
      is_verified: isVerified
    };

    if (editingId) {
      editIndianFood(editingId, payload);
      Alert.alert("Dish Updated", `Successfully updated "${name}" in the database!`);
      setEditingId(null);
      setActiveTab("manage");
    } else {
      addIndianFood(payload);
      Alert.alert("Dish Created", `Successfully added "${name}" to the Indian database!`);
    }

    resetForm();
  };

  const handleEditSelect = (food: IndianFoodItem) => {
    setEditingId(food.id);
    setName(food.name);
    setServingSize(food.serving_size);
    setCalories(food.calories.toString());
    setProtein(food.protein.toString());
    setCarbs(food.carbs.toString());
    setFat(food.fat.toString());
    setFiber(food.fiber.toString());
    setIron(food.iron.toString());
    setCalcium(food.calcium.toString());
    setVitaminD(food.vitamin_d.toString());
    setVitaminB12(food.vitamin_b12.toString());
    setCategory(food.category);
    setIsVerified(food.is_verified);
    setActiveTab("add");
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert("Delete Food Item", `Are you sure you want to permanently delete "${name}" from the Indian Food Database?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          deleteIndianFood(id);
          Alert.alert("Deleted", "Item removed successfully.");
        }
      }
    ]);
  };

  const handleVerify = (id: string) => {
    verifyIndianFood(id);
    Alert.alert("Verified", "The food item is now marked as verified and will display a security shield badge.");
  };

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setServingSize("100g");
    setCalories("200");
    setProtein("8");
    setCarbs("24");
    setFat("6");
    setFiber("3");
    setIron("1.5");
    setCalcium("60");
    setVitaminD("0");
    setVitaminB12("0");
    setCategory("North Indian");
    setIsVerified(false);
  };

  return (
    <View style={styles.container}>
      
      {/* Header bar */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.replace("/search")}>
          <ArrowLeft size={20} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Database Admin</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Tabs Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === "add" && styles.tabActive]}
          onPress={() => setActiveTab("add")}
        >
          <Text style={[styles.tabText, activeTab === "add" && styles.tabTextActive]}>
            {editingId ? "Edit Food" : "Add Food"}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === "manage" && styles.tabActive]}
          onPress={() => setActiveTab("manage")}
        >
          <Text style={[styles.tabText, activeTab === "manage" && styles.tabTextActive]}>
            Manage Database
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.body} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {activeTab === "add" ? (
          /* FORM VIEW: ADD / EDIT */
          <View style={styles.formCard}>
            
            <View style={styles.inputSection}>
              <Text style={styles.fieldLabel}>Dish Name</Text>
              <TextInput style={styles.textInput} value={name} onChangeText={setName} placeholder="e.g. Masala Dosa" />
            </View>

            <View style={styles.gridRow}>
              <View style={[styles.inputSection, { width: "48%" }]}>
                <Text style={styles.fieldLabel}>Serving Size</Text>
                <TextInput style={styles.textInput} value={servingSize} onChangeText={setServingSize} placeholder="e.g. 1 plate (150g)" />
              </View>

              <View style={[styles.inputSection, { width: "48%" }]}>
                <Text style={styles.fieldLabel}>Calories (kcal)</Text>
                <TextInput style={styles.textInput} value={calories} onChangeText={setCalories} keyboardType="numeric" />
              </View>
            </View>

            {/* Macros Section */}
            <Text style={styles.subTitle}>Macronutrients</Text>
            <View style={styles.gridThree}>
              <View style={styles.gridThreeCol}>
                <Text style={styles.fieldLabel}>Protein (g)</Text>
                <TextInput style={styles.textInputCent} value={protein} onChangeText={setProtein} keyboardType="numeric" />
              </View>
              <View style={styles.gridThreeCol}>
                <Text style={styles.fieldLabel}>Carbs (g)</Text>
                <TextInput style={styles.textInputCent} value={carbs} onChangeText={setCarbs} keyboardType="numeric" />
              </View>
              <View style={styles.gridThreeCol}>
                <Text style={styles.fieldLabel}>Fat (g)</Text>
                <TextInput style={styles.textInputCent} value={fat} onChangeText={setFat} keyboardType="numeric" />
              </View>
            </View>

            {/* Micronutrients Section */}
            <Text style={styles.subTitle}>Micronutrients</Text>
            <View style={styles.gridRow}>
              <View style={[styles.inputSection, { width: "48%" }]}>
                <Text style={styles.fieldLabel}>Fiber (g)</Text>
                <TextInput style={styles.textInput} value={fiber} onChangeText={setFiber} keyboardType="numeric" />
              </View>
              <View style={[styles.inputSection, { width: "48%" }]}>
                <Text style={styles.fieldLabel}>Iron (mg)</Text>
                <TextInput style={styles.textInput} value={iron} onChangeText={setIron} keyboardType="numeric" />
              </View>
            </View>

            <View style={styles.gridThree}>
              <View style={styles.gridThreeCol}>
                <Text style={styles.fieldLabel}>Calcium (mg)</Text>
                <TextInput style={styles.textInputCent} value={calcium} onChangeText={setCalcium} keyboardType="numeric" />
              </View>
              <View style={styles.gridThreeCol}>
                <Text style={styles.fieldLabel}>Vit D (mcg)</Text>
                <TextInput style={styles.textInputCent} value={vitaminD} onChangeText={setVitaminD} keyboardType="numeric" />
              </View>
              <View style={styles.gridThreeCol}>
                <Text style={styles.fieldLabel}>Vit B12 (mcg)</Text>
                <TextInput style={styles.textInputCent} value={vitaminB12} onChangeText={setVitaminB12} keyboardType="numeric" />
              </View>
            </View>

            {/* Pick category */}
            <Text style={styles.fieldLabel}>Food Category</Text>
            <View style={styles.categoryGrid}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.categoryChip, category === cat && styles.categoryChipActive]}
                  onPress={() => setCategory(cat)}
                >
                  <Text style={[styles.categoryChipText, category === cat && styles.categoryChipTextActive]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Switch Verification state */}
            <View style={styles.switchRow}>
              <View style={styles.switchLabelWrapper}>
                <ShieldCheck size={18} color="#14B8A6" />
                <View style={styles.switchTextCol}>
                  <Text style={styles.switchTitle}>Verify Food Item</Text>
                  <Text style={styles.switchSub}>Display verified trust shield badge</Text>
                </View>
              </View>
              <Switch
                value={isVerified}
                onValueChange={setIsVerified}
                trackColor={{ false: "#E5E7EB", true: "#111827" }}
                thumbColor="#FFFFFF"
              />
            </View>

            {/* Confirm action button */}
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveFood}>
              <Check size={18} color="#FFFFFF" />
              <Text style={styles.saveButtonText}>
                {editingId ? "Update Database Entry" : "Save Database Entry"}
              </Text>
            </TouchableOpacity>

            {editingId && (
              <TouchableOpacity style={styles.cancelBtn} onPress={resetForm}>
                <Text style={styles.cancelBtnText}>CANCEL EDIT</Text>
              </TouchableOpacity>
            )}

          </View>
        ) : (
          /* LIST VIEW: MANAGE AND DELETE */
          <View style={styles.listSection}>
            <Text style={styles.listSectionTitle}>All Database Items ({indianFoods.length})</Text>
            
            {indianFoods.map((food) => (
              <View key={food.id} style={styles.manageRow}>
                
                <View style={styles.manageInfo}>
                  <View style={styles.manageNameWrapper}>
                    <Text style={styles.manageName}>{food.name}</Text>
                    {food.is_verified && <ShieldCheck size={12} color="#14B8A6" style={{ marginLeft: 4 }} />}
                  </View>
                  <Text style={styles.manageSubtext}>
                    {food.category} • {food.serving_size} • {food.calories} kcal
                  </Text>
                </View>

                <View style={styles.manageActions}>
                  {!food.is_verified && (
                    <TouchableOpacity style={styles.verifyAction} onPress={() => handleVerify(food.id)}>
                      <Text style={styles.verifyActionText}>VERIFY</Text>
                    </TouchableOpacity>
                  )}
                  
                  <TouchableOpacity style={styles.editAction} onPress={() => handleEditSelect(food)}>
                    <Edit2 size={12} color="#111827" />
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.deleteAction} onPress={() => handleDelete(food.id, food.name)}>
                    <Trash2 size={12} color="#EF4444" />
                  </TouchableOpacity>
                </View>

              </View>
            ))}
          </View>
        )}

      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8FA",
  },
  header: {
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
  headerTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#111827",
    letterSpacing: -0.2,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    padding: 6,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: "#111827",
  },
  tabText: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#6B7280",
  },
  tabTextActive: {
    color: "#111827",
    fontWeight: "900",
  },
  body: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 80,
  },
  formCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 28,
    padding: 20,
  },
  subTitle: {
    fontSize: 10,
    fontWeight: "900",
    color: "#9CA3AF",
    textTransform: "uppercase",
    marginTop: 14,
    marginBottom: 8,
    textAlign: "left",
  },
  inputSection: {
    marginBottom: 12,
    alignItems: "flex-start",
  },
  fieldLabel: {
    fontSize: 9,
    fontWeight: "900",
    color: "#9CA3AF",
    textTransform: "uppercase",
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 12,
    fontWeight: "bold",
    color: "#111827",
    width: "100%",
  },
  gridRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  gridThree: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  gridThreeCol: {
    width: "31%",
    alignItems: "flex-start",
  },
  textInputCent: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    paddingVertical: 10,
    fontSize: 12,
    fontWeight: "bold",
    color: "#111827",
    width: "100%",
    textAlign: "center",
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 4,
    marginBottom: 16,
  },
  categoryChip: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginRight: 6,
    marginBottom: 6,
  },
  categoryChipActive: {
    backgroundColor: "#111827",
    borderColor: "#111827",
  },
  categoryChipText: {
    fontSize: 8,
    fontWeight: "900",
    color: "#6B7280",
  },
  categoryChipTextActive: {
    color: "#FFFFFF",
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 18,
    padding: 12,
    marginBottom: 20,
  },
  switchLabelWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  switchTextCol: {
    marginLeft: 10,
    alignItems: "flex-start",
  },
  switchTitle: {
    fontSize: 11,
    fontWeight: "900",
    color: "#111827",
  },
  switchSub: {
    fontSize: 8,
    color: "#9CA3AF",
    fontWeight: "bold",
    marginTop: 2,
  },
  saveButton: {
    flexDirection: "row",
    backgroundColor: "#111827",
    paddingVertical: 14,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "900",
    marginLeft: 6,
  },
  cancelBtn: {
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  cancelBtnText: {
    color: "#EF4444",
    fontSize: 9,
    fontWeight: "900",
  },
  listSection: {
    width: "100%",
  },
  listSectionTitle: {
    fontSize: 11,
    fontWeight: "900",
    color: "#9CA3AF",
    textTransform: "uppercase",
    marginBottom: 14,
    textAlign: "left",
  },
  manageRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 18,
    padding: 14,
    marginBottom: 8,
  },
  manageInfo: {
    flex: 1,
    alignItems: "flex-start",
  },
  manageNameWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  manageName: {
    fontSize: 12,
    fontWeight: "900",
    color: "#111827",
  },
  manageSubtext: {
    fontSize: 9,
    color: "#9CA3AF",
    fontWeight: "bold",
    marginTop: 4,
  },
  manageActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  verifyAction: {
    backgroundColor: "#E6F4F1",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 8,
  },
  verifyActionText: {
    color: "#14B8A6",
    fontSize: 8,
    fontWeight: "900",
  },
  editAction: {
    backgroundColor: "#F3F4F6",
    padding: 8,
    borderRadius: 8,
    marginRight: 6,
  },
  deleteAction: {
    backgroundColor: "#FEF2F2",
    padding: 8,
    borderRadius: 8,
  },
});
