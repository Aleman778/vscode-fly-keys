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
		vscode.commands.registerCommand('vscode-fly-keys.cursorLineStart', function() {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        const position = editor.selection.active;
        const lineText = editor.document.lineAt(position.line).text;
        const firstNonWhitespaceCharIndex = lineText.search(/\S/); // \S matches the first non-whitespace character

        if (firstNonWhitespaceCharIndex == -1 || position.character === firstNonWhitespaceCharIndex) {
          vscode.commands.executeCommand('cursorMove', { to: 'prevBlankLine'})
        } else {
          const newPosition = position.with(position.line, firstNonWhitespaceCharIndex);
          editor.selection = new vscode.Selection(newPosition, newPosition);
        }
      }
		}),
		vscode.commands.registerCommand('vscode-fly-keys.cursorLineEnd', function() {
		})
	)
}

function setEditingMode(mode) {
  globalState.mode = mode;
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
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
