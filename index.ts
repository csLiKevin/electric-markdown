import { create } from "browser-sync";
import express, { NextFunction } from "express";
import { config } from "./src/config";
import {
    INDEX_TEMPLATE,
    POSTS_TEMPLATE,
    POST_TEMPLATE,
    TEMPLATES_DIRECTORY,
} from "./src/constants";
import { getPost, getPosts } from "./src/helpers";

async function asyncResponse(
    callback: () => Promise<void>,
    next: NextFunction
) {
    try {
        await callback();
    } catch (error) {
        next(error);
    }
}

const app = express();

app.set("views", TEMPLATES_DIRECTORY);
app.set("view engine", "pug");

app.use(express.static("."));

app.get("/", async (_, response, next) => {
    await asyncResponse(async () => {
        const { homepage } = config;
        const post = await getPost(homepage);
        response.render(INDEX_TEMPLATE, post);
    }, next);
});

app.get("/posts", async (request, response, next) => {
    const {
        query: { page },
    } = request;

    await asyncResponse(async () => {
        const posts = await getPosts(Number(page));
        response.render(POSTS_TEMPLATE, {
            posts: posts,
            title: "Posts",
            ...config,
        });
    }, next);
});

app.get("/posts/:postId", async (request, response, next) => {
    const {
        params: { postId },
    } = request;

    await asyncResponse(async () => {
        const post = await getPost(postId);
        response.render(POST_TEMPLATE, post);
    }, next);
});

app.listen(3000);

create().init({
    files: ["**/*.pug", "**/*.md"],
    open: false,
    proxy: "localhost:3000",
    ui: false,
});
