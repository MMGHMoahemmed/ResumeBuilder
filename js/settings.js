// --- START OF FILE settings.js ---

// Function to load settings into the form
async function loadSettingsForm() {
    const userProfile = await getSetting('userProfile'); // Use Dexie helper
    if (userProfile) {
        document.getElementById('setting-first-name').value = userProfile.firstName || '';
        document.getElementById('setting-last-name').value = userProfile.lastName || '';
        document.getElementById('setting-address').value = userProfile.address || '';
        document.getElementById('setting-phone').value = userProfile.phone || '';
        document.getElementById('setting-email').value = userProfile.email || '';
         // Load other fields...
         // Handle photo loading if you store it here (complex, maybe skip for now)
    }

    // Load API Key (keep existing logic)
    const savedKey = await getSetting(GEMINI_API_KEY_STORAGE_KEY); // Use Dexie helper
    const apiKeyInput = document.getElementById('gemini-api-key');
     if (apiKeyInput && savedKey) {
        apiKeyInput.value = savedKey;
        // You might want to check/validate the key status here too
        updateApiKeyStatus("API Key loaded.", false);
    } else if (apiKeyInput) {
         updateApiKeyStatus("API Key not set.", true);
    }
}

// Function to save user profile settings
async function saveUserProfile() {
    const profile = {
        firstName: document.getElementById('setting-first-name').value.trim(),
        lastName: document.getElementById('setting-last-name').value.trim(),
        address: document.getElementById('setting-address').value.trim(),
        phone: document.getElementById('setting-phone').value.trim(),
        email: document.getElementById('setting-email').value.trim(),
        // Collect other fields...
        // Handle photo saving if needed
    };
    const success = await saveSetting('userProfile', profile); // Use Dexie helper
    if (success) {
        alert("Profile updated successfully!"); // Simple feedback
    } else {
        alert("Failed to update profile.");
    }
}

 // Function to save API Key (modified to use Dexie)
 async function saveApiKeySetting() {
     const apiKeyInput = document.getElementById('gemini-api-key');
     const key = apiKeyInput?.value?.trim();
     if (key) {
        const success = await saveSetting(GEMINI_API_KEY_STORAGE_KEY, key); // Use Dexie helper
        if (success) {
             updateApiKeyStatus(translations[currentLang]?.api_key_saved || "API Key saved.", false);
             console.log("API Key saved to Dexie.");
        } else {
            updateApiKeyStatus("Failed to save API Key.", true);
        }
     } else {
         updateApiKeyStatus("API Key cannot be empty.", true);
     }
 }

// Helper function to update API key status message (keep existing logic)
function updateApiKeyStatus(message, isError = false) {
    const statusEl = document.getElementById('api-key-status');
    if (statusEl) {
        statusEl.textContent = message;
        statusEl.className = isError ? 'text-danger ms-2' : 'text-success ms-2';
        setTimeout(() => {
            if (statusEl.textContent === message) {
                statusEl.textContent = '';
                statusEl.className = 'text-muted ms-2';
            }
        }, 5000);
    }
}


// --- Export Data Handler ---
async function handleExportData() {
    const exportButton = document.getElementById('export-data-btn');
    const fileNameInput = document.getElementById('export-file-name');
    if (!exportButton || !fileNameInput) return;

    const originalButtonText = exportButton.innerHTML;
    exportButton.disabled = true;
    const exportStartKey = 'settings_notify_export_start';
    exportButton.innerHTML = `<span class="spinner-border spinner-border-sm me-2" role="status"></span> ${translations[currentLang]?.[exportStartKey] || 'Exporting...'}`;

    try {
        // Use direct Dexie call to get all resumes
        const allResumes = await db.resumes.toArray();

        if (!allResumes || allResumes.length === 0) {
            showNotification(translations[currentLang]?.settings_notify_export_no_data || "No resume data found to export.", 'warning');
            return; // Exit early
        }

        // Prepare data for export (could also include settings if needed)
        const exportData = {
            exportDate: new Date().toISOString(),
            resumeData: allResumes
            // settingsData: await db.settings.toArray() // Optionally include settings
        };

        const jsonString = JSON.stringify(exportData, null, 2); // Pretty print
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');

        // Get filename, provide default, sanitize
        let filename = fileNameInput.value.trim();
        if (!filename) {
            const defaultFnKey = 'settings_default_export_filename';
            filename = translations[currentLang]?.[defaultFnKey] || 'ai_resume_builder_export';
        }
        filename = filename.replace(/[^a-z0-9_-]/gi, '_').toLowerCase(); // Basic sanitize
        filename += `_${new Date().toISOString().split('T')[0]}.json`; // Add date

        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showNotification(translations[currentLang]?.settings_notify_export_success || "Data exported successfully.", 'success');
        fileNameInput.value = ''; // Clear input after export

    } catch (error) {
        console.error("Error exporting data:", error);
        showNotification(translations[currentLang]?.settings_notify_export_fail || "Data export failed.", 'danger');
    } finally {
        exportButton.disabled = false;
        // Restore original text using its data-translate key
        const exportBtnKey = 'settings_button_export_data';
        exportButton.innerHTML = translations[currentLang]?.[exportBtnKey] || 'Export Data File';
    }
}

