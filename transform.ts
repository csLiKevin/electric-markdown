// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="types.d.ts"/>
import doc from "rehype-document";
import format from "rehype-format";
import html from "rehype-stringify";
import markdown from "remark-parse";
import remark2rehype from "remark-rehype";
import remark2retext from "remark-retext";
import english from "retext-english";
import indefiniteArticle from "retext-indefinite-article";
import { read } from "to-vfile";
import { VFileCompatible, VFile } from "vfile";
import reporter from "vfile-reporter";
import unified from "unified";

const processor = unified()
    .use(markdown)
    .use(remark2retext, unified().use(english).use(indefiniteArticle))
    .use(remark2rehype)
    .use(doc, { title: "Contents" })
    .use(format)
    .use(html);

export async function transform(
    vFileCompatible: VFileCompatible
): Promise<VFile> {
    const vFile = await read(vFileCompatible);
    await processor.process(vFile);
    console.log(reporter(vFile));
    return vFile;
}
