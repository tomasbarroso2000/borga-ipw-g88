'use strict';

function buildSuccessList() {
	const successes = {};
	
	function addSuccess(code, name, message) {
		successes[name] = info => {
			return { code, name, message, info };
		};
	}
	
	addSuccess(1000, 'SUCCESS', "a success occurred");
	addSuccess(1001, 'FOUND', "The item existS");
    addSuccess(1002, 'GROUP_CREATED', 'Group created successfully');
    addSuccess(1003, 'GROUP_DELETED', 'Group deleted successfully');
    addSuccess(1004, 'GROUP_MODIFIED', 'Group modified successfully');
    addSuccess(1005, 'GAME_ADDED', 'Game added to group successfully');
    addSuccess(1006, 'GAME_REMOVED', 'Game removed from group successfully');
	
	return successes;
}

const successList = buildSuccessList();

module.exports = successList;
