import { Request, Response } from "express";
import { GoogleGenAI } from "@google/genai";

export async function recommendProducts(req: Request, res: Response): Promise<any> {
  try {
    const { name, category, price, description } = req.body;

    if (!name || !category || price === undefined) {
      return res.status(400).json({ error: "Product name, category, and price are required." });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "Gemini API key is not configured." });
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `You are an e-commerce recommendation assistant.
Given this product:

Name: ${name}
Category: ${category}
Price: ${price}
Description: ${description || "No description provided."}

Recommend exactly 3 similar products.

Return ONLY valid JSON in this format:

{
  "recommendations":[
    {
      "name":"",
      "reason":"",
      "priceRange":""
    }
  ]
}

Do not include markdown.
Do not include explanations outside JSON.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const responseText = response.text || "";
    
    // Attempt to parse JSON
    try {
      const parsedData = JSON.parse(responseText);
      
      // Basic validation of output structure
      if (!parsedData.recommendations || !Array.isArray(parsedData.recommendations)) {
        throw new Error("Invalid response format from Gemini");
      }

      return res.status(200).json({
        success: true,
        recommendations: parsedData.recommendations
      });
    } catch (parseError) {
      console.error("Failed to parse Gemini response:", responseText);
      return res.status(500).json({ error: "Failed to parse recommendations from AI." });
    }

  } catch (error) {
    console.error("Recommend products error:", error);
    return res.status(500).json({ error: "Internal server error during AI recommendation." });
  }
}
