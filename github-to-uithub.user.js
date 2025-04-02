// ==UserScript==
// @name         View on Uithub / Voir sur Uithub
// @name:en      View on Uithub
// @name:fr      Voir sur Uithub
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Adds a button on GitHub repository pages to access the corresponding Uithub page
// @description:en  Adds a button on GitHub repository pages to access the corresponding Uithub page
// @description:fr  Ajoute un bouton sur les pages GitHub pour accéder à la page Uithub correspondante
// @author       MindLated
// @match        https://github.com/*/*
// @grant        none
// @homepageURL  https://github.com/Sato-Isolated/github-to-uithub
// @supportURL   https://github.com/Sato-Isolated/github-to-uithub/issues
// ==/UserScript==

(function() {
    'use strict';

    // Dictionary for translations
    const translations = {
        'fr': {
            buttonText: 'Voir sur Uithub',
            tooltipText: 'Ouvrir ce dépôt sur Uithub.com'
        },
        'en': {
            buttonText: 'View on Uithub',
            tooltipText: 'Open this repository on Uithub.com'
        }
    };

    // Detect the browser's language (e.g., "fr", "en", etc.)
    const lang = (navigator.language || navigator.userLanguage).slice(0, 2);
    const localization = translations[lang] || translations['en'];

    function isRepoPage() {
        // Check if we're on a repository page
        return window.location.pathname.split('/').length >= 3 &&
               !window.location.pathname.includes('/search') &&
               !window.location.pathname.includes('/settings');
    }

    function addButton() {
        // Only proceed if we're on a repo page
        if (!isRepoPage()) return;

        // Prevent adding the button multiple times
        if (document.getElementById('button-uithub')) return;

        // Try different selectors for the container
        const containerSelectors = [
            '.pagehead-actions',
            '.file-navigation',
            '.repository-content'
        ];

        let container = null;
        for (const selector of containerSelectors) {
            container = document.querySelector(selector);
            if (container) break;
        }

        if (!container) {
            // If no container found, retry after a short delay
            setTimeout(addButton, 500);
            return;
        }

        // Create a <li> element for the button
        const li = document.createElement('li');

        // Create a link element that will serve as the button
        const a = document.createElement('a');
        a.id = 'button-uithub';
        a.textContent = localization.buttonText;
        a.className = 'btn btn-sm';
        a.title = localization.tooltipText;
        
        // Replace "github.com" with "uithub.com" in the current URL
        const uithubUrl = window.location.href.replace('github.com', 'uithub.com');
        a.href = uithubUrl;
        a.target = '_blank';
        
        li.appendChild(a);

        // Add the button in the correct position
        if (container.classList.contains('pagehead-actions')) {
            container.prepend(li);
        } else {
            // For other containers, append at the end
            container.appendChild(li);
        }
    }

    // Try to add the button multiple times to handle slow page loads
    function initButton() {
        addButton();
        // Retry a few times with increasing delays
        [100, 500, 1000, 2000].forEach(delay => {
            setTimeout(addButton, delay);
        });
    }

    // Add the button as soon as possible
    if (document.readyState === 'loading') {
        window.addEventListener('DOMContentLoaded', initButton);
    } else {
        initButton();
    }

    // Use a MutationObserver to handle dynamic navigation (PJAX)
    const observeDOM = () => {
        const targetNode = document.body;
        const config = { childList: true, subtree: true };
        const observer = new MutationObserver((mutationsList) => {
            for (const mutation of mutationsList) {
                if (mutation.type === 'childList' && isRepoPage()) {
                    addButton();
                }
            }
        });
        observer.observe(targetNode, config);
    };

    // Start observing DOM changes
    observeDOM();
})();
