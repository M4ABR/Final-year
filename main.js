import { GoogleGenerativeAI } from "@google/generative-ai";
import { marked } from "marked";

// Initialize the Gemini API
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

// Append the bot's response with markdown content
const appendMessage = (message, sender = "user") => {
  const container = document.getElementById("messageContainer");
  if (!container) return console.error("Message container not found!");

  const msgDiv = document.createElement("div");
  msgDiv.className = `message ${sender}`;

  if (sender === "bot") {
    // Convert markdown to HTML
    const htmlContent = marked(message); 
    
    // Wrap the markdown content in a container
    msgDiv.innerHTML = `<div class="markdown-container">${htmlContent}</div>`;
    
    // Find code blocks and add a copy button
    const codeBlocks = msgDiv.querySelectorAll("pre code");
    codeBlocks.forEach((codeBlock) => {
      // Create a copy button and append it to the pre element
      const copyButton = document.createElement("button");
      copyButton.classList.add("copy-btn");
      copyButton.textContent = "Copy";

      // Append the button to the code block's container
      codeBlock.parentElement.appendChild(copyButton);

      // Add event listener for copy functionality
      copyButton.addEventListener("click", () => {
        // Select the code content
        const code = codeBlock.textContent;
        const textArea = document.createElement("textarea");
        textArea.value = code;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);

        // Add success style to the copy button
        copyButton.textContent = "Copied!";
        copyButton.classList.add("success");

        // Reset button text after a delay
        setTimeout(() => {
          copyButton.textContent = "Copy";
          copyButton.classList.remove("success");
        }, 2000);
      });
    });

    // Find tables and wrap them in a div for horizontal scrolling
    const tables = msgDiv.querySelectorAll("table");
    tables.forEach(table => {
      const tableWrapper = document.createElement("div");
      tableWrapper.classList.add("table-container");
      table.parentNode.insertBefore(tableWrapper, table);
      tableWrapper.appendChild(table);
    });
  } else {
    msgDiv.textContent = message; // User message as plain text
  }

  container.appendChild(msgDiv);
  container.scrollTop = container.scrollHeight; // Auto-scroll to the latest message
};



// Analyze a file
const analyzeFile = async (file) => {
  try {
    const fileBuffer = await file.arrayBuffer();
    const mimeType = file.type;

    if (!mimeType) {
      appendMessage("Unsupported file type.", "system");
      return;
    }

    const model = await genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const fileData = {
      inlineData: {
        data: Buffer.from(fileBuffer).toString("base64"),
        mimeType,
      },
    };

    const prompt = "Analyze the content of the uploaded file.";
    const result = await model.generateContent([prompt, fileData]);
    appendMessage(result.response.text(), "gemini");
  } catch (error) {
    console.error("Error analyzing the file:", error);
    appendMessage("Error analyzing the file. Please try again.", "system");
  }
};

// Analyze text input
const analyzeText = async (text) => {
  try {
    const model = await genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent([text]);

    const aiResponse = result.response.text();
    appendMessage(aiResponse, "bot");
  } catch (error) {
    console.error("Error analyzing the text:", error);
    appendMessage("Error analyzing the text. Please try again.", "system");
  }
};

// Handle file input
const handleFileInput = async (file) => {
  if (file) {
    appendMessage(`File uploaded: ${file.name}`, "user");
    await analyzeFile(file);
  }
};

// Set up file input listeners
const fileInput = document.getElementById("fileInput");

fileInput.addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (file) await handleFileInput(file);
});

const messageInput = document.getElementById("messageInput");
const submitButton = document.getElementById("submitButton");

submitButton.addEventListener("click", async () => {
  const message = messageInput.value.trim();
  if (message) {
    appendMessage(message, "user");
    messageInput.value = "";
    await analyzeText(message);
  }
});

messageInput.addEventListener("keydown", async (event) => {
  if (event.key === "Enter") submitButton.click();
});
