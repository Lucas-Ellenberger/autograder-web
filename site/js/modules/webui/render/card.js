import * as Autograder from '../../autograder/index.js';
import * as Icon from './icon.js';
import * as Util from '../util/index.js';

class Card {
    constructor(
        type = 'unknown', text = '', link = '#',
        {
            minServerRole = Autograder.Common.SERVER_ROLE_UNKNOWN,
            minCourseRole = Autograder.Common.COURSE_ROLE_UNKNOWN,
            courseId = undefined,
        } = {}) {
        // An optional card type that is added to the HTML class list.
        this.type = type;

        // The display test of the card.
        this.text = text;

        // Routes to this link when the card is clicked.
        // All routes must start with a '#'.
        this.link = link;

        // The minimum server role a user needs to have to view this card.
        this.minServerRole = minServerRole;

        // The minimum course role a user needs to have to view this card.
        this.minCourseRole = minCourseRole;

        // The course that is used for the course role check.
        this.courseId = courseId;

        this.validate();
    }

    validate() {
        if (!this.link.startsWith('#')) {
            console.error(`A card link must start with a '#': '${this.link}'.`);
        }

        if (!Number.isInteger(this.minServerRole)) {
            console.error('A card must have an integer value for the min server role.');
        }

        if (!Number.isInteger(this.minCourseRole)) {
            console.error('A card must have an integer value for the min course role.');
        }
    }

    toHTML() {
        return `
            <div class='card card-${this.type} tertiary-color drop-shadow'>
                <a href='${this.link}' alt='${this.text}'>
                    <span>${this.text}</span>
                </a>
            </div>
        `;
    }

    // Signals the card should be hidden based on the context user's roles.
    isHidden(context) {
        const userServerRole = Autograder.Common.getServerRoleValue(context?.user?.role);

        // Never hide cards from server admins or above.
        if (userServerRole >= Autograder.Common.SERVER_ROLE_ADMIN) {
            return false;
        }

        if (this.minServerRole > userServerRole) {
            return true;
        }

        const course = context?.user?.courses[this.courseId];
        const userCourseRole = Autograder.Common.getCourseRoleValue(course?.role);

        if (this.minCourseRole > userCourseRole) {
            return true;
        }

        return false;
    }
}

// Render some cards to html.
// This function takes ownership of the list of cards.
function makeCards(context, cards) {
    cards.sort(function(a, b) {
        return Util.caseInsensitiveStringCompare(a.text, b.text);
    });

    let html = [];
    for (const card of cards) {
        if (card.isHidden(context)) {
            continue;
        }

        html.push(card.toHTML());
    }

    if (html.length === 0) {
        return undefined;
    }

    return `
        <div class='cards-area'>
            ${html.join("\n")}
        </div>
    `;
}

// Render a list of card sections to html.
// A card section is [section name, a list of cards].
function makeCardSections(context, sectionsName, sections, iconName = Icon.ICON_NAME_DEFAULT) {
    let cardSections = [];
    for (const section of sections) {
        cardSections.push(makeCardSection(context, section[0], section[1]));
    }

    let headerClasses = 'secondary-color drop-shadow';
    if (sectionsName === '') {
        headerClasses += ' hidden';
    }

    return `
        <div class='card-header ${headerClasses}'>
            ${Icon.getIconHTML(iconName)}
            <div class='card-title'>
                <h1>${sectionsName}</h1>
            </div>
        </div>
        <div class='card-sections'>
            ${cardSections.join("\n")}
        </div>
    `;
}

// Render a section name and some cards to html.
function makeCardSection(context, sectionName, sectionCards) {
    const cardHTML = makeCards(context, sectionCards);
    if (!cardHTML) {
        return '';
    }

    return `
        <div class='card-section secondary-color drop-shadow'>
            <h2>${sectionName}</h2>
            ${cardHTML}
        </div>
    `;
}

export {
    Card,

    makeCards,
    makeCardSection,
    makeCardSections,
};
