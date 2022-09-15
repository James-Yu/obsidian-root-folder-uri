import { App, MarkdownView, Notice, Plugin, PluginSettingTab, Setting, ObsidianProtocolData } from 'obsidian'
import { remote, shell } from 'electron'
import * as path from 'path'
import * as os from 'os'

// Remember to rename these classes and interfaces!

interface RootFolderURISettings {
	rootFolder: string
	findString: string
	replaceString: string
}

interface RootFolderURIParams extends ObsidianProtocolData {
	to: string
}

const DEFAULT_SETTINGS: RootFolderURISettings = {
	rootFolder: '~/',
	findString: '',
	replaceString: ''
}

export default class MyPlugin extends Plugin {
	settings: RootFolderURISettings

	async onload() {
		await this.loadSettings()

		this.addSettingTab(new RootFolderURISettingTab(this.app, this))

		this.addCommand({
			id: 'add-root-folder-uri',
			name: 'Add a root folder URI.',
			callback: () => {
				const view = this.app.workspace.getActiveViewOfType(MarkdownView)
				if (view === null) {
					return
				}
				const document = view.editor
				setTimeout(() => {
					const files = remote.dialog.showOpenDialogSync({properties: ['openFile', 'openDirectory', 'multiSelections']})
					if (files === undefined) {
						return
					}
					for (const file of files) {
						const relative = path
							.relative(this.settings.rootFolder.replace(/^~(?=$|\/|\\)/, os.homedir()), file)
							.replace(this.settings.findString, this.settings.replaceString)
						const line = document.getCursor()
						document.replaceRange(`[${path.basename(file)}](obsidian://from-root?to=${encodeURI(relative)})`, line, line)
					}
				}, 50)
			}
		})
		
		this.registerObsidianProtocolHandler('from-root', async (payload) => {
			const parameters = payload as RootFolderURIParams
			const file = path.resolve(this.settings.rootFolder.replace(/^~(?=$|\/|\\)/, os.homedir()), decodeURI(parameters.to))
			shell.openPath(file).then(err => err === '' || new Notice(err))
		})
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData())
	}

	async saveSettings() {
		await this.saveData(this.settings)
	}
}

class RootFolderURISettingTab extends PluginSettingTab {
	plugin: MyPlugin

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin)
		this.plugin = plugin
	}

	display(): void {
		const {containerEl} = this

		containerEl.empty()

		containerEl.createEl('h2', {text: 'Root Folder URI Settings'})

		new Setting(containerEl)
			.setName('Root Folder')
			.setDesc('The folder from which the `ob-root` URI schema rooted.')
			.addText(text => text
				.setPlaceholder('The folder path should end with a slash (/).')
				.setValue(this.plugin.settings.rootFolder)
				.onChange(async (value) => {
					this.plugin.settings.rootFolder = value
					await this.plugin.saveSettings()
				}))

		new Setting(containerEl)
			.setName('Find String')
			.setDesc('The string (or RegExp) to search in the relative path.')
			.addText(text => text
				.setValue(this.plugin.settings.findString)
				.onChange(async (value) => {
					this.plugin.settings.findString = value
					await this.plugin.saveSettings()
				}))

		new Setting(containerEl)
			.setName('Replace String')
			.setDesc('The string to replace in the relative path.')
			.addText(text => text
				.setValue(this.plugin.settings.replaceString)
				.onChange(async (value) => {
					this.plugin.settings.replaceString = value
					await this.plugin.saveSettings()
				}))
	}
}