export const config = {
    formatDate: (date: Date): string => date.toISOString().split("T")[0],
    homepage: "00000001",
    showRecentFirst: false,
    siteDescription:
        "An opinionated static site generator. Focus on your content, generate everything else.",
    siteTitle: "Electric Markdown",
};

export default config;
