import { App, Plugin, TFile, moment } from 'obsidian';

export default class PinDailyNotePlugin extends Plugin {
    pinnedLeafId: string | null = null;

    async onload() {
        // Pin today's note on startup
        this.app.workspace.onLayoutReady(() => this.pinTodayNote());

        // Register event for when daily notes plugin creates a new note
        this.registerEvent(
            this.app.workspace.on('file-open', (file) => {
                if (file && this.isDailyNote(file)) {
                    this.pinDailyNote(file);
                }
            })
        );

        // Add ribbon icon to manually pin today's note
        this.addRibbonIcon('pin', 'Pin Today\'s Note', () => {
            this.pinTodayNote();
        });
    }

    getDailyNoteSettings() {
        // @ts-ignore
        const dailyNotesPlugin = this.app.internalPlugins.plugins['daily-notes'];
        // Explicitly check boolean status
        const isEnabled = dailyNotesPlugin?.enabled === true;
        if (!isEnabled) {
            return null;
        }
        return dailyNotesPlugin.instance.options;
    }

    isDailyNote(file: TFile): boolean {
        const dailyNotePath = this.getTodayNotePath();
        return dailyNotePath ? file.path === dailyNotePath : false;
    }

    getTodayNotePath(): string | null {
        const settings = this.getDailyNoteSettings();
        if (!settings) {
            console.log('Daily Notes plugin is not enabled');
            return null;
        }

        const folder = settings.folder?.trim() || '';
        const format = settings.format?.trim() || 'YYYY-MM-DD';
        const filename = moment().format(format);
        
        return folder 
            ? `${folder}/${filename}.md`
            : `${filename}.md`;
    }

    async pinTodayNote() {
        const dailyNotePath = this.getTodayNotePath();
        if (!dailyNotePath) {
            return;
        }

        const file = this.app.vault.getAbstractFileByPath(dailyNotePath);
        if (file instanceof TFile) {
            await this.pinDailyNote(file);
        }
    }

    async pinDailyNote(file: TFile) {
        let targetLeaf = this.pinnedLeafId 
            ? this.app.workspace.getLeafById(this.pinnedLeafId)
            : this.app.workspace.getLeaf(true);

        if (!targetLeaf) {
            targetLeaf = this.app.workspace.getLeaf(true);
        }

        // Set the leaf to be pinned
        await targetLeaf.setPinned(true);
        
        // Store the leaf id
        this.pinnedLeafId = targetLeaf.id;

        // Open the file in the pinned leaf
        await targetLeaf.openFile(file);
    }
}
