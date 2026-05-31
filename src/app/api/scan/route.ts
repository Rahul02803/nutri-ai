import { NextResponse } from "next/server";
import { INITIAL_FOODS } from "@/lib/foods";

export async function POST(req: Request) {
  try {
    const { imageBase64, mimeType, clientApiKey } = await req.json();

    const apiKey = clientApiKey || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini API key is not configured. Please supply an API key in .env or input it directly." },
        { status: 400 }
      );
    }

    if (!imageBase64) {
      return NextResponse.json({ error: "Missing imageBase64 payload" }, { status: 400 });
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    // Strict prompt strictly forbidding calorie and macro estimation from AI
    const promptText = `Analyze this image and identify food items.
Return ONLY JSON.

{
  "foods":[
    {
      "name":"",
      "confidence":0
    }
  ]
}

Do not estimate calories.
Do not estimate macros.
Only identify visible foods.`;

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
        maxOutputTokens: 250,
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

      // Step 4 & 5: Food database lookup & calculate calories and macros
      const identified = foods[0]; // Primary identified food item
      const identifiedName = (identified.name || "").trim().toLowerCase();
      const confidence = parseFloat(identified.confidence) || 0;

      // Smart database lookup check name and aliases
      let matchedItem = INITIAL_FOODS.find((item) => {
        const itemName = item.name.toLowerCase();
        const aliasMatch = item.aliases?.some((alias) => identifiedName.includes(alias.toLowerCase()) || alias.toLowerCase().includes(identifiedName));
        return itemName.includes(identifiedName) || identifiedName.includes(itemName) || aliasMatch;
      });

      // Default fallback if not found in database (e.g. estimate generic fallback)
      if (!matchedItem) {
        matchedItem = {
          id: "generic-match",
          name: identified.name || "Identified Meal",
          servingSize: "1 serving (150g)",
          calories: 280,
          protein: 8,
          carbs: 35,
          fat: 10,
          category: "Other"
        };
      }

      return NextResponse.json({
        success: true,
        data: {
          foodName: matchedItem.name,
          calories: matchedItem.calories,
          protein: matchedItem.protein,
          carbs: matchedItem.carbs,
          fat: matchedItem.fat,
          servingSize: matchedItem.servingSize,
          confidence: confidence
        }
      });

    } catch (e) {
      return NextResponse.json({ error: "Failed to parse structured JSON output from Gemini." }, { status: 500 });
    }

  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Internal server error" }, { status: 500 });
  }
}
