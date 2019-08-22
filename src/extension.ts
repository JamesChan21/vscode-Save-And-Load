/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/


import * as vscode from 'vscode';

let myStatusBarItem: vscode.StatusBarItem;

// record data
let record_line = 0;
let record_character = 0;
let status = false;
let isRecord = false;
let recordPath = "";


export function activate({ subscriptions }: vscode.ExtensionContext) {

	// register a command that is invoked when the status bar
	// item is selected
	const myCommandId = 'sample.showSelectionCount';
	subscriptions.push(vscode.commands.registerCommand(myCommandId, () => {
		if(status == false){
			myStatusBarItem.text = `$(log-out) LOAD`;
			updateCursonPosition();
		}
		else{
			myStatusBarItem.text = `$(log-in) SAVE`;
			returnCursonPosition();
		}
	}));

	let disposable1 = vscode.commands.registerCommand('extension.save', () => {
		myStatusBarItem.text = `$(log-out) LOAD`;
		updateCursonPosition();
	});

	let disposable2 = vscode.commands.registerCommand('extension.load', () => {
		if(isRecord == true){
			myStatusBarItem.text = `$(log-in) SAVE`;
			returnCursonPosition();
		}
		else{
			vscode.window.showErrorMessage('Please save a position!');
		}
	});

	// create a new status bar item that we can now manage
	myStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
	myStatusBarItem.command = myCommandId;
	myStatusBarItem.show();
	subscriptions.push(myStatusBarItem);
	myStatusBarItem.text = `$(log-in) SAVE`;
}

function updateCursonPosition(): void {
	let editor = vscode.window.activeTextEditor;
	let position = editor!.selection.active;
	
	record_line = position.line;
	record_character = position.character;
	recordPath = vscode.window.activeTextEditor!.document.fileName;
	vscode.window.showInformationMessage('SAVE');

	status = true;
	isRecord = true;
}

function returnCursonPosition(): void {
	if(recordPath !== vscode.window.activeTextEditor!.document.fileName){
		var openPath = vscode.Uri.file(recordPath); //A request file path
		vscode.workspace.openTextDocument(openPath).then(doc => {			
			let options = setCursonPosition();
			vscode.window.showTextDocument(doc, options);
		});
	}
	else{
		setCursonPosition();
	}
}

function setCursonPosition(): vscode.TextDocumentShowOptions {
	let editor = vscode.window.activeTextEditor;
	var position = editor!.selection.active;
	var nextCursor = position.with(record_line, record_character);

	editor!.selection = new vscode.Selection(nextCursor, nextCursor);
	let range = new vscode.Range(nextCursor, nextCursor);

	//The range will always be revealed in the center of the viewport.
	editor!.revealRange(range, 1);

	let options: vscode.TextDocumentShowOptions = {selection: editor!.selection};
	
	vscode.window.showInformationMessage('LOAD');
	status = false;

	return options
}

