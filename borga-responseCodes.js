'use strict';

function buildErrorList() {
	const errors = {};
	
	function addError(code, name, message) {
		errors[name] = info => {
			return { code, name, message, info };
		};
	}
	
	addError(1000, 'FAIL', "An error occurred");
	addError(1001, 'EXT_SVC_FAIL', "External service failure");
	addError(1002, 'NOT_FOUND', "The item does not exist");
	addError(1003, 'MISSING_PARAM', 'Required parameter missing');
	addError(1004, 'INVALID_PARAM', 'Invalid value for parameter');
	addError(1005, 'UNAUTHENTICATED', 'Invalid or missing token');
	
	return errors;
}

function buildSuccessList() {
	const successes = {};
	
	function addSuccess(code, name, message) {
		successes[name] = info => {
			return { code, name, message, info };
		};
	}
	
	addSuccess(1000, 'SUCCESS', "a success occurred");
	addSuccess(1001, 'FOUND', "The item exists");
    addSuccess(1002, 'GROUP_CREATED', 'Group created successfully');
    addSuccess(1003, 'GROUP_DELETED', 'Group deleted successfully');
    addSuccess(1004, 'GROUP_MODIFIED', 'Group modified successfully');
    addSuccess(1005, 'GAME_ADDED', 'Game added to group successfully');
    addSuccess(1006, 'GAME_REMOVED', 'Game removed from group successfully');
	addSuccess(1007, 'USER_ADDED', 'User added successfully');
	
	return successes;
}

const errorList = buildErrorList();
const successList = buildSuccessList();

module.exports = {errorList, successList};
