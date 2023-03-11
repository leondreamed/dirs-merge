import * as fs from 'node:fs'
import path from 'node:path'

export function dirsMergeSync(
	sourceDir: string,
	destinationDir: string,
	conflictResolver: 'skip' | 'overwrite'
) {
	const sourceEntryNames = fs.readdirSync(sourceDir)

	for (const sourceEntryName of sourceEntryNames) {
		const sourceEntryPath = path.join(sourceDir, sourceEntryName)
		const destinationEntryPath = path.join(destinationDir, sourceEntryName)

		const stats = fs.lstatSync(sourceEntryPath)

		if (stats.isDirectory()) {
			dirsMergeSync(sourceEntryPath, destinationEntryPath, conflictResolver)
		} else {
			// console.log({srcFile, destFile}, 'conflict?', fs.existsSync(destFile))
			if (fs.existsSync(destinationEntryPath)) {
				switch (conflictResolver) {
					case 'overwrite': {
						fs.copyFileSync(sourceEntryPath, destinationEntryPath)
						break
					}

					case 'skip': {
						break
					}

					default: {
						throw new Error(
							`Invalid conflict resolver: ${String(conflictResolver)}`
						)
					}
				}
			} else {
				fs.copyFileSync(sourceEntryPath, destinationEntryPath)
			}
		}
	}
}

export async function dirsMerge(
	sourceDir: string,
	destinationDir: string,
	conflictResolver: 'skip' | 'overwrite'
) {
	const sourceEntryNames = await fs.promises.readdir(sourceDir)

	await Promise.all(
		sourceEntryNames.map(async (sourceEntryName) => {
			const sourceEntryPath = path.join(sourceDir, sourceEntryName)
			const destinationEntryPath = path.join(destinationDir, sourceEntryName)

			const stats = await fs.promises.lstat(sourceEntryPath)

			if (stats.isDirectory()) {
				await dirsMerge(sourceEntryPath, destinationEntryPath, conflictResolver)
			} else {
				// console.log({srcFile, destFile}, 'conflict?', fs.existsSync(destFile))
				if (fs.existsSync(destinationEntryPath)) {
					switch (conflictResolver) {
						case 'overwrite': {
							await fs.promises.copyFile(sourceEntryPath, destinationEntryPath)
							break
						}

						case 'skip': {
							break
						}

						default: {
							throw new Error(
								`Invalid conflict resolver: ${String(conflictResolver)}`
							)
						}
					}
				} else {
					await fs.promises.copyFile(sourceEntryPath, destinationEntryPath)
				}
			}
		})
	)
}
