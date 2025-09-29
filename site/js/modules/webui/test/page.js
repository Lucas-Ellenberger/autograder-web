import * as Core from '../core/index.js';

function checkCards(expectedLabelNames) {
    const courseCardSpans = document.querySelectorAll('.cards-area .card span');
    let actualLabelNames = courseCardSpans.values().map(function(element) {
        return element.textContent;
    }).toArray();

    expect(actualLabelNames).toStrictEqual(expectedLabelNames);
}

function checkPageBasics(title, dataPage) {
    expect(document.title).toContain(title);

    let pageContent = document.querySelector(`.page-body .content[data-page="${dataPage}"]`);
    expect(pageContent).not.toBeNull();
}

async function submitTemplate() {
    let resultWaitPromise = Core.Event.getEventPromise(Core.Event.EVENT_TYPE_TEMPLATE_RESULT_COMPLETE);
    document.querySelector('.template-button').click();
    await resultWaitPromise;
}

export {
    checkCards,
    checkPageBasics,
    submitTemplate,
}
