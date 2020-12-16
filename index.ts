import { create } from "browser-sync";
import express from "express";
import { getPost, getPosts } from "./helpers";

const app = express();

app.set("views", "templates");
app.set("view engine", "pug");

app.use(express.static("."));

app.get("/", (_, response) => {
    response.render("index", {
        title: "Hey",
        message: "Hello there!",
    });
});

app.get("/posts", async (request, response, next) => {
    const {
        query: { page },
    } = request;

    try {
        const posts = await getPosts(Number(page));
        response.render("posts", { posts: posts, title: "Posts" });
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
        response.render("post", post);
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
