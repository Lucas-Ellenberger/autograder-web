import * as Base from './base.js';
import * as Event from './event.js';
import * as Routing from './routing.js';
import * as TestUtil from './test/util.js';

test("Enrolled Courses", async function() {
    Base.init(false);

    await TestUtil.loginUser("course-student");
    await navigateToEnrolledCourses();

    expect(document.title).toContain('Enrolled Courses');

    let pageContent = document.querySelector('.page-body .content[data-page="enrolled courses"]');
    expect(pageContent).not.toBeNull();

    const courseCardSpans = pageContent.querySelectorAll('.cards-area .card span');
    expect(courseCardSpans[0].textContent).toBe('Course 101');
    expect(courseCardSpans[1].textContent).toBe('Course Using Different Languages');
});

test("Nav Course101", async function() {
    Base.init(false);

    await TestUtil.loginUser("course-student");

    let targetCourse = 'course101';
    await navigateToCourse(targetCourse);

    expect(document.title).toContain(targetCourse);

    let pageContent = document.querySelector('.page-body .content[data-page="course"]');
    expect(pageContent.querySelector('h2').textContent).toBe('Course 101');
    expect(pageContent.querySelector(`.cards-area .card-assignment a[href="#course/assignment?assignment=hw0&course=${targetCourse}"]`)).not.toBeNull();
});

async function navigateToEnrolledCourses() {
    let pathComponents = {
        'path': Routing.PATH_COURSES,
    };

    let coursesRenderedPromise = Event.getEventPromise(Event.ROUTING_COMPLETED, pathComponents);

    Routing.routeComponents(pathComponents);
    await coursesRenderedPromise;
}

async function navigateToCourse(courseId) {
    let pathComponents = {
        'path': Routing.PATH_COURSE,
        'params': {
            [Routing.PARAM_COURSE]: courseId,
        },
    };

    let courseRenderedPromise = Event.getEventPromise(Event.ROUTING_COMPLETED, pathComponents);

    Routing.routeComponents(pathComponents);
    await courseRenderedPromise;
}
