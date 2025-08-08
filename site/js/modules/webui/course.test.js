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
                    expect(document.querySelector('.content[data-page="enrolled courses"]')).not.toBeNull();

                    const course101Link = document.querySelector('a[href="#course?course=course101"]');
                    const courseLangLink = document.querySelector('a[href="#course?course=course-languages"]');

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
                    expect(document.querySelector('.content[data-page="course"]')).not.toBeNull();

                    expect(document.querySelector('.page-title span').textContent).toBe('course101');
                    expect(document.querySelector('h2').textContent).toBe('Course 101');

                    expect(document.querySelector('a[href="#course/assignment?assignment=hw0&course=course101"]')).not.toBeNull();
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
            const courseLink = document.querySelector(`a[href="#course?course=${courseID}"]`);
            courseLink.click();

            return TestUtil.waitForDOMChange(`.page-body .content[data-page="course"]`);
        })
    ;
}

export {
    navigateToEnrolledCourses,
}
