// --- Helper Functions ---

// Get API Key (using Dexie)
async function getApiKey() {
    // Use the helper from dexieApi.js (ensure dexieApi.js is loaded first)
    if (typeof getSetting !== 'function') {
        console.error("Dexie helper 'getSetting' not found.");
        return localStorage.getItem(GEMINI_API_KEY_STORAGE_KEY); // Fallback to localStorage
    }
    return await getSetting(GEMINI_API_KEY_STORAGE_KEY);
}

// --- END OF FILE aiAPI.js ---


// --- START OF FILE aiAPI.js ---
// ... (keep getApiKey, fetchQuestionsFromAI) ...

// --- NEW: Function for Resume Content Generation ---
async function fetchResumeContentFromAI(promptType, contextData = {}, outputLanguage = 'en') {
    const apiKey = await getApiKey();
    if (!apiKey) {
        throw new Error(translations[currentLang]?.api_key_missing || "API Key missing.");
    }

    const modelName = "gemini-1.5-flash"; // Or your preferred model
    const API_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

    let prompt = "";
    const targetLanguageName = outputLanguage === 'ar' ? 'Arabic' : 'English';

    // --- Construct Prompts based on type ---
    switch (promptType) {
        case 'summary':
            prompt = `Based on the following resume information (if provided), write a concise and compelling professional summary/objective (around 3-4 sentences) suitable for a resume. Tailor it towards the job title/role if specified. Focus on key skills and experience.
            Job Title/Role: ${contextData.role || 'Not specified'}
            Key Skills: ${contextData.skills || 'Not specified'}
            Experience Highlights: ${contextData.experience || 'Not specified'}

            IMPORTANT: Respond ONLY with the generated summary text itself, in ${targetLanguageName}. Do not include any introductory phrases like "Here is a summary:", markdown formatting, or any other extra text. Just the summary.`;
            break;
        case 'job_description_bullets':
             prompt = `Based on the following job title and company, generate 3-5 impactful bullet points for a resume's work experience section. Use action verbs and quantify achievements where possible. Focus on responsibilities relevant to the title.
             Job Title: ${contextData.jobTitle || 'Not specified'}
             Company: ${contextData.company || 'Not specified'}
             Optional Keywords/Context: ${contextData.keywords || ''}

             IMPORTANT: Respond ONLY with the generated bullet points (starting with '*' or '-'), each on a new line, in ${targetLanguageName}. Do not include any introductory phrases, markdown formatting, or any other extra text. Just the bullet points.`;
             break;
        // Add more cases for other AI features (e.g., 'skills_suggestion')
        default:
            throw new Error("Invalid prompt type requested.");
    }

    console.log("Sending Prompt:", prompt);

    const requestBody = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 512 }, // Adjust config as needed
        // Add safety settings if desired
    };

    try {
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
             // ... (reuse error handling logic from fetchQuestionsFromAI) ...
            let errorData; try { errorData = await response.json(); } catch (e) { /* ignore */ }
             throw new Error(`API Error (${response.status}): ${errorData?.error?.message || response.statusText}`);
        }

        const responseData = await response.json();
        console.log("AI Content Response:", responseData);

         if (responseData.candidates?.[0]?.content?.parts?.[0]?.text) {
             return responseData.candidates[0].content.parts[0].text.trim(); // Return the generated text
         } else if (responseData.promptFeedback?.blockReason) {
             throw new Error(`Request blocked by safety filters: ${responseData.promptFeedback.blockReason}`);
         } else {
             throw new Error('Unexpected response structure from AI content generation.');
         }
    } catch (error) {
         console.error("Error fetching AI content:", error);
         throw error; // Re-throw for the caller to handle
    }
}




// --- START OF FILE aiAPI.js ---
// ... (keep getApiKey, fetchQuestionsFromAI, fetchResumeContentFromAI) ...

// --- NEW: Function for Cover Letter Generation/Enhancement ---
async function fetchCoverLetterFromAI(action, jobDesc, company, hiringManager, existingText = '', resumeContext = '', outputLanguage = 'en') {
    const apiKey = await getApiKey();
    if (!apiKey) {
        throw new Error(translations[currentLang]?.api_key_missing || "API Key missing.");
    }

    const modelName = "gemini-1.5-flash"; // Or your preferred model
    const API_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
    const targetLanguageName = outputLanguage === 'ar' ? 'Arabic' : 'English';

    let prompt = "";

    // Build context strings safely
    const jobContext = `Job Description:\n${jobDesc || 'Not provided'}\nCompany: ${company || 'Not provided'}\nHiring Manager: ${hiringManager || 'Not specified'}`;
    const resumeInfo = resumeContext ? `\n\nRelevant Resume Info:\n${resumeContext}` : ''; // Add later if using resume data

    if (action === 'generate') {
        prompt = `You are an expert cover letter writer. Write a professional and compelling cover letter in ${targetLanguageName} based on the following information. Tailor it specifically to the job description. Address the hiring manager if their name is provided. Focus on highlighting skills and experience relevant to the job description. Keep the tone professional and enthusiastic. Do NOT invent skills or experience not mentioned in the resume context (if provided).

${jobContext}${resumeInfo}

IMPORTANT: Respond ONLY with the full cover letter text (including salutation, body paragraphs, and closing). Do not include any introductory phrases like "Here is the cover letter:", markdown formatting (except maybe for paragraphs), or any other extra text. Just the cover letter content itself.`;

    } else if (action === 'enhance') {
        if (!existingText) {
            throw new Error("No existing text provided for enhancement.");
        }
        prompt = `You are an expert cover letter editor. Enhance the following DRAFT cover letter based on the provided job information. Improve clarity, tone, impact, and ensure it strongly aligns with the job description. Correct any grammatical errors or awkward phrasing. Maintain a professional and enthusiastic tone. Address the hiring manager if provided.

${jobContext}${resumeInfo}

DRAFT Cover Letter to Enhance:
---
${existingText}
---

IMPORTANT: Respond ONLY with the full, enhanced cover letter text in ${targetLanguageName}. Do not include any introductory phrases like "Here is the enhanced letter:", explanations of changes, or markdown formatting (except paragraphs). Just the complete, improved cover letter.`;

    } else {
        throw new Error("Invalid AI cover letter action requested.");
    }

    console.log("Sending Cover Letter Prompt:", prompt);

    const requestBody = {
        contents: [{ parts: [{ text: prompt }] }],
        // Adjust generation config - might need more tokens for a full letter
        generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
        // Add safety settings if desired
    };

    try {
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            let errorData; try { errorData = await response.json(); } catch (e) { /* ignore */ }
            throw new Error(`API Error (${response.status}): ${errorData?.error?.message || response.statusText}`);
        }

        const responseData = await response.json();
        console.log("AI Cover Letter Response:", responseData);

        if (responseData.candidates?.[0]?.content?.parts?.[0]?.text) {
             // Clean up potential AI artifacts like "```" or markdown headers if they sneak in
             let generatedText = responseData.candidates[0].content.parts[0].text.trim();
             generatedText = generatedText.replace(/^```(text|markdown)?\s*/i, '').replace(/```\s*$/, ''); // Remove code block fences
             return generatedText;
        } else if (responseData.promptFeedback?.blockReason) {
            throw new Error(`Request blocked by safety filters: ${responseData.promptFeedback.blockReason}`);
        } else {
            throw new Error('Unexpected response structure from AI cover letter generation.');
        }
    } catch (error) {
        console.error("Error fetching AI cover letter:", error);
        throw error; // Re-throw for the caller to handle
    }
}

// --- END OF FILE aiAPI.js ---

// --- END OF FILE aiAPI.js ---