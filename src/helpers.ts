import { promises } from "fs";
import { join } from "path";
import { VFile } from "vfile";
import { transform, VFileData } from "./transform";

const { readdir } = promises;

export async function getPost(postId: string): Promise<VFile> {
    const path = join("posts", postId, "content.md");

    const vFile = await transform(path);
    (vFile.data as VFileData).url = `/${vFile.dirname}`;

    return vFile;
}

export async function getPosts(page: number, pageSize = 10): Promise<VFile[]> {
    const postIds = (await readdir("posts", { withFileTypes: true }))
        .filter((dirent) => dirent.isDirectory())
        .map(({ name }) => name);

    const lastPage = Math.ceil(postIds.length / pageSize);

    // 0 or Nan will use page 1.
    // Past last page will use last page.
    const targetPage = Math.min(page, lastPage) || 1;

    const endIndex = targetPage * pageSize;
    const startIndex = endIndex - pageSize;
    const pagePostIds = postIds.slice(startIndex, endIndex);

    return await Promise.all(pagePostIds.map((postId) => getPost(postId)));
}
