/**
 * ORCID Publications Loader
 * Fetches publications from ORCID API and displays them
 */

class ORCIDLoader {
    constructor(orcidId) {
        this.orcidId = orcidId;
        this.baseUrl = 'https://pub.orcid.org/v3.0';
        this.headers = {
            'Accept': 'application/json'
        };
    }

    /**
     * Fetch all works from ORCID
     */
    async fetchWorks() {
        try {
            const response = await fetch(`${this.baseUrl}/${this.orcidId}/works`, {
                headers: this.headers
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return data.group || [];
        } catch (error) {
            console.error('Error fetching ORCID works:', error);
            throw error;
        }
    }

    /**
     * Fetch detailed information for a specific work
     */
    async fetchWorkDetails(putCode) {
        try {
            const response = await fetch(`${this.baseUrl}/${this.orcidId}/work/${putCode}`, {
                headers: this.headers
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error(`Error fetching work details for ${putCode}:`, error);
            return null;
        }
    }

    /**
     * Highlight author name in the author list
     */
    highlightAuthorName(authorString, authorNames) {
        if (!authorNames || authorNames.length === 0) return authorString;
        
        let highlighted = authorString;
        authorNames.forEach(name => {
            // Create a case-insensitive regex that matches the name
            const regex = new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
            highlighted = highlighted.replace(regex, `<strong>$&</strong>`);
        });
        
        return highlighted;
    }

    /**
     * Process and format work data
     */
    formatWork(work, config = {}) {
        const title = work.title?.title?.value || 'Untitled';
        const journal = work['journal-title']?.value || '';
        const year = work['publication-date']?.year?.value || '';
        const type = work.type || '';
        const url = work.url?.value || '';
        
        // Extract authors - this can be complex as ORCID structure varies
        let authors = '';
        if (work.contributors && work.contributors.contributor) {
            const authorList = work.contributors.contributor
                .filter(c => c['contributor-attributes']?.['contributor-role'] === 'author')
                .map(c => {
                    const creditName = c['credit-name'];
                    return creditName ? creditName.value : 'Unknown Author';
                })
                .join(', ');
            authors = authorList || 'Unknown Authors';
            
            // Highlight the configured author name(s)
            if (config.authorName) {
                authors = this.highlightAuthorName(authors, config.authorName);
            }
        }

        return {
            title,
            authors,
            journal,
            year,
            type,
            url,
            raw: work
        };
    }

    /**
     * Load and display publications
     */
    async loadPublications(containerId = 'publications', config = {}) {
        const container = document.querySelector(`#${containerId}`);
        if (!container) {
            console.error(`Container #${containerId} not found`);
            return;
        }

        // Show loading message
        container.innerHTML = '<h2>Publications</h2><p>Loading publications from ORCID...</p>';

        try {
            const works = await this.fetchWorks();
            
            if (works.length === 0) {
                container.innerHTML = '<h2>Publications</h2><p>No publications found in ORCID.</p>';
                return;
            }

            // Fetch detailed information for each work
            const detailedWorks = [];
            for (const workGroup of works) {
                for (const workSummary of workGroup['work-summary']) {
                    const putCode = workSummary['put-code'];
                    const details = await this.fetchWorkDetails(putCode);
                    if (details) {
                        detailedWorks.push(this.formatWork(details, config));
                    }
                }
            }

            // Sort by year (newest first)
            detailedWorks.sort((a, b) => {
                const yearA = parseInt(a.year) || 0;
                const yearB = parseInt(b.year) || 0;
                return yearB - yearA;
            });

            // Generate HTML
            let html = '<h2>Publications</h2><div class="publications-list">';
            
            detailedWorks.forEach(work => {
                html += '<div class="publication-item">';
                
                if (work.url) {
                    html += `<h3><a href="${work.url}" target="_blank">${work.title}</a></h3>`;
                } else {
                    html += `<h3>${work.title}</h3>`;
                }
                
                html += `<p class="authors">${work.authors}</p>`;
                
                if (work.journal) {
                    html += `<p class="journal"><em>${work.journal}</em>`;
                    if (work.year) {
                        html += ` (${work.year})`;
                    }
                    html += '</p>';
                } else if (work.year) {
                    html += `<p class="year">${work.year}</p>`;
                }
                
                if (work.type) {
                    html += `<p class="type"><small>Type: ${work.type}</small></p>`;
                }
                
                html += '</div>';
            });
            
            html += '</div>';
            container.innerHTML = html;

        } catch (error) {
            console.error('Error loading ORCID publications:', error);
            container.innerHTML = `
                <h2>Publications</h2>
                <p>Error loading publications from ORCID. Please try again later.</p>
                <p><small>Error: ${error.message}</small></p>
            `;
        }
    }
}

// Initialize and load publications when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Get configuration
    const config = window.ORCID_CONFIG || {};
    const orcidId = config.orcidId || 'YOUR-ORCID-ID';
    
    if (orcidId === 'YOUR-ORCID-ID') {
        const container = document.querySelector('#publications');
        if (container) {
            container.innerHTML = `
                <h2>Publications</h2>
                <p>To display publications from ORCID:</p>
                <ol>
                    <li>Open <code>scripts/orcidConfig.js</code></li>
                    <li>Replace <code>YOUR-ORCID-ID</code> with your actual ORCID ID</li>
                    <li>Save the file and refresh this page</li>
                </ol>
                <p>Your ORCID ID can be found at <a href="https://orcid.org/" target="_blank">orcid.org</a></p>
            `;
        }
        console.warn('Please set your ORCID ID in scripts/orcidConfig.js');
        return;
    }
    
    const loader = new ORCIDLoader(orcidId);
    loader.loadPublications(config.containerId || 'publications', config);
});
