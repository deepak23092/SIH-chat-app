const translate = require("google-translate-api-x");

const translateText = async (text, targetLanguage, sourceLanguage = "en") => {
  try {
    if (!text || !targetLanguage) {
      throw new Error("Invalid text or target language.");
    }

    const response = await translate(text, {
      from: sourceLanguage,
      to: targetLanguage,
    });

    if (response && response.text) {
      return response.text;
    } else {
      console.error("Translation error:", response);
      throw new Error("Translation not found.");
    }
  } catch (error) {
    console.error("Error during translation:", error.message);
    throw new Error("Translation failed.");
  }
};

module.exports = { translateText };
