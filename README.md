# Obsidian Root Folder URI Plugin

This plugin creates and handles a new file URI which roots from a specific folder.

It is for my personal use. I typically store large attachments in my cloud drive (e.g., OneDrive and Dropbox). I also use iCloud to sync obsidian notes. Cloud drives may have different cross-platform root directories, and I typically set it to HOME. This plugin provides a URI to resolve the `to` payload from a predefined root directory accepting `~` and get the absolute path.

There are two main parts in this plugin, namely, insert a URI and click on a URI.
- There is a new obsidian command `Add a root folder URI.` It pops a file selection dialog (file, directory, multi-select) and translates the selected files or folders into the `obsidian://from-root?to=xxx` URI format. The `to=` part includes a relative path from the `Root Folder` plugin config.
- When clicking on this URI, the plugin translates back to the absolute file path using the `Root Folder` config. The default application is launched to open that file or directory.

There is also another set of settings, i.e., `Find String` and `Replace String`. This find-n-replace happens when the plugin is creating URI. I use them to replace the real path `Library/CloudStorage/OneDrive-Personal` with the symlink `OneDrive`, both of which are under `~/` in all my computers.