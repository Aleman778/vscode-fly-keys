// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

const MODE_COMMAND = "command";
const MODE_INSERT = "insert";
const MODE_LEADER = "leader";
const MODE_KEYMAP_I = "keymapI";
const MODE_KEYMAP_J = "keymapJ";
const MODE_KEYMAP_D = "keymapD";
const MODE_KEYMAP_O = "keymapO";

const globalState = {
	mode: null,
  visualMode: false,
  visualAnchor: new vscode.Position(0, 0),
	active: true
}

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	console.log("`vscode-fly-keys` is activated")
  setEditingMode(MODE_COMMAND)

	context.subscriptions.push(
    vscode.commands.registerCommand('type', async args => {
      const text = args.text;
      if (vscode.window.activeTextEditor && globalState.mode == MODE_COMMAND) {
        vscode.window.showInformationMessage(`Run command: ${text}`);
      } else {
        await vscode.commands.executeCommand('default:type', { text });
      }
    }),
		vscode.commands.registerCommand('vscode-fly-keys.toggleExtension', function() {
			globalState.active = !globalState.active;
		}),
		vscode.commands.registerCommand('vscode-fly-keys.toCommandMode', function() {
			setEditingMode(MODE_COMMAND);
			vscode.window.showInformationMessage('Command mode active');
		}),
		vscode.commands.registerCommand('vscode-fly-keys.toInsertMode', function() {
			setEditingMode(MODE_INSERT);
			vscode.window.showInformationMessage('Insert mode active');
		}),
		vscode.commands.registerCommand('vscode-fly-keys.toggleVisualMode', function() {
      setVisualMode(!globalState.visualMode)
			vscode.window.showInformationMessage(`Visual mode active: ${globalState.visualMode}`);
		}),
		vscode.commands.registerCommand('vscode-fly-keys.toLeaderMode', function() {
			setEditingMode(MODE_LEADER);
		}),
		vscode.commands.registerCommand('vscode-fly-keys.toKeymapI', function() {
			setEditingMode(MODE_KEYMAP_I);
			vscode.window.showInformationMessage('Command mode active');
		}),
		vscode.commands.registerCommand('vscode-fly-keys.toKeymapJ', function() {
			setEditingMode(MODE_KEYMAP_J);
			vscode.window.showInformationMessage('Insert mode active');
		}),
		vscode.commands.registerCommand('vscode-fly-keys.toKeymapD', function() {
			setEditingMode(MODE_KEYMAP_D);
			vscode.window.showInformationMessage('Visual mode active');
		}),
		vscode.commands.registerCommand('vscode-fly-keys.toKeymapO', function() {
			setEditingMode(MODE_KEYMAP_O);
		}),
    vscode.commands.registerCommand('vscode-fly-keys.cursorUp', function() {
			vscode.commands.executeCommand('cursorMove', { 
        to: 'up', select: globalState.visualMode 
      })
		}),
    vscode.commands.registerCommand('vscode-fly-keys.cursorRight', function() {
			vscode.commands.executeCommand('cursorMove', { 
        to: 'right', select: globalState.visualMode 
      })
		}),
    vscode.commands.registerCommand('vscode-fly-keys.cursorDown', function() {
			vscode.commands.executeCommand('cursorMove', { 
        to: 'down', select: globalState.visualMode 
      })
		}),
    vscode.commands.registerCommand('vscode-fly-keys.cursorLeft', function() {
			vscode.commands.executeCommand('cursorMove', { 
        to: 'left', select: globalState.visualMode 
      })
		}),
    vscode.commands.registerCommand('vscode-fly-keys.cursorWordPartLeft', function() {
			moveCursorToSubword(-1)
		}),
    vscode.commands.registerCommand('vscode-fly-keys.cursorWordPartRight', function() {
			moveCursorToSubword(1)
		}),
		vscode.commands.registerCommand('vscode-fly-keys.cursorLineStart', function() {
      moveCursorToLineOrBlock(-1)
		}),
		vscode.commands.registerCommand('vscode-fly-keys.cursorLineEnd', function() {
      moveCursorToLineOrBlock(1)
		})
	)
}

function moveCursorToSubword(dir) {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showErrorMessage('No active text editor!');
        return;
    }
    
    const document = editor.document;
    const currentPosition = editor.selection.active;

    let line = currentPosition.line
    let charIndex = currentPosition.character + dir
    let newPosition = null;
    let lineText = document.lineAt(line).text;
    while (!newPosition) {
      let match;
      let matchDist = 999999;
      const subWordBoundaryRegex = dir > 0 ?
        /([a-z])([^a-z0-9])|(_|\s)([a-zA-Z0-9])/g :
        /(^[a-z])|([^a-z][a-z])|([a-z][A-Z])|(_|\s)([a-zA-Z0-9])/g
      while ((match = subWordBoundaryRegex.exec(lineText)) !== null) {
          const matchIndex = match.index + 1;
          const dist = (matchIndex - charIndex) * dir;

          if (dist > 0 && dist < matchDist) {
              newPosition = new vscode.Position(line, matchIndex);
              matchDist = dist
          }
      }

      line += dir;
      if (line >= 0 && line < document.lineCount) {
        lineText = document.lineAt(line).text;
        charIndex = dir > 0 ? 0 : lineText.length;
      }
    }

    if (newPosition) {
      setCursorPosition(editor, newPosition);
    }
}

function moveCursorToLineOrBlock (dir) {
  const editor = vscode.window.activeTextEditor;
  if (editor) {
    const position = editor.selection.active;
    const lineText = editor.document.lineAt(position.line).text;
    const firstNonWhitespaceCharIndex = lineText.search(/\S/); // \S matches the first non-whitespace character
    const trimmedLineLength = lineText.trimEnd().length;

    if (dir > 0 && position.character == trimmedLineLength) {
      vscode.commands.executeCommand('cursorMove', { 
        to: 'nextBlankLine', select: globalState.visualMode 
      })
    } else if (dir < 0 && (firstNonWhitespaceCharIndex == -1 || position.character === firstNonWhitespaceCharIndex)) {
      vscode.commands.executeCommand('cursorMove', { 
        to: 'prevBlankLine', select: globalState.visualMode 
      })
    } else {
      const charIndex = dir < 0 ? firstNonWhitespaceCharIndex : trimmedLineLength;
      const newPosition = position.with(position.line, charIndex);
      setCursorPosition(editor, newPosition);
    }
  }
}

function setEditingMode(mode) {
  globalState.mode = mode;
  if (vscode.workspace.workspaceFolders) {
    vscode.workspace.getConfiguration('editor', vscode.window.activeTextEditor.document.uri)
        .update('cursorStyle', mode == MODE_INSERT ? 'line' : 'block', vscode.ConfigurationTarget.Workspace);
  }
  vscode.commands.executeCommand(
    'setContext',
    'vscode-fly-keys.mode',
    mode
  )
}

function setVisualMode(enable) {
  globalState.visualMode = enable;
  vscode.commands.executeCommand(
    'setContext',
    'vscode-fly-keys.visual',
    enable
  )

  const editor = vscode.window.activeTextEditor;
  if (editor) {
    if (globalState.visualMode) {
      globalState.visualAnchor = editor.selection.active;
    } else {
        const position = editor.selection.active;
        editor.selection = new vscode.Selection(position, position);
    }
  }
}

function setCursorPosition(editor, newPosition) {
  const anchorPosition = globalState.visualMode ? globalState.visualAnchor : newPosition;
  editor.selection = new vscode.Selection(anchorPosition, newPosition);
  editor.revealRange(new vscode.Selection(newPosition, newPosition));
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
