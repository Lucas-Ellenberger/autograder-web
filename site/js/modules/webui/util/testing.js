let _testingMode = false;

function isTestingMode() {
    return _testingMode;
}

function setTestingMode(value) {
    _testingMode = value;
}

export {
    isTestingMode,
    setTestingMode,
}
