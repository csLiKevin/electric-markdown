process.env.NODE_ENV = "production";

import { promises } from "fs";
import { join } from "path";
import { compileFile } from "pug";
import { demandCommand } from "yargs";
import {
    BUILD_DIRECTORY,
    CONTENT_FILE,
    INDEX_TEMPLATE,
    POSTS_DIRECTORY,
    POSTS_TEMPLATE,
    POST_TEMPLATE,
    STATIC_DIRECTORY,
    TEMPLATES_DIRECTORY,
} from "./src/constants";
import { copyDirectory, getPost, getPostIds, paginate } from "./src/helpers";
import { template } from "./templates/content";

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
            const postIds = await getPostIds();
            const pages = paginate(postIds, 10);

            await mkdir(BUILD_DIRECTORY, { recursive: true });

            await copyDirectory(STATIC_DIRECTORY, BUILD_DIRECTORY);

            const homepageTemplate = compileFile(
                join(TEMPLATES_DIRECTORY, INDEX_TEMPLATE)
            );
            await writeFile(
                join(BUILD_DIRECTORY, "index.html"),
                homepageTemplate(await getPost(postIds[0]))
            );

            const postTemplate = compileFile(
                join(TEMPLATES_DIRECTORY, POST_TEMPLATE)
            );
            const postsTemplate = compileFile(
                join(TEMPLATES_DIRECTORY, POSTS_TEMPLATE)
            );
            for (const page of pages) {
                const posts = await Promise.all(
                    page.map((postId) => getPost(postId))
                );
                await writeFile(
                    join(BUILD_DIRECTORY, POSTS_DIRECTORY, "index.html"),
                    postsTemplate({ posts: posts })
                );

                for (const post of posts) {
                    const { dirname = "" } = post;
                    await copyDirectory(dirname, BUILD_DIRECTORY);
                    await writeFile(
                        join(BUILD_DIRECTORY, dirname, "index.html"),
                        postTemplate(post)
                    );
                }
            }
        }
    )
    .strict()
    .parse();
