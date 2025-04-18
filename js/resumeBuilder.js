// --- START OF FILE resumeBuilder.js ---
// ... (keep existing vars like previewContainer)



// --- Live Preview ---
const previewContainer = document.getElementById('resume-preview-content');



let currentResumeId = null; // Variable to hold the ID of the resume being edited

// --- Populate Form Function ---
function populateForm(resumeData) {
    if (!resumeData) return;
    console.log("Populating form with data:", resumeData);

    // Clear existing dynamic entries before populating
    document.getElementById('work-experience-entries').innerHTML = '';
    document.getElementById('education-entries').innerHTML = '';
    document.getElementById('trainings-entries').innerHTML = '';
    document.getElementById('skills-entries').innerHTML = '';
    document.getElementById('projects-entries').innerHTML = '';
    document.getElementById('certifications-entries').innerHTML = '';
    document.getElementById('awards-entries').innerHTML = '';
    document.getElementById('publications-entries').innerHTML = '';
    document.getElementById('volunteering-entries').innerHTML = '';
    document.getElementById('languages-entries').innerHTML = '';
    document.getElementById('interests-entries').innerHTML = '';
    document.getElementById('social-media-entries').innerHTML = '';
    document.getElementById('references-entries').innerHTML = '';
    document.getElementById('custom-sections-entries').innerHTML = '';


    // Personal Info
    const pi = resumeData.personalInfo || {};
    document.getElementById('input-name').value = pi.name || '';
    document.getElementById('input-role').value = pi.role || '';
    document.getElementById('input-objective').value = pi.summary || '';
    document.getElementById('input-email').value = pi.email || '';
    document.getElementById('input-phone').value = pi.phone || '';
    document.getElementById('input-website').value = pi.website || '';
    document.getElementById('input-linkedin').value = pi.linkedin || '';
    document.getElementById('input-github').value = pi.github || '';
    document.getElementById('input-location').value = pi.location || '';
    
    // Photo (handle carefully - only update if photo data exists)
    const photoPreviewImg = document.getElementById('profile-photo-preview');
    const photoPreviewContainer = document.getElementById('photo-preview-container');
    const removePhotoButton = document.getElementById('remove-photo-btn');
    if (pi.photo && photoPreviewImg && photoPreviewContainer && removePhotoButton) {
         photoPreviewImg.src = pi.photo;
         photoPreviewContainer.style.display = 'block';
         removePhotoButton.style.display = 'inline-block';
    } else if (photoPreviewContainer) {
         photoPreviewContainer.style.display = 'none';
         removePhotoButton.style.display = 'none';
         photoPreviewImg.src = '#';
    }


    // Populate dynamic sections by simulating clicks isn't ideal.
    // Instead, create elements directly and populate them.

    const populateSection = (items, containerId, templateId, populateFn) => {
        const container = document.getElementById(containerId);
        const template = document.getElementById(templateId);
        if (!container || !template || !items || !Array.isArray(items)) return;

        items.forEach(itemData => {
            const clone = template.content.firstElementChild.cloneNode(true);
            populateFn(clone, itemData); // Call specific populator

             // Add remove listener
            const removeBtn = clone.querySelector('.remove-entry-btn');
            if (removeBtn) {
                removeBtn.addEventListener('click', () => {
                    clone.remove();
                    updatePreview();
                });
            }
             // Add input listeners
            clone.querySelectorAll('input, textarea, select').forEach(input => {
                 const eventType = (input.tagName === 'SELECT' || input.type === 'checkbox' || input.type === 'radio') ? 'change' : 'input';
                input.addEventListener(eventType, updatePreview);
            });

            container.appendChild(clone); // Append directly
        });
    };

    // --- Define Population Functions for Each Section ---
    const populateJob = (clone, data) => {
        clone.querySelector('[data-input="company"]').value = data.company || '';
        clone.querySelector('[data-input="job_title"]').value = data.jobTitle || '';
        clone.querySelector('[data-input="job_location"]').value = data.location || '';
        clone.querySelector('[data-input="start_date"]').value = data.startDate || '';
        clone.querySelector('[data-input="end_date"]').value = data.endDate || '';
        clone.querySelector('[data-input="current_job"]').checked = data.current || false;
        clone.querySelector('[data-input="description"]').value = data.description || '';
    };
    populateSection(resumeData.workExperience, 'work-experience-entries', 'job-entry-template', populateJob);

    const populateEdu = (clone, data) => {
         clone.querySelector('[data-input="school"]').value = data.school || '';
         clone.querySelector('[data-input="degree_major"]').value = data.degree || ''; // Match data key
         clone.querySelector('[data-input="edu_location"]').value = data.location || '';
         clone.querySelector('[data-input="gpa"]').value = data.gpa || '';
         clone.querySelector('[data-input="edu_start_date"]').value = data.startDate || '';
         clone.querySelector('[data-input="edu_end_date"]').value = data.endDate || '';
         clone.querySelector('[data-input="edu_current"]').checked = data.current || false;
         clone.querySelector('[data-input="additional_info"]').value = data.additionalInfo || '';
    };
     populateSection(resumeData.education, 'education-entries', 'education-entry-template', populateEdu);

    const populateTraining = (clone, data) => {
         clone.querySelector('[data-input="training_name"]').value = data.name || '';
         clone.querySelector('[data-input="institution"]').value = data.institution || '';
         clone.querySelector('[data-input="completion_date"]').value = data.date || '';
         clone.querySelector('[data-input="training_description"]').value = data.description || '';
    };
     populateSection(resumeData.trainings, 'trainings-entries', 'training-entry-template', populateTraining);

     const populateSkillCat = (clone, data) => {
        clone.querySelector('[data-input="skills_category"]').value = data.category || '';
        clone.querySelector('[data-input="skills_list"]').value = data.skillsList || '';
     };
     populateSection(resumeData.skills, 'skills-entries', 'skill-category-template', populateSkillCat);

     const populateProject = (clone, data) => {
         clone.querySelector('[data-input="project_name"]').value = data.name || '';
         clone.querySelector('[data-input="project_link"]').value = data.link || '';
         clone.querySelector('[data-input="project_date"]').value = data.date || '';
         clone.querySelector('[data-input="project_description"]').value = data.description || '';
     };
     populateSection(resumeData.projects, 'projects-entries', 'project-entry-template', populateProject);

     const populateCertification = (clone, data) => {
         clone.querySelector('[data-input="certification_name"]').value = data.name || '';
         clone.querySelector('[data-input="cert_issuer"]').value = data.issuer || '';
         clone.querySelector('[data-input="issue_date"]').value = data.issueDate || '';
         clone.querySelector('[data-input="expiration_date"]').value = data.expDate || '';
         clone.querySelector('[data-input="credential_url"]').value = data.url || '';
     };
     populateSection(resumeData.certifications, 'certifications-entries', 'certification-entry-template', populateCertification);

     const populateAward = (clone, data) => {
         clone.querySelector('[data-input="award_title"]').value = data.title || '';
         clone.querySelector('[data-input="issuer"]').value = data.issuer || '';
         clone.querySelector('[data-input="award_date"]').value = data.date || '';
         clone.querySelector('[data-input="award_description"]').value = data.description || '';
     };
     populateSection(resumeData.awards, 'awards-entries', 'award-entry-template', populateAward);

     const populatePublication = (clone, data) => {
        clone.querySelector('[data-input="publication_title"]').value = data.title || '';
        clone.querySelector('[data-input="publisher"]').value = data.publisher || '';
        clone.querySelector('[data-input="publication_date"]').value = data.date || '';
        clone.querySelector('[data-input="publication_url"]').value = data.url || '';
        clone.querySelector('[data-input="publication_description"]').value = data.description || '';
     };
     populateSection(resumeData.publications, 'publications-entries', 'publication-entry-template', populatePublication);

    const populateVolunteer = (clone, data) => {
         clone.querySelector('[data-input="role"]').value = data.role || '';
         clone.querySelector('[data-input="organization"]').value = data.organization || '';
         clone.querySelector('[data-input="volunteer_location"]').value = data.location || '';
         clone.querySelector('[data-input="volunteer_start_date"]').value = data.startDate || '';
         clone.querySelector('[data-input="volunteer_end_date"]').value = data.endDate || '';
         clone.querySelector('[data-input="currently_volunteering"]').checked = data.current || false;
         clone.querySelector('[data-input="volunteer_description"]').value = data.description || '';
     };
     populateSection(resumeData.volunteering, 'volunteering-entries', 'volunteering-entry-template', populateVolunteer);

     const populateLanguage = (clone, data) => {
         clone.querySelector('[data-input="language"]').value = data.language || '';
         clone.querySelector('[data-input="proficiency"]').value = data.proficiency || '';
     };
     populateSection(resumeData.languages, 'languages-entries', 'language-entry-template', populateLanguage);

     const populateInterest = (clone, data) => {
         clone.querySelector('[data-input="interest_name"]').value = data.name || '';
     };
     populateSection(resumeData.interests, 'interests-entries', 'interest-entry-template', populateInterest);

     const populateSocial = (clone, data) => {
         clone.querySelector('[data-input="network"]').value = data.network || '';
         clone.querySelector('[data-input="username"]').value = data.username || '';
         clone.querySelector('[data-input="profile_url"]').value = data.url || '';
     };
     populateSection(resumeData.socialMedia, 'social-media-entries', 'social-media-entry-template', populateSocial);

     const populateReference = (clone, data) => {
         clone.querySelector('[data-input="referent_name"]').value = data.name || '';
         clone.querySelector('[data-input="referent_company"]').value = data.company || '';
         clone.querySelector('[data-input="referent_email"]').value = data.email || '';
         clone.querySelector('[data-input="referent_phone"]').value = data.phone || '';
         clone.querySelector('[data-input="reference_text"]').value = data.note || '';
     };
     populateSection(resumeData.references, 'references-entries', 'reference-entry-template', populateReference);

    const populateCustom = (clone, data) => {
        clone.querySelector('[data-input="custom_title"]').value = data.title || '';
        clone.querySelector('[data-input="custom_description"]').value = data.description || '';
    };
    populateSection(resumeData.customSections, 'custom-sections-entries', 'custom-section-template', populateCustom);

    // Settings
    const s = resumeData.settings || {};
    document.getElementById('settings-theme-color').value = s.themeColor || '#206bc4';
    document.getElementById('settings-font-family').value = s.fontFamily || "'Inter', sans-serif";
    document.getElementById('settings-font-size').value = s.fontSize || '10pt';
    document.getElementById('settings-document-size').value = s.documentSize || 'A4';

    // IMPORTANT: Update preview after populating all fields
    updatePreview();
}

