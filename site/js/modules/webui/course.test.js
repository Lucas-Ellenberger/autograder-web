import * as Base from './base.js';
import * as TestUtil from './test/util.js';

test("Enrolled Courses", async function() {
    Base.init(false);

    await TestUtil.loginUser("course-student");
    await navigateToEnrolledCourses();

    expect(document.title).toContain('Enrolled Courses');
    expect(document.querySelector('.header .page-title span').textContent).toBe('Enrolled Courses');

    let pageContent = document.querySelector('.page-body .content[data-page="enrolled courses"]');
    expect(pageContent).not.toBeNull();

    const course101Link = pageContent.querySelector('a[href="#course?course=course101"]');
    const courseLangLink = pageContent.querySelector('a[href="#course?course=course-languages"]');

    expect(course101Link).not.toBeNull();
    expect(courseLangLink).not.toBeNull();
});

test("Nav Course101", async function() {
    Base.init(false);

    await TestUtil.loginUser("course-student");

    let targetCourse = 'course101';
    await navigateToCourse(targetCourse);

    expect(document.title).toContain(targetCourse);
    expect(document.querySelector('.header .page-title span').textContent).toBe(targetCourse);

    let pageContent = document.querySelector('.page-body .content[data-page="course"]');
    expect(pageContent).not.toBeNull();

    expect(pageContent.querySelector('h2').textContent).toBe('Course 101');
    expect(pageContent.querySelector(`.cards-area .card-assignment a[href="#course/assignment?assignment=hw0&course=${targetCourse}"]`)).not.toBeNull();
});

function navigateToEnrolledCourses() {
    let changedToEnrolledCoursesPage = TestUtil.waitForDOMChange('.page-body .content[data-page="enrolled courses"]');

    window.location.hash = '#courses';
    return changedToEnrolledCoursesPage;
}

async function navigateToCourse(courseID) {
    await navigateToEnrolledCourses();

    window.location.hash = '#course?course=course101';
    return TestUtil.waitForDOMChange(`.page-body .content[data-page="course"]`);
}

export {
    navigateToEnrolledCourses,
};
