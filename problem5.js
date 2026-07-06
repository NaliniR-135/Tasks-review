//to count total size, folders and files

const fs = require("fs");
const path = require("path");

function getFolderInfo(folderPath) {
    let totalSize = 0;
    let fileCount = 0;
    let folderCount = 0;

    const items = fs.readdirSync(folderPath, { withFileTypes: true });
    console.log(items);
    for (const item of items) {
        const fullPath = path.join(folderPath, item.name);

        if (item.isFile()) {
            const stats = fs.statSync(fullPath);
            totalSize += stats.size;
            fileCount++;
        }

        else if (item.isDirectory()) {
            folderCount++;
            const result = getFolderInfo(fullPath);
            totalSize += result.totalSize;
            fileCount += result.fileCount;
            folderCount += result.folderCount;
        }
    }

    return { totalSize, fileCount, folderCount };
}

const result = getFolderInfo("/Users/Nalini.Ravi/Desktop/Demo");

console.log("Total size:", result.totalSize, "bytes");
console.log("Files:", result.fileCount);
console.log("Folders:", result.folderCount);

