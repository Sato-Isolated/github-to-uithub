// ==UserScript==
// @name         View on Uithub / Voir sur Uithub
// @name:en      View on Uithub
// @name:fr      Voir sur Uithub
// @name:es      Ver en Uithub
// @name:de      Auf Uithub anzeigen
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Adds a button on GitHub repository pages to access the corresponding Uithub page
// @description:en  Adds a button on GitHub repository pages to access the corresponding Uithub page
// @description:fr  Ajoute un bouton sur les pages GitHub pour accéder à la page Uithub correspondante
// @description:es  Agrega un botón en las páginas de GitHub para acceder a la página Uithub correspondiente
// @description:de  Fügt einen Button auf GitHub-Repository-Seiten hinzu, um auf die entsprechende Uithub-Seite zuzugreifen
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
        },
        'es': {
            buttonText: 'Ver en Uithub',
            tooltipText: 'Abrir este repositorio en Uithub.com'
        },
        'de': {
            buttonText: 'Auf Uithub anzeigen',
            tooltipText: 'Dieses Repository auf Uithub.com öffnen'
        }
    };

    // Detect the browser's language (e.g., "fr", "en", etc.)
    const lang = (navigator.language || navigator.userLanguage).slice(0, 2);
    const localization = translations[lang] || translations['en'];

    function isRepoPage() {
        try {
            const pathParts = window.location.pathname.split('/');
            return pathParts.length >= 3 &&
                   !window.location.pathname.includes('/search') &&
                   !window.location.pathname.includes('/settings');
        } catch (error) {
            console.error('Error checking repository page:', error);
            return false;
        }
    }

    function createUithubUrl() {
        try {
            return window.location.href.replace('github.com', 'uithub.com');
        } catch (error) {
            console.error('Error creating Uithub URL:', error);
            return null;
        }
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

        try {
            // Create a <li> element for the button
            const li = document.createElement('li');

            // Create a link element that will serve as the button
            const a = document.createElement('a');
            a.id = 'button-uithub';
            a.textContent = localization.buttonText;
            a.className = 'btn btn-sm';
            a.title = localization.tooltipText;
            a.setAttribute('role', 'button');
            a.setAttribute('aria-label', localization.tooltipText);

            // Replace "github.com" with "uithub.com" in the current URL
            const uithubUrl = createUithubUrl();
            if (!uithubUrl) return;
            
            a.href = uithubUrl;
            a.target = '_blank';
            a.rel = 'noopener noreferrer';

            li.appendChild(a);

            // Add the button in the correct position
            if (container.classList.contains('pagehead-actions')) {
                container.prepend(li);
            } else {
                // For other containers, append at the end
                container.appendChild(li);
            }
        } catch (error) {
            console.error('Error adding Uithub button:', error);
        }
    }

    // Try to add the button with optimized retry strategy
    function initButton() {
        addButton();
        // Retry with fewer attempts but more reasonable delays
        [100, 1000].forEach(delay => {
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
        try {
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
        } catch (error) {
            console.error('Error setting up DOM observer:', error);
        }
    };

    // Start observing DOM changes
    observeDOM();
})();