// --- Import Data Handler ---
async function handleImportData() {
    const importButton = document.getElementById('import-data-btn');
    const fileInput = document.getElementById('import-file-input');
    if (!importButton || !fileInput) return;

    const file = fileInput.files?.[0];

    if (!file || !file.type.includes('json')) {
        showNotification(translations[currentLang]?.settings_notify_import_select_file || "Please select a valid JSON file.", 'warning');
        return;
    }

    const originalButtonText = importButton.innerHTML;
    importButton.disabled = true;
    const readingKey = 'settings_notify_import_reading';
    importButton.innerHTML = `<span class="spinner-border spinner-border-sm me-2" role="status"></span> ${translations[currentLang]?.[readingKey] || 'Reading...'}`;

    const reader = new FileReader();

    reader.onload = async (event) => {
        const savingKey = 'settings_notify_import_saving';
        importButton.innerHTML = `<span class="spinner-border spinner-border-sm me-2" role="status"></span> ${translations[currentLang]?.[savingKey] || 'Importing...'}`;
        try {
            const fileContent = event.target.result;
            const importedData = JSON.parse(fileContent);

            // --- Basic Validation ---
            if (!importedData || typeof importedData !== 'object' || !Array.isArray(importedData.resumeData)) {
                throw new Error(translations[currentLang]?.settings_notify_import_invalid_data || "Invalid data format.");
            }

            const resumesToImport = importedData.resumeData;

            if (resumesToImport.length === 0) {
                 showNotification(translations[currentLang]?.settings_notify_export_no_data || "No resume data found in the file.", 'info'); // Reuse no data key
                 return; // Exit if no resumes in file
            }


            // --- Prepare for bulkAdd ---
            const now = new Date();
            const preparedResumes = resumesToImport.map(resume => {
                 // ** IMPORTANT: Remove existing ID for bulkAdd **
                 const { id, ...resumeWithoutId } = resume;

                 // Update timestamps and ensure name exists
                 resumeWithoutId.createdAt = resumeWithoutId.createdAt || now; // Keep original creation if exists, else set now
                 resumeWithoutId.updatedAt = now; // Always update 'updatedAt'
                 if (!resumeWithoutId.name && resumeWithoutId.personalInfo?.name) {
                     resumeWithoutId.name = resumeWithoutId.personalInfo.name;
                 } else if (!resumeWithoutId.name) {
                     const defaultNameKey = 'myresumes_untitled_resume';
                     resumeWithoutId.name = translations[currentLang]?.[defaultNameKey] || `Imported Resume ${now.toLocaleTimeString()}`;
                 }
                 // Ensure all expected sections are at least empty arrays if missing
                  const requiredSections = ['workExperience', 'education', 'trainings', 'skills', 'projects', 'certifications', 'awards', 'publications', 'volunteering', 'languages', 'interests', 'socialMedia', 'references', 'customSections'];
                  requiredSections.forEach(section => {
                      if (!Array.isArray(resumeWithoutId[section])) {
                          resumeWithoutId[section] = [];
                      }
                  });
                  // Ensure settings and personalInfo objects exist
                  if(typeof resumeWithoutId.settings !== 'object') resumeWithoutId.settings = {};
                  if(typeof resumeWithoutId.personalInfo !== 'object') resumeWithoutId.personalInfo = {};


                 return resumeWithoutId;
            });

            // Perform the bulk add
            await db.resumes.bulkAdd(preparedResumes);

             // Optionally import settings (use bulkPut to overwrite)
             if (Array.isArray(importedData.settingsData)) {
                 const preparedSettings = importedData.settingsData.map(setting => ({ key: setting.key, value: setting.value }));
                 await db.settings.bulkPut(preparedSettings);
             }


            showNotification(translations[currentLang]?.settings_notify_import_success || "Resumes imported successfully!", 'success');
            // Optionally, redirect or inform the user to check My Resumes
             // window.location.href = 'MyResumes.html';

        } catch (error) {
            console.error("Error importing data:", error);
            // Check if it's a parsing error
            if (error instanceof SyntaxError) {
                 showNotification(translations[currentLang]?.settings_notify_import_parsing_error || "Error parsing JSON file.", 'danger');
            } else {
                 showNotification(`${translations[currentLang]?.settings_notify_import_fail || "Import failed."} ${error.message}`, 'danger');
            }
        } finally {
             importButton.disabled = false;
             const importBtnKey = 'settings_button_import_data';
             importButton.innerHTML = translations[currentLang]?.[importBtnKey] || 'Import Data';
             fileInput.value = null; // Clear the file input
        }
    };

    reader.onerror = (event) => {
        console.error("Error reading file:", event.target.error);
        showNotification(translations[currentLang]?.settings_notify_import_fail || "Error reading the selected file.", 'danger');
        importButton.disabled = false;
        const importBtnKey = 'settings_button_import_data';
        importButton.innerHTML = translations[currentLang]?.[importBtnKey] || 'Import Data';
        fileInput.value = null;
    };

    // Read the file
    reader.readAsText(file);
}

