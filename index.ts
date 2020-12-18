import { create } from "browser-sync";
import express from "express";
import {
    INDEX_TEMPLATE,
    POSTS_TEMPLATE,
    POST_TEMPLATE,
    TEMPLATES_DIRECTORY,
} from "./src/constants";
import { getPost, getPostIds, getPosts } from "./src/helpers";

const app = express();

app.set("views", TEMPLATES_DIRECTORY);
app.set("view engine", "pug");

app.use(express.static("."));

app.get("/", async (_, response, next) => {
    try {
        const postIds = await getPostIds();
        const post = await getPost(postIds[0]);
        response.render(INDEX_TEMPLATE, post);
    } catch (error) {
        next(error);
    }
});

app.get("/posts", async (request, response, next) => {
    const {
        query: { page },
    } = request;

    try {
        const posts = await getPosts(Number(page));
        response.render(POSTS_TEMPLATE, { posts: posts, title: "Posts" });
    } catch (error) {
        next(error);
    }
});

app.get("/posts/:postId", async (request, response, next) => {
    const {
        params: { postId },
    } = request;

    try {
        const post = await getPost(postId);
        response.render(POST_TEMPLATE, post);
    } catch (error) {
        next(error);
    }
});

app.listen(3000);

create().init({
    files: ["**/*.pug", "**/*.md"],
    open: false,
    proxy: "localhost:3000",
    ui: false,
});
