// --- START OF FILE myResumes.js ---

const resumeListContainer = document.getElementById('resume-list-container');
const resumeCardTemplate = document.getElementById('resume-card-template');


// Create Modal Elements
const createModalElement = document.getElementById('modal-create-resume');
const createModalSaveBtn = document.getElementById('modal-create-save-btn');
const newResumeNameInput = document.getElementById('new-resume-name');
const newResumeLangSelect = document.getElementById('new-resume-language');
const createModalError = document.getElementById('modal-create-error');
let createModalInstance = null; // To hold the Bootstrap modal instance


// Sidebar Filter Elements

const filterLangEn = document.querySelector('input[name="form-type[]"][value="en"]');
const filterLangAr = document.querySelector('input[name="form-type[]"][value="ar"]');


// (NEW) Filter Elements
const filterForm = document.getElementById('filter-form');
const searchInput = document.getElementById('filter-search-name');
const filterLangCheckboxes = document.querySelectorAll('.filter-lang'); // Use class
const filterDateRadios = document.querySelectorAll('.filter-date');     // Use class
const clearFiltersBtn = document.getElementById('clear-filters-btn');

// (NEW) Single Import Elements
const importSingleBtn = document.getElementById('import-single-resume-btn');
const importSingleFileInput = document.getElementById('single-resume-import-input');

let allFetchedResumes = []; // Cache fetched resumes



// --- Render Resumes (Slight modifications for clarity/avatar) ---
function renderResumeList(resumes) {
    if (!resumeListContainer || !resumeCardTemplate) return;

    resumeListContainer.innerHTML = ''; // Clear previous list or loading indicator

    if (!resumes || resumes.length === 0) {
        // Use translation keys for the empty message
        const msg = translations[currentLang]?.myresumes_no_resumes || "You haven't created any resumes yet.";
        const createLink = translations[currentLang]?.myresumes_create_link || "Create one now!";
        resumeListContainer.innerHTML = `<div class="col-12"><div class="card card-body text-center text-muted">${msg} <a href="ResumeBuilder.html">${createLink}</a></div></div>`;
        return;
    }

    resumes.forEach(resume => {
        const clone = resumeCardTemplate.content.firstElementChild.cloneNode(true);
        const resumeId = resume.id;

        clone.dataset.resumeId = resumeId;
        const nameEl = clone.querySelector('.resume-name a');
        const roleEl = clone.querySelector('.resume-role');
        const langBadge = clone.querySelector('.resume-language span'); // Target the badge span
        const updatedEl = clone.querySelector('.resume-updated');
        const editBtn = clone.querySelector('.edit-resume-btn');
        const avatarEl = clone.querySelector('.avatar'); // Target the span directly
        const deleteBtn = clone.querySelector('.delete-resume-btn');
        const duplicateBtn = clone.querySelector('.duplicate-resume-btn');
        const exportBtn = clone.querySelector('.export-json-btn');
        const downloadPdfBtn = clone.querySelector('.download-pdf-btn'); // Get PDF btn

        // Translate static parts of the template clone *before* populating
        clone.querySelectorAll('[data-translate]').forEach(el => {
            const key = el.getAttribute('data-translate');
            if (translations[currentLang]?.[key]) {
                el.textContent = translations[currentLang][key];
            }
        });

        // Populate card
        if (nameEl) {
            nameEl.textContent = resume.name || (translations[currentLang]?.navbar_title || 'Untitled Resume'); // Use a translated default
            nameEl.href = `./ResumeBuilder.html?resumeId=${resumeId}`;
        }
        if (roleEl) {
            roleEl.textContent = resume.personalInfo?.role || ''; // Default empty if no role
        }
        if (langBadge) {
            // Determine language - Needs logic. Assume 'en' for now or check settings/resumeData
            const langCode = resume.settings?.language || 'en'; // Example: check resume settings if stored
            const langText = langCode === 'ar' ? (translations[currentLang]?.lang_arabic || 'Arabic') : (translations[currentLang]?.lang_english || 'English');
            langBadge.textContent = langText;
            langBadge.className = `badge ${langCode === 'ar' ? 'bg-info' : 'bg-green'}`; // Example styling
        }
        if (updatedEl) {
            updatedEl.textContent = `Updated: ${resume.updatedAt ? new Date(resume.updatedAt).toLocaleDateString('en-GB') : '-'}`;
        }
        if (editBtn) {
             editBtn.href = `./ResumeBuilder.html?resumeId=${resumeId}`;
             // Translate edit button text if needed (though template should handle it)
             const editKey = 'myresumes_card_edit_button';
             if (translations[currentLang]?.[editKey]) {
                 editBtn.textContent = translations[currentLang][editKey];
             }
        }
        if (avatarEl) { // Check avatar element exists
             if (resume.personalInfo?.photo) {
                avatarEl.style.backgroundImage = `url(${resume.personalInfo.photo})`;
                avatarEl.textContent = ''; // Clear placeholder text/icon if photo exists
                avatarEl.classList.remove('avatar-placeholder');
             } else if (resume.name) {
                 avatarEl.textContent = resume.name.match(/\b(\w)/g)?.join('').substring(0, 2).toUpperCase() || '?'; // Safer initials
                 avatarEl.style.backgroundImage = ''; // Ensure no background image if using initials
                 avatarEl.classList.add('avatar-placeholder'); // Add class for styling initials
             } else {
                 avatarEl.textContent = '?'; // Default placeholder
                 avatarEl.style.backgroundImage = '';
                 avatarEl.classList.add('avatar-placeholder');
             }
        }


        // Add Event Listeners for Actions
        duplicateBtn?.addEventListener('click', (e) => { e.preventDefault(); handleDuplicateResume(resumeId); });
        deleteBtn?.addEventListener('click', (e) => { e.preventDefault(); handleDeleteResume(resumeId); });
        exportBtn?.addEventListener('click', (e) => { e.preventDefault(); handleExportJson(resumeId); });
        downloadPdfBtn?.addEventListener('click', (e) => { e.preventDefault(); handleDownloadPdf(resumeId); });

        resumeListContainer.appendChild(clone);
    });
}

