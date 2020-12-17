// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="./types.d.ts"/>
import dictionary from "dictionary-en";
import { safeLoad } from "js-yaml";
import { join, relative } from "path";
import { rehypeAccessibleEmojis } from "rehype-accessible-emojis";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeFormat from "rehype-format";
import rehypeStringify from "rehype-stringify";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import rehypeSlug from "rehype-slug";
import remarkCapitalize from "remark-capitalize";
import remarkEmoji from "remark-emoji";
import remarkExternalLinks from "remark-external-links";
import remarkFootnotes from "remark-footnotes";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import remarkNormalizeHeadings from "remark-normalize-headings";
import remarkNumberedFootnoteLabels from "remark-numbered-footnote-labels";
import remarkParse from "remark-parse";
import remarkPresetLint from "remark-preset-lint-markdown-style-guide";
import remarkToRehype from "remark-rehype";
import remarkToRetext from "remark-retext";
import remarkSmartypants from "@silvenon/remark-smartypants";
import remarkValidateLinks from "remark-validate-links";
import retextAssuming from "retext-assuming";
import retextContractions from "retext-contractions";
import retextDiacritics from "retext-diacritics";
import retextEnglish from "retext-english";
import retextIndefiniteArticle from "retext-indefinite-article";
import retextIntensify from "retext-intensify";
import retextOveruse from "retext-overuse";
import retextPassive from "retext-passive";
import retextProfanities from "retext-profanities";
import retextReadability from "retext-readability";
import retextRedundantAcronyms from "retext-redundant-acronyms";
import retextRepeatedWords from "retext-repeated-words";
import retextSentenceSpacing from "retext-sentence-spacing";
import retextSimplify from "retext-simplify";
import retextSpell from "retext-spell";
import { read } from "to-vfile";
import { VFileCompatible, VFile } from "vfile";
import reporter from "vfile-reporter";
import unified, { Transformer } from "unified";
import visit from "unist-util-visit";
import { URL } from "url";
import { Node } from "unist";

const production = process.env.NODE_ENV === "production";

export type VFileData = Record<string, unknown>;

function noOpAttacher(): void {
    return undefined;
}

function remarkFrontmatterYaml(): Transformer {
    return (node, vFile) => {
        visit(node, "yaml", ({ value }) => {
            const data = vFile.data as { frontmatter: VFileData };
            data.frontmatter = {
                ...data.frontmatter,
                ...(safeLoad(value as string) as VFileData),
            };
        });
    };
}

function remarkVariables(): Transformer {
    const regex = /{{ *(?<variable>[\w\.]+) *}}/g;

    return (node, vFile) => {
        const data = vFile.data as VFileData;

        visit(node, "text", (node) => {
            const value = node.value as string;
            const matches = Array.from(value.matchAll(regex));

            node.value = matches.reduce((value, [match, variable]) => {
                const variableValue = variable
                    .split(".")
                    .reduce(
                        (obj, property) => obj[property] as VFileData,
                        data
                    ) as unknown;

                if (!variableValue) {
                    return value;
                }

                return value.replace(match, variableValue as string);
            }, value);
        });
    };
}

function remarkUrls(): Transformer {
    // Convert relative url paths to absolute url paths.
    function transformUrl(node: Node, directoryName: string): void {
        const url = node.url as string;

        // Ignore absolute urls.
        try {
            new URL(url);
            return;
        } catch (error) {}

        // Must start with /. Replace \ with / on Windows.
        node.url = `/${relative(".", join(directoryName, url)).replace(
            /\\/g,
            "/"
        )}`;
    }

    return (node, vFile) => {
        visit(node, ["image", "link"], (node) => {
            transformUrl(node, vFile.dirname || "");
        });
    };
}

function retextShim(): Transformer {
    return (_, vFile) => {
        // Hack for plugins using an old version of vfile.
        vFile.warn = vFile.message;
    };
}

const transformer = unified()
    .use(remarkParse)
    .use(remarkFrontmatter)
    .use(remarkFrontmatterYaml) // Must come after remarkFrontmatter.
    .use(remarkVariables) // Must come after plugins that update VFileData and before any transformations.
    .use(remarkEmoji)
    .use(remarkCapitalize) // Must come after remarkEmoji.
    .use(remarkExternalLinks, {
        target: "_blank",
        rel: ["nofollow", "noopener", "noreferrer"],
    })
    .use(remarkFootnotes)
    .use(remarkGfm)
    .use(remarkNormalizeHeadings)
    .use(remarkNumberedFootnoteLabels)
    .use(production ? noOpAttacher : remarkPresetLint)
    .use(remarkSmartypants)
    .use(production ? noOpAttacher : remarkValidateLinks)
    .use(remarkUrls) // Must come after remarkValidateLinks.
    .use(
        production ? noOpAttacher : remarkToRetext,
        unified()
            .use(retextShim)
            .use(retextEnglish)
            .use(retextAssuming) // Needs shim.
            // .use(retextCliches)
            .use(retextContractions)
            .use(retextDiacritics)
            .use(retextIndefiniteArticle)
            .use(retextIntensify)
            .use(retextOveruse) // Needs shim. Potential performance issues.
            .use(retextPassive)
            .use(retextProfanities)
            .use(retextReadability)
            .use(retextRedundantAcronyms)
            .use(retextRepeatedWords)
            .use(retextSentenceSpacing)
            .use(retextSimplify)
            .use(retextSpell, dictionary)
        // .use(retextUsage)
    )
    .use(remarkToRehype, { allowDangerousHtml: true })
    .use(rehypeRaw) // Must come after remarkToRehype.
    .use(rehypeSanitize)
    .use(rehypeAccessibleEmojis)
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings) // Must come after remarkSlug.
    .use(rehypeFormat)
    .use(rehypeStringify);

export async function transform(
    vFileCompatible: VFileCompatible
): Promise<VFile> {
    const vFile = await read(vFileCompatible);
    await transformer.process(vFile);
    !production && console.log(reporter(vFile));
    return vFile;
}
