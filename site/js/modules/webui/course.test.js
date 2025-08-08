import * as TestUtil from '../autograder/test/server.js'

import * as Base from './base.js'
import * as LoginUtil from './login.test.js'

test("Enrolled Courses", function() {
    Base.init(false);

    return LoginUtil.loginUser("course-student")
        .then(function() {
            return navigateToEnrolledCourses()
                .then(function() {
                    expect(document.title).toContain('Enrolled Courses');
                    expect(document.querySelector('.header .page-title span').textContent).toBe('Enrolled Courses');

                    let pageContent = document.querySelector('.page-body .content[data-page="enrolled courses"]');
                    expect(pageContent).not.toBeNull();

                    const course101Link = pageContent.querySelector('a[href="#course?course=course101"]');
                    const courseLangLink = pageContent.querySelector('a[href="#course?course=course-languages"]');

                    expect(course101Link).not.toBeNull();
                    expect(courseLangLink).not.toBeNull();
                })
            ;
        })
    ;
});

test("Nav Course101", function() {
    Base.init(false);

    let targetCourse = 'course101';

    return LoginUtil.loginUser("course-student")
        .then(function() {
            return navigateToCourse(targetCourse)
                .then(function() {
                    expect(document.title).toContain(targetCourse);
                    expect(document.querySelector('.header .page-title span').textContent).toBe('course101');

                    let pageContent = document.querySelector('.page-body .content[data-page="course"]');
                    expect(pageContent).not.toBeNull();

                    expect(pageContent.querySelector('h2').textContent).toBe('Course 101');
                    expect(pageContent.querySelector(`.cards-area .card-assignment a[href="#course/assignment?assignment=hw0&course=${targetCourse}"]`)).not.toBeNull();
                })
            ;
        })
    ;
});

function navigateToEnrolledCourses() {
    let courseLink = document.querySelector(`.nav .nav-item[data-target="courses"] a`);

    let changedToEnrolledCoursesPage = TestUtil.waitForDOMChange('.page-body .content[data-page="enrolled courses"]');
    courseLink.click();

    return changedToEnrolledCoursesPage;
}

function navigateToCourse(courseID) {
    return navigateToEnrolledCourses()
        .then(function() {
            const courseLink = document.querySelector(`.page-body .content[data-page="enrolled courses"] a[href="#course?course=${courseID}"]`);
            courseLink.click();

            return TestUtil.waitForDOMChange(`.page-body .content[data-page="course"]`);
        })
    ;
}

export {
    navigateToEnrolledCourses,
}
