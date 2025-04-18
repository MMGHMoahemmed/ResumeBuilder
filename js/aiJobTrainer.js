const outputLanguageSelect = document.getElementById('output-language-select'); // Get reference
console.log(outputLanguageSelect);

const outputQuestionsNumber = document.getElementById('generated_questions_number'); // Get reference
console.log(outputQuestionsNumber);







// --- ** NEW: AI Job Trainer Logic ** ---

const jobDescriptionInput = document.getElementById('job-description-input');
const generateWrittenBtn = document.getElementById('generate-written-btn');
const generateInterviewBtn = document.getElementById('generate-interview-btn');
const writtenQuestionsContainer = document.getElementById('written-questions-container');
const interviewQuestionsContainer = document.getElementById('interview-questions-container');
const questionTemplate = document.getElementById('question-card-template');
const generateMoreWrittenBtn = document.getElementById('generate-more-written-btn');
const generateMoreInterviewBtn = document.getElementById('generate-more-interview-btn');

// --- Gemini API Call Function ---
async function fetchQuestionsFromAI(apiKey, jobDescription, questionType, outputLanguage, count = outputQuestionsNumber.value, existingQuestions = []) {
    console.log(`Fetching ${count} ${questionType} questions via API...`);

  

            // Use the correct latest model endpoint
            const modelName = "gemini-1.5-flash"; // Or "gemini-1.5-flash-latest" if preferred
            const API_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;


    // --- Construct the Prompt ---
    let promptInstruction = "";
    let outputFormatInstruction = ""; // Define outside the if/else
    // *NEW* Language Instruction
    const targetLanguageName = outputLanguage === 'ar' ? 'Arabic' : 'English';
    const languageInstruction = `\n\nIMPORTANT: Generate the entire JSON response (all keys and string values like "question", "solution", "how_to_answer", "type") ONLY in ${targetLanguageName}. Do not use any other language in the response.`;



   if (questionType === 'interview') {
        promptInstruction = `Generate ${count} potential behavioral or technical interview questions suitable for evaluating candidates applying for the following job. Focus on questions that assess experience, problem-solving, and cultural fit based on the description.`;
        // *** CRITICAL: Instruct for JSON Output for INTERVIEW ***
        outputFormatInstruction = `
Respond ONLY with a valid JSON array containing ${count} objects.
Each object in the array must have the following exact keys:
- "question": (string) The generated interview question.
- "sample_answer": (string) A detailed specific example answer using methods like STAR where applicable. This should be a concrete example of what a candidate might say.
- "how_to_answer": (string) A guide explaining the structure or method for answering the question well (e.g., explain the STAR method, mention key points to cover).
- "type": (string) The type of question (e.g., "behavioral", "technical", "scenario").

Do NOT include any introductory text, explanations, closing remarks, markdown formatting (like \`\`\`json), or anything else outside the single JSON array structure in your response. The entire response must be only the JSON array.
${languageInstruction}
`;
    } else { // written
        promptInstruction = `Generate ${count} potential written test questions suitable for evaluating candidates applying for the following job. Focus on technical skills, problem-solving scenarios, or short-answer questions relevant to the description.`;
        outputFormatInstruction = `
Respond ONLY with a valid JSON array containing ${count} objects.
Each object in the array must have the following exact keys:
- "question": (string) The generated written test question.
- "solution": (string) The detailed correct answer or the direct solution to the problem/question.
- "how_to_answer": (string) Step-by-step instructions, key concepts to mention, or guidance on how to arrive at the solution or structure a good response.
- "type": (string) The type of question (e.g., "technical", "problem-solving", "short-answer", "calculation").

Do NOT include any introductory text, explanations, closing remarks, markdown formatting (like \`\`\`json), or anything else outside the single JSON array structure in your response. The entire response must be only the JSON array.
${languageInstruction}
`;
    }

    let existingQuestionsContext = "";
    if (existingQuestions.length > 0) {
        existingQuestionsContext = "\n\nAvoid generating questions similar to these existing ones:\n" + existingQuestions.map((q, i) => `${i+1}. ${q.question}`).join("\n");
    }



const fullPrompt = `
Job Description:
---
${jobDescription}
---

Instructions:
${promptInstruction}
${existingQuestionsContext}

Output Format Instructions:
${outputFormatInstruction}
`;



console.log("Sending Prompt:", fullPrompt); // Log the prompt for debugging


    // --- Prepare API Request ---
    const requestBody = {
        contents: [{
            parts: [{ text: fullPrompt }]
        }],
        // Optional: Add generationConfig or safetySettings if needed
        // generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
        // safetySettings: [ ... ]
    };

    // --- Make API Call ---
    try {
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json();
                console.error("API Error Response:", errorData);
                 if (response.status === 400) { // Often invalid API key or malformed request
                      throw new Error(`${translations[currentLang]?.error_api_key_invalid || 'API Key invalid or request error.'} (Status: ${response.status})`);
                 } else if (response.status === 429) { // Quota Exceeded
                      throw new Error(`${translations[currentLang]?.error_api_quota || 'API Quota Exceeded.'} (Status: ${response.status})`);
                 }
            } catch (e) {
                 console.error("Failed to parse error response:", e);
                // Fallback error
                throw new Error(`${translations[currentLang]?.error_api_generic || 'API Error.'} Status: ${response.status}`);
            }
             throw new Error(`${translations[currentLang]?.error_api_generic || 'API Error:'} ${errorData?.error?.message || response.statusText}`);

        }

        const responseData = await response.json();
        console.log("API Success Response:", responseData);

        // --- Extract and Parse the JSON Content ---
        if (responseData.candidates?.[0]?.content?.parts?.[0]?.text) {
            const generatedText = responseData.candidates[0].content.parts[0].text;
            console.log("Generated Text:", generatedText);

            // --- Improved JSON Extraction (Keep this) ---
            let jsonString = generatedText;
            const startIndex = jsonString.indexOf('[');
            const endIndex = jsonString.lastIndexOf(']');

        if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
            // Extract the substring that looks like a JSON array
            jsonString = jsonString.substring(startIndex, endIndex + 1);
            console.log("Extracted JSON substring:", jsonString);
        } else {
            // Fallback to regex cleaning if extraction fails (less likely needed now)
            console.warn("Could not extract JSON using []. Falling back to regex cleaning.");
            jsonString = jsonString.replace(/^```json\s*|```$/g, '').trim();
        }
        // --- End Improved JSON Extraction ---


        try {
            // Ensure the string isn't empty after extraction/cleaning
            if (!jsonString) {
                throw new Error("JSON string is empty after extraction/cleaning.");
            }

            
            const parsedQuestions = JSON.parse(jsonString);


            if (!Array.isArray(parsedQuestions)) { throw new Error("Response is not JSON array."); }
            if (parsedQuestions.length > 0) {
                const firstQ = parsedQuestions[0];
                if (questionType === 'interview') {
                    if (typeof firstQ.question === 'undefined' || typeof firstQ.sample_answer === 'undefined' || typeof firstQ.how_to_answer === 'undefined') {
                        console.warn("Parsed interview objects missing required keys.");
                    }
                } else { // written
                    // Check for the NEW written keys
                    if (typeof firstQ.question === 'undefined' || typeof firstQ.solution === 'undefined' || typeof firstQ.how_to_answer === 'undefined') {
                        console.warn("Parsed written objects missing required keys (question, solution, how_to_answer).");
                        // Optionally throw error
                    }
                }
            }
            return parsedQuestions; // Success!

        } catch (parseError) {
            console.error("JSON Parse Error:", parseError);
            // Log the string that *actually* failed parsing
            console.error("String that failed parsing:", jsonString);
            throw new Error(translations[currentLang]?.error_json_parse || 'Failed to parse AI response.');
        }
        // ...
        } else if (responseData.promptFeedback?.blockReason) {
            // Handle blocked prompts
             console.error("Prompt blocked:", responseData.promptFeedback);
             throw new Error(`${translations[currentLang]?.error_api_safety || 'Request blocked by safety filters.'} Reason: ${responseData.promptFeedback.blockReason}`);
        }
         else {
            console.error("Unexpected API response structure:", responseData);
            throw new Error('Unexpected response structure from API.');
        }

    } catch (error) {
        console.error("Error during fetchQuestionsFromAI:", error);
        // Re-throw the specific error message we created or a generic one
        throw error; // Let handleGenerateClick catch and display it
    }
}

