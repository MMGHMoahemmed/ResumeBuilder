// --- START OF FILE main.js ---

document.addEventListener('DOMContentLoaded', () => {

    // --- Initialization ---
    initThemeSwitcher(); // From themeAndLanguage.js
    initLanguageSwitcher(); // From themeAndLanguage.js

    // Call page-specific initializers
    if (typeof initResumeBuilder === 'function') {
        initResumeBuilder();
    }
    if (typeof initAiJobTrainer === 'function') {
        initAiJobTrainer();
    }
    if (typeof initSettingsPage === 'function') {
        initSettingsPage();
    }
    if (typeof initMyResumesPage === 'function') {
        initMyResumesPage();
    }
     // --- NEW ---
     if (typeof initCoverLetterPage === 'function' && document.getElementById('cover-letter-preview')) { // Add check for cover letter page
        initCoverLetterPage();
    }

   // Remove generic initEventListeners() call if it exists here





});

   // --- ADD THIS FUNCTION HERE ---
   function showNotification(message, type = 'info') { // type can be 'info', 'success', 'warning', 'danger'
    const container = document.getElementById('notification-container');
    const template = document.getElementById('notification-template');
    if (!container || !template) {
         console.error("Notification container or template not found!");
         // Fallback if elements are missing
         alert(`${type.toUpperCase()}: ${message}`);
         return;
    }

    try {
        const clone = template.content.firstElementChild.cloneNode(true);
        clone.querySelector('.toast-body').textContent = message;

        // Set background color based on type
        let bgColorClass = 'bg-primary'; // Default to info
        if (type === 'success') bgColorClass = 'bg-success';
        else if (type === 'warning') bgColorClass = 'bg-warning text-dark'; // Dark text for warning
        else if (type === 'danger') bgColorClass = 'bg-danger';
        clone.classList.add(bgColorClass);

        container.appendChild(clone);

        const toast = new bootstrap.Toast(clone, { delay: 5000 }); // Auto-hide after 5s
        toast.show();

        // Remove the element after it's hidden
        clone.addEventListener('hidden.bs.toast', () => {
            clone.remove();
        });
    } catch (error) {
        console.error("Error creating notification:", error);
         alert(`${type.toUpperCase()}: ${message}`); // Fallback alert on error
    }
}


// --- END OF FILE main.js ---