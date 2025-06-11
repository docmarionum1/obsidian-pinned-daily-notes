import PinDailyNotePlugin from "./main";
import { App, PluginSettingTab, Setting } from "obsidian";

export interface PinDailyNotePluginSetting {
    whereToPin: PinOptions
}

export enum PinOptions {
    EDITOR = 'editor',
    LEFT_SIDE_BAR = 'leftSideBar',
    RIGHT_SIDE_BAR = 'rightSideBar',
}

export const DEFAULT_SETTING: Partial<PinDailyNotePluginSetting> = {
    whereToPin: PinOptions.EDITOR,
}

const whereToPinDropdownOptions: Record<PinOptions, string> = {
    [PinOptions.EDITOR]: 'Editor',
    [PinOptions.LEFT_SIDE_BAR]: 'Left Sidebar',
    [PinOptions.RIGHT_SIDE_BAR]: 'Right Sidebar',
}

export class PinDailyNotePluginSettingTab extends PluginSettingTab {
    plugin: PinDailyNotePlugin

    constructor(app: App, plugin: PinDailyNotePlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();

        new Setting(containerEl)
            .setName('Pin Location')
            .setDesc('Default place to pin new daily note')
            .addDropdown((dropdown) => {
                dropdown.addOptions(whereToPinDropdownOptions)
                dropdown.setValue(
                    this.plugin.settings.whereToPin ||
                    DEFAULT_SETTING.whereToPin
                )
                dropdown.onChange(async (value) => {
                    this.plugin.settings.whereToPin = value as PinOptions;
                    await this.plugin.saveSettings()
                })
            });
    }
}