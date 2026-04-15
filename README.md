<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/ee9ad85a-2c1e-4758-a8a1-f0c7fb8254f8

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Deploy to Vercel

1. Install the Vercel CLI or connect your project in the Vercel dashboard.
2. Ensure the `GEMINI_API_KEY` environment variable is configured in the Vercel project.
3. Deploy with:
   `vercel --prod`

The project includes `vercel.json` to build the Vite app and route all client-side paths to `index.html`.
