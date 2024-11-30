const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");
const mime = require("mime-types"); // To get the mime type of the file

const genAI = new GoogleGenerativeAI("AIzaSyCG6fk4HCvQl97R4D_5fVvLATgbRri2mJ0");

const callfun = async () => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  // Specify the file path and read it
  const filePath = "./xry.webp"; // Replace with your file path
  const fileBuffer = fs.readFileSync(filePath);
  const mimeType = mime.lookup(filePath);

  if (!mimeType) {
    console.error("Unsupported file type");
    return;
  }

  const fileData = {
    inlineData: {
      data: Buffer.from(fileBuffer).toString("base64"),
      mimeType: mimeType,
    },
  };

  // Set a prompt for analyzing the content
  const prompt = "analyse this image and tell me in 2 lines what is said in this image. but use simple easy words so that i can understand";

  // Call the model with the prompt and file data
  const result = await model.generateContent([prompt, fileData]);
  console.log(result.response.text());
};

// Run the function
callfun();
