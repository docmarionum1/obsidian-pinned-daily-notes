import { App, Plugin, TFile, WorkspaceLeaf, View } from 'obsidian';
import { PinDailyNotePluginSetting as Setting, PinDailyNotePluginSettingTab as SettingTab, DEFAULT_SETTING } from 'setting';


interface DailyNotesSettings {
    folder?: string;
    format?: string;
}

interface DailyNotesPlugin {
    enabled: boolean;
    instance?: {
        options: DailyNotesSettings;
    };
}

interface ObsidianApp extends App {
    internalPlugins: {
        plugins: {
            'daily-notes': DailyNotesPlugin;
        };
    };
    commands: {
        commands: Record<string, { callback: () => Promise<void> }>;
    };
}

interface ObsidianWorkspaceLeaf extends WorkspaceLeaf {
    pinned?: boolean;
}

interface ObsidianView extends View {
    file?: TFile;
}


export default class PinDailyNotePlugin extends Plugin {
    private obsidianApp: ObsidianApp;
    settings: Setting; // non private for access from Setting class

    constructor(app: App, manifest: any) {
        super(app, manifest);
        this.obsidianApp = app as ObsidianApp;
    }

    async onload(): Promise<void> {
        const handleDailyNote = async (): Promise<void> => {
            // Get the path of today's daily note
            const todayPath = this.getTodayNotePath();
            if (!todayPath) return;

            // Find the pinned daily note leaf
            // It could be today's or any matching daily note that's already pinned
            const leaves: ObsidianWorkspaceLeaf[] = this.obsidianApp.workspace.getLeavesOfType('markdown');
            let leaf = leaves.find(leaf => {
                const view = leaf.view as ObsidianView;
                return leaf.pinned && this.isDailyNotePath(view?.file?.path);
            });

            // If today's daily note doesn't already exist, create it
            if (!(this.obsidianApp.vault.getAbstractFileByPath(todayPath) instanceof TFile)) {
                const dailyNotesCommand = this.obsidianApp.commands.commands['daily-notes'];
                if (dailyNotesCommand) {
                    // Open a new tab leaf
                    const newLeaf = this.obsidianApp.workspace.getLeaf(true);

                    // Call the default daily notes command which will create the file in the new leaf
                    await dailyNotesCommand.callback();

                    // If we found a pinned daily note earlier, we can close newLeaf
                    // Otherwise we will use the new leaf as the new pinned daily note leaf
                    if (leaf) {
                        newLeaf.detach();
                    } else {
                        newLeaf.setPinned(true);
                        return;
                    }
                }
            }

            // Get today's file after possibly creating it above
            const todayFile = this.obsidianApp.vault.getAbstractFileByPath(todayPath);

            // If we don't have an active leaf, create one
            if (!leaf) {
                leaf = this.obsidianApp.workspace.getLeaf(true);
                leaf.setPinned(true);
            }

            // Open today's file in the pinned leaf
            if (todayFile instanceof TFile) {
                await leaf.openFile(todayFile);
                this.obsidianApp.workspace.setActiveLeaf(leaf, { focus: true });
            }
        };

        this.addRibbonIcon('calendar-plus', 'Open today\'s daily note (Pinned)', () => {
            handleDailyNote();
        });

        this.addCommand({
            id: 'open-todays-daily-note-pinned',
            name: 'Open today\'s daily note',
            callback: () => handleDailyNote(),
        });

        await this.loadSettings()
        this.addSettingTab(new SettingTab(this.app, this))
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTING, await this.loadData())
    }

    async saveSettings() {
        this.saveData(this.settings)
    }

    getTodayNotePath(): string | null {
        const dailyNotesPlugin = this.obsidianApp.internalPlugins.plugins['daily-notes'];
        if (!dailyNotesPlugin?.enabled) return null;

        try {
            const settings = dailyNotesPlugin.instance?.options;
            if (!settings) return null;

            const folder = settings.folder?.trim().replace(/\/$/, '') || '';
            const format = settings.format?.trim() || 'YYYY-MM-DD';
            const date = window.moment();

            let filename = date.format(format);
            if (format.includes('/')) {
                const formattedPath = folder
                    ? `${folder}/${filename}`
                    : filename;
                return formattedPath + '.md';
            } else {
                const path = folder
                    ? `${folder}/${filename}`
                    : filename;
                return path + '.md';
            }
        } catch (error) {
            console.error('Error generating daily note path:', error);
            return null;
        }
    }

    isDailyNotePath(path: string | undefined): boolean {
        if (!path) return false;

        const dailyNotesPlugin = this.obsidianApp.internalPlugins.plugins['daily-notes'];
        if (!dailyNotesPlugin?.enabled) return false;

        try {
            const settings = dailyNotesPlugin.instance?.options;
            if (!settings) return false;

            const folder = settings.folder?.trim().replace(/\/$/, '') || '';

            if (folder && !path.startsWith(folder)) return false;

            const filename = path.slice(folder ? folder.length + 1 : 0, -3);
            return window.moment(filename, settings.format?.trim() || 'YYYY-MM-DD', true).isValid();
        } catch (error) {
            return false;
        }
    }
}
