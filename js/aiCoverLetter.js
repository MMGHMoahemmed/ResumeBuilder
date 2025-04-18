// --- START OF FILE aiCoverLetter.js ---

// --- DOM Elements ---
const jobDescInput = document.getElementById('job-description-input');
const companyInput = document.getElementById('company-name-input');
const managerInput = document.getElementById('hiring-manager-input');
const existingClInput = document.getElementById('existing-cover-letter-input');
const outputTextarea = document.getElementById('generated-cover-letter-output');
const previewDiv = document.getElementById('cover-letter-preview');
const generateBtn = document.getElementById('generate-cl-btn');
const enhanceBtn = document.getElementById('enhance-cl-btn');
const saveBtn = document.getElementById('save-cl-btn');
const downloadBtn = document.getElementById('download-cl-btn');
const coverLetterNameInput = document.getElementById('cover-letter-name');
const currentCoverLetterIdInput = document.getElementById('current-cover-letter-id');

let currentCoverLetterId = null; // Variable to hold the ID being edited

// --- Core Functions ---

function updatePreview() {
    if (!outputTextarea || !previewDiv) return;
    const text = outputTextarea.value;
    // Basic conversion of newlines to <br> for HTML display
    previewDiv.innerHTML = text.replace(/\n/g, '<br>');
}

async function callAI(action) {
    const jobDesc = jobDescInput?.value.trim();
    const company = companyInput?.value.trim();
    const manager = managerInput?.value.trim();
    const existingText = existingClInput?.value.trim();
    const currentUiLang = document.documentElement.lang || 'en';

    let buttonToDisable = null;
    let loadingKey = '';
    let notifyFailKey = 'cover_letter_notify_ai_fail';

    if (action === 'generate') {
        if (!jobDesc) {
            showNotification(translations[currentLang]?.cover_letter_notify_job_desc_missing || "Please provide the job description.", 'warning');
            jobDescInput?.focus();
            return;
        }
        buttonToDisable = generateBtn;
        loadingKey = 'cover_letter_notify_generating';

    } else if (action === 'enhance') {
        if (!existingText) {
            showNotification(translations[currentLang]?.cover_letter_notify_existing_missing || "Please paste your existing letter to enhance.", 'warning');
            existingClInput?.focus();
            return;
        }
         if (!jobDesc) {
            showNotification(translations[currentLang]?.cover_letter_notify_job_desc_missing || "Please provide the job description for context.", 'warning');
            jobDescInput?.focus();
            return;
        }
        buttonToDisable = enhanceBtn;
        loadingKey = 'cover_letter_notify_enhancing';
    } else {
        return; // Should not happen
    }

    const originalButtonContent = buttonToDisable.innerHTML;
    buttonToDisable.disabled = true;
    buttonToDisable.innerHTML = `<span class="spinner-border spinner-border-sm me-2" role="status"></span> ${translations[currentLang]?.[loadingKey] || 'Processing...'}`;

    try {
        // TODO: Implement resumeContext fetching later if needed
        const resumeContext = '';

        const generatedText = await fetchCoverLetterFromAI(action, jobDesc, company, manager, existingText, resumeContext, currentUiLang);

        if (generatedText) {
            outputTextarea.value = generatedText;
            updatePreview();
            showNotification(translations[currentLang]?.cover_letter_notify_ai_success || "AI processing complete.", 'success');
        } else {
             throw new Error("AI returned empty content.");
        }

    } catch (error) {
        console.error(`AI ${action} error:`, error);
        showNotification(`${translations[currentLang]?.[notifyFailKey] || 'AI request failed:'} ${error.message}`, 'danger');
    } finally {
        buttonToDisable.disabled = false;
        buttonToDisable.innerHTML = originalButtonContent;
    }
}

// --- Data Persistence ---

function collectCoverLetterData() {
    return {
        name: coverLetterNameInput?.value.trim() || '',
        jobDescription: jobDescInput?.value.trim() || '',
        companyName: companyInput?.value.trim() || '',
        hiringManager: managerInput?.value.trim() || '',
        // Note: We save the *output*, not the potentially different 'existing' input
        letterContent: outputTextarea?.value || '',
        // Add any other relevant fields (e.g., associated resume ID later)
    };
}

