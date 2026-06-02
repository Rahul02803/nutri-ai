import { NextResponse } from "next/server";
import { FoodItem } from "@/lib/foods";
import { searchFoodsOfflineOnline } from "@/lib/foodSearchService";

export async function POST(req: Request) {
  try {
    const { imageBase64, mimeType, clientApiKey } = await req.json();

    const apiKey = clientApiKey || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini API key is not configured. Please configure an API key in .env or input it directly." },
        { status: 400 }
      );
    }

    if (!imageBase64) {
      return NextResponse.json({ error: "Missing imageBase64 payload" }, { status: 400 });
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    // Prompt Gemini Vision strictly to detect foods and estimate weights in grams, but DO NOT generate macros/calories
    const promptText = `Analyze this image and identify all visible food items.
Return ONLY JSON matching this schema:
{
  "foods": [
    {
      "name": "Identified Food Name",
      "estimated_weight_g": 150,
      "confidence": 0.95
    }
  ]
}

For each food item:
1. Detect the specific food name (e.g. "Steamed Basmati Rice", "Paneer Butter Masala", "Jalebi", "Whole Wheat Roti / Chapati", "Dal Tadka").
2. Estimate the portion weight in grams.
3. Generate a confidence score between 0 and 1.
4. DO NOT generate, calculate, or estimate calories, protein, carbs, fats, or other nutrients. You must strictly omit any nutritional calculations.

Only return the JSON list of foods.`;

    const payload = {
      contents: [
        {
          parts: [
            { text: promptText },
            {
              inlineData: {
                mimeType: mimeType || "image/jpeg",
                data: cleanBase64
              }
            }
          ]
        }
      ],
      generationConfig: {
        maxOutputTokens: 500,
        temperature: 0.1,
        responseMimeType: "application/json"
      }
    };

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Gemini API responded with error: ${errorText}` },
        { status: response.status }
      );
    }

    const responseData = await response.json();
    const replyText = responseData?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!replyText) {
      return NextResponse.json({ error: "Failed to receive food parsing from Gemini." }, { status: 500 });
    }

    try {
      const parsedData = JSON.parse(replyText.trim());
      const foods = parsedData.foods || [];

      if (foods.length === 0) {
        return NextResponse.json({ error: "No food items could be identified in this image." }, { status: 400 });
      }

      // Concurrently query database for each identified food
      const processedFoods = await Promise.all(foods.map(async (f: any) => {
        const identifiedName = (f.name || "").trim();
        const estimatedWeightG = parseFloat(f.estimated_weight_g) || 100;
        const confidence = parseFloat(f.confidence) || 0.8;

        // Perform unified database search
        const dbMatches = await searchFoodsOfflineOnline(identifiedName);
        let matchedItem: FoodItem;

        if (dbMatches.length > 0) {
          matchedItem = dbMatches[0];
        } else {
          // Fallback to generic item if not found
          matchedItem = {
            id: `generic-scan-${Math.floor(Math.random() * 10000)}`,
            name: identifiedName,
            servingSize: "100g",
            calories: 150,
            protein: 4.0,
            carbs: 20.0,
            fat: 5.0,
            category: "Other"
          };
        }

        // Parse serving weight from matched item servingSize
        let servingWeightG = 100;
        const weightMatch = matchedItem.servingSize.match(/(\d+)\s*(g|ml)/i);
        if (weightMatch) {
          servingWeightG = parseFloat(weightMatch[1]) || 100;
        }

        const scaleFactor = estimatedWeightG / servingWeightG;

        return {
          id: matchedItem.id,
          name: matchedItem.name,
          estimatedWeightG,
          calories: Math.round(matchedItem.calories * scaleFactor),
          protein: Math.round(matchedItem.protein * scaleFactor * 10) / 10,
          carbs: Math.round(matchedItem.carbs * scaleFactor * 10) / 10,
          fat: Math.round(matchedItem.fat * scaleFactor * 10) / 10,
          servingSize: matchedItem.servingSize,
          confidence
        };
      }));

      return NextResponse.json({
        success: true,
        foods: processedFoods
      });

    } catch (e) {
      return NextResponse.json({ error: "Failed to parse structured JSON output from Gemini." }, { status: 500 });
    }

  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Internal server error" }, { status: 500 });
  }
}
