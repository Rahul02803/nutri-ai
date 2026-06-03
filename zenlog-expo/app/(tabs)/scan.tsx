import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator, SafeAreaView } from "react-native";
import { useStore, FoodPrediction, FoodCorrection } from "../../store/useStore";
import { useRouter } from "expo-router";
import { scanMealImageWithGemini, ScannedFoodResult } from "../../services/gemini";
import { 
  Camera as LucideCamera, 
  Image as LucideImageIcon, 
  Check as LucideCheck, 
  X as LucideX, 
  AlertTriangle as LucideAlertTriangle
} from "lucide-react-native";
import { SupportedUnit, getUnitWeightInGrams, calculateNutrition } from "../../services/servingEngine";

const Camera = LucideCamera as any;
const ImageIcon = LucideImageIcon as any;
const Check = LucideCheck as any;
const X = LucideX as any;
const AlertTriangle = LucideAlertTriangle as any;

export default function ScannerScreen() {
  const router = useRouter();
  const { logMeal, savePredictionAndCorrection, setTabBarHidden } = useStore();

  const [scanState, setScanState] = useState<"viewport" | "analyzing" | "confidence_fallback" | "edit_sheet">("viewport");
  const [busy, setBusy] = useState(false);

  // Tab bar hiding trigger
  React.useEffect(() => {
    const isOverlayOpen = scanState !== "viewport";
    setTabBarHidden(isOverlayOpen);
    return () => setTabBarHidden(false);
  }, [scanState, setTabBarHidden]);

  // Gemini scanned results
  const [scannedFoods, setScannedFoods] = useState<ScannedFoodResult[]>([]);
  const [currentConfidence, setCurrentConfidence] = useState(1.0);
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

  const supportedUnitsList: SupportedUnit[] = ["g", "oz", "ml", "tbsp", "cup", "bowl", "piece", "slice", "cube", "roti"];

  // Capture Trigger
  const handleSimulateCapture = () => {
    setScanState("analyzing");
    setBusy(true);

    const mockBase64 = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ...";

    setTimeout(async () => {
      try {
        const foods = await scanMealImageWithGemini(mockBase64);
        setScannedFoods(foods);

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
    }, 1800);
  };

  const populateEditSheet = (food: ScannedFoodResult) => {
    const w = food.weight || 100;
    setEditName(food.name);
    setEditWeight(w.toString());
    setEditUnit("g");
    
    // Set base stats per 1 gram
    const stats = {
      calories: food.calories / w,
      protein: food.protein / w,
      carbs: food.carbs / w,
      fat: food.fat / w,
      fiber: 3.5 / w,
      iron: 2.0 / w,
      calcium: 240 / w,
      vitamin_d: 0.6 / w,
      vitamin_b12: 0.4 / w
    };
    
    setBaseStats(stats);

    // Populate values
    setEditCalories(food.calories.toString());
    setEditProtein(food.protein.toString());
    setEditCarbs(food.carbs.toString());
    setEditFat(food.fat.toString());
  };

  // Real-time recalculation of serving size metrics
  const handleRecalculate = (newWeightStr: string, newUnit: SupportedUnit) => {
    setEditWeight(newWeightStr);
    setEditUnit(newUnit);

    const qty = parseFloat(newWeightStr);
    if (isNaN(qty) || qty <= 0) return;

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

    setEditCalories(recalculated.calories.toString());
    setEditProtein(recalculated.protein.toString());
    setEditCarbs(recalculated.carbs.toString());
    setEditFat(recalculated.fat.toString());
  };

  const handleSelectFallback = (option: { name: string; calories: number }) => {
    const mockFood: ScannedFoodResult = {
      name: option.name,
      weight: 150,
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
    
    const qty = parseFloat(editWeight) || 100;
    const mult = getUnitWeightInGrams(editUnit, editName);
    const totalGrams = qty * mult;

    // Log meal to local store
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

    Alert.alert("Meal Logged", "Logged to your dashboard successfully!", [
      { text: "Done", onPress: () => router.replace("/(tabs)") }
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* VIEW 1: FULL-SCREEN CAMERA VIEWPORT */}
        {scanState === "viewport" && (
          <View style={styles.cameraContainer}>
            {/* Minimal overlays */}
            <TouchableOpacity 
              style={styles.backButtonFloating}
              onPress={() => router.replace("/(tabs)")}
              activeOpacity={0.8}
            >
              <X size={20} color="#FFFFFF" />
            </TouchableOpacity>

            <View style={styles.scanBrackets}>
              <View style={styles.bracketCorner} />
            </View>

            <View style={styles.cameraMeta}>
              <Text style={styles.cameraTitle}>ZenLog Camera</Text>
              <Text style={styles.cameraSubtitle}>Align dish inside brackets</Text>
            </View>

            {/* Absolute Bottom Controls (Max 3: Gallery, Shutter, Manual Input) */}
            <View style={styles.cameraControls}>
              <TouchableOpacity 
                style={styles.controlPill} 
                onPress={handleSimulateCapture}
                activeOpacity={0.8}
              >
                <ImageIcon size={20} color="#FFFFFF" />
              </TouchableOpacity>

              {/* Shutter primary button */}
              <TouchableOpacity 
                style={styles.shutterButton} 
                onPress={handleSimulateCapture}
                activeOpacity={0.9}
              >
                <View style={styles.shutterInner} />
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.controlPill} 
                onPress={() => { populateEditSheet({ name: "Paneer Roll", weight: 150, calories: 350, protein: 12, carbs: 45, fat: 8, confidence: 1.0 }); setScanState("edit_sheet"); }}
                activeOpacity={0.8}
              >
                <Text style={styles.controlText}>+ Log</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* VIEW 2: AI ANALYZING */}
        {scanState === "analyzing" && (
          <View style={styles.centeredWrapper}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={styles.analyzingText}>ZenLog Visual AI</Text>
            <Text style={styles.analyzingSub}>Calculating macro distributions...</Text>
          </View>
        )}

        {/* VIEW 3: CONFIDENCE FALLBACK MATCH */}
        {scanState === "confidence_fallback" && (
          <View style={styles.fallbackContainer}>
            <View style={styles.alertHeader}>
              <AlertTriangle size={20} color="#F59E0B" />
              <Text style={styles.alertTitle}>Select Closest Match</Text>
            </View>
            <Text style={styles.alertSubtitle}>Confidence was low. Select the closest option below:</Text>

            <ScrollView contentContainerStyle={styles.fallbackList} showsVerticalScrollIndicator={false}>
              {fallbackOptions.map((opt, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.fallbackItem}
                  onPress={() => handleSelectFallback(opt)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.fallbackItemName}>{opt.name}</Text>
                  <Text style={styles.fallbackItemCal}>{opt.calories} kcal</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* VIEW 4: RESULTS SHEET OVERLAY (Calm, White, Soft gray cards, 20px rounded) */}
        {scanState === "edit_sheet" && (
          <View style={styles.resultsSheet}>
            <ScrollView contentContainerStyle={styles.resultsScroll} showsVerticalScrollIndicator={false}>
              
              <View style={styles.resultsHeader}>
                <Text style={styles.resultsTitle}>Meal Scanned</Text>
                {/* Action 3: Close (Tertiary Action) */}
                <TouchableOpacity 
                  onPress={() => setScanState("viewport")} 
                  style={styles.closeBtn}
                  activeOpacity={0.8}
                >
                  <X size={18} color="#111827" />
                </TouchableOpacity>
              </View>

              {/* Food Name input card */}
              <View style={styles.grayCard}>
                <Text style={styles.fieldLabel}>Meal Item</Text>
                <TextInput style={styles.nameInput} value={editName} onChangeText={setEditName} />
              </View>

              {/* Quantities & Unit pill selectors (Action 2: Edit serving size/unit) */}
              <View style={styles.grayCard}>
                <View style={styles.quantityRow}>
                  <View style={{ width: "35%" }}>
                    <Text style={styles.fieldLabel}>Quantity</Text>
                    <TextInput 
                      style={styles.qtyInput} 
                      value={editWeight} 
                      onChangeText={(v) => handleRecalculate(v, editUnit)} 
                      keyboardType="numeric" 
                    />
                  </View>
                  <View style={{ width: "60%" }}>
                    <Text style={styles.fieldLabel}>Unit</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.unitScroll}>
                      {supportedUnitsList.map((unit) => (
                        <TouchableOpacity
                          key={unit}
                          style={[styles.unitPill, editUnit === unit && styles.unitPillActive]}
                          onPress={() => handleRecalculate(editWeight, unit)}
                          activeOpacity={0.8}
                        >
                          <Text style={[styles.unitText, editUnit === unit && styles.unitTextActive]}>
                            {unit}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                </View>

                {/* Serving Slider (Electric Blue #3B82F6) */}
                {(() => {
                  const SLIDER_STEPS = [50, 100, 150, 200, 250];
                  const currentWeight = parseFloat(editWeight) || 100;
                  
                  let activeIdx = 1;
                  let minDiff = Infinity;
                  SLIDER_STEPS.forEach((step, idx) => {
                    const stepInUnit = step * getUnitWeightInGrams("g", editName) / getUnitWeightInGrams(editUnit, editName);
                    const diff = Math.abs(stepInUnit - currentWeight);
                    if (diff < minDiff) {
                      minDiff = diff;
                      activeIdx = idx;
                    }
                  });

                  return (
                    <View style={styles.sliderBox}>
                      <View style={styles.sliderTrackWrapper}>
                        <View style={styles.sliderTrackBg} />
                        <View style={[styles.sliderTrackActive, { width: `${(activeIdx / 4) * 100}%` }]} />
                        <View style={[styles.sliderKnob, { left: `${(activeIdx / 4) * 100}%` }]} />
                      </View>
                      
                      <View style={styles.sliderLabels}>
                        {SLIDER_STEPS.map((step, idx) => {
                          const stepVal = editUnit === "g" 
                            ? step 
                            : Math.round((step * getUnitWeightInGrams("g", editName) / getUnitWeightInGrams(editUnit, editName)) * 10) / 10;
                          return (
                            <TouchableOpacity
                              key={idx}
                              onPress={() => handleRecalculate(stepVal.toString(), editUnit)}
                              activeOpacity={0.8}
                            >
                              <Text style={[styles.sliderLabel, activeIdx === idx && styles.sliderLabelActive]}>
                                {stepVal}{editUnit}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </View>
                  );
                })()}
              </View>

              {/* Recalculating Macros layout (Protein, Carbs, Fat, Calories in clean grays) */}
              <View style={styles.recalcGrid}>
                {/* Calories */}
                <View style={styles.recalcCol}>
                  <Text style={styles.recalcVal}>{editCalories}</Text>
                  <Text style={styles.recalcLabel}>Calories</Text>
                </View>
                {/* Protein */}
                <View style={styles.recalcCol}>
                  <Text style={styles.recalcVal}>{editProtein}g</Text>
                  <Text style={styles.recalcLabel}>Protein</Text>
                </View>
                {/* Carbs */}
                <View style={styles.recalcCol}>
                  <Text style={styles.recalcVal}>{editCarbs}g</Text>
                  <Text style={styles.recalcLabel}>Carbs</Text>
                </View>
                {/* Fats */}
                <View style={styles.recalcCol}>
                  <Text style={styles.recalcVal}>{editFat}g</Text>
                  <Text style={styles.recalcLabel}>Fats</Text>
                </View>
              </View>

              {/* Action 1: Save Log (Primary Action - prominent electric blue) */}
              <TouchableOpacity 
                style={styles.confirmButton} 
                onPress={handleConfirmSave}
                activeOpacity={0.9}
              >
                <Check size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.confirmText}>Confirm & Log Meal</Text>
              </TouchableOpacity>

            </ScrollView>
          </View>
        )}

      </View>
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
  cameraContainer: {
    flex: 1,
    backgroundColor: "#111115",
    justifyContent: "space-between",
    position: "relative",
  },
  backButtonFloating: {
    position: "absolute",
    top: 24,
    left: 24,
    height: 44,
    width: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  scanBrackets: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  bracketCorner: {
    height: 180,
    width: 180,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.4)",
    borderRadius: 24,
  },
  cameraMeta: {
    position: "absolute",
    top: 90,
    alignSelf: "center",
    alignItems: "center",
  },
  cameraTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },
  cameraSubtitle: {
    fontSize: 11,
    color: "#A1A1AA",
    fontWeight: "700",
    marginTop: 4,
  },
  cameraControls: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    width: "100%",
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
  controlPill: {
    height: 48,
    width: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  controlText: {
    fontSize: 10,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  shutterButton: {
    height: 80,
    width: 80,
    borderRadius: 40,
    borderWidth: 5,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  shutterInner: {
    height: 60,
    width: 60,
    borderRadius: 30,
    backgroundColor: "#3B82F6", // Electric Accent Blue
  },
  centeredWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  analyzingText: {
    fontSize: 18,
    fontWeight: "900",
    color: "#111827",
    marginTop: 18,
  },
  analyzingSub: {
    fontSize: 11,
    color: "#6B7280",
    fontWeight: "700",
    marginTop: 4,
  },
  fallbackContainer: {
    flex: 1,
    padding: 24,
    backgroundColor: "#FFFFFF",
  },
  alertHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#111827",
    marginLeft: 8,
  },
  alertSubtitle: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "700",
    lineHeight: 16,
    marginBottom: 24,
  },
  fallbackList: {
    paddingBottom: 24,
  },
  fallbackItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F4F4F5",
    borderRadius: 20,
    padding: 18,
    marginBottom: 10,
  },
  fallbackItemName: {
    fontSize: 14,
    fontWeight: "800",
    color: "#111827",
  },
  fallbackItemCal: {
    fontSize: 13,
    fontWeight: "900",
    color: "#3B82F6",
  },
  resultsSheet: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  resultsScroll: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
  },
  resultsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  resultsTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: "#111827",
    letterSpacing: -0.5,
  },
  closeBtn: {
    height: 36,
    width: 36,
    borderRadius: 18,
    backgroundColor: "#F4F4F5",
    alignItems: "center",
    justifyContent: "center",
  },
  grayCard: {
    backgroundColor: "#F4F4F5",
    borderRadius: 20,
    padding: 18,
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: "900",
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  nameInput: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
    paddingVertical: 2,
  },
  quantityRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  qtyInput: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingVertical: 4,
  },
  unitScroll: {
    paddingVertical: 2,
  },
  unitPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#E5E7EB",
    borderRadius: 12,
    marginRight: 6,
    justifyContent: "center",
  },
  unitPillActive: {
    backgroundColor: "#3B82F6",
  },
  unitText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#111827",
  },
  unitTextActive: {
    color: "#FFFFFF",
  },
  sliderBox: {
    marginTop: 10,
  },
  sliderTrackWrapper: {
    height: 16,
    justifyContent: "center",
    position: "relative",
  },
  sliderTrackBg: {
    height: 4,
    backgroundColor: "#E5E7EB",
    borderRadius: 2,
    width: "100%",
  },
  sliderTrackActive: {
    height: 4,
    backgroundColor: "#3B82F6",
    borderRadius: 2,
    position: "absolute",
  },
  sliderKnob: {
    height: 16,
    width: 16,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    borderWidth: 3,
    borderColor: "#3B82F6",
    position: "absolute",
    marginLeft: -8,
  },
  sliderLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  sliderLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#9CA3AF",
  },
  sliderLabelActive: {
    color: "#111827",
    fontWeight: "900",
  },
  recalcGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  recalcCol: {
    width: "48%",
    backgroundColor: "#F4F4F5",
    borderRadius: 20,
    padding: 16,
    alignItems: "center",
    marginBottom: 10,
  },
  recalcVal: {
    fontSize: 20,
    fontWeight: "900",
    color: "#111827",
  },
  recalcLabel: {
    fontSize: 10,
    color: "#6B7280",
    fontWeight: "700",
    marginTop: 2,
  },
  confirmButton: {
    flexDirection: "row",
    backgroundColor: "#3B82F6",
    borderRadius: 20,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  confirmText: {
    fontSize: 14,
    fontWeight: "900",
    color: "#FFFFFF",
  },
});
