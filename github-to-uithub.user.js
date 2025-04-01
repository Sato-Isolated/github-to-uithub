// ==UserScript==
// @name         View on Uithub / Voir sur Uithub
// @name:en      View on Uithub
// @name:fr      Voir sur Uithub
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Adds a button on GitHub repository pages to access the corresponding Uithub page
// @description:en  Adds a button on GitHub repository pages to access the corresponding Uithub page
// @description:fr  Ajoute un bouton sur les pages GitHub pour accéder à la page Uithub correspondante
// @author       
// @match        https://github.com/*/*
// @grant        none
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

    function addButton() {
        // Prevent adding the button multiple times
        if (document.getElementById('button-uithub')) return;

        // Select the actions container (stars, forks, etc.)
        const container = document.querySelector('.pagehead-actions');
        if (!container) return;

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
        container.prepend(li);
    }

    // Add the button as soon as the page is fully loaded
    window.addEventListener('load', addButton);

    // Use a MutationObserver to handle dynamic navigation (PJAX)
    const target = document.getElementById('js-repo-pjax-container');
    if (target) {
        const observer = new MutationObserver(() => {
            addButton();
        });
        observer.observe(target, { childList: true, subtree: true });
    }
})();
