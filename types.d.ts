// npm packages missing types.

declare module "rehype-format";
declare module "remark-retext";
declare module "retext-english";
declare module "retext-indefinite-article";

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