// --- Action Handlers (Delete, Duplicate, Export - Use showNotification) ---
async function handleDuplicateResume(id) {
    if (!confirm(translations[currentLang]?.myresumes_confirm_duplicate || `Are you sure you want to duplicate this resume?`)) return; // Add translation key
    console.log(`Duplicating resume ID: ${id}`);
    // Add Loading state?
    const newId = await duplicateResume(id);
    if (newId) {
        showNotification(translations[currentLang]?.myresumes_notify_duplicate_success || "Resume duplicated successfully!", 'success');
        await loadAndRenderResumes(); // Refresh the list
    } else {
        showNotification(translations[currentLang]?.myresumes_notify_duplicate_fail || "Failed to duplicate resume.", 'danger');
    }
}

async function handleDeleteResume(id) {
    if (!confirm(translations[currentLang]?.myresumes_confirm_delete || `Are you sure you want to permanently delete this resume? This cannot be undone.`)) return; // Add translation key
    console.log(`Deleting resume ID: ${id}`);
    const success = await deleteResume(id);
    if (success) {
        showNotification(translations[currentLang]?.myresumes_notify_delete_success || "Resume deleted successfully!", 'success');
        const cardToRemove = resumeListContainer.querySelector(`.resume-card-item[data-resume-id="${id}"]`);
        cardToRemove?.remove(); // Remove instantly
        // If list becomes empty, show the empty message
        if (resumeListContainer.children.length === 0) {
            renderResumeList([]);
        }
    } else {
        showNotification(translations[currentLang]?.myresumes_notify_delete_fail || "Failed to delete resume.", 'danger');
    }
}

async function handleExportJson(id) {
     console.log(`Exporting resume ID as JSON: ${id}`);
     const resumeData = await getResume(id);
     if (resumeData) {
         const exportData = { ...resumeData };
         // delete exportData.id; // Keep ID for potential import later? Your choice.
         const jsonString = JSON.stringify(exportData, null, 2);
         const blob = new Blob([jsonString], { type: 'application/json' });
         const url = URL.createObjectURL(blob);
         const a = document.createElement('a');
         const filename = (resumeData.name || `resume_${id}`).replace(/[^a-z0-9]/gi, '_').toLowerCase();
         a.href = url;
         a.download = `${filename}.json`;
         document.body.appendChild(a);
         a.click();
         document.body.removeChild(a);
         URL.revokeObjectURL(url);
         showNotification(translations[currentLang]?.myresumes_notify_export_success || "Resume exported as JSON.", 'info');
     } else {
         showNotification(translations[currentLang]?.myresumes_notify_export_fail || "Could not find resume data to export.", 'warning');
     }
}

function handleDownloadPdf(id) {
    // Option 1: Redirect to builder to handle PDF (simplest)
     // showNotification(`Redirecting to builder to generate PDF for resume ${id}...`, 'info');
     // window.location.href = `./ResumeBuilder.html?resumeId=${id}&action=download`; // Need builder logic

     // Option 2: Placeholder
     showNotification(translations[currentLang]?.myresumes_notify_pdf_nyi || `PDF download for resume ID ${id} is not implemented yet.`, 'warning'); // Add translation key
}

