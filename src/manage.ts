process.env.NODE_ENV = "production";

import { promises } from "fs";
import { join } from "path";
import { compileFile } from "pug";
import { demandCommand } from "yargs";
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
import { deleteGeneratedFiles, getPost, getPostIds, paginate } from "./helpers";
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
            const homepageTemplate = compileFile(
                join(TEMPLATES_DIRECTORY, INDEX_TEMPLATE)
            );
            const postTemplate = compileFile(
                join(TEMPLATES_DIRECTORY, POST_TEMPLATE)
            );
            const postsTemplate = compileFile(
                join(TEMPLATES_DIRECTORY, POSTS_TEMPLATE)
            );

            const { homepage } = config;
            await writeFile(
                INDEX_FILE,
                homepageTemplate(await getPost(homepage))
            );

            const postIds = await getPostIds();
            const pages = paginate(postIds, 10);
            for (const page of pages) {
                const posts = await Promise.all(
                    page.map((postId) => getPost(postId))
                );
                await writeFile(
                    join(POSTS_DIRECTORY, INDEX_FILE),
                    postsTemplate({ posts: posts, ...config })
                );

                for (const post of posts) {
                    const { dirname = "" } = post;
                    await writeFile(
                        join(dirname, INDEX_FILE),
                        postTemplate(post)
                    );
                }
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
