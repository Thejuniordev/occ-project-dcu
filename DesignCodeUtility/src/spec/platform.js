const onWindows = process.platform === "win32"

exports.toPlatformPath = path => onWindows ? `C:${path}` : path