// --- Create New Resume Logic ---
async function handleCreateNewResume() {
    const name = newResumeNameInput.value.trim();
    const lang = newResumeLangSelect.value;

    if (!name) {
        createModalError.textContent = translations[currentLang]?.myresumes_modal_error_name || "Please enter a name for the resume."; // Add translation
        createModalError.style.display = 'block';
        newResumeNameInput.focus();
        return;
    }
    createModalError.style.display = 'none'; // Hide error

    // Disable button while saving
    createModalSaveBtn.disabled = true;
    createModalSaveBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-2" role="status"></span>Creating...`; // Add translation key

    // Create minimal data structure
    const now = new Date();
    const newResumeData = {
        name: name, // Ensure name field exists for Dexie index
        personalInfo: { name: name }, // Also put name in personalInfo
        settings: { language: lang }, // Store language setting
        // Initialize other sections as empty arrays to prevent errors later
        workExperience: [],
        education: [],
        trainings: [],
        skills: [],
        projects: [],
        certifications: [],
        awards: [],
        publications: [],
        volunteering: [],
        languages: [],
        interests: [],
        socialMedia: [],
        references: [],
        customSections: [],
        createdAt: now, // Set creation timestamp
        updatedAt: now
    };

    try {
        const newId = await saveResume(newResumeData); // saveResume is already in dexieApi.js
        if (newId) {
            showNotification(translations[currentLang]?.myresumes_notify_create_success || "Resume created successfully!", 'success');
            if (createModalInstance) createModalInstance.hide(); // Hide modal
            window.location.href = `./ResumeBuilder.html?resumeId=${newId}`; // Redirect to edit
        } else {
            throw new Error("Failed to save new resume to database.");
        }
    } catch (error) {
        console.error("Error creating new resume:", error);
        createModalError.textContent = translations[currentLang]?.myresumes_modal_error_save || "Error saving resume. Please try again."; // Add translation
        createModalError.style.display = 'block';
        createModalSaveBtn.disabled = false;
        // Restore original button text
        const createKey = 'myresumes_modal_button_create';
        createModalSaveBtn.innerHTML = translations[currentLang]?.[createKey] || 'Create Resume';

    }
}

// ---(NEW) Filtering Logic (Refined) ---
function getFilterFunction() {
  
    const searchTerm = searchInput?.value.toLowerCase().trim() || '';
    // Get *all* checked language values
    const checkedLangs = Array.from(filterLangCheckboxes)
                             .filter(cb => cb.checked)
                             .map(cb => cb.value); // ['en', 'ar'] or ['en'] or ['ar'] or []
    const selectedDateFilter = document.querySelector('input[name="filter_date"]:checked')?.value;

    // Determine if any filter is active
    const isLangFilterActive = checkedLangs.length < filterLangCheckboxes.length; // Active if not all langs are checked
    const isDateFilterActive = selectedDateFilter && selectedDateFilter !== 'all';
    const isSearchActive = searchTerm !== '';

    if (!isLangFilterActive && !isDateFilterActive && !isSearchActive) {
        console.log("No active filters.");
        return null; // No filtering needed, render all from cache
    }

    console.log("Building filter function with:", { searchTerm, checkedLangs, selectedDateFilter });

    // --- Build the filter function ---
    return (resume) => {
        let nameMatch = true;
        let langMatch = true;
        let dateMatch = true;

        // Name Filter
        if (isSearchActive) {
             const resumeNameLower = resume.name?.toLowerCase() || '';
             const personalNameLower = resume.personalInfo?.name?.toLowerCase() || '';
             nameMatch = resumeNameLower.includes(searchTerm) || personalNameLower.includes(searchTerm);
        }

        // Language Filter
        if (isLangFilterActive) {
             if (checkedLangs.length === 0) {
                 langMatch = false; // If no languages are checked, match nothing
             } else {
                 const resumeLang = resume.settings?.language || 'en'; // Default to 'en' if not set
                 langMatch = checkedLangs.includes(resumeLang);
             }
        }

        // Date Filter
        if (isDateFilterActive) {
            const resumeDate = new Date(resume.updatedAt);
            const now = new Date();
            let filterDateStart = null;

            if (selectedDateFilter === 'today') {
                filterDateStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // Start of today
            } else if (selectedDateFilter === 'last_week') {
                 filterDateStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7); // 7 days ago
            } else if (selectedDateFilter === 'this_month') {
                filterDateStart = new Date(now.getFullYear(), now.getMonth(), 1); // Start of the current month
            }

            dateMatch = filterDateStart ? (resumeDate >= filterDateStart) : true; // Only filter if a start date was calculated
        }


        return nameMatch && langMatch && dateMatch; // Must match all active filters
    };
}


