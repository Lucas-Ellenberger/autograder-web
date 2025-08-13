import * as Base from './base.js';
import * as Event from './event.js';
import * as Routing from './routing.js';
import * as TestUtil from './test/util.js';

test("Enrolled Courses", async function() {
    Base.init(false);

    await TestUtil.loginUser("course-student");
    await navigateToEnrolledCourses();

    TestUtil.checkPageBasics('Enrolled Courses', 'enrolled courses');

    const expectedLabelNames = [
        'Course 101',
        'Course Using Different Languages',
    ];
    TestUtil.checkCards(expectedLabelNames);
});

test("Nav Course101", async function() {
    Base.init(false);

    await TestUtil.loginUser("course-student");

    let targetCourse = 'course101';
    await navigateToCourse(targetCourse);

    TestUtil.checkPageBasics(targetCourse, 'course');

    const expectedLabelNames = [
        'Homework 0',
        'Email Users',
        'List Users',
    ];
    TestUtil.checkCards(expectedLabelNames);
});

async function navigateToEnrolledCourses() {
    let pathComponents = {
        'path': Routing.PATH_COURSES,
    };

    let coursesRenderedPromise = Event.getEventPromise(Event.EVENT_TYPE_ROUTING_COMPLETE, pathComponents);

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

    let courseRenderedPromise = Event.getEventPromise(Event.EVENT_TYPE_ROUTING_COMPLETE, pathComponents);

    Routing.routeComponents(pathComponents);
    await courseRenderedPromise;
}
