import type { ModuleOptions } from "@nuxtjs/tailwindcss";

export default {
    cssPath: ["~/assets/css/tailwind.css", { injectPosition: "first" }],
    configPath: "./config/tailwind.config",
    exposeConfig: {
        level: 2
    },
    config: {},
    viewer: true
} as Partial<ModuleOptions>