// --- Single Resume Import Handler ---
async function handleSingleResumeImport(file) {
    if (!file || !file.type.includes('json')) {
        showNotification(translations[currentLang]?.myresumes_notify_single_import_select || "Please select a valid JSON file.", 'warning');
        return;
    }

    showNotification(translations[currentLang]?.myresumes_notify_single_import_reading || "Reading resume file...", 'info');

    const reader = new FileReader();
    reader.onload = async (event) => {
        try {
            const fileContent = event.target.result;
            const importedResumeData = JSON.parse(fileContent);

            // --- Basic Validation (Single Resume Object) ---
            // Check if it's an object and has at least personalInfo or a name
            if (!importedResumeData || typeof importedResumeData !== 'object' || Array.isArray(importedResumeData) || (!importedResumeData.personalInfo && !importedResumeData.name)) {
                 throw new Error(translations[currentLang]?.myresumes_notify_single_import_invalid || "Invalid resume data format.");
            }

            // --- Prepare Data for Save ---
            const now = new Date();
            // IMPORTANT: Remove existing ID if it exists from an export
            const { id, ...resumeWithoutId } = importedResumeData;

            // Update timestamps and ensure name exists
            resumeWithoutId.createdAt = resumeWithoutId.createdAt || now; // Keep original creation if exists
            resumeWithoutId.updatedAt = now; // Always update 'updatedAt'
            if (!resumeWithoutId.name && resumeWithoutId.personalInfo?.name) {
                resumeWithoutId.name = resumeWithoutId.personalInfo.name;
            } else if (!resumeWithoutId.name) {
                 const defaultNameKey = 'myresumes_untitled_resume';
                 resumeWithoutId.name = translations[currentLang]?.[defaultNameKey] || `Imported Resume ${now.toLocaleTimeString()}`;
            }
             // Ensure essential fields exist (like personalInfo if missing)
             if (!resumeWithoutId.personalInfo) resumeWithoutId.personalInfo = {};
             if (!resumeWithoutId.personalInfo.name) resumeWithoutId.personalInfo.name = resumeWithoutId.name; // Sync name
             if (!resumeWithoutId.settings) resumeWithoutId.settings = {}; // Ensure settings object exists

             // Ensure all expected section arrays exist
             const requiredSections = ['workExperience', 'education', 'trainings', 'skills', 'projects', 'certifications', 'awards', 'publications', 'volunteering', 'languages', 'interests', 'socialMedia', 'references', 'customSections'];
             requiredSections.forEach(section => {
                 if (!Array.isArray(resumeWithoutId[section])) {
                     resumeWithoutId[section] = [];
                 }
             });

            showNotification(translations[currentLang]?.myresumes_notify_single_import_saving || "Importing resume...", 'info');

            // Save the single resume (saveResume handles add)
            const newId = await saveResume(resumeWithoutId);

            if (newId) {
                showNotification(translations[currentLang]?.myresumes_notify_single_import_success || "Resume imported successfully!", 'success');
                await loadAndRenderResumes(null); // Refresh the list to show the new resume
            } else {
                 throw new Error("Failed to save imported resume to database.");
            }

        } catch (error) {
            console.error("Error importing single resume:", error);
            if (error instanceof SyntaxError) {
                 showNotification(translations[currentLang]?.myresumes_notify_single_import_parse_error || "Error parsing resume file.", 'danger');
            } else {
                 showNotification(`${translations[currentLang]?.myresumes_notify_single_import_fail || "Failed to import resume."} ${error.message}`, 'danger');
            }
        } finally {
            // Reset the hidden file input so the change event fires again
             if (importSingleFileInput) importSingleFileInput.value = null;
        }
    };
    reader.onerror = (event) => {
        console.error("Error reading file:", event.target.error);
        showNotification(translations[currentLang]?.myresumes_notify_single_import_fail || "Error reading the selected file.", 'danger');
        if (importSingleFileInput) importSingleFileInput.value = null;
    };
    reader.readAsText(file);
}

