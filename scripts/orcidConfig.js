/**
 * Configuration for ORCID Publications Loader
 * 
 * To use the ORCID loader:
 * 1. Get your ORCID ID from https://orcid.org/
 * 2. Replace 'YOUR-ORCID-ID' below with your actual ORCID ID
 * 3. Make sure your ORCID profile is public or has public works
 * 
 * Example ORCID ID format: 0000-0000-0000-0000
 */

const ORCID_CONFIG = {
    // Replace this with your actual ORCID ID
    orcidId: '0009-0005-6731-1553',
    
    // Your name to highlight in author lists (can include variations)
    authorName: ['Vincent Jung', 'V. Jung', 'Jung, Vincent', 'Jung, V.'],
    
    // Optional: Customize which section to load publications into
    containerId: 'publications',
    
    // Optional: Show work type (article, conference paper, etc.)
    showType: true,
    
    // Optional: Maximum number of publications to display (0 = all)
    maxPublications: 0
};

// Export for use in orcidLoader.js
window.ORCID_CONFIG = ORCID_CONFIG;
