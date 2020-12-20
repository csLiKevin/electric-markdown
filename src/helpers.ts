import { promises } from "fs";
import { join, relative } from "path";
import { renderFile } from "pug";
import { VFile } from "vfile";
import { config } from "./config";
import {
    CONTENT_FILE,
    INDEX_FILE,
    INDEX_TEMPLATE,
    POSTS_DIRECTORY,
    POSTS_TEMPLATE,
    POST_TEMPLATE,
    TEMPLATES_DIRECTORY,
} from "./constants";
import { transform, VFileData } from "./transform";

const { formatDate, homepage, production, showRecentFirst } = config;
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

export async function buildHomePage(): Promise<string> {
    const post = await getPost(homepage);
    if (production && !(post.data as VFileData).frontmatter.publishDate) {
        throw new Error("Homepage is not published.");
    }
    return renderFile(join(TEMPLATES_DIRECTORY, INDEX_TEMPLATE), {
        ...post,
        ...config,
    });
}

export async function buildPostPage(postId: string): Promise<string> {
    const post = await getPost(postId);
    return renderFile(join(TEMPLATES_DIRECTORY, POST_TEMPLATE), {
        ...post,
        ...config,
    });
}

export async function buildPostsPage(
    page: number,
    pageSize = 10
): Promise<string> {
    const posts = await getPosts();
    const pages = paginate(posts, pageSize);
    // 0 or Nan will use page 1.
    // Past last page will use last page.
    const last = Math.ceil(posts.length / pageSize);
    const target = Math.min(page, last) || 1;

    return renderFile(join(TEMPLATES_DIRECTORY, POSTS_TEMPLATE), {
        posts: pages[target - 1],
        title: "Posts",
        ...config,
    });
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

async function getPost(postId: string): Promise<VFile> {
    const path = join(POSTS_DIRECTORY, postId, CONTENT_FILE);

    const vFile = await transform(path);
    const vFileData = vFile.data as VFileData;
    vFileData.url = toAbsoluteUrl(vFile.dirname || "");

    const {
        frontmatter: { publishDate },
    } = vFileData;
    if (publishDate) {
        vFileData.frontmatter.publishDate = (formatDate(
            publishDate
        ) as unknown) as Date;
    }

    for (const [key, value] of Object.entries(config)) {
        vFile[key] = value;
    }

    return vFile;
}

async function getPosts(): Promise<VFile[]> {
    const postIds = await getPostIds();
    const posts = (
        await Promise.all(postIds.map((postId) => getPost(postId)))
    ).filter(
        (post) =>
            !production || (post.data as VFileData).frontmatter.publishDate
    );
    if (showRecentFirst) {
        posts.sort(
            // Put posts with a more recent publish date first.
            (left, right) =>
                Number((right.data as VFileData).frontmatter.publishDate) -
                Number((left.data as VFileData).frontmatter.publishDate)
        );
    }

    return posts;
}

export async function getPostIds(): Promise<string[]> {
    return (await readdir(POSTS_DIRECTORY, { withFileTypes: true }))
        .filter((dirent) => dirent.isDirectory())
        .map(({ name }) => name);
}

function paginate<T>(array: T[], pageSize: number): T[][] {
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
