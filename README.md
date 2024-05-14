# vscode-fly-keys

Reimplementation of emacs package xah-fly-keys in Visual Studio Code.
This provides a modal editor experience similar to vim but with more ergonomic keybindings.
The keybindings provided are slightly different from default xah-fly-keys but all
keybindings are customizable.

## Features

Features 3 modes similar to vim:
- COMMAND mode `HOME` (default no characters are typed) 
- INSERT mode  `F` (this is where you type characters)
- VISUAL mode  `T` (toggles on/off is combined with COMMAND mode, works like holding shift down)

In COMMAND mode you can navigate and edit the document with these commands:
- `o`/ `;`/ `l`/ `k` for moving cursor up/ right/ down/ left
- `x`/ `c`/ `v` for cut/ copy/ paste
- `y` for undo

## Extension Settings

Most things are configurable via keybindings editor, just search for `vscode-fly-keys`.

## Known Issues

This is in a very early stage of development, lots of missing keybindings.

## Release Notes

### 0.0.1

Initial release few basic commands for navigation, switching modes, cut/copy/paste and undo/redo.