function populateCoverLetterForm(data) {
    if (!data) return;
    coverLetterNameInput.value = data.name || '';
    jobDescInput.value = data.jobDescription || '';
    companyInput.value = data.companyName || '';
    managerInput.value = data.hiringManager || '';
    outputTextarea.value = data.letterContent || '';
    // Clear the 'existing' input when loading, as we save the output
    existingClInput.value = '';
    updatePreview(); // Update preview after loading data
}

async function handleSaveCoverLetter() {
    const saveData = collectCoverLetterData();
    const idToSave = currentCoverLetterId;

    if (!saveBtn) return;
    const originalButtonContent = saveBtn.innerHTML;
    saveBtn.disabled = true;
    const savingKey = 'cover_letter_notify_saving';
    saveBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-2" role="status"></span> ${translations[currentLang]?.[savingKey] || 'Saving...'}`;

    try {
        const savedId = await saveCoverLetter(saveData, idToSave); // Use Dexie helper

        if (savedId) {
            if (!idToSave) { // If it was new
                currentCoverLetterId = savedId;
                currentCoverLetterIdInput.value = savedId;
                // Update URL
                const newUrl = `${window.location.pathname}?coverLetterId=${savedId}${window.location.hash}`;
                history.pushState({ coverLetterId: savedId }, document.title, newUrl);
            }
             showNotification(translations[currentLang]?.cover_letter_notify_save_success || "Cover letter saved successfully!", 'success');
        } else {
            throw new Error("Failed to get valid ID after saving cover letter.");
        }
    } catch (error) {
        console.error("Error saving cover letter:", error);
         showNotification(translations[currentLang]?.cover_letter_notify_save_fail || "Failed to save cover letter.", 'danger');
    } finally {
        saveBtn.disabled = false;
        saveBtn.innerHTML = originalButtonContent; // Restore original text (or use translation key)
    }
}

async function loadCoverLetterForEditing() {
    const urlParams = new URLSearchParams(window.location.search);
    const coverLetterIdParam = urlParams.get('coverLetterId');

    if (coverLetterIdParam) {
        currentCoverLetterId = parseInt(coverLetterIdParam);
        currentCoverLetterIdInput.value = currentCoverLetterId;

        const coverLetterData = await getCoverLetter(currentCoverLetterId); // Use Dexie helper
        if (coverLetterData) {
            populateCoverLetterForm(coverLetterData);
        } else {
            console.error(`Cover Letter with ID ${currentCoverLetterId} not found.`);
            showNotification(translations[currentLang]?.cover_letter_notify_load_fail || `Error: Could not load cover letter.`, 'danger');
            currentCoverLetterId = null; // Reset ID
            currentCoverLetterIdInput.value = '';
            // Optionally clear the form or show default state
            // populateCoverLetterForm(null); // Or create a clearForm function
        }
    } else {
        console.log("No coverLetterId in URL, starting fresh.");
        // Optionally clear the form or pre-fill with defaults if needed
        // updatePreview(); // Ensure preview is initially empty or reflects defaults
    }
}

function handleDownload() {
     showNotification(translations[currentLang]?.cover_letter_notify_download_nyi || "PDF download not implemented yet.", 'info');
     // Logic for PDF generation would go here (e.g., using jsPDF on the previewDiv content)
}

// --- Initialization ---
function initCoverLetterPage() {
    console.log("Initializing AI Cover Letter page...");

    // Event Listeners
    generateBtn?.addEventListener('click', () => callAI('generate'));
    enhanceBtn?.addEventListener('click', () => callAI('enhance'));
    saveBtn?.addEventListener('click', handleSaveCoverLetter);
    downloadBtn?.addEventListener('click', handleDownload);

    // Live preview update
    outputTextarea?.addEventListener('input', updatePreview);

    // Load existing data if ID in URL
    loadCoverLetterForEditing();

     // Initial translation
     translatePage(currentLang);
     // Initial preview update in case there's default text or loaded data
     updatePreview();
}

// Make sure showNotification is globally available (e.g., in main.js)
function showNotification(message, type = 'info') {
    if (typeof window.showNotification === 'function') {
        window.showNotification(message, type);
    } else {
        console.warn("showNotification function not found. Falling back to alert.");
        alert(`${type.toUpperCase()}: ${message}`);
    }
}

// --- END OF FILE aiCoverLetter.js ---