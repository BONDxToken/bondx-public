import "dotenv/config"; console.log(process.env.OPENAI_API_KEY?.slice(-6) ?? "MISSING");
