# Pinned Daily Notes for Obsidian

A plugin for Obsidian that helps you manage your daily notes with pinned tabs. It provides a dedicated button and command to open today's daily note in a pinned tab.

## Features

- Adds a ribbon icon (calendar+) to open today's daily note in a pinned tab
- Adds a command palette action "Open today's daily note" 
- When clicking the button or running the command:
  - If a pinned daily note tab exists: Updates it to today's note and focuses it
  - If no pinned daily note exists: Creates a new pinned tab with today's note
- Works with any daily note folder structure and format
- Respects your Daily Notes plugin settings

## How to Use

1. Install the plugin
2. Click the calendar+ icon in the ribbon (left sidebar) or use the command palette to run "Open today's daily note"
3. The first time you use it, a new pinned tab will be created
4. Move this tab wherever you want it to stay
5. From now on, that tab will be updated to show today's note whenever you use the plugin

## Configuration

### New Pin Location

The plugin allows you to configure where new pinned daily notes should appear:

- **Editor**: Opens the daily note in the main editor area
- **Left Sidebar**: Opens the daily note in a new tab in the left sidebar
- **Right Sidebar**: Opens the daily note in a new tab in the right sidebar

To change the pin location:

1. Open Obsidian Settings
2. Go to Community Plugins
3. Find "Pinned Daily Notes" in your list of installed plugins
4. Click the gear icon to open plugin settings
5. Select your preferred location from the dropdown menu

The setting will take effect the next time you open a daily note using the plugin.
If you already have a pinned daily note in a location other than this setting, it
won't move it.

### Daily Notes Plugin

The plugin allows you to configure which daily notes plugin to use:

- **Daily Notes (Core Plugin)**: Uses the core daily notes plugin
- **Periodic Notes (Community Plugin)**: Uses the [periodic notes plugin](https://github.com/liamcain/obsidian-periodic-notes)

To change the daily notes plugin:

1. Open Obsidian Settings
2. Go to Community Plugins
3. Find "Pinned Daily Notes" in your list of installed plugins
4. Click the gear icon to open plugin settings
5. Select your preferred plugin from the dropdown menu


## Installation

1. Open Obsidian Settings
2. Go to Community Plugins and disable Safe Mode
3. Click Browse and search for "Pinned Daily Notes"
4. Install the plugin
5. Enable the plugin in your list of installed plugins

## Support

If you encounter any issues or have suggestions, please file them on [GitHub](https://github.com/docmarionum1/obsidian-pinned-daily-notes/issues).


## License

MIT
