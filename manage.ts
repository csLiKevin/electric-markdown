import { promises } from "fs";
import { join } from "path";
import { demandCommand } from "yargs";
import { CONTENT_FILE, POSTS_DIRECTORY } from "./src/constants";
import { getPostIds } from "./src/helpers";
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
        () => console.log("Not Implemented")
    )
    .strict()
    .parse();