// --- Load Default Personal Info ---
async function loadDefaultPersonalInfo() {
    const userProfile = await getSetting('userProfile');
    if (userProfile) {
        console.log("Loading default personal info from settings...");
        // Only populate if the fields are empty
        if (!document.getElementById('input-name').value) {
             document.getElementById('input-name').value = `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim();
        }
        if (!document.getElementById('input-email').value) {
             document.getElementById('input-email').value = userProfile.email || '';
        }
         if (!document.getElementById('input-phone').value) {
             document.getElementById('input-phone').value = userProfile.phone || '';
        }
         if (!document.getElementById('input-location').value) {
             document.getElementById('input-location').value = userProfile.address || ''; // Assuming address maps to location
        }
        // Update preview if any changes were made
        updatePreview();
    }
}


// --- Load Resume Data Logic ---
async function loadResumeForEditing() {
    const urlParams = new URLSearchParams(window.location.search);
    const resumeIdParam = urlParams.get('resumeId');

    if (resumeIdParam) {
        currentResumeId = parseInt(resumeIdParam); // Store the ID
        document.getElementById('current-resume-id').value = currentResumeId; // Set hidden input

        const resumeData = await getResume(currentResumeId); // Fetch from Dexie
        if (resumeData) {
            populateForm(resumeData);
        } else {
            console.error(`Resume with ID ${currentResumeId} not found.`);
            alert(`Error: Could not load resume with ID ${currentResumeId}. Starting fresh.`);
            currentResumeId = null; // Reset ID
             document.getElementById('current-resume-id').value = '';
             await loadDefaultPersonalInfo(); // Load defaults if specified resume fails
        }
    } else {
        console.log("No resumeId found in URL, starting fresh or loading defaults.");
         await loadDefaultPersonalInfo(); // Load defaults if starting new
         // Ensure preview updates even when starting fresh
         updatePreview();
    }
}


// --- Save Resume Handler (Refined) ---
async function handleSaveResume() {
    const saveData = collectFormData(); // Get all data from the form
    const resumeIdToSave = currentResumeId; // Use the globally stored ID

    const saveButton = document.getElementById('save-resume-btn');
    if (!saveButton) return; // Should not happen, but good practice

    const originalButtonContent = saveButton.innerHTML;
    saveButton.disabled = true;
    // Use a translation key for "Saving..." if available
    const savingTextKey = 'myresumes_notify_saving'; // Example key - Add to translation.js
    const savingDefaultText = 'Saving...';
    saveButton.innerHTML = `<span class="spinner-border spinner-border-sm me-2" role="status"></span> ${translations[currentLang]?.[savingTextKey] || savingDefaultText}`;

    try {
        // Ensure the name field within personalInfo matches the top-level name for Dexie index
        if (saveData.personalInfo?.name && !saveData.name) {
             saveData.name = saveData.personalInfo.name;
        } else if (!saveData.name && saveData.personalInfo?.name) {
            // If saveData.name exists but personalInfo.name doesn't, sync them maybe? Or prioritize one.
            // Let's prioritize personalInfo.name if it exists
             saveData.name = saveData.personalInfo.name;
        } else if (!saveData.name && !saveData.personalInfo?.name) {
            // If neither exists, create a default name (saveResume in dexieApi should handle this, but we can double-check)
            const defaultNameKey = 'myresumes_untitled_resume'; // Add to translation.js
            const defaultName = translations[currentLang]?.[defaultNameKey] || `Untitled Resume ${new Date().toLocaleTimeString()}`;
            saveData.name = defaultName;
            if (!saveData.personalInfo) saveData.personalInfo = {};
            saveData.personalInfo.name = defaultName;
        } else if (saveData.name !== saveData.personalInfo?.name) {
             // If they differ, ensure Dexie 'name' index matches the visible name
             saveData.name = saveData.personalInfo.name;
        }


        // Call the Dexie function to save/update
        const savedId = await saveResume(saveData, resumeIdToSave);

        if (savedId) {
            // Update state if it was a new resume
            if (!resumeIdToSave) {
                currentResumeId = savedId;
                document.getElementById('current-resume-id').value = currentResumeId; // Update hidden input

                // Update URL without reloading page
                const newUrl = `${window.location.pathname}?resumeId=${savedId}${window.location.hash}`;
                history.pushState({ resumeId: savedId }, document.title, newUrl); // Update browser history
                console.log(`New resume saved with ID: ${savedId}. URL updated.`);
            } else {
                console.log(`Resume ID ${resumeIdToSave} updated.`);
            }

            // Show success feedback
            const successMsgKey = 'myresumes_notify_save_success'; // Add to translation.js
            showNotification(translations[currentLang]?.[successMsgKey] || "Resume saved successfully!", 'success');

        } else {
            // saveResume returned null/undefined, indicating failure
            throw new Error("Failed to get valid ID after saving.");
        }
    } catch (error) {
        console.error("Error saving resume:", error);
        const errorMsgKey = 'myresumes_notify_save_fail'; // Add to translation.js
        showNotification(`${translations[currentLang]?.[errorMsgKey] || "Failed to save resume."} ${error.message}`, 'danger');
    } finally {
        // Restore button state regardless of success or failure
        saveButton.disabled = false;
        saveButton.innerHTML = originalButtonContent;
    }
}


// --- Resume Builder Init Function ---
function initResumeBuilder() {
    console.log("Initializing Resume Builder page...");

    // Existing listeners...
    const formElements = document.querySelectorAll('.builder-container input, .builder-container textarea, .builder-container select');
    formElements.forEach(el => {
        if (!el.closest('template')) {
             const eventType = (el.tagName === 'SELECT' || ['checkbox', 'radio', 'color'].includes(el.type)) ? 'change' : 'input';
            el.addEventListener(eventType, updatePreview);
        }
    });

    document.getElementById('add-job-btn')?.addEventListener('click', (e) => addSectionEntry(e.target, 'work-experience-entries', 'job-entry-template'));
    // ... ALL OTHER 'add' button listeners ...
    document.getElementById('add-custom-section-btn')?.addEventListener('click', (e) => addSectionEntry(e.target, 'custom-sections-entries', 'custom-section-template'));

    const mainCardBody = document.querySelector('.builder-container .card-body');
     if (mainCardBody) {
         mainCardBody.addEventListener('click', function(event) {
             if (event.target.closest('.remove-entry-btn')) {
                 event.target.closest('.dynamic-entry')?.remove();
                 updatePreview();
             }
         });
     }

     const photoInput = document.getElementById('input-photo');
     const photoPreviewImg = document.getElementById('profile-photo-preview');
     const photoPreviewContainer = document.getElementById('photo-preview-container');
     const removePhotoButton = document.getElementById('remove-photo-btn');
     if (photoInput && photoPreviewImg && photoPreviewContainer && removePhotoButton) {
          photoInput.addEventListener('change', function() { /* ... photo upload logic ... */ updatePreview(); });
          removePhotoButton.addEventListener('click', () => { /* ... photo remove logic ... */ updatePreview(); });
     }

     document.getElementById('download-resume-btn')?.addEventListener('click', () => {/* ... download placeholder ... */});
     document.getElementById('change-template-btn')?.addEventListener('click', () => {/* ... template placeholder ... */});

    // --- NEW Listeners ---
    document.getElementById('save-resume-btn')?.addEventListener('click', handleSaveResume);

    // --- Load Data ---
    loadResumeForEditing(); // Check URL and load data if ID is present, or load defaults
}



    function updatePreview() {
        if (!previewContainer) return;
        const data = collectFormData();
        let previewHTML = ''; // Start fresh

        // --- Personal Info ---
         previewHTML += `
            <div class="text-center mb-4">
                ${data.personalInfo.photo ? `<img src="${data.personalInfo.photo}" alt="Profile Photo" class="img-thumbnail rounded-circle mb-2" style="width: 100px; height: 100px; object-fit: cover;">` : ''}
                <h2 id="preview-name" class="text-primary mb-1">${data.personalInfo.name || translations[currentLang].placeholder_name}</h2>
                <p id="preview-role" class="lead fs-6 mb-1">${data.personalInfo.role || translations[currentLang].placeholder_role}</p>
                <div id="preview-contact-info" class="text-muted small d-flex justify-content-center flex-wrap gap-3">
                    ${data.personalInfo.location ? `<span><i class="ti ti-map-pin"></i> ${data.personalInfo.location}</span>` : ''}
                    ${data.personalInfo.phone ? `<span><i class="ti ti-phone"></i> ${data.personalInfo.phone}</span>` : ''}
                    ${data.personalInfo.email ? `<span><i class="ti ti-mail"></i> <a href="mailto:${data.personalInfo.email}">${data.personalInfo.email}</a></span>` : ''}
                    ${data.personalInfo.website ? `<span><i class="ti ti-world"></i> <a href="${data.personalInfo.website}" target="_blank" rel="noopener noreferrer">${data.personalInfo.website}</a></span>` : ''}
                    ${data.personalInfo.linkedin ? `<span><i class="ti ti-brand-linkedin"></i> <a href="${data.personalInfo.linkedin}" target="_blank" rel="noopener noreferrer">LinkedIn</a></span>` : ''}
                    ${data.personalInfo.github ? `<span><i class="ti ti-brand-github"></i> <a href="${data.personalInfo.github}" target="_blank" rel="noopener noreferrer">GitHub</a></span>` : ''}
                </div>
            </div>`;

        if (data.personalInfo.summary) {
            previewHTML += `<div id="preview-summary" class="mb-4">${formatText(data.personalInfo.summary)}</div>`;
        }

        // --- Work Experience ---
        if (data.workExperience.length > 0) {
            previewHTML += `<h5 data-translate="preview_section_work">${translations[currentLang].preview_section_work}</h5>`;
            previewHTML += '<div id="preview-work-experience-list">';
            data.workExperience.forEach(job => {
                const dates = `${job.startDate || ''} - ${job.endDate || (job.current ? (translations[currentLang].label_current_job || 'Present') : '')}`;
                previewHTML += `
                    <div class="mb-3">
                        <h6><strong>${job.jobTitle || 'Job Title'}</strong> | ${job.company || 'Company'}</h6>
                        <div class="d-flex justify-content-between text-muted small mb-1">
                            <span>${job.location || ''}</span>
                            <span>${dates}</span>
                        </div>
                        ${job.description ? `<div class="text-muted small">${formatText(job.description)}</div>` : ''}
                    </div>`;
            });
            previewHTML += '</div>';
        }

        // --- Education ---
         if (data.education.length > 0) {
             previewHTML += `<h5 data-translate="preview_section_education">${translations[currentLang].preview_section_education}</h5>`;
             previewHTML += '<div id="preview-education-list">';
             data.education.forEach(edu => {
                  const dates = `${edu.startDate || ''} - ${edu.endDate || (edu.current ? (translations[currentLang].label_edu_current || 'Present') : '')}`;
                  previewHTML += `
                     <div class="mb-3">
                         <h6><strong>${edu.degree || 'Degree & Major'}</strong> | ${edu.school || 'Institution'}</h6>
                          <div class="d-flex justify-content-between text-muted small mb-1">
                             <span>${edu.location || ''} ${edu.gpa ? `(GPA: ${edu.gpa})` : ''}</span>
                             <span>${dates}</span>
                         </div>
                         ${edu.additionalInfo ? `<div class="text-muted small">${formatText(edu.additionalInfo)}</div>` : ''}
                     </div>`;
             });
             previewHTML += '</div>';
         }

         // --- Trainings --- *NEW*
         if (data.trainings.length > 0) {
             previewHTML += `<h5 data-translate="preview_section_trainings">${translations[currentLang].preview_section_trainings}</h5>`;
             previewHTML += '<div id="preview-trainings-list">';
             data.trainings.forEach(tr => {
                 previewHTML += `
                     <div class="mb-3">
                         <h6><strong>${tr.name || 'Training Name'}</strong> | ${tr.institution || 'Provider'}</h6>
                         <div class="text-muted small mb-1">${tr.date || ''}</div>
                         ${tr.description ? `<div class="text-muted small">${formatText(tr.description)}</div>` : ''}
                     </div>`;
             });
             previewHTML += '</div>';
         }

         // --- Skills ---
         if (data.skills.length > 0) {
             previewHTML += `<h5 data-translate="preview_section_skills">${translations[currentLang].preview_section_skills}</h5>`;
             previewHTML += '<div id="preview-skills-list">';
             data.skills.forEach(skillCat => {
                 previewHTML += `
                     <div class="mb-2">
                         <strong>${skillCat.category || 'Skills'}:</strong>
                         <span class="text-muted small ms-1">${skillCat.skillsList || ''}</span>
                     </div>`;
             });
             previewHTML += '</div>';
         }

         // --- Projects ---
         if (data.projects.length > 0) {
             previewHTML += `<h5 data-translate="preview_section_projects">${translations[currentLang].preview_section_projects}</h5>`;
             previewHTML += '<div id="preview-projects-list">';
             data.projects.forEach(proj => {
                 previewHTML += `
                     <div class="mb-3">
                         <h6><strong>${proj.name || 'Project Name'}</strong> ${proj.link ? `| <a href="${proj.link}" target="_blank" rel="noopener noreferrer"><i class="ti ti-link"></i> Link</a>` : ''}</h6>
                         <div class="text-muted small mb-1">${proj.date || ''}</div>
                         ${proj.description ? `<div class="text-muted small">${formatText(proj.description)}</div>` : ''}
                     </div>`;
             });
             previewHTML += '</div>';
         }

        // --- Certifications --- *NEW*
        if (data.certifications.length > 0) {
            previewHTML += `<h5 data-translate="preview_section_certifications">${translations[currentLang].preview_section_certifications}</h5>`;
            previewHTML += '<div id="preview-certifications-list">';
            data.certifications.forEach(cert => {
                 const dates = `${cert.issueDate || ''}${cert.expDate ? ` - ${cert.expDate}`: ''}`;
                 previewHTML += `
                    <div class="mb-3">
                         <h6><strong>${cert.name || 'Certification Name'}</strong> | ${cert.issuer || 'Issuer'}</h6>
                         <div class="text-muted small mb-1">
                            <span>${dates}</span>
                            ${cert.url ? `<a href="${cert.url}" target="_blank" rel="noopener noreferrer" class="ms-2"><i class="ti ti-link"></i> Credential</a>` : ''}
                         </div>
                     </div>`;
            });
            previewHTML += '</div>';
        }

         // --- Awards --- *NEW*
         if (data.awards.length > 0) {
             previewHTML += `<h5 data-translate="preview_section_awards">${translations[currentLang].preview_section_awards}</h5>`;
             previewHTML += '<div id="preview-awards-list">';
             data.awards.forEach(aw => {
                 previewHTML += `
                     <div class="mb-3">
                         <h6><strong>${aw.title || 'Award Title'}</strong> | ${aw.issuer || 'Issuer'}</h6>
                         <div class="text-muted small mb-1">${aw.date || ''}</div>
                         ${aw.description ? `<div class="text-muted small">${formatText(aw.description)}</div>` : ''}
                     </div>`;
             });
             previewHTML += '</div>';
         }

          // --- Publications --- *NEW*
         if (data.publications.length > 0) {
             previewHTML += `<h5 data-translate="preview_section_publications">${translations[currentLang].preview_section_publications}</h5>`;
             previewHTML += '<div id="preview-publications-list">';
             data.publications.forEach(pub => {
                 previewHTML += `
                     <div class="mb-3">
                         <h6><strong>${pub.title || 'Publication Title'}</strong> | ${pub.publisher || 'Publisher'}</h6>
                         <div class="text-muted small mb-1">
                            <span>${pub.date || ''}</span>
                            ${pub.url ? `<a href="${pub.url}" target="_blank" rel="noopener noreferrer" class="ms-2"><i class="ti ti-link"></i> Link</a>` : ''}
                         </div>
                         ${pub.description ? `<div class="text-muted small">${formatText(pub.description)}</div>` : ''}
                     </div>`;
             });
             previewHTML += '</div>';
         }

        // --- Volunteering --- *NEW*
         if (data.volunteering.length > 0) {
             previewHTML += `<h5 data-translate="preview_section_volunteering">${translations[currentLang].preview_section_volunteering}</h5>`;
             previewHTML += '<div id="preview-volunteering-list">';
             data.volunteering.forEach(vol => {
                 const dates = `${vol.startDate || ''} - ${vol.endDate || (vol.current ? (translations[currentLang].label_currently_volunteering || 'Present') : '')}`;
                 previewHTML += `
                     <div class="mb-3">
                         <h6><strong>${vol.role || 'Role'}</strong> | ${vol.organization || 'Organization'}</h6>
                          <div class="d-flex justify-content-between text-muted small mb-1">
                             <span>${vol.location || ''}</span>
                             <span>${dates}</span>
                         </div>
                         ${vol.description ? `<div class="text-muted small">${formatText(vol.description)}</div>` : ''}
                     </div>`;
             });
             previewHTML += '</div>';
         }

         // --- Languages ---
         if (data.languages.length > 0) {
             previewHTML += `<h5 data-translate="preview_section_languages">${translations[currentLang].preview_section_languages}</h5>`;
             previewHTML += '<div id="preview-languages-list" class="d-flex flex-wrap text-muted small gap-3">'; // Use gap
             data.languages.forEach((lang) => {
                 previewHTML += `
                     <div>
                         <span>${lang.language || 'Language'}</span>
                         ${lang.proficiency ? `<span class="ms-1">(${lang.proficiency})</span>` : ''}
                     </div>`;
             });
             previewHTML += '</div>';
         }

         // --- Interests --- *NEW*
         if (data.interests.length > 0) {
             previewHTML += `<h5 data-translate="preview_section_interests">${translations[currentLang].preview_section_interests}</h5>`;
             previewHTML += '<div id="preview-interests-list">';
             previewHTML += `<p class="text-muted small">${data.interests.map(i => i.name).join(', ')}</p>`;
             previewHTML += '</div>';
         }


         // --- Social Media --- *NEW* (Displaying as links)
         if (data.socialMedia.length > 0) {
            previewHTML += `<h5 data-translate="preview_section_social_media">${translations[currentLang].preview_section_social_media}</h5>`;
             previewHTML += '<div id="preview-social-media-list" class="d-flex flex-wrap text-muted small gap-3">';
             data.socialMedia.forEach(sm => {
                // Basic icon mapping - could be improved
                let icon = 'ti-world';
                if (sm.network?.toLowerCase().includes('linkedin')) icon = 'ti-brand-linkedin';
                else if (sm.network?.toLowerCase().includes('github')) icon = 'ti-brand-github';
                else if (sm.network?.toLowerCase().includes('twitter')) icon = 'ti-brand-twitter';
                else if (sm.network?.toLowerCase().includes('facebook')) icon = 'ti-brand-facebook';

                previewHTML += `
                    <div>
                        <a href="${sm.url || '#'}" target="_blank" rel="noopener noreferrer" class="text-muted">
                            <i class="ti ${icon}"></i>
                            ${sm.username || sm.network || 'Profile'}
                        </a>
                    </div>`;
             });
             previewHTML += '</div>';
         }

        // --- References --- *NEW* (Often better to state "Available upon request")
         if (data.references.length > 0) {
             previewHTML += `<h5 data-translate="preview_section_references">${translations[currentLang].preview_section_references}</h5>`;
             previewHTML += '<div id="preview-references-list">';
             // Option 1: Display "Available upon request" if any reference exists
             previewHTML += `<p class="text-muted small">${translations[currentLang].placeholder_reference_text || 'Available upon request'}</p>`;
             // Option 2: Display details (Use with caution - privacy)
             /*
             data.references.forEach(ref => {
                 previewHTML += `
                     <div class="mb-2 text-muted small">
                         <strong>${ref.name || 'Referent Name'}</strong> - ${ref.company || 'Company/Position'}<br>
                         ${ref.email ? `<i class="ti ti-mail me-1"></i>${ref.email}` : ''} ${ref.phone ? `<i class="ti ti-phone ms-2 me-1"></i>${ref.phone}` : ''}
                         ${ref.note ? `<br><em>${ref.note}</em>` : ''}
                     </div>`;
             });
             */
             previewHTML += '</div>';
         }

        // --- Custom Sections ---
        if (data.customSections.length > 0) {
            previewHTML += '<div id="preview-custom-sections-list">';
             data.customSections.forEach(section => {
                 // Use the actual title provided by the user
                 previewHTML += `<h5>${section.title || translations[currentLang].preview_section_custom_placeholder}</h5>`;
                 previewHTML += `<div class="mb-3 text-muted small">${formatText(section.description) || ''}</div>`;
             });
             previewHTML += '</div>';
        }


        previewContainer.innerHTML = previewHTML;
        // Re-apply translations to any preview elements that use data-translate (like section headers)
        previewContainer.querySelectorAll('[data-translate]').forEach(el => {
             const key = el.getAttribute('data-translate');
             if (translations[currentLang] && translations[currentLang][key]) {
                 el.textContent = translations[currentLang][key];
             }
         });
    }  
      
  // Helper function to collect data from all form inputs
  function collectFormData() {
    const data = {
        personalInfo: {},
        workExperience: [],
        education: [],
        trainings: [], // New
        skills: [],
        projects: [],
        certifications: [], // New
        awards: [], // New
        publications: [], // New
        volunteering: [], // New
        languages: [],
        interests: [], // New
        socialMedia: [], // New
        references: [], // New
        customSections: [],
        settings: {}
    };

    // Personal Info (as before)
    data.personalInfo.name = document.getElementById('input-name')?.value;
    data.personalInfo.role = document.getElementById('input-role')?.value;
    data.personalInfo.summary = document.getElementById('input-objective')?.value;
    data.personalInfo.email = document.getElementById('input-email')?.value;
    data.personalInfo.phone = document.getElementById('input-phone')?.value;
    data.personalInfo.website = document.getElementById('input-website')?.value;
    data.personalInfo.linkedin = document.getElementById('input-linkedin')?.value;
    data.personalInfo.github = document.getElementById('input-github')?.value;
    data.personalInfo.location = document.getElementById('input-location')?.value;
    const photoPreview = document.getElementById('profile-photo-preview');
    data.personalInfo.photo = photoPreview?.src.startsWith('data:image') ? photoPreview.src : null; // Ensure it's a data URL

    // Work Experience (as before)
    document.querySelectorAll('#work-experience-entries .job-entry').forEach(entry => {
        data.workExperience.push({
            company: entry.querySelector('[data-input="company"]')?.value,
            jobTitle: entry.querySelector('[data-input="job_title"]')?.value,
            location: entry.querySelector('[data-input="job_location"]')?.value,
            startDate: entry.querySelector('[data-input="start_date"]')?.value,
            endDate: entry.querySelector('[data-input="end_date"]')?.value,
            current: entry.querySelector('[data-input="current_job"]')?.checked,
            description: entry.querySelector('[data-input="description"]')?.value,
        });
    });

    // Education (as before)
    document.querySelectorAll('#education-entries .education-entry').forEach(entry => {
         data.education.push({
            school: entry.querySelector('[data-input="school"]')?.value,
            degree: entry.querySelector('[data-input="degree_major"]')?.value,
            location: entry.querySelector('[data-input="edu_location"]')?.value,
            gpa: entry.querySelector('[data-input="gpa"]')?.value,
            startDate: entry.querySelector('[data-input="edu_start_date"]')?.value,
            endDate: entry.querySelector('[data-input="edu_end_date"]')?.value,
            current: entry.querySelector('[data-input="edu_current"]')?.checked,
            additionalInfo: entry.querySelector('[data-input="additional_info"]')?.value,
         });
    });

     // Trainings *NEW*
     document.querySelectorAll('#trainings-entries .training-entry').forEach(entry => {
         data.trainings.push({
             name: entry.querySelector('[data-input="training_name"]')?.value,
             institution: entry.querySelector('[data-input="institution"]')?.value,
             date: entry.querySelector('[data-input="completion_date"]')?.value,
             description: entry.querySelector('[data-input="training_description"]')?.value,
         });
     });

    // Skills (as before)
    document.querySelectorAll('#skills-entries .skill-category-entry').forEach(entry => {
        data.skills.push({
            category: entry.querySelector('[data-input="skills_category"]')?.value,
            skillsList: entry.querySelector('[data-input="skills_list"]')?.value,
        });
    });

    // Projects (as before)
     document.querySelectorAll('#projects-entries .project-entry').forEach(entry => {
         data.projects.push({
             name: entry.querySelector('[data-input="project_name"]')?.value,
             link: entry.querySelector('[data-input="project_link"]')?.value,
             date: entry.querySelector('[data-input="project_date"]')?.value,
             description: entry.querySelector('[data-input="project_description"]')?.value,
         });
     });

     // Certifications *NEW*
     document.querySelectorAll('#certifications-entries .certification-entry').forEach(entry => {
         data.certifications.push({
             name: entry.querySelector('[data-input="certification_name"]')?.value,
             issuer: entry.querySelector('[data-input="cert_issuer"]')?.value,
             issueDate: entry.querySelector('[data-input="issue_date"]')?.value,
             expDate: entry.querySelector('[data-input="expiration_date"]')?.value,
             url: entry.querySelector('[data-input="credential_url"]')?.value,
         });
     });

     // Awards *NEW*
     document.querySelectorAll('#awards-entries .award-entry').forEach(entry => {
         data.awards.push({
             title: entry.querySelector('[data-input="award_title"]')?.value,
             date: entry.querySelector('[data-input="award_date"]')?.value,
             issuer: entry.querySelector('[data-input="issuer"]')?.value,
             description: entry.querySelector('[data-input="award_description"]')?.value,
         });
     });

     // Publications *NEW*
     document.querySelectorAll('#publications-entries .publication-entry').forEach(entry => {
         data.publications.push({
             title: entry.querySelector('[data-input="publication_title"]')?.value,
             publisher: entry.querySelector('[data-input="publisher"]')?.value,
             date: entry.querySelector('[data-input="publication_date"]')?.value,
             url: entry.querySelector('[data-input="publication_url"]')?.value,
             description: entry.querySelector('[data-input="publication_description"]')?.value,
         });
     });

     // Volunteering *NEW*
     document.querySelectorAll('#volunteering-entries .volunteering-entry').forEach(entry => {
         data.volunteering.push({
             role: entry.querySelector('[data-input="role"]')?.value,
             organization: entry.querySelector('[data-input="organization"]')?.value,
             location: entry.querySelector('[data-input="volunteer_location"]')?.value,
             startDate: entry.querySelector('[data-input="volunteer_start_date"]')?.value,
             endDate: entry.querySelector('[data-input="volunteer_end_date"]')?.value,
             current: entry.querySelector('[data-input="currently_volunteering"]')?.checked,
             description: entry.querySelector('[data-input="volunteer_description"]')?.value,
         });
     });

     // Languages (as before)
     document.querySelectorAll('#languages-entries .language-entry').forEach(entry => {
         data.languages.push({
             language: entry.querySelector('[data-input="language"]')?.value,
             proficiency: entry.querySelector('[data-input="proficiency"]')?.value,
         });
     });

     // Interests *NEW*
     document.querySelectorAll('#interests-entries .interest-entry').forEach(entry => {
         data.interests.push({
             name: entry.querySelector('[data-input="interest_name"]')?.value,
         });
     });

     // Social Media *NEW*
     document.querySelectorAll('#social-media-entries .social-media-entry').forEach(entry => {
         data.socialMedia.push({
             network: entry.querySelector('[data-input="network"]')?.value,
             username: entry.querySelector('[data-input="username"]')?.value,
             url: entry.querySelector('[data-input="profile_url"]')?.value,
         });
     });

     // References *NEW*
     document.querySelectorAll('#references-entries .reference-entry').forEach(entry => {
         data.references.push({
             name: entry.querySelector('[data-input="referent_name"]')?.value,
             company: entry.querySelector('[data-input="referent_company"]')?.value,
             // position: entry.querySelector('[data-input="referent_position"]')?.value, // Removed
             email: entry.querySelector('[data-input="referent_email"]')?.value,
             phone: entry.querySelector('[data-input="referent_phone"]')?.value,
             note: entry.querySelector('[data-input="reference_text"]')?.value,
         });
     });

    // Custom Sections (as before)
    document.querySelectorAll('#custom-sections-entries .custom-section-entry').forEach(entry => {
         data.customSections.push({
             title: entry.querySelector('[data-input="custom_title"]')?.value,
             description: entry.querySelector('[data-input="custom_description"]')?.value,
         });
    });

    // Settings (as before)
    data.settings.themeColor = document.getElementById('settings-theme-color')?.value;
    data.settings.fontFamily = document.getElementById('settings-font-family')?.value;
    data.settings.fontSize = document.getElementById('settings-font-size')?.value;
    data.settings.documentSize = document.getElementById('settings-document-size')?.value;

    console.log("Collected Data:", data); // For debugging
    return data;
}


    // Helper to format text (e.g., newlines to <br>, simple markdown)
    function formatText(text) {
        if (!text) return '';
        // Basic: replace newlines with <br>
        let html = text.replace(/\n/g, '<br>');
        // Basic: replace lines starting with * or - with <li> (needs wrapping <ul>) - More complex logic needed for proper list handling
         // Let's keep it simple for now: just newlines
        return html;
         // Example for bullet points (needs refinement)
         /*
         let lines = text.split('\n');
         let inList = false;
         html = '';
         lines.forEach(line => {
             line = line.trim();
             if (line.startsWith('* ') || line.startsWith('- ')) {
                 if (!inList) {
                     html += '<ul>';
                     inList = true;
                 }
                 html += `<li>${line.substring(2)}</li>`;
             } else {
                 if (inList) {
                     html += '</ul>';
                     inList = false;
                 }
                 html += line ? `<p>${line}</p>` : ''; // Add paragraphs for non-list lines
             }
         });
         if (inList) {
             html += '</ul>'; // Close list if it's the last element
         }
         return html;
         */
    }




    // --- Dynamic Section Management ---
    let entryCounters = {}; // To keep track of added entries for potential unique IDs if needed

    function addSectionEntry(button, containerId, templateId) {
        const container = document.getElementById(containerId);
        const template = document.getElementById(templateId);
        if (!container || !template) {
            console.error(`Container #${containerId} or Template #${templateId} not found.`);
            return;
        }

        const clone = template.content.firstElementChild.cloneNode(true);

        // Add event listener to the remove button WITHIN the cloned node
        const removeBtn = clone.querySelector('.remove-entry-btn');
        if (removeBtn) {
            removeBtn.addEventListener('click', () => {
                clone.remove();
                updatePreview(); // Update preview after removing
            });
        }

        // Append the cloned entry
        // Insert before the 'Add' button if it's inside the container, otherwise append
        const addButton = container.querySelector('.add-entry-btn'); // Assuming add buttons have this class
        if (addButton) {
             container.insertBefore(clone, addButton);
        } else {
            container.appendChild(clone);
        }


        // Add input listeners to the new elements
        clone.querySelectorAll('input, textarea, select').forEach(input => {
             const eventType = (input.tagName === 'SELECT' || input.type === 'checkbox' || input.type === 'radio') ? 'change' : 'input';
            input.addEventListener(eventType, updatePreview);
        });

        // Optional: Clear input fields in the clone
        clone.querySelectorAll('input, textarea').forEach(input => {
            if (input.type !== 'checkbox' && input.type !== 'radio') {
                 input.value = '';
            } else if (input.type === 'checkbox' || input.type === 'radio') {
                input.checked = false;
            }
        });
         clone.querySelectorAll('select').forEach(select => {
             select.selectedIndex = 0; // Reset selects
         });


        updatePreview(); // Update preview after adding
    }



    function initResumeBuilder() {


            // --- Ensure Save Button Listener is attached ---
    const saveBtn = document.getElementById('save-resume-btn');
    if (saveBtn) {
        saveBtn.addEventListener('click', handleSaveResume);
        console.log("Save button listener attached."); // Confirm listener setup
    } else {
        console.error("Save button not found!");
    }



        // Live Preview Listeners (for static fields)
        const formElements = document.querySelectorAll('.builder-container input, .builder-container textarea, .builder-container select');
        formElements.forEach(el => {
            if (!el.closest('template')) { // Only non-template elements
                const eventType = (el.tagName === 'SELECT' || el.type === 'checkbox' || el.type === 'radio' || el.type === 'color') ? 'change' : 'input';
                el.addEventListener(eventType, updatePreview);
            }
        });
    
        // 'Add Section' Button Listeners
        document.getElementById('add-job-btn')?.addEventListener('click', (e) => addSectionEntry(e.target, 'work-experience-entries', 'job-entry-template'));
        document.getElementById('add-school-btn')?.addEventListener('click', (e) => addSectionEntry(e.target, 'education-entries', 'education-entry-template'));
        document.getElementById('add-training-btn')?.addEventListener('click', (e) => addSectionEntry(e.target, 'trainings-entries', 'training-entry-template')); // New
        document.getElementById('add-skill-category-btn')?.addEventListener('click', (e) => addSectionEntry(e.target, 'skills-entries', 'skill-category-template'));
        document.getElementById('add-project-btn')?.addEventListener('click', (e) => addSectionEntry(e.target, 'projects-entries', 'project-entry-template'));
        document.getElementById('add-certification-btn')?.addEventListener('click', (e) => addSectionEntry(e.target, 'certifications-entries', 'certification-entry-template')); // New
        document.getElementById('add-award-btn')?.addEventListener('click', (e) => addSectionEntry(e.target, 'awards-entries', 'award-entry-template')); // New
        document.getElementById('add-publication-btn')?.addEventListener('click', (e) => addSectionEntry(e.target, 'publications-entries', 'publication-entry-template')); // New
        document.getElementById('add-volunteer-btn')?.addEventListener('click', (e) => addSectionEntry(e.target, 'volunteering-entries', 'volunteering-entry-template')); // New
        document.getElementById('add-language-btn')?.addEventListener('click', (e) => addSectionEntry(e.target, 'languages-entries', 'language-entry-template'));
        document.getElementById('add-interest-btn')?.addEventListener('click', (e) => addSectionEntry(e.target, 'interests-entries', 'interest-entry-template')); // New
        document.getElementById('add-social-btn')?.addEventListener('click', (e) => addSectionEntry(e.target, 'social-media-entries', 'social-media-entry-template')); // New
        document.getElementById('add-reference-btn')?.addEventListener('click', (e) => addSectionEntry(e.target, 'references-entries', 'reference-entry-template')); // New
        document.getElementById('add-custom-section-btn')?.addEventListener('click', (e) => addSectionEntry(e.target, 'custom-sections-entries', 'custom-section-template'));
    
    
        // Remove Button Listeners (delegate from container - more efficient)
        const mainCardBody = document.querySelector('.builder-container .card-body');
        if (mainCardBody) {
            mainCardBody.addEventListener('click', function(event) {
                if (event.target.closest('.remove-entry-btn')) {
                    // Find the closest parent entry div and remove it
                    event.target.closest('.dynamic-entry')?.remove();
                    updatePreview(); // Update preview after removing
                }
            });
        }
    
        // Photo Upload/Remove (as before)
        const photoInput = document.getElementById('input-photo');
        const photoPreviewImg = document.getElementById('profile-photo-preview'); // Renamed variable for clarity
        const photoPreviewContainer = document.getElementById('photo-preview-container');
        const removePhotoButton = document.getElementById('remove-photo-btn');
    
        if (photoInput && photoPreviewImg && photoPreviewContainer && removePhotoButton) {
             photoInput.addEventListener('change', function() {
                 if (this.files && this.files[0]) {
                     const reader = new FileReader();
                     reader.onload = function(e) {
                         photoPreviewImg.src = e.target.result;
                         photoPreviewContainer.style.display = 'block';
                         removePhotoButton.style.display = 'inline-block';
                         updatePreview();
                     }
                     reader.readAsDataURL(this.files[0]);
                 }
             });
    
             removePhotoButton.addEventListener('click', () => {
                 photoInput.value = '';
                 photoPreviewImg.src = '#';
                 photoPreviewContainer.style.display = 'none';
                 removePhotoButton.style.display = 'none';
                 updatePreview();
             });
        }
      // --- Resume Builder Listeners (Comment out or remove if not needed) ---
      /*
      const formElements = document.querySelectorAll('.builder-container input, .builder-container textarea, .builder-container select');
      formElements.forEach(el => { ... });
      document.getElementById('add-job-btn')?.addEventListener(...);
      // ... other add buttons ...
      const mainCardBody = document.querySelector('.builder-container .card-body');
      if (mainCardBody) { mainCardBody.addEventListener('click', ...); }
      const photoInput = document.getElementById('input-photo');
      // ... photo logic ...
      */

          // --- NEW: AI Assist Button Listener (using event delegation) ---
    const builderContainer = document.querySelector('.builder-container');
    if (builderContainer) {
        builderContainer.addEventListener('click', (event) => {
            const aiButton = event.target.closest('.ai-assist-btn');
            if (aiButton) {
                handleAiAssist(aiButton);
            }
        });
    }

    // --- Load Data ---
    loadResumeForEditing();
  


  
  } 
  
  
// Initial preview is triggered by initLanguageSwitcher -> translatePage -> updatePreview

    // --- Placeholder for Download Function ---
    document.getElementById('download-resume-btn')?.addEventListener('click', () => {
        alert('Download functionality not implemented yet. This would typically involve using a library like jsPDF or a server-side rendering process.');
        // Example using jsPDF (requires including the library)
        /*
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const previewElement = document.getElementById('resume-preview-content');
        // Basic HTML rendering (might need html2canvas for better results)
        doc.html(previewElement, {
           callback: function (doc) {
             doc.save('resume.pdf');
           },
           x: 10,
           y: 10,
           width: 180, // Adjust width as needed for A4/Letter
           windowWidth: previewElement.scrollWidth
        });
        */
    });

     // --- Placeholder for Change Template ---
     document.getElementById('change-template-btn')?.addEventListener('click', () => {
         alert('Template switching functionality not implemented yet.');
         // This would involve:
         // 1. Having multiple CSS files or CSS rulesets for different templates.
         // 2. Changing a class on the preview container or body.
         // 3. Potentially adjusting the `updatePreview` function if HTML structure differs significantly between templates.
     });  


  // --- START OF FILE resumeBuilder.js ---
// ... (keep existing functions and initResumeBuilder start) ...

// --- NEW: AI Assist Handler ---
async function handleAiAssist(button) {
    const targetInputId = button.getAttribute('data-target');
    const promptType = button.getAttribute('data-prompt-type');
    const targetElement = document.getElementById(targetInputId);

    if (!targetElement || !promptType) {
        console.error("AI Assist button missing target or type.");
        return;
    }

    const originalButtonContent = button.innerHTML;
    button.disabled = true;
    button.innerHTML = `<span class="spinner-border spinner-border-sm" role="status"></span>`;

    try {
        let context = {};
        // Gather context based on promptType
        if (promptType === 'summary') {
             context.role = document.getElementById('input-role')?.value;
             // Simple skills context (could be improved)
             context.skills = Array.from(document.querySelectorAll('#skills-entries [data-input="skills_list"]')).map(el => el.value).join(', ');
             // Simple experience context (first job title)
             context.experience = document.querySelector('#work-experience-entries [data-input="job_title"]')?.value;
        } else if (promptType === 'job_description_bullets') {
            const entryDiv = button.closest('.dynamic-entry'); // Get parent entry
             context.jobTitle = entryDiv?.querySelector('[data-input="job_title"]')?.value;
             context.company = entryDiv?.querySelector('[data-input="company"]')?.value;
            // Add keywords if you have an input for them
        }
         // Add more context gathering for other types

        const currentUiLang = document.documentElement.lang || 'en'; // Get UI language
        const generatedText = await fetchResumeContentFromAI(promptType, context, currentUiLang);

        if (generatedText) {
             targetElement.value = generatedText; // Update the textarea/input
             updatePreview(); // Refresh preview
        } else {
            alert("AI could not generate content for this request.");
        }

    } catch (error) {
        console.error("AI Assist Error:", error);
        alert(`AI Assist failed: ${error.message}`);
    } finally {
         button.disabled = false;
         button.innerHTML = originalButtonContent;
    }
}


// ... (rest of resumeBuilder.js) ...
// --- END OF FILE resumeBuilder.js ---


// --- END OF FILE resumeBuilder.js ---