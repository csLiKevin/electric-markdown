import { promises } from "fs";
import { join, relative } from "path";
import { VFile } from "vfile";
import { config } from "./config";
import { CONTENT_FILE, INDEX_FILE, POSTS_DIRECTORY } from "./constants";
import { transform, VFileData } from "./transform";

const { unlink, opendir, readdir } = promises;

async function* walk(path: string): AsyncGenerator<string, void, void> {
    for await (const dirent of await opendir(path)) {
        const entry = join(path, dirent.name);
        if (dirent.isDirectory()) {
            yield* walk(entry);
        }

        yield entry;
    }
}

export async function deleteGeneratedFiles(): Promise<void> {
    for await (const filePath of walk(POSTS_DIRECTORY)) {
        if (filePath.endsWith(INDEX_FILE)) {
            console.log("Deleting:", filePath);
            await unlink(filePath);
        }
    }

    console.log("Deleting:", INDEX_FILE);
    await unlink(INDEX_FILE);
}

export async function getPost(postId: string): Promise<VFile> {
    const path = join(POSTS_DIRECTORY, postId, CONTENT_FILE);

    const vFile = await transform(path);
    (vFile.data as VFileData).url = toAbsoluteUrl(vFile.dirname || "");
    for (const [key, value] of Object.entries(config)) {
        vFile[key] = value;
    }

    return vFile;
}

export async function getPosts(page: number, pageSize = 10): Promise<VFile[]> {
    const postIds = await getPostIds();
    const pages = paginate(postIds, pageSize);

    const lastPage = Math.ceil(postIds.length / pageSize);

    // 0 or Nan will use page 1.
    // Past last page will use last page.
    const targetPage = Math.min(page, lastPage) || 1;

    return await Promise.all(
        pages[targetPage - 1].map((postId) => getPost(postId))
    );
}

export async function getPostIds(): Promise<string[]> {
    return (await readdir(POSTS_DIRECTORY, { withFileTypes: true }))
        .filter((dirent) => dirent.isDirectory())
        .map(({ name }) => name);
}

export function paginate<T>(array: T[], pageSize: number): T[][] {
    const results = [] as T[][];

    for (
        let startIndex = 0;
        startIndex < array.length;
        startIndex = startIndex + pageSize
    ) {
        results.push(array.slice(startIndex, startIndex + pageSize));
    }

    return results;
}

export function toAbsoluteUrl(path: string): string {
    // Must start with /. Replace \ with / on Windows.
    return `/${relative(".", path)}`.replace(/\\/g, "/");
}

export function sortPostsByPublishDate(posts: VFile[]): void {
    posts.sort(
        // Put posts with the more recent publish date first.
        (left, right) =>
            Number((right.data as VFileData).frontmatter.publishDate) -
            Number((left.data as VFileData).frontmatter.publishDate)
    );
}
