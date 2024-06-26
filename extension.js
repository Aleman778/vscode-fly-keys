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
  relativeIndex: 0,
  prevLine: 0,
	active: true
}

const relativeAtStrings = ['center', 'bottom', 'top']

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	context.subscriptions.push(
    vscode.commands.registerCommand('type', async args => {
      const text = args.text;
      
      if (vscode.window.activeTextEditor && globalState.mode == MODE_INSERT) {
        await vscode.commands.executeCommand('default:type', { text });
      } else if (vscode.window.activeTextEditor && globalState.mode == MODE_COMMAND) {
        if (text == '\n') {
          await vscode.commands.executeCommand('default:type', { text });
        } else {
          vscode.window.showInformationMessage(`Unknown command for key: ${text}`);
        }
      } else {
        setEditingMode(MODE_COMMAND)
      }
    }),

    wrap('vscode-fly-keys.splitEditorToRightGroup', 'workbench.action.splitEditorToRightGroup'),
    wrap('vscode-fly-keys.copy', 'editor.action.clipboardCopyAction'),
    wrap('vscode-fly-keys.paste', 'editor.action.clipboardPasteAction'),
    wrap('vscode-fly-keys.undo', 'undo'),
    wrap('vscode-fly-keys.redo', 'redo'),
    wrap('vscode-fly-keys.focusPrevGroup', 'workbench.action.focusPreviousGroup'),
    wrap('vscode-fly-keys.focusNextGroup', 'workbench.action.focusNextGroup'),
    wrap('vscode-fly-keys.toggleLineComment', 'editor.action.commentLine'),
    wrap('vscode-fly-keys.replace', 'editor.action.startFindReplaceAction'),
    wrap('vscode-fly-keys.switchFile', 'workbench.action.quickOpen'),
    wrap('vscode-fly-keys.save', 'workbench.action.files.save'),
    // wrap('vscode-fly-keys.', ''),

		vscode.commands.registerCommand('vscode-fly-keys.cut', function() {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        let position = editor.selection.active;
        if (position.line > editor.selection.anchor.line ||
          (position.line === editor.selection.anchor.line &&
            position.character > editor.selection.anchor.character)) {
          position = editor.selection.anchor
        }
        vscode.commands.executeCommand('editor.action.clipboardCutAction')
        setVisualMode(false, position)
      }
		}),

    vscode.commands.registerCommand('vscode-fly-keys.inplaceNewline', async function () {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        const selection = editor.selection;
        await vscode.commands.executeCommand('default:type', { text: '\n' });
        editor.selection = selection;
      }
    }),

  	vscode.commands.registerCommand('vscode-fly-keys.toggleExtension', function() {
			globalState.active = !globalState.active;
		}),

		vscode.commands.registerCommand('vscode-fly-keys.toCommandMode', function() {
			setEditingMode(MODE_COMMAND);
		}),

		vscode.commands.registerCommand('vscode-fly-keys.toInsertMode', function() {
			setEditingMode(MODE_INSERT);
		}),

		vscode.commands.registerCommand('vscode-fly-keys.toggleVisualMode', function() {
      setVisualMode(!globalState.visualMode)
		}),

		vscode.commands.registerCommand('vscode-fly-keys.toLeaderMode', function() {
			setEditingMode(MODE_LEADER);
		}),

		vscode.commands.registerCommand('vscode-fly-keys.toKeymapI', function() {
			setEditingMode(MODE_KEYMAP_I);
		}),

		vscode.commands.registerCommand('vscode-fly-keys.toKeymapJ', function() {
			setEditingMode(MODE_KEYMAP_J);
		}),

		vscode.commands.registerCommand('vscode-fly-keys.toKeymapD', function() {
			setEditingMode(MODE_KEYMAP_D);
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

    vscode.commands.registerCommand('vscode-fly-keys.scrollRelativeToCursor', function () {
      const line = vscode.window.activeTextEditor.selection.start.line;
      if (globalState.prevLine != line) {
        globalState.relativeIndex = 0
      }
      globalState.prevLine = line
      vscode.commands.executeCommand("revealLine", {
        lineNumber: line,
        at: relativeAtStrings[globalState.relativeIndex++ % 3]
      });
    }),
    
    vscode.commands.registerCommand('vscode-fly-keys.gotoBeginningOfFile', function () {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        setCursorPosition(editor, new vscode.Position(0, 0))
        vscode.commands.executeCommand("revealLine", {
          lineNumber: 0, at: "top"
        });
      }
      setEditingMode(MODE_COMMAND)
    }),
    
    vscode.commands.registerCommand('vscode-fly-keys.gotoEndOfFile', function () {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        setCursorPosition(editor, new vscode.Position(editor.document.lineCount, 0))
        vscode.commands.executeCommand("revealLine", {
          lineNumber: editor.document.lineCount, at: "bottom"
        });
      }
      setEditingMode(MODE_COMMAND)
    }),
    
    vscode.commands.registerCommand('vscode-fly-keys.cursorWordPartLeft', function() {
			moveCursorToSubword(-1)
		}),

    vscode.commands.registerCommand('vscode-fly-keys.cursorWordPartRight', function() {
			moveCursorToSubword(1)
		}),
    
    vscode.commands.registerCommand('vscode-fly-keys.deleteWordPartLeft', function() {
			moveCursorToSubword(-1, true)
		}),

    vscode.commands.registerCommand('vscode-fly-keys.deleteWordPartRight', function() {
			moveCursorToSubword(1, true)
		}),

		vscode.commands.registerCommand('vscode-fly-keys.cursorLineStart', function() {
      moveCursorToLineOrBlock(-1)
		}),

		vscode.commands.registerCommand('vscode-fly-keys.cursorLineEnd', function() {
      moveCursorToLineOrBlock(1)
		})
	)
  
  setEditingMode(MODE_COMMAND)
}

