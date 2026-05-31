import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator } from "react-native";
import { useStore, FoodPrediction, FoodCorrection } from "../../store/useStore";
import { useRouter } from "expo-router";
import { scanMealImageWithGemini, ScannedFoodResult } from "../../services/gemini";
import { 
  Camera as LucideCamera, 
  Image as LucideImageIcon, 
  Check as LucideCheck, 
  X as LucideX, 
  Sparkles as LucideSparkles, 
  AlertTriangle as LucideAlertTriangle, 
  Edit3 as LucideEdit3 
} from "lucide-react-native";
import { SupportedUnit, getUnitWeightInGrams, calculateNutrition } from "../../services/servingEngine";

// Bypass Strict Lucide type checking constraints
const Camera = LucideCamera as any;
const ImageIcon = LucideImageIcon as any;
const Check = LucideCheck as any;
const X = LucideX as any;
const Sparkles = LucideSparkles as any;
const AlertTriangle = LucideAlertTriangle as any;
const Edit3 = LucideEdit3 as any;

export default function ScannerScreen() {
  const router = useRouter();
  const {
    logMeal,
    savePredictionAndCorrection,
    createTemplate,
    incrementScans,
    subscriptionPlan,
    scanCountToday
  } = useStore();

  const [scanState, setScanState] = useState<"viewport" | "analyzing" | "confidence_fallback" | "edit_sheet">("viewport");
  const [busy, setBusy] = useState(false);

  // Gemini scanned results
  const [scannedFoods, setScannedFoods] = useState<ScannedFoodResult[]>([]);
  const [currentConfidence, setCurrentConfidence] = useState(1.0);

  // Fallback options when confidence < 0.85
  const [fallbackOptions, setFallbackOptions] = useState<Array<{ name: string; calories: number }>>([]);

  // Edit Sheet values
  const [editName, setEditName] = useState("");
  const [editWeight, setEditWeight] = useState("100");
  const [editUnit, setEditUnit] = useState<SupportedUnit>("g");
  
  // Macros
  const [editCalories, setEditCalories] = useState("300");
  const [editProtein, setEditProtein] = useState("15");
  const [editCarbs, setEditCarbs] = useState("35");
  const [editFat, setEditFat] = useState("8");
  
  // Micros
  const [editFiber, setEditFiber] = useState("3");
  const [editIron, setEditIron] = useState("1.5");
  const [editCalcium, setEditCalcium] = useState("60");
  const [editVitD, setEditVitD] = useState("0");
  const [editVitB12, setEditVitB12] = useState("0");

  // Dynamic Serving Size Base Stats (stored per 1 gram of original food)
  const [baseStats, setBaseStats] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    iron: 0,
    calcium: 0,
    vitamin_d: 0,
    vitamin_b12: 0
  });

  const supportedUnitsList: SupportedUnit[] = ["g", "kg", "oz", "lb", "ml", "liter", "tbsp", "tsp", "cup", "bowl", "piece", "slice", "cube", "egg", "roti"];

  // Simulated capture trigger
  const handleSimulateCapture = () => {
    if (subscriptionPlan === "free" && scanCountToday >= 10) {
      Alert.alert("Scan Limit Exceeded", "You have reached your free daily limit of 10 scans. Upgrade to Premium for unlimited scanning and advanced analytics!");
      return;
    }

    setScanState("analyzing");
    setBusy(true);

    const mockBase64 = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ...";

    setTimeout(async () => {
      try {
        const foods = await scanMealImageWithGemini(mockBase64);
        setScannedFoods(foods);
        incrementScans();

        const confidence = foods[0]?.confidence || 1.0;
        setCurrentConfidence(confidence);

        if (confidence < 0.85) {
          setFallbackOptions([
            { name: "Paneer Tikka Curry", calories: 380 },
            { name: "Paneer Bhurji & Roti", calories: 480 },
            { name: "Shahi Paneer With Rice", calories: 520 }
          ]);
          setScanState("confidence_fallback");
        } else {
          populateEditSheet(foods[0]);
          setScanState("edit_sheet");
        }
      } catch (e: any) {
        Alert.alert("Scanning Failure", e.message || "Failed to process photo.");
        setScanState("viewport");
      } finally {
        setBusy(false);
      }
    }, 2000);
  };

  const populateEditSheet = (food: ScannedFoodResult) => {
    const w = food.weight || 100;
    
    // Store micro nutrient defaults if vision doesn't provide them
    const fib = 3.5;
    const ir = 2.0;
    const cal = 240;
    const vd = 0.6;
    const vb = 0.4;

    setEditName(food.name);
    setEditWeight(w.toString());
    setEditUnit("g");
    
    // Set base stats per 1 gram
    const stats = {
      calories: food.calories / w,
      protein: food.protein / w,
      carbs: food.carbs / w,
      fat: food.fat / w,
      fiber: fib / w,
      iron: ir / w,
      calcium: cal / w,
      vitamin_d: vd / w,
      vitamin_b12: vb / w
    };
    
    setBaseStats(stats);

    // Populate input values
    setEditCalories(food.calories.toString());
    setEditProtein(food.protein.toString());
    setEditCarbs(food.carbs.toString());
    setEditFat(food.fat.toString());
    setEditFiber(fib.toString());
    setEditIron(ir.toString());
    setEditCalcium(cal.toString());
    setEditVitD(vd.toString());
    setEditVitB12(vb.toString());
  };

  // Real-time recalculation of serving size metrics
  const handleRecalculate = (newWeightStr: string, newUnit: SupportedUnit) => {
    setEditWeight(newWeightStr);
    setEditUnit(newUnit);

    const qty = parseFloat(newWeightStr);
    if (isNaN(qty) || qty <= 0) return;

    // Recalculate using our standard Serving Engine conversion logic
    const baseStatsInput = {
      calories: baseStats.calories,
      protein: baseStats.protein,
      carbs: baseStats.carbs,
      fat: baseStats.fat,
      fiber: baseStats.fiber,
      iron: baseStats.iron,
      calcium: baseStats.calcium,
      vitamin_d: baseStats.vitamin_d,
      vitamin_b12: baseStats.vitamin_b12
    };

    const recalculated = calculateNutrition(baseStatsInput, qty, newUnit, editName);

    // Recalculate stats instantly using base metrics (without API calls!)
    setEditCalories(recalculated.calories.toString());
    setEditProtein(recalculated.protein.toString());
    setEditCarbs(recalculated.carbs.toString());
    setEditFat(recalculated.fat.toString());
    setEditFiber(recalculated.fiber.toString());
    setEditIron(recalculated.iron.toString());
    setEditCalcium(recalculated.calcium.toString());
    setEditVitD(recalculated.vitamin_d.toString());
    setEditVitB12(recalculated.vitamin_b12.toString());
  };


  const handleSelectFallback = (option: { name: string; calories: number }) => {
    // Populate stats based on user fallback choice
    const mockFood: ScannedFoodResult = {
      name: option.name,
      weight: 180,
      calories: option.calories,
      protein: Math.round((option.calories * 0.25) / 4),
      carbs: Math.round((option.calories * 0.5) / 4),
      fat: Math.round((option.calories * 0.25) / 9),
      confidence: 1.0
    };

    populateEditSheet(mockFood);
    setScanState("edit_sheet");
  };

  const handleConfirmSave = () => {
    const cal = parseInt(editCalories) || 0;
    const pro = parseInt(editProtein) || 0;
    const carb = parseInt(editCarbs) || 0;
    const f = parseInt(editFat) || 0;
    
    // Calculate total grams mapped
    const qty = parseFloat(editWeight) || 100;
    const mult = getUnitWeightInGrams(editUnit, editName);
    const totalGrams = qty * mult;

    // Log food item to daily dashboard list
    logMeal(
      {
        meal_type: "Lunch",
        calories: cal,
        protein: pro,
        carbs: carb,
        fat: f
      },
      [
        {
          food_name: editName,
          quantity_grams: totalGrams,
          calories: cal,
          protein: pro,
          carbs: carb,
          fat: f
        }
      ]
    );

    const originalFood = scannedFoods[0] || { name: editName, weight: totalGrams, calories: cal };
    
    savePredictionAndCorrection(
      {
        predicted_food: originalFood.name,
        predicted_weight: originalFood.weight || totalGrams,
        predicted_calories: originalFood.calories || cal,
        confidence: currentConfidence
      },
      {
        prediction_id: "",
        corrected_food: editName,
        corrected_weight: totalGrams,
        corrected_calories: cal,
        corrected_protein: pro,
        corrected_carbs: carb,
        corrected_fat: f
      }
    );

    Alert.alert("Meal Saved", "Correction logged! ZenLog AI is learning from your edits.", [
      { text: "Dashboard", onPress: () => router.replace("/(tabs)") }
    ]);
  };

  const handleSaveAsTemplate = () => {
    if (!editName) return;
    const cal = parseInt(editCalories) || 0;
    const pro = parseInt(editProtein) || 0;
    const carb = parseInt(editCarbs) || 0;
    const f = parseInt(editFat) || 0;
    
    const qty = parseFloat(editWeight) || 100;
    const mult = getUnitWeightInGrams(editUnit, editName);
    const totalGrams = qty * mult;

    createTemplate(editName, [
      {
        food_name: editName,
        quantity_grams: totalGrams,
        calories: cal,
        protein: pro,
        carbs: carb,
        fat: f
      }
    ]);

    Alert.alert("Template Created", `Successfully saved Reusable Template "${editName}"!`);
  };

  return (
    <View style={styles.container}>
      
      {/* Brand Header */}
      <View style={styles.header}>
        <Text style={styles.brandTitle}>ZenLog Scanner</Text>
        <Text style={styles.headerSub}>AI Meal Recognition</Text>
      </View>

      <View style={styles.viewportContainer}>
        
        {/* VIEW 1: SIMULATED CAMERA VIEWPORT */}
        {scanState === "viewport" && (
          <View style={styles.contentWrapper}>
            <View style={styles.cameraBox}>
              <View style={styles.bracketsWrapper}>
                <View style={styles.bracketSquare} />
              </View>
              
              <Text style={styles.cameraHelpText}>ZenLog Camera Simulator</Text>
              <Text style={styles.cameraHelpSub}>Align plate and capture to call Gemini 2.5 Flash Vision.</Text>

              {/* Action buttons */}
              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.galleryButton} onPress={handleSimulateCapture}>
                  <ImageIcon size={20} color="#FFFFFF" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.captureButton} onPress={handleSimulateCapture}>
                  <View style={styles.captureInner} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.manualButton} onPress={() => { populateEditSheet({ name: "Custom Meal", weight: 150, calories: 350, protein: 12, carbs: 45, fat: 8, confidence: 1.0 }); setScanState("edit_sheet"); }}>
                  <Edit3 size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* VIEW 2: AI ANALYZING */}
        {scanState === "analyzing" && (
          <View style={styles.analyzingWrapper}>
            <ActivityIndicator size="large" color="#14B8A6" />
            <Text style={styles.analyzingText}>Gemini 2.5 Flash Vision Active</Text>
            <Text style={styles.analyzingSub}>Calculating Indian presets database calories splits...</Text>
          </View>
        )}

        {/* VIEW 3: CONFIDENCE ENGINE FALLBACK */}
        {scanState === "confidence_fallback" && (
          <View style={styles.fallbackWrapper}>
            <View style={styles.fallbackCard}>
              <View style={styles.alertHeader}>
                <AlertTriangle size={18} color="#D97706" />
                <Text style={styles.alertTitle}>Select Correct Food</Text>
              </View>
              <Text style={styles.alertSub}>Gemini confidence was low ({Math.round(currentConfidence * 100)}%). Select close option match:</Text>

              <View style={styles.optionsList}>
                {fallbackOptions.map((opt, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.optionItem}
                    onPress={() => handleSelectFallback(opt)}
                  >
                    <Text style={styles.optionText}>🍱 {opt.name}</Text>
                    <Text style={styles.optionCalories}>{opt.calories} kcal</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* VIEW 4: EDIT RESULTS SHEET */}
        {scanState === "edit_sheet" && (
          <View style={styles.editWrapper}>
            <ScrollView contentContainerStyle={styles.editForm} showsVerticalScrollIndicator={false}>
              
              <View style={styles.editHeader}>
                <Text style={styles.editTitle}>Confirm Food Estimation</Text>
                <TouchableOpacity onPress={() => setScanState("viewport")} style={styles.closeButton}>
                  <X size={16} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <View style={styles.inputSection}>
                <Text style={styles.fieldLabel}>Food Name</Text>
                <TextInput style={styles.textInput} value={editName} onChangeText={setEditName} />
              </View>

              {/* Dynamic Serving Size Picker */}
              <View style={styles.gridRow}>
                <View style={[styles.inputSection, { width: "48%" }]}>
                  <Text style={styles.fieldLabel}>Quantity</Text>
                  <TextInput 
                    style={styles.textInput} 
                    value={editWeight} 
                    onChangeText={(v) => handleRecalculate(v, editUnit)} 
                    keyboardType="numeric" 
                  />
                </View>
                <View style={[styles.inputSection, { width: "48%" }]}>
                  <Text style={styles.fieldLabel}>Unit</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.unitPillsScroll}>
                    {supportedUnitsList.map((unit) => (
                      <TouchableOpacity
                        key={unit}
                        style={[styles.unitPill, editUnit === unit && styles.unitPillActive]}
                        onPress={() => handleRecalculate(editWeight, unit)}
                      >
                        <Text style={[styles.unitPillText, editUnit === unit && styles.unitPillTextActive]}>
                          {unit}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>

              {/* Serving size quick slider */}
              {(() => {
                const SLIDER_STEPS = [50, 75, 100, 125, 150, 200];
                const currentWeightNum = parseFloat(editWeight) || 100;
                
                let closestIndex = 2; // Default to 100g
                let minDiff = Infinity;
                
                SLIDER_STEPS.forEach((step, idx) => {
                  const stepInCurrentUnit = step * getUnitWeightInGrams("g", editName) / getUnitWeightInGrams(editUnit, editName);
                  const diff = Math.abs(stepInCurrentUnit - currentWeightNum);
                  if (diff < minDiff) {
                    minDiff = diff;
                    closestIndex = idx;
                  }
                });

                return (
                  <View style={styles.sliderContainer}>
                    <Text style={styles.fieldLabel}>Serving Size Slider ({editName})</Text>
                    
                    <View style={styles.sliderTrackWrapper}>
                      {/* Track background */}
                      <View style={styles.sliderTrackBg} />
                      
                      {/* Active track highlighting */}
                      <View 
                        style={[
                          styles.sliderTrackActive, 
                          { width: `${(closestIndex / (SLIDER_STEPS.length - 1)) * 100}%` }
                        ]} 
                      />
                      
                      {/* Sliding knob */}
                      <View 
                        style={[
                          styles.sliderKnob, 
                          { left: `${(closestIndex / (SLIDER_STEPS.length - 1)) * 100}%` }
                        ]} 
                      />
                    </View>

                    {/* Step labels */}
                    <View style={styles.sliderLabelsRow}>
                      {SLIDER_STEPS.map((step, idx) => {
                        const stepVal = editUnit === "g" 
                          ? step 
                          : Math.round((step * getUnitWeightInGrams("g", editName) / getUnitWeightInGrams(editUnit, editName)) * 10) / 10;
                        
                        return (
                          <TouchableOpacity
                            key={idx}
                            style={styles.sliderLabelBtn}
                            onPress={() => handleRecalculate(stepVal.toString(), editUnit)}
                          >
                            <Text style={[styles.sliderLabelText, closestIndex === idx && styles.sliderLabelTextActive]}>
                              {stepVal}{editUnit}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                );
              })()}

              {/* Recalculated Macros outputs */}
              <View style={styles.gridRow}>
                <View style={[styles.inputSection, { width: "48%" }]}>
                  <Text style={styles.fieldLabel}>Calories (kcal)</Text>
                  <TextInput style={styles.textInput} value={editCalories} onChangeText={setEditCalories} keyboardType="numeric" />
                </View>
                <View style={[styles.inputSection, { width: "48%" }]}>
                  <Text style={styles.fieldLabel}>Fiber (g)</Text>
                  <TextInput style={styles.textInput} value={editFiber} onChangeText={setEditFiber} keyboardType="numeric" />
                </View>
              </View>

              <View style={styles.gridThree}>
                <View style={styles.gridThreeCol}>
                  <Text style={styles.fieldLabel}>Protein (g)</Text>
                  <TextInput style={styles.textInputCent} value={editProtein} onChangeText={setEditProtein} keyboardType="numeric" />
                </View>
                <View style={styles.gridThreeCol}>
                  <Text style={styles.fieldLabel}>Carbs (g)</Text>
                  <TextInput style={styles.textInputCent} value={editCarbs} onChangeText={setEditCarbs} keyboardType="numeric" />
                </View>
                <View style={styles.gridThreeCol}>
                  <Text style={styles.fieldLabel}>Fat (g)</Text>
                  <TextInput style={styles.textInputCent} value={editFat} onChangeText={setEditFat} keyboardType="numeric" />
                </View>
              </View>

              {/* Recalculated Micros outputs */}
              <Text style={styles.microsLabelHeading}>Recalculated Micro-nutrients</Text>
              <View style={styles.gridThree}>
                <View style={styles.gridThreeCol}>
                  <Text style={styles.fieldLabel}>Calcium (mg)</Text>
                  <TextInput style={styles.textInputCent} value={editCalcium} onChangeText={setEditCalcium} keyboardType="numeric" />
                </View>
                <View style={styles.gridThreeCol}>
                  <Text style={styles.fieldLabel}>Vit D (mcg)</Text>
                  <TextInput style={styles.textInputCent} value={editVitD} onChangeText={setEditVitD} keyboardType="numeric" />
                </View>
                <View style={styles.gridThreeCol}>
                  <Text style={styles.fieldLabel}>Vit B12 (mcg)</Text>
                  <TextInput style={styles.textInputCent} value={editVitB12} onChangeText={setEditVitB12} keyboardType="numeric" />
                </View>
              </View>

              <TouchableOpacity style={styles.saveButton} onPress={handleConfirmSave}>
                <Check size={18} color="#FFFFFF" />
                <Text style={styles.saveButtonText}>Confirm & Save Log</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.templateButton} onPress={handleSaveAsTemplate}>
                <Text style={styles.templateButtonText}>⭐️ Save as Reusable Template</Text>
              </TouchableOpacity>

            </ScrollView>
          </View>
        )}

      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8FA",
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  header: {
    alignItems: "flex-start",
    marginBottom: 20,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#111827",
  },
  headerSub: {
    fontSize: 9,
    fontWeight: "900",
    color: "#9CA3AF",
    textTransform: "uppercase",
    marginTop: 2,
  },
  viewportContainer: {
    flex: 1,
  },
  contentWrapper: {
    flex: 1,
    marginBottom: 100,
  },
  cameraBox: {
    flex: 1,
    backgroundColor: "#111115",
    borderRadius: 36,
    borderWidth: 4,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 24,
    overflow: "hidden",
  },
  bracketsWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    opacity: 0.15,
  },
  bracketSquare: {
    height: 160,
    width: 160,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    borderRadius: 20,
  },
  cameraHelpText: {
    fontSize: 14,
    fontWeight: "900",
    color: "#FFFFFF",
    marginTop: 10,
  },
  cameraHelpSub: {
    fontSize: 9,
    color: "#9CA3AF",
    fontWeight: "bold",
    textAlign: "center",
    maxWidth: 200,
    marginTop: 4,
    lineHeight: 13,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    width: "100%",
    marginTop: 20,
  },
  galleryButton: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    height: 48,
    width: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  captureButton: {
    height: 70,
    width: 70,
    borderRadius: 35,
    backgroundColor: "transparent",
    borderWidth: 4,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  captureInner: {
    height: 52,
    width: 52,
    borderRadius: 26,
    backgroundColor: "#14B8A6",
  },
  manualButton: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    height: 48,
    width: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  analyzingWrapper: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 100,
  },
  analyzingText: {
    fontSize: 14,
    fontWeight: "900",
    color: "#111827",
    marginTop: 16,
  },
  analyzingSub: {
    fontSize: 9,
    color: "#9CA3AF",
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 4,
  },
  fallbackWrapper: {
    flex: 1,
    marginBottom: 100,
  },
  fallbackCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 32,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 24,
  },
  alertHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: "#D97706",
    marginLeft: 8,
  },
  alertSub: {
    fontSize: 10,
    color: "#6B7280",
    fontWeight: "bold",
    lineHeight: 14,
    marginBottom: 16,
  },
  optionsList: {
    paddingVertical: 4,
  },
  optionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    padding: 14,
    marginBottom: 8,
  },
  optionText: {
    fontSize: 12,
    fontWeight: "900",
    color: "#111827",
  },
  optionCalories: {
    fontSize: 11,
    fontWeight: "900",
    color: "#10B981",
  },
  editWrapper: {
    flex: 1,
    marginBottom: 100,
  },
  editForm: {
    backgroundColor: "#FFFFFF",
    borderRadius: 36,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 24,
  },
  editHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    paddingBottom: 12,
    marginBottom: 16,
  },
  editTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: "#111827",
  },
  closeButton: {
    backgroundColor: "#F3F4F6",
    padding: 6,
    borderRadius: 99,
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
    borderRadius: 16,
    paddingHorizontal: 16,
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
  unitPillsScroll: {
    flexGrow: 0,
    maxHeight: 44,
  },
  unitPill: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    marginRight: 6,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  unitPillActive: {
    backgroundColor: "#111827",
    borderColor: "#111827",
  },
  unitPillText: {
    fontSize: 9,
    fontWeight: "900",
    color: "#6B7280",
  },
  unitPillTextActive: {
    color: "#FFFFFF",
  },
  microsLabelHeading: {
    fontSize: 9,
    fontWeight: "900",
    color: "#9CA3AF",
    textTransform: "uppercase",
    marginVertical: 10,
    textAlign: "left",
  },
  gridThree: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  gridThreeCol: {
    width: "31%",
    alignItems: "flex-start",
  },
  textInputCent: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    paddingVertical: 10,
    fontSize: 12,
    fontWeight: "bold",
    color: "#111827",
    width: "100%",
    textAlign: "center",
  },
  saveButton: {
    flexDirection: "row",
    backgroundColor: "#111827",
    paddingVertical: 14,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 8,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
    marginLeft: 6,
  },
  templateButton: {
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },
  templateButtonText: {
    color: "#6B7280",
    fontSize: 11,
    fontWeight: "bold",
  },
  sliderContainer: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    width: "100%",
  },
  sliderTrackWrapper: {
    height: 30,
    justifyContent: "center",
    position: "relative",
    width: "100%",
    marginVertical: 4,
  },
  sliderTrackBg: {
    height: 4,
    backgroundColor: "#E5E7EB",
    borderRadius: 2,
    width: "100%",
  },
  sliderTrackActive: {
    height: 4,
    backgroundColor: "#14B8A6",
    borderRadius: 2,
    position: "absolute",
  },
  sliderKnob: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    borderWidth: 3,
    borderColor: "#14B8A6",
    position: "absolute",
    marginTop: -8,
    marginLeft: -10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  sliderLabelsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 8,
  },
  sliderLabelBtn: {
    alignItems: "center",
    paddingVertical: 4,
  },
  sliderLabelText: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#9CA3AF",
  },
  sliderLabelTextActive: {
    color: "#111827",
    fontWeight: "900",
  },
});
