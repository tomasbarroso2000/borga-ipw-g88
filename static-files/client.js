'use strict';

function setupForGroupDelete() {
	const deleteButtons =
		document.querySelectorAll('.cls-del-but');
	deleteButtons.forEach(butDel => {
		butDel.onclick = onDeleteGroup;
	});
	return;

	async function onDeleteGroup() {
		const groupId = this.id.substr(8);
		console.log(groupId);
		try {
			await apiDeleteGroup(groupId);
			deleteTableEntry(groupId);
		} catch (err) {
			alert(err);
		}
	}

	async function apiDeleteGroup(groupId) {
		const delReqRes = await fetch(
			'/api/my/groups/' + groupId,
			{ method: 'DELETE' }
		);
		if (delReqRes.status === 200) {
			return;
		}
		throw new Error(
			'Failed to delete group with id ' + groupId + '\n' +
			delReqRes.status + ' ' + delReqRes.statusText
		);
	}

	function deleteTableEntry(groupId) {
		alert("Group Deleted!");
		const tableEntryId = '#group-' + groupId;
		const tableEntry = document.querySelector(tableEntryId);
		tableEntry.parentNode.removeChild(tableEntry);
	}
}


function setupForGroupEdit() {
	const editButtons =
		document.querySelectorAll('.cls-edt-but');
	editButtons.forEach(butEdt => {
		butEdt.onclick = onEditGroup;
	});
	return;

	async function onEditGroup() {
		const groupId = this.id.substr(8);
		console.log(groupId);
		try {
			await apiEditGroup(groupId);
		} catch (err) {
			alert(err);
		}
	}

	async function apiEditGroup(groupId) {
		const edtReqRes = await fetch(
			'/api/my/groups/' + groupId,
			{ method: 'PUT' }
		);
		if (edtReqRes.status === 200) {
			return;
		}
		throw new Error(
			'Failed to edit group with id ' + groupId + '\n' +
			edtReqRes.status + ' ' + edtReqRes.statusText
		);
	}
}