function moveCursorToSubword(dir, kill = false) {
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
        /([a-z])([^a-z0-9])|([a-zA-Z0-9])([^a-zA-Z0-9])/g :
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
      if (kill) {
        editor.edit(editBuilder => {
          editBuilder.delete(new vscode.Selection(currentPosition, newPosition))
        })
      } else {
        setCursorPosition(editor, newPosition);
      }
    }
}

function moveCursorToLineOrBlock(dir) {
  const editor = vscode.window.activeTextEditor;
  if (editor) {
    const position = editor.selection.active;
    const lineText = editor.document.lineAt(position.line).text;
    const firstNonWhitespaceCharIndex = lineText.search(/\S/); // \S matches the first non-whitespace character

    if (dir > 0 && position.character == lineText.length) {
      vscode.commands.executeCommand('cursorMove', { 
        to: 'nextBlankLine', select: globalState.visualMode 
      })
    } else if (dir < 0 && (firstNonWhitespaceCharIndex == -1 || position.character === firstNonWhitespaceCharIndex)) {
      vscode.commands.executeCommand('cursorMove', { 
        to: 'prevBlankLine', select: globalState.visualMode 
      })
    } else {
      const charIndex = dir < 0 ? firstNonWhitespaceCharIndex : lineText.length;
      const newPosition = position.with(position.line, charIndex);
      setCursorPosition(editor, newPosition);
    }
  }
}

function wrap(ourId, execId) {
  return vscode.commands.registerCommand(ourId, function () {
    vscode.commands.executeCommand(execId)
    setEditingMode(MODE_COMMAND)
  })
}

function setEditingMode(mode) {
  globalState.mode = mode;
  if (vscode.workspace.workspaceFolders) {
    vscode.workspace.getConfiguration('editor', vscode.window.activeTextEditor.document.uri)
        .update('cursorStyle', mode == MODE_INSERT ? 'line' : 'block', vscode.ConfigurationTarget.Global);
  }
  vscode.commands.executeCommand(
    'setContext',
    'vscode-fly-keys.mode',
    mode
  )
  setVisualMode(false)
}

function setVisualMode(enable, newPosition = null) {
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
      let position = newPosition || editor.selection.active;
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
