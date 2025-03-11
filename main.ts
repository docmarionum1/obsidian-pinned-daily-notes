import { App, Plugin, TFile, TAbstractFile, WorkspaceLeaf, View } from 'obsidian';
import type moment from 'moment';

declare global {
    interface Window {
        moment: typeof moment;
    }
}

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

    constructor(app: App, manifest: any) {
        super(app, manifest);
        this.obsidianApp = app as ObsidianApp;
    }

    async onload(): Promise<void> {
        const handleDailyNote = async (): Promise<void> => {
            const todayPath = this.getTodayNotePath();
            if (!todayPath) return;

            const leaves = this.obsidianApp.workspace.getLeavesOfType('markdown');
            let leaf = leaves.find(leaf => {
                const obsLeaf = leaf as ObsidianWorkspaceLeaf;
                const view = obsLeaf.view as ObsidianView;
                return obsLeaf.pinned && this.isDailyNotePath(view?.file?.path);
            });

            if (!leaf) {
                leaf = this.obsidianApp.workspace.getLeaf('tab');
                (leaf as ObsidianWorkspaceLeaf).setPinned(true);
            }

            this.obsidianApp.workspace.setActiveLeaf(leaf, { focus: true });

            let todayFile = this.obsidianApp.vault.getAbstractFileByPath(todayPath);
            if (!(todayFile instanceof TFile)) {
                const dailyNotesCommand = this.obsidianApp.commands.commands['daily-notes'];
                if (dailyNotesCommand) {
                    await dailyNotesCommand.callback();
                    const newLeaf = this.obsidianApp.workspace.getMostRecentLeaf();
                    if (newLeaf && newLeaf !== leaf) {
                        newLeaf.detach();
                    }    
                    todayFile = this.obsidianApp.vault.getAbstractFileByPath(todayPath);
                }
            }

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
