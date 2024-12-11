const { Translate } = require("@google-cloud/translate").v2;
require("dotenv").config();

const CREDENTIALS = JSON.parse(process.env.CREDENTIALS);

const translate = new Translate({
  credentials: CREDENTIALS,
  projectId: CREDENTIALS.project_id,
});

const translateText = async (text, targetLanguage) => {
  try {
    if (!text || !targetLanguage) {
      throw new Error("Invalid text or target language.");
    }

    let [translation] = await translate.translate(text, targetLanguage);
    return translation;
  } catch (error) {
    console.log(`Error at translate text --> ${error}`);
    return text;
  }
};

module.exports = { translateText };
