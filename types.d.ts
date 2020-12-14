// npm packages missing types.

declare module "dictionary-en";

declare module "rehype-format";

declare module "remark-capitalize";
declare module "remark-emoji";
declare module "remark-normalize-headings";
declare module "remark-numbered-footnote-labels";
declare module "remark-preset-lint-markdown-style-guide";
declare module "remark-retext";
declare module "@silvenon/remark-smartypants";
declare module "remark-validate-links";

declare module "retext-assuming";
declare module "retext-contractions";
declare module "retext-diacritics";
declare module "retext-english";
declare module "retext-indefinite-article";
declare module "retext-intensify";
declare module "retext-overuse";
declare module "retext-passive";
declare module "retext-profanities";
declare module "retext-readability";
declare module "retext-redundant-acronyms";
declare module "retext-repeated-words";
declare module "retext-sentence-spacing";
declare module "retext-simplify";
declare module "retext-spell";

declare module "to-vfile" {
    import { VFile, VFileCompatible } from "vfile";

    export function read(
        options: VFileCompatible,
        encoding?: string,
        callback?: (arg: Error | VFile) => void
    ): Promise<VFile>;
}

declare module "vfile-reporter" {
    import { VFile } from "vfile";

    type options = {
        color?: boolean;
        defaultName?: string;
        quiet?: boolean;
        silent?: boolean;
        verbose?: boolean;
    };

    export default function reporter(
        files: VFile | VFile[],
        options?: options
    ): void;
}
