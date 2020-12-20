process.env.NODE_ENV = "production";

import { promises } from "fs";
import { join } from "path";
import { demandCommand } from "yargs";
import {
    CONTENT_FILE,
    INDEX_FILE,
    POSTS_DIRECTORY,
    TAGS_DIRECTORY,
} from "./constants";
import {
    buildHomePage,
    buildPostPage,
    buildPostsPage,
    buildTagPage,
    buildTagsPage,
    deleteGeneratedFiles,
    getPosts,
    getPostIds,
} from "./helpers";
import { template } from "../templates/content";
import { VFileData } from "./transform";

const { mkdir, writeFile } = promises;

type AddArguments = { title: string };

demandCommand()
    .command(
        "add <title>",
        "add a post",
        (yargs) => {
            yargs.positional("title", {
                describe: "post title",
                type: "string",
            });
        },
        async ({ title }: AddArguments) => {
            const postIds = await getPostIds();
            const postDirectory = join(
                POSTS_DIRECTORY,
                `${postIds.length + 1}`.padStart(8, "0")
            );

            const filePath = join(postDirectory, CONTENT_FILE);

            await mkdir(postDirectory, { recursive: true });
            await writeFile(filePath, template(title));
        }
    )
    .command(
        "build",
        "build static website",
        () => undefined,
        async () => {
            await writeFile(INDEX_FILE, await buildHomePage());

            // TODO: Support pagination.
            await writeFile(
                join(POSTS_DIRECTORY, INDEX_FILE),
                await buildPostsPage(1)
            );

            const posts = await getPosts();

            for (const post of posts) {
                const data = post.data as VFileData;
                const { postId } = data;
                await writeFile(
                    join(POSTS_DIRECTORY, postId, INDEX_FILE),
                    await buildPostPage(postId)
                );
            }

            await mkdir(TAGS_DIRECTORY, { recursive: true });
            await writeFile(
                join(TAGS_DIRECTORY, INDEX_FILE),
                await buildTagsPage()
            );

            const tags = posts.reduce((accumulator, post) => {
                const {
                    frontmatter: { tags },
                } = post.data as VFileData;
                tags.forEach((tag) => accumulator.add(tag));
                return accumulator;
            }, new Set<string>());

            for (const tag of Array.from(tags)) {
                const directory = join(TAGS_DIRECTORY, tag);
                await mkdir(directory, { recursive: true });
                await writeFile(
                    join(directory, INDEX_FILE),
                    await buildTagPage(tag)
                );
            }
        }
    )
    .command(
        "clean",
        "delete generated files",
        () => undefined,
        async () => {
            await deleteGeneratedFiles();
        }
    )
    .strict()
    .parse();
