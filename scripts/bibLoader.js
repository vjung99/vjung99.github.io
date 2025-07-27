document.addEventListener('DOMContentLoaded', async () => {
    const pubSection = document.querySelector('#publications');
    if (!pubSection) return;
    
    // Get author name configuration
    const config = window.ORCID_CONFIG || {};
    const authorNames = config.authorName || ['Vincent Jung', 'V. Jung'];
    
    // Function to highlight author name
    function highlightAuthorName(authorString, authorNames) {
        if (!authorNames || authorNames.length === 0) return authorString;
        
        let highlighted = authorString;
        authorNames.forEach(name => {
            // Create a case-insensitive regex that matches the name
            const regex = new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
            highlighted = highlighted.replace(regex, `<strong>$&</strong>`);
        });
        
        return highlighted;
    }
    
    try {
        const response = await fetch('bibliography.bib');
        const bibContent = await response.text();
        // Simple splitting on '@' (ignoring empty leading entry)
        const entries = bibContent.split('@').filter(entry => entry.trim());
        let html = '<ul>';
        entries.forEach(raw => {
            // Re-add "@" to each entry and parse minimal fields using regex
            const entry = '@' + raw;
            const titleMatch = entry.match(/title\s*=\s*\{([^}]+)\}/i);
            const authorMatch = entry.match(/author\s*=\s*\{([^}]+)\}/i);
            const yearMatch = entry.match(/year\s*=\s*\{([^}]+)\}/i);
            const title = titleMatch ? titleMatch[1] : 'No Title';
            const author = authorMatch ? authorMatch[1] : 'Unknown Author';
            const year = yearMatch ? yearMatch[1] : 'n.d.';
            
            // Highlight author name
            const highlightedAuthor = highlightAuthorName(author, authorNames);
            
            html += `<li><strong>${title}</strong><br>${highlightedAuthor} (${year})</li>`;
        });
        html += '</ul>';
        pubSection.innerHTML = html;
    } catch (error) {
        console.error('Error loading bibliography:', error);
    }
});
