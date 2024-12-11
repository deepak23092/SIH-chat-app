const { generateObject } = require("ai");
const { createOpenAI } = require("@ai-sdk/openai");
const { z } = require("zod");
const Negotiation = require("../models/Negotiation");

// Initialize OpenAI
const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

exports.openAiFunc = async (req, res) => {
  console.log("req.body", req.body);
  try {
    const userInput = req.body.text;
    console.log("userInput", userInput);

    if (!userInput) {
      return res
        .status(400)
        .json({ error: "Text field is required in the request body." });
    }

    // Use OpenAI to extract product name and price
    const result = await generateObject({
      model: openai("gpt-4o-mini-2024-07-18"),
      schema: z.object({
        productName: z.string().optional(),
        price: z.number().optional(),
      }),
      messages: [
        {
          role: "system",
          content:
            "You are an assistant. Extract the product name (e.g., crop, fruit, or vegetable) and price from the user's message. If the message is invalid, leave the fields empty.",
        },
        {
          role: "user",
          content: userInput,
        },
      ],
    });

    const { productName, price } = result.object;

    // Validate the extracted data
    if (!productName || !price) {
      return res.status(200).json({
        message: "You are not eligible for negotiating.",
      });
    }

    // Store the valid negotiation in the database
    const negotiation = new Negotiation({
      productName,
      price,
      message: userInput,
    });
    await negotiation.save();

    return res.status(200).json({
      message: "Your negotiation has been recorded.",
      negotiation: { productName, price },
    });
  } catch (error) {
    console.error("Error processing negotiation:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};
