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

function setupForGroupClickable() {
	const groupButton =
		document.querySelectorAll('.scroll');
	groupButton.forEach(group => {
		group.onclick = onGroupClicked;
	});
	return;
}

async function onGroupClicked() {
	const groupId = this.id.substr(8);
	window.location = '/my/groups/' + groupId + '/info';
}

function setupForInput() {
	const inputs =
		document.querySelectorAll('input[type="submit"]');
	inputs.forEach(input => {
		input.onclick = () => {
			input.form.submit();
			input.disabled = true
		}
	});
	return;
}

function setupForGroupEdit() {
	const editButton =
		document.querySelector('.cls-edt-grp');

	editButton.onclick = onEditGroup;
	return;

	async function onEditGroup() {
		const newName = document.querySelector('#name').value;
		const newDesc = document.querySelector('#description').value;
		const groupId = this.id.substr(8);
		try {
			await apiEditGroup(groupId, newName, newDesc);
			window.location = '/my/groups';
		} catch (err) {
			alert(err);
		}
	}

	async function apiEditGroup(groupId, newName, newDesc) {
		const edtReqRes = await fetch(
			'/api/my/groups',
			{
				method: 'PUT',
				headers:
				{
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ id: groupId, name: newName, description: newDesc })
			});
		if (edtReqRes.status === 200) {
			return;
		}
		throw new Error(
			'Failed to edit group with id ' + groupId + '\n' +
			edtReqRes.status + ' ' + edtReqRes.statusText
		);
	}
}

function setupForGameDelete() {
	const groupId = document.querySelector('#groupId').value;
	const deleteButtons = document.querySelectorAll('.cls-del-but');
	deleteButtons.forEach(butDel => {
		butDel.onclick = onDeleteGame;
	});
	return;

	async function onDeleteGame() {
		const gameId = this.id.substr(8);
		try {
			await apiDeleteGame(groupId, gameId);
			deleteEntry(gameId);
		} catch (err) {
			alert(err);
		}
	}

	async function apiDeleteGame(groupId, gameId) {
		const delReqRes = await fetch(
			'/api/my/groups/' + groupId + '/' + gameId,
			{ method: 'DELETE' }
		);
		if (delReqRes.status === 200) {
			return;
		}
		throw new Error(
			'Failed to delete game with id ' + groupId + 'from group\n' +
			delReqRes.status + ' ' + delReqRes.statusText
		);
	}

	function deleteEntry(gameId) {
		alert("Game Deleted!");
		const entryId = '#game-' + gameId;
		const entry = document.querySelector(entryId);
		entry.parentNode.removeChild(entry);
	}
}
