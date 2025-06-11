import PinDailyNotePlugin from "./main";
import { App, PluginSettingTab, Setting } from "obsidian";

export enum PinOptions {
    EDITOR = 'editor',
    LEFT_SIDE_BAR = 'leftSideBar',
    RIGHT_SIDE_BAR = 'rightSideBar',
}

export enum PluginOptions {
    DAILY_NOTES = 'daily-notes',
    PERIODIC_NOTES = 'periodic-notes',
}

export interface PinDailyNotePluginSetting {
    whereToPin: PinOptions
    plugin: PluginOptions
}

export const DEFAULT_SETTING: Partial<PinDailyNotePluginSetting> = {
    whereToPin: PinOptions.EDITOR,
    plugin: PluginOptions.DAILY_NOTES,
}

const whereToPinDropdownOptions: Record<PinOptions, string> = {
    [PinOptions.EDITOR]: 'Editor',
    [PinOptions.LEFT_SIDE_BAR]: 'Left Sidebar',
    [PinOptions.RIGHT_SIDE_BAR]: 'Right Sidebar',
}

const pluginDropdownOptions: Record<PluginOptions, string> = {
    [PluginOptions.DAILY_NOTES]: 'Daily Notes (Core Plugin)',
    [PluginOptions.PERIODIC_NOTES]: 'Periodic Notes (Community Plugin)',
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
                    await this.plugin.saveSettings();
                })
            });

        new Setting(containerEl)
            .setName('Plugin')
            .setDesc('Plugin to use for creating daily notes')
            .addDropdown((dropdown) => {
                dropdown.addOptions(pluginDropdownOptions)
                dropdown.setValue(
                    this.plugin.settings.plugin ||
                    DEFAULT_SETTING.plugin
                )
                dropdown.onChange(async (value) => {
                    this.plugin.settings.plugin = value as PluginOptions;
                    await this.plugin.saveSettings();
                })
            });
    }
}