// --- Load and Render (Modified for Filtering) ---
async function loadAndRenderResumes(filterFn = null) {
    if (!resumeListContainer) return;
    resumeListContainer.innerHTML = `<div class="col-12 text-center p-5"><div class="spinner-border text-primary" role="status"></div><p class="mt-2" data-translate="myresumes_loading">Loading resumes...</p></div>`;
    translatePage(currentLang); // Translate loading message

    try {
        // Fetch only if cache is empty OR if no filter function is provided (means initial load or clear)
        if (allFetchedResumes.length === 0 || !filterFn) {
             console.log("Fetching all resumes from Dexie...");
            allFetchedResumes = await getAllResumes(); // Fetch and cache
        } else {
            console.log("Using cached resumes for filtering.");
        }

        let resumesToRender = allFetchedResumes;

        // Apply filtering if a function is provided
        if (typeof filterFn === 'function') {
            console.log("Applying filters...");
            resumesToRender = allFetchedResumes.filter(filterFn);
            console.log(`Filtered down to ${resumesToRender.length} resumes.`);
        } else {
             console.log("No filters applied, rendering all cached resumes.");
        }

        renderResumeList(resumesToRender);
        translatePage(currentLang); // Re-translate dynamic elements in cards

    } catch (error) {
        console.error("Failed to load/render resumes:", error);
        const errorMsg = translations[currentLang]?.myresumes_error_loading || "Error loading resumes. Please try again later.";
        resumeListContainer.innerHTML = `<div class="col-12"><div class="card card-body text-center text-danger">${errorMsg}</div></div>`;
    }
}

// --- Initialization ---
function initMyResumesPage() {
    console.log("Initializing My Resumes page...");

    // Initialize Modal Instance
    if (createModalElement) {
         createModalInstance = new bootstrap.Modal(createModalElement);
         createModalSaveBtn?.addEventListener('click', handleCreateNewResume);
         // Clear error on modal close
         createModalElement.addEventListener('hidden.bs.modal', () => {
            if(createModalError) createModalError.style.display = 'none';
            if(newResumeNameInput) newResumeNameInput.value = ''; // Clear input
            if(createModalSaveBtn) { // Re-enable button if it was disabled during a failed save
                 createModalSaveBtn.disabled = false;
                 const createKey = 'myresumes_modal_button_create';
                 createModalSaveBtn.innerHTML = translations[currentLang]?.[createKey] || 'Create Resume';
            }
         });

    }

    // Listener for the main "Create New" button to show modal
    const createBtnHeader = document.getElementById('create-new-resume-btn-header'); // Target the header button
    createBtnHeader?.addEventListener('click', (e) => {
        e.preventDefault(); // Prevent default link behavior if it's still an <a>
        if (createModalInstance) createModalInstance.show();
    });



    // Listener for Filter Form Submission
    filterForm?.addEventListener('submit', (e) => {
        e.preventDefault(); // Prevent default form submission
        console.log("Filter form submitted.");
        const filterFn = getFilterFunction();
        loadAndRenderResumes(filterFn); // Reload list with filters applied to cache
    });

     // Listener for Individual Filter Changes (Optional: Live Filtering)
     // This triggers filtering whenever any filter input changes
     searchInput?.addEventListener('input', () => { const filterFn = getFilterFunction(); loadAndRenderResumes(filterFn); });
     filterLangCheckboxes.forEach(cb => cb.addEventListener('change', () => { const filterFn = getFilterFunction(); loadAndRenderResumes(filterFn); }));
     filterDateRadios.forEach(rb => rb.addEventListener('change', () => { const filterFn = getFilterFunction(); loadAndRenderResumes(filterFn); }));

    // Listener for Clearing Filters
    clearFiltersBtn?.addEventListener('click', () => {
        console.log("Clearing filters...");
        if (filterForm) {
             filterForm.reset(); // Reset the form elements visually
             // Ensure defaults are re-checked after reset if needed
             searchInput.value = '';
             document.getElementById('filter-lang-en').checked = true; // Re-check defaults
             document.getElementById('filter-lang-ar').checked = true;
             document.querySelector('input[name="filter_date"][value="all"]').checked = true;
        }
        allFetchedResumes = []; // Clear cache to force refetch
        loadAndRenderResumes(null); // Reload all
    });
    

        // Listener for Single Import Button
        importSingleBtn?.addEventListener('click', () => {
            importSingleFileInput?.click(); // Trigger hidden file input
        });
    
        // Listener for Hidden File Input Change
        importSingleFileInput?.addEventListener('change', (event) => {
            const file = event.target.files?.[0];
            if (file) {
                handleSingleResumeImport(file);
            }
        });


        
    // Add listeners for individual filter changes if you want live filtering (more complex)
    // searchInput?.addEventListener('input', () => { /* debounce and call filter */ });
    // filterLangEn?.addEventListener('change', () => { /* call filter */ }); ...

    // Initial Load
    loadAndRenderResumes(null); // Load all initially
}




// --- END OF FILE myResumes.js ---