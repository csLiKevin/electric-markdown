import { create } from "browser-sync";
import express from "express";

const app = express();

app.set("views", ".");
app.set("view engine", "pug");

app.get("/", (_, response) => {
    response.render("templates/index", {
        title: "Hey",
        message: "Hello there!",
    });
});

app.listen(3000);

create().init({
    files: ["*/**/*.pug"],
    proxy: "localhost:3000",
    ui: false,
});
