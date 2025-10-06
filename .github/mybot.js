// 🇬🇧 English: MyBoT script to run inside GitHub Actions
// 🇮🇷 فارسی: اسکریپت MyBoT برای اجرا در GitHub Actions

import OpenAI from "openai";
import fs from "fs";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function main() {
  console.log("🤖 MyBoT is running inside GitHub Actions...");
  const readme = fs.existsSync("README.md")
    ? fs.readFileSync("README.md", "utf-8")
    : "No README found.";

  const completion = await openai.chat.completions.create({
    model: "gpt-5",
    messages: [
      { role: "system", content: "You are MyBoT, the AI automation assistant for DuneTube." },
      { role: "user", content: `Analyze this README and suggest improvements:\n\n${readme}` },
    ],
  });

  console.log("✅ MyBoT summary:\n", completion.choices[0].message.content);
}

main();
