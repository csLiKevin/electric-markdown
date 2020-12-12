import { create } from "browser-sync";
import express from "express";
import { join } from "path";
import { transform } from "./transform";

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

app.get("/posts/:postId", async (request, response, next) => {
    const { url } = request;
    const path = join(url.substring(1), "content.md");
    try {
        const { contents } = await transform(path);
        response.send(contents);
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
