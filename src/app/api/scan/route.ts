import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { imageBase64, mimeType, clientApiKey } = await req.json();

    // Prioritize client-provided key from localStorage, fall back to environment variable
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

    // Official Google Gemini API endpoint (gemini-1.5-flash for maximum vision speed and reliability)
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    const promptText = `Analyze this food image. Estimate its nutritional value.
Provide your response strictly in raw JSON format with the following fields:
{
  "foodName": "A descriptive name of the food item detected",
  "calories": 350, // estimated total calories as a number
  "protein": 15, // estimated protein in grams as a number
  "carbs": 45, // estimated carbohydrate in grams as a number
  "fat": 12, // estimated fat in grams as a number
  "estimatedWeightGrams": 250 // estimated portion weight in grams
}
IMPORTANT: Do not wrap your response in markdown code blocks like \`\`\`json or \`\`\`. Return ONLY a clean, valid JSON string.`;

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
        temperature: 0.2,
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

    // Safely parse JSON structure from text
    try {
      const parsedData = JSON.parse(replyText.trim());
      return NextResponse.json({ success: true, data: parsedData });
    } catch (e) {
      return NextResponse.json({ success: true, rawText: replyText });
    }

  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Internal server error" }, { status: 500 });
  }
}
