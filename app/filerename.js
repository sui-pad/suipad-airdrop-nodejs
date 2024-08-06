import { readdir, rename } from 'fs/promises';
import { join, extname } from 'path';

// 文件夹路径
const directoryPath = 'C:\\Project\\ys\\forexpng';

async function renameFiles() {
    try {
        // 读取文件夹中的所有文件
        const files = await readdir(directoryPath);

        // 遍历所有文件
        for (let index = 0; index < files.length; index++) {
            const file = files[index];

            // 获取文件的完整路径
            const filePath = join(directoryPath, file);

            // 新文件名（可以根据需要修改）
            const newFileName = file.replace('-removebg-preview', '');
            const newFilePath = join(directoryPath, newFileName);

            // 重命名文件
            await rename(filePath, newFilePath);
            console.log(`文件 ${file} 已重命名为 ${newFileName}`);
        }
    } catch (err) {
        console.error('处理文件时出错:', err);
    }
}

await renameFiles();
