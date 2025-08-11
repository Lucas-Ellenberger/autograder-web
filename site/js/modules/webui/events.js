const DEFAULT_TIMEOUT = 3000;

const HANDLER_COMPLETED = 'Handler Completed';

class EventManager {
    constructor() {
        this.eventElement = document.createElement(`div`);
        this.listeners = new Map();
    }

    // Create an event with the given name and optional details.
    createEvent(eventName, details = {}) {
        return new CustomEvent(eventName, {
            detail: details,
        });
    }

    // Add an event listener with optional filtering.
    // TODO: Describe the details.
    addEventListener(eventName, onEventFunc, details = undefined) {
        // The function keyword create a new 'this' context.
        // Store a reference to 'this' in self to preserve context.
        const self = this;
        const onEventFuncWithFilter = function(event) {
            console.debug(`Incoming event: '${eventName}' with event details: '${JSON.stringify(event.detail)}' and target details: '${JSON.stringify(details)}'.`);
            if (self.matchesFilter(event.detail, details)) {
                onEventFunc(event);
            }
        }

        this.eventElement.addEventListener(eventName, onEventFuncWithFilter);

        const listenerId = Symbol('listener');
        this.listeners.set(listenerId, {
            eventName,
            callback: onEventFuncWithFilter,
        });

        const cleanup = function() {
            self.eventElement.removeEventListener(eventName, onEventFuncWithFilter);
            self.listeners.delete(listenerId);
        };

        return cleanup;
    }

    // Dispatch an event with the given name and optional details.
    dispatchEvent(eventName, details = {}) {
        const customEvent = this.createEvent(eventName, details);
        this.eventElement.dispatchEvent(customEvent);
    }

    matchesFilter(eventDetails, details) {
        if ((!details) || (Object.keys(details).length === 0)) {
            return true;
        }

        return Object.entries(details).every(function([key, value]) {
            return eventDetails[key] === value;
        });
    }

    // Cleanup all listeners from the event manager.
    removeAllListeners() {
        for (const listener of Object.values(this.listeners)) {
            this.eventElement.removeEventListener(listener.eventName, listener.onEventFuncWithFilter);
        }

        this.listeners.clear();
    }

    waitForEvent(eventName, details = undefined, timeout = DEFAULT_TIMEOUT) {
        const self = this;
        return new Promise(function(resolve, reject) {
            let timeoutId;

            const cleanup = self.addEventListener(eventName, function(event) {
                if (timeoutId) {
                    clearTimeout(timeoutId);
                }

                resolve(event);
            }, details);

            if (timeout) {
                timeoutId = setTimeout(function() {
                    cleanup();
                    reject(new Error(`Timeout: Event '${eventName}' timed out after ${timeout}ms.`));
                }, timeout);
            }
        });
    }
}

const eventManager = new EventManager();

export {
    eventManager,

    HANDLER_COMPLETED,
};
