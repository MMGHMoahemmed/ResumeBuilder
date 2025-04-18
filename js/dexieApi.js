// --- START OF FILE dexieApi.js ---

const db = new Dexie('AiResumeBuilderDB');

db.version(2).stores({ // <---- UPDATE VERSION NUMBER
  resumes: '++id, name, createdAt, updatedAt',
  settings: '&key',
  coverLetters: '++id, name, createdAt, updatedAt' // Add new table
}).upgrade(tx => {
    // Example upgrade function if you need complex migration later
    console.log("Upgrading database schema to version 2...");
    // No specific migration needed for just adding a table in this simple case
});

// --- Database Helper Functions ---

// Settings
async function saveSetting(key, value) {
  try {
    await db.settings.put({ key: key, value: value });
    console.log(`Setting '${key}' saved.`);
    return true;
  } catch (error) {
    console.error(`Error saving setting '${key}':`, error);
    return false;
  }
}

async function getSetting(key) {
  try {
    const setting = await db.settings.get(key);
    return setting ? setting.value : undefined;
  } catch (error) {
    console.error(`Error getting setting '${key}':`, error);
    return undefined;
  }
}

// Resumes (CRUD)
async function saveResume(resumeData, resumeId = null) {
  const now = new Date();
  const dataToSave = {
    ...resumeData, // Spread the collected form data
    updatedAt: now,
  };

  try {
    if (resumeId) {
      // Update existing resume
      dataToSave.id = resumeId;
      await db.resumes.put(dataToSave);
      console.log(`Resume ID ${resumeId} updated.`);
      return resumeId;
    } else {
      // Add new resume
      dataToSave.createdAt = now;
      // Ensure 'name' exists for indexing, use a default if missing
      if (!dataToSave.personalInfo || !dataToSave.personalInfo.name) {
           dataToSave.name = `Untitled Resume ${now.toLocaleString()}`;
           if (!dataToSave.personalInfo) dataToSave.personalInfo = {};
           dataToSave.personalInfo.name = dataToSave.name; // Add to personalInfo as well
      } else {
          dataToSave.name = dataToSave.personalInfo.name;
      }

      const newId = await db.resumes.add(dataToSave);
      console.log(`New resume saved with ID: ${newId}`);
      return newId;
    }
  } catch (error) {
    console.error("Error saving resume:", error);
    return null;
  }
}

async function getResume(id) {
    if (!id) return null;
    try {
        const resume = await db.resumes.get(parseInt(id)); // Ensure ID is number
        console.log(`Retrieved resume ID ${id}:`, resume);
        return resume;
    } catch (error) {
        console.error(`Error getting resume ID ${id}:`, error);
        return null;
    }
}

async function getAllResumes() {
    try {
        // Sort by last updated, newest first
        const resumes = await db.resumes.orderBy('updatedAt').reverse().toArray();
        console.log("Retrieved all resumes:", resumes);
        return resumes;
    } catch (error) {
        console.error("Error getting all resumes:", error);
        return [];
    }
}

async function deleteResume(id) {
    if (!id) return false;
    try {
        await db.resumes.delete(parseInt(id)); // Ensure ID is number
        console.log(`Resume ID ${id} deleted.`);
        return true;
    } catch (error) {
        console.error(`Error deleting resume ID ${id}:`, error);
        return false;
    }
}

async function duplicateResume(id) {
    if (!id) return null;
    try {
        const originalResume = await getResume(id);
        if (!originalResume) return null;

        // Create a deep copy and remove the original ID
        const newResumeData = JSON.parse(JSON.stringify(originalResume));
        delete newResumeData.id;

        // Update name and timestamps
        newResumeData.name = `Copy of ${originalResume.name}`;
        if (newResumeData.personalInfo) {
            newResumeData.personalInfo.name = newResumeData.name;
        }
        const now = new Date();
        newResumeData.createdAt = now;
        newResumeData.updatedAt = now;

        // Save the duplicated resume as a new entry
        const newId = await saveResume(newResumeData); // saveResume handles adding 'name' and 'createdAt'
        console.log(`Duplicated resume ID ${id} into new ID ${newId}`);
        return newId; // Return the ID of the new duplicate
    } catch (error) {
        console.error(`Error duplicating resume ID ${id}:`, error);
        return null;
    }
}




// --- NEW: Cover Letter Helper Functions ---

async function saveCoverLetter(coverLetterData, coverLetterId = null) {
  const now = new Date();
  const dataToSave = {
    ...coverLetterData, // Spread the collected data
    updatedAt: now,
  };

  try {
    if (coverLetterId) {
      // Update existing
      dataToSave.id = coverLetterId;
      await db.coverLetters.put(dataToSave);
      console.log(`Cover Letter ID ${coverLetterId} updated.`);
      return coverLetterId;
    } else {
      // Add new
      dataToSave.createdAt = now;
      // Ensure 'name' exists
      if (!dataToSave.name) {
           dataToSave.name = `Untitled Cover Letter ${now.toLocaleString()}`;
      }
      const newId = await db.coverLetters.add(dataToSave);
      console.log(`New Cover Letter saved with ID: ${newId}`);
      return newId;
    }
  } catch (error) {
    console.error("Error saving cover letter:", error);
    return null;
  }
}

async function getCoverLetter(id) {
    if (!id) return null;
    try {
        const letter = await db.coverLetters.get(parseInt(id));
        console.log(`Retrieved cover letter ID ${id}:`, letter);
        return letter;
    } catch (error) {
        console.error(`Error getting cover letter ID ${id}:`, error);
        return null;
    }
}

async function getAllCoverLetters() { // For potential future list page
    try {
        const letters = await db.coverLetters.orderBy('updatedAt').reverse().toArray();
        console.log("Retrieved all cover letters:", letters);
        return letters;
    } catch (error) {
        console.error("Error getting all cover letters:", error);
        return [];
    }
}

async function deleteCoverLetter(id) {
    if (!id) return false;
    try {
        await db.coverLetters.delete(parseInt(id));
        console.log(`Cover Letter ID ${id} deleted.`);
        return true;
    } catch (error) {
        console.error(`Error deleting cover letter ID ${id}:`, error);
        return false;
    }
}



// Add other helper functions as needed

// --- END OF FILE dexieApi.js ---