// --- Delete Data Handler ---
async function handleDeleteData() {
    const deleteButton = document.getElementById('delete-data-btn');
    if (!deleteButton || deleteButton.disabled) return; // Don't run if disabled

    const confirmKey = 'settings_notify_delete_confirm';
    if (!confirm(translations[currentLang]?.[confirmKey] || "Are you absolutely sure you want to delete ALL data?")) {
        return;
    }

    const originalButtonText = deleteButton.innerHTML;
    deleteButton.disabled = true; // Disable again just in case
    const deletingKey = 'settings_notify_delete_deleting';
    deleteButton.innerHTML = `<span class="spinner-border spinner-border-sm me-2" role="status"></span> ${translations[currentLang]?.[deletingKey] || 'Deleting...'}`;

    try {
        // Clear the tables
        await db.resumes.clear();
        await db.settings.clear(); // Also clear settings

        showNotification(translations[currentLang]?.settings_notify_delete_success || "All data deleted successfully. Reloading...", 'success');

        // Wait a moment for the user to see the message, then reload
        setTimeout(() => {
            window.location.reload();
        }, 2000); // Reload after 2 seconds

    } catch (error) {
        console.error("Error deleting data:", error);
        showNotification(translations[currentLang]?.settings_notify_delete_fail || "Failed to delete data.", 'danger');
        deleteButton.disabled = false; // Re-enable on failure
        // Restore original button text using its data-translate key
        const deleteBtnKey = 'settings_button_delete_data';
        deleteButton.innerHTML = translations[currentLang]?.[deleteBtnKey] || 'Delete';
    }
    // No finally needed here because we reload on success
}

// Main initialization function for the settings page
// --- Update initSettingsPage ---
function initSettingsPage() {
    console.log("Initializing Settings page...");

    // Load settings when the page loads
    loadSettingsForm();

    // Save Profile Listener
    const updateProfileBtn = document.getElementById('update-profile-btn');
    if (updateProfileBtn) {
        updateProfileBtn.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent default form submission if it was type="submit"
            saveUserProfile();
        });
    }

    // Save API Key Listener (Modified)
    const saveApiKeyBtn = document.getElementById('save-api-key-btn');
    if (saveApiKeyBtn) {
        saveApiKeyBtn.addEventListener('click', saveApiKeySetting);
    }

    // Save Profile Listener (keep this)
    document.getElementById('update-profile-btn')?.addEventListener('click', (e) => {
        e.preventDefault();
        saveUserProfile();
    });

    // Save API Key Listener (keep this)
    document.getElementById('save-api-key-btn')?.addEventListener('click', saveApiKeySetting);

    // --- NEW Listeners ---
    document.getElementById('export-data-btn')?.addEventListener('click', handleExportData);
    document.getElementById('import-data-btn')?.addEventListener('click', handleImportData);
    document.getElementById('delete-data-btn')?.addEventListener('click', handleDeleteData);

    // Delete confirm checkbox listener
    const deleteCheckbox = document.getElementById('delete-confirm-checkbox');
    const deleteButton = document.getElementById('delete-data-btn');
    if (deleteCheckbox && deleteButton) {
        deleteCheckbox.addEventListener('change', () => {
            deleteButton.disabled = !deleteCheckbox.checked; // Enable button only if checkbox is checked
        });
    }

    // Add listeners for Save Photo if implementing that logic
    // ...
}



// --- END OF FILE settings.js ---





