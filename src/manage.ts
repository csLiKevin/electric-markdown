process.env.NODE_ENV = "production";

import { promises } from "fs";
import { join } from "path";
import { demandCommand } from "yargs";
import { CONTENT_FILE, INDEX_FILE, POSTS_DIRECTORY } from "./constants";
import {
    buildHomePage,
    buildPostPage,
    buildPostsPage,
    deleteGeneratedFiles,
    getPostIds,
} from "./helpers";
import { template } from "../templates/content";

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

            // TODO: Prevent unpublished posts from being generated.
            for (const postId of await getPostIds()) {
                await writeFile(
                    join(POSTS_DIRECTORY, postId, INDEX_FILE),
                    await buildPostPage(postId)
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
