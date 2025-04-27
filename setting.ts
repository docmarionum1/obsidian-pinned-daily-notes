import PinDailyNotePlugin from "./main"
import { App, DropdownComponent, PluginSettingTab, Setting } from "obsidian"

export interface PinDailyNotePluginSetting {
    whereToPin: string
}

export enum PinOptions {
    EDITOR = 'editor',
    LEFT_SIDE_BAR = 'leftSideBar',
    RIGHT_SIDE_BAR = 'rightSideBar',
}

export const DEFAULT_SETTING: Partial<PinDailyNotePluginSetting> = {
    whereToPin: PinOptions.EDITOR
}

export class PinDailyNotePluginSettingTab extends PluginSettingTab {
    plugin: PinDailyNotePlugin

    constructor(app: App, plugin: PinDailyNotePlugin) {
        super(app, plugin)
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty()

        new Setting(containerEl)
            .setName('Where to Pin')
            .setDesc('Default place to pin Daily Note')
            .addDropdown((dropdown) => {
                dropdown.addOptions(whereToPinDropdownOptions)
                dropdown.setValue(this.plugin.settings.whereToPin)
                dropdown.onChange(async (value) => {
                    this.plugin.settings.whereToPin = value;
                    await this.plugin.saveSettings()
                })
            })
    }
}

const whereToPinDropdownOptions: Record<string, PinOptions> = {
    editor: PinOptions.EDITOR,
    leftSideBar: PinOptions.LEFT_SIDE_BAR,
    rightSideBar: PinOptions.RIGHT_SIDE_BAR
}