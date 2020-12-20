import { create } from "browser-sync";
import express, { NextFunction } from "express";
import {
    buildHomePage,
    buildPostPage,
    buildPostsPage,
    buildTagPage,
    buildTagsPage,
} from "./helpers";

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

app.use(express.static(".", { index: false }));

app.get("/", async (_, response, next) => {
    await asyncResponse(async () => {
        response.send(await buildHomePage());
    }, next);
});

app.get("/posts", async (request, response, next) => {
    const {
        query: { page },
    } = request;

    await asyncResponse(async () => {
        response.send(await buildPostsPage(Number(page)));
    }, next);
});

app.get("/posts/:postId", async (request, response, next) => {
    const {
        params: { postId },
    } = request;

    await asyncResponse(async () => {
        response.send(await buildPostPage(postId));
    }, next);
});

app.get("/tags", async (_, response, next) => {
    await asyncResponse(async () => {
        response.send(await buildTagsPage());
    }, next);
});

app.get("/tags/:tag", async (request, response, next) => {
    const {
        params: { tag },
    } = request;

    await asyncResponse(async () => {
        response.send(await buildTagPage(tag));
    }, next);
});

app.listen(3000);

create().init({
    files: ["**/*.css", "**/*.md", "**/*.pug"],
    open: false,
    proxy: "localhost:3000",
    ui: false,
});
