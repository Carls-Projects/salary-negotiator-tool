// api/generate.js - This is your serverless function

// Load environment variables (for local development only)
// Vercel will handle these securely in production
require('dotenv').config();

const { GoogleGenerativeAI } = require('@google/generative-ai');

// Access your API key from environment variables
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY is not set. Please set it in your .env file or Vercel environment variables.");
    // In a real application, you might send a more user-friendly error
    // For now, this will clearly show in server logs if misconfigured.
}

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// This is the main handler for your serverless function
// It's an asynchronous function because we'll be waiting for the AI response
module.exports = async (req, res) => {
    // Ensure this is a POST request and has data
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // Extract data from the request body
    const { offerDetails, targetGoal, justificationPoints, negotiationContext, selectedPriorities } = req.body;

    // --- Prompt Engineering: Crafting the detailed instructions for Gemini ---
    const userPrompt = `
    You are an expert salary negotiation coach. Your goal is to provide concise, actionable, and confident talking points for a job seeker.

    Based on the following information, generate a structured negotiation script. Focus on value, anticipate objections, and maintain a collaborative yet firm tone.

    --- User Information ---
    1. Current Offer Details: ${offerDetails}
    2. User's Target/Negotiation Goal: ${targetGoal}
    3. User's Justification Points (achievements, market research, unique value):
    ${justificationPoints.split('\n').map(p => `- ${p.trim()}`).join('\n')}
    4. Negotiation Context: ${negotiationContext}
    ${selectedPriorities && selectedPriorities.length > 0 ? `5. User's Top Non-Salary Priorities: ${selectedPriorities.join(', ')}` : ''}
    ---

    Please provide the talking points in the following structure, using clear, confident, and professional language. Ensure the output is easy to read and directly actionable for the user.

    ## 1. Strategic Opening
    - A polite and appreciative opening to acknowledge the offer and express continued enthusiasm.

    ## 2. Core Compensation Justification
    - Talking points that clearly state the user's desired compensation (${targetGoal}).
    - Crucially, this section must elaborate on *how* the user's "Justification Points" directly translate into value for the company and support the requested compensation. Frame this as an investment in their success.

    ${selectedPriorities && selectedPriorities.length > 0 ? `## 3. Non-Salary Priority Integration
    - Specific talking points for each of the user's selected non-salary priorities (${selectedPriorities.join(', ')}).
    - For each, suggest how discussing this priority benefits both the user and the company (e.g., 'more PTO for refreshed productivity', 'professional development for enhanced skills that directly help the company').` : ''}

    ## 4. Anticipating Objections & Responses
    - Identify 2-3 common employer objections (e.g., "budget constraints", "standard package", "junior role") based on the context.
    - For each objection, provide a brief, strategic counter-response that re-emphasizes value or finds common ground.

    ## 5. Confident Closing & Next Steps
    - How to gracefully conclude the conversation.
    - What to ask for next (e.g., "When can I expect to hear back?").

    ## 6. Recommended Tone & Mindset
    - A brief recommendation on the overall tone (e.g., collaborative, confident, appreciative).

    Format the output using Markdown (bolding, bullet points, headings) for readability. Do not include any conversational filler outside of the structured talking points.
    `;
    // --- End of Prompt Engineering ---

    try {
        // Select the generative model. Using Gemini 1.5 Flash for its balance of performance and cost-effectiveness.
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Generate content
        const result = await model.generateContent(userPrompt);
        const response = await result.response;
        const text = response.text();

        // Send the AI's response back to the frontend
        res.status(200).json({ talkingPoints: text });

    } catch (error) {
        console.error('Error calling Gemini API:', error);
        // Send a more detailed error message during development
        res.status(500).json({ error: 'Failed to generate talking points from AI. Please try again.', details: error.message });
    }
};