// --- Display Questions (MODIFIED) ---
function displayQuestions(questions, container, template, questionType, append = false) {
if (!container || !template) return;

if (!append) { container.innerHTML = ''; } // Clear before adding if not appending

if (!questions || questions.length === 0) {
    if (container.children.length === 0) { // Show placeholder only if truly empty
        container.innerHTML = `<p class="text-center text-muted" data-translate="placeholder_questions">${translations[currentLang]?.placeholder_questions || 'No questions generated or returned.'}</p>`;
    }
    return;
}

const startingIndex = container.querySelectorAll('.question-card').length;

questions.forEach((q, index) => {
    const clone = template.content.firstElementChild.cloneNode(true);
    // Get references (keep this)
    const questionNumberEl = clone.querySelector('.question-number');
    const questionTextEl = clone.querySelector('.question-text');
    const sampleAnswerEl = clone.querySelector('.sample-answer-content'); // Will hold the 'solution' for written
    const howToAnswerEl = clone.querySelector('.how-to-answer-content');
    const showSampleBtn = clone.querySelector('.show-sample-answer-btn'); // Will control 'solution'
    const showHowToBtn = clone.querySelector('.show-how-to-answer-btn');
    const sampleBtnSpan = showSampleBtn?.querySelector('span');
    const howToBtnSpan = showHowToBtn?.querySelector('span');

    clone.dataset.questionType = q.type || questionType;
    if (questionNumberEl) questionNumberEl.textContent = `#${startingIndex + index + 1}`;
    if (questionTextEl) questionTextEl.textContent = q.question || "Error: Question text missing";

    // --- Conditional Logic based on questionType ---
    let solutionText, howToText;
    let btn1ShowKey, btn1HideKey, btn1DefaultShow, btn1DefaultHide;
    let btn2ShowKey, btn2HideKey, btn2DefaultShow, btn2DefaultHide;

    if (questionType === 'interview') {
        solutionText = q.sample_answer || "Sample answer not provided.";
        howToText = q.how_to_answer || "Guidance not provided.";
        // Keys for interview buttons
        btn1ShowKey = 'button_show_sample_answer';
        btn1HideKey = 'button_hide_sample_answer';
        btn1DefaultShow = "Show Sample";
        btn1DefaultHide = "Hide Sample";
        btn2ShowKey = 'button_show_how_to_answer';
        btn2HideKey = 'button_hide_how_to_answer';
        btn2DefaultShow = "Show How To";
        btn2DefaultHide = "Hide How To";
    } else { // Written questions
        solutionText = q.solution || "Solution not provided."; // Use the 'solution' field
        howToText = q.how_to_answer || "Guidance not provided."; // Use the 'how_to_answer' field
        // Keys for written buttons (use existing 'answer' keys for the solution)
        btn1ShowKey = 'button_show_answer';
        btn1HideKey = 'button_hide_answer';
        btn1DefaultShow = "Show Answer";
        btn1DefaultHide = "Hide Answer";
        // Use the same 'how_to_answer' keys for guidance
        btn2ShowKey = 'button_show_how_to_answer';
        btn2HideKey = 'button_hide_how_to_answer';
        btn2DefaultShow = "Show How To";
        btn2DefaultHide = "Hide How To";
    }

    // Populate content areas
    if (sampleAnswerEl) sampleAnswerEl.textContent = solutionText;
    if (howToAnswerEl) howToAnswerEl.textContent = howToText;

         // Configure Button 1 (Solution/Sample Answer)
         if (showSampleBtn && sampleBtnSpan && sampleAnswerEl) {
            sampleBtnSpan.textContent = translations[currentLang]?.[btn1ShowKey] || btn1DefaultShow;
            showSampleBtn.style.display = 'inline-block';
            showSampleBtn.addEventListener('click', () => {
                const isVisible = sampleAnswerEl.classList.toggle('answer-visible');
                const key = isVisible ? btn1HideKey : btn1ShowKey;
                sampleBtnSpan.textContent = translations[currentLang]?.[key] || (isVisible ? btn1DefaultHide : btn1DefaultShow);
                sampleAnswerEl.style.display = isVisible ? 'block' : 'none';
            });
        } else {
             if (showSampleBtn) showSampleBtn.style.display = 'none'; // Hide if element missing
        }

        // Configure Button 2 (How to Answer)
        if (showHowToBtn && howToBtnSpan && howToAnswerEl) {
            howToBtnSpan.textContent = translations[currentLang]?.[btn2ShowKey] || btn2DefaultShow;
            showHowToBtn.style.display = 'inline-block';
            showHowToBtn.addEventListener('click', () => {
                const isVisible = howToAnswerEl.classList.toggle('answer-visible');
                const key = isVisible ? btn2HideKey : btn2ShowKey;
                howToBtnSpan.textContent = translations[currentLang]?.[key] || (isVisible ? btn2DefaultHide : btn2DefaultShow);
                howToAnswerEl.style.display = isVisible ? 'block' : 'none';
            });
        } else {
             if (showHowToBtn) showHowToBtn.style.display = 'none'; // Hide if element missing
        }

        container.appendChild(clone);
    });
}


// --- Button Loading State (MODIFIED for Language) ---
function setButtonLoading(button, isLoading) {
    const textSpan = button.querySelector('.btn-text > span'); // Target the innermost span
    const spinner = button.querySelector('.spinner-border');
    const originalTextKey = textSpan?.getAttribute('data-translate');
    const selectedOutputLang = outputLanguageSelect?.value || 'en'; // Get selected lang
    const langName = selectedOutputLang === 'ar' ? translations[currentLang]?.lang_arabic || 'Arabic' : translations[currentLang]?.lang_english || 'English';

    if (isLoading) {
        button.disabled = true;
        button.classList.add('loading');
        if (textSpan) {
            // Store original text if not already stored
            if (!textSpan.dataset.originalText && originalTextKey) {
                textSpan.dataset.originalText = translations[currentLang]?.[originalTextKey] || textSpan.textContent;
            }
            // Set loading text including language
             let loadingText = translations[currentLang]?.generating_in_language || 'Generating in {lang}...';
             textSpan.textContent = loadingText.replace('{lang}', langName); // Replace placeholder
        }
        if (spinner) spinner.style.display = 'inline-block';

    } else {
        button.disabled = false;
        button.classList.remove('loading');
        if (textSpan && textSpan.dataset.originalText) {
            // Restore original text
            textSpan.textContent = textSpan.dataset.originalText;
        } else if (textSpan && originalTextKey) {
            // Fallback if original text wasn't stored correctly
            textSpan.textContent = translations[currentLang]?.[originalTextKey] || 'Generate';
        }
        if (spinner) spinner.style.display = 'none';
    }
}

// --- Generate Button Click Handler (MODIFIED) ---
async function handleGenerateClick(questionType, container, template, generateMoreBtn, buttonElement, isMore = false) {
    const apiKey = await getSetting(GEMINI_API_KEY_STORAGE_KEY);
    if (!apiKey) {
        alert(translations[currentLang]?.api_key_missing || "API Key is missing. Please set it in Settings.");
        // Optional: Redirect to settings page
        // window.location.href = '/Settings.html#pills-Ai-Settings';
        return;
    }

    const jobDesc = jobDescriptionInput.value.trim();
    if (!jobDesc) {
        alert('Please paste a job description first.'); // Basic validation
        jobDescriptionInput.focus();
        return;
    }

    // *NEW* Get selected output language
    const selectedOutputLanguage = outputLanguageSelect?.value || 'en'; // Default to 'en' if not found
    setButtonLoading(buttonElement, true); // Loading state now shows language

    // Clear container or show specific loading message
    if (!isMore) {
        container.innerHTML = `<div class="text-center p-3"><div class="spinner-border text-primary" role="status"></div><p class="mt-2">${buttonElement.querySelector('.btn-text > span')?.textContent || 'Generating...'}</p></div>`; // Use the text from the button
        if(generateMoreBtn) generateMoreBtn.style.display = 'none';
    }


    try {
        let count = isMore ? 3 : 5;
        // Get existing questions from the UI to provide context (avoid duplicates)
         const existingQuestions = isMore ? Array.from(container.querySelectorAll('.question-card')).map(card => ({
             question: card.querySelector('.question-text')?.textContent || ''
         })).filter(q => q.question) : [];

          // *NEW* Pass selected language to the API call
          const questions = await fetchQuestionsFromAI(apiKey, jobDesc, questionType, selectedOutputLanguage, count=outputQuestionsNumber.value, existingQuestions);

        // Important: If appending, the loading indicator is still there. If not appending, displayQuestions clears it.
        // If not appending and questions is empty/null, displayQuestions will show the placeholder.
        displayQuestions(questions, container, template, questionType, isMore);

        // Show 'Generate More' button only if new questions were successfully added
        if (generateMoreBtn && questions && questions.length > 0) {
            generateMoreBtn.style.display = 'block';
        } else if (!isMore && (!questions || questions.length === 0)) {
             // Initial generation failed or returned nothing, ensure placeholder is shown
             // displayQuestions handles this if container is empty after clearing
             if (container.innerHTML === ''){ // Double check if displayQuestions didn't add placeholder
                 container.innerHTML = `<p class="text-center text-muted">${translations[currentLang]?.placeholder_questions || 'Could not generate questions based on this description.'}</p>`;
             }
             if(generateMoreBtn) generateMoreBtn.style.display = 'none'; // Ensure hidden
        } else if (isMore && (!questions || questions.length === 0)) {
            // 'Generate more' returned nothing, maybe show a small message?
            console.log("Generate more returned no new questions.");
            // Optionally disable the 'more' button temporarily or show a toast
        }

    } catch (error) {
         console.error("Error generating questions:", error);
         const errorMsg = error.message || translations[currentLang]?.error_generating || 'Error generating questions.';
        // Display error in the container if it was the initial generation attempt
         if (!isMore) {
             container.innerHTML = `<div class="alert alert-danger" role="alert">${errorMsg}</div>`;
         } else {
             // Show alert for 'generate more' failures
             alert(errorMsg);
         }
        if (generateMoreBtn) generateMoreBtn.style.display = 'none'; // Hide 'more' button on error
    } finally {
        setButtonLoading(buttonElement, false);
    }
}





function initAiJobTrainer() {



// --- ** AI Trainer Listeners ** ---

// *NEW* Add listener for output language change (optional, but good practice)
if (outputLanguageSelect) {
  outputLanguageSelect.addEventListener('change', () => {
      console.log("Output language changed to:", outputLanguageSelect.value);
      // You could potentially store this preference in localStorage too
 localStorage.setItem('preferredOutputLang', outputLanguageSelect.value);
  });
}

if (generateWrittenBtn) {
  generateWrittenBtn.addEventListener('click', () => {
      handleGenerateClick('written', writtenQuestionsContainer, questionTemplate, generateMoreWrittenBtn, generateWrittenBtn, false);
  });
}
if (generateInterviewBtn) {
  generateInterviewBtn.addEventListener('click', () => {
      handleGenerateClick('interview', interviewQuestionsContainer, questionTemplate, generateMoreInterviewBtn, generateInterviewBtn, false);
  });
}
if (generateMoreWrittenBtn) {
  generateMoreWrittenBtn.addEventListener('click', () => {
      handleGenerateClick('written', writtenQuestionsContainer, questionTemplate, generateMoreWrittenBtn, generateMoreWrittenBtn, true);
  });
}
if (generateMoreInterviewBtn) {
  generateMoreInterviewBtn.addEventListener('click', () => {
      handleGenerateClick('interview', interviewQuestionsContainer, questionTemplate, generateMoreInterviewBtn, generateMoreInterviewBtn, true);
  });
}

// Event listeners for "Show Answer" are added dynamically in `displayQuestions`

// --- ** Settings Page Listeners ** ---
const saveApiKeyBtn = document.getElementById('save-api-key-btn');
const apiKeyInput = document.getElementById('gemini-api-key');

if (saveApiKeyBtn && apiKeyInput) {
  saveApiKeyBtn.addEventListener('click', () => {
      const key = apiKeyInput.value;
      if (saveApiKey(key)) {
          updateApiKeyStatus(translations[currentLang]?.api_key_saved || "API Key saved.");
          console.log("API Key saved to localStorage.");
      } else {
           updateApiKeyStatus("Invalid key format.", true); // Simple validation
      }
  });
}

// Load API key into input field when page loads (if on settings page)
loadApiKeyInput();


  // Note: Event listeners for "Show Answer" buttons inside question cards
  // are added dynamically within the `displayQuestions` function.




}