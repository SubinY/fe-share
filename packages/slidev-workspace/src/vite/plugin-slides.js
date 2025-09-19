"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.slidesPlugin = slidesPlugin;
var node_fs_1 = require("node:fs");
var getSlideFrontmatter_1 = require("../scripts/utils/getSlideFrontmatter");
var config_1 = require("../scripts/utils/config");
var args = process.argv.slice(2);
function slidesPlugin() {
    return {
        name: 'vite-plugin-slides',
        configureServer: function (server) {
            var _a;
            var watchers = [];
            // Resolve slides directories at runtime, not build time
            var config = (0, config_1.loadConfig)();
            var slidesDirs = (0, config_1.resolveSlidesDirs)(config);
            // Watch for changes in all slides directories
            slidesDirs.forEach(function (slidesDir) {
                var watcher = (0, node_fs_1.watch)(slidesDir, { recursive: true }, function (eventType, filename) {
                    if (filename && filename.endsWith('slides.md')) {
                        // Reload frontmatter
                        try {
                            var slides = (0, getSlideFrontmatter_1.getAllSlidesFrontmatter)();
                            // Trigger HMR update
                            server.ws.send({
                                type: 'custom',
                                event: 'slides-updated',
                                data: slides,
                            });
                        }
                        catch (error) {
                            console.error('❌ Error reading slides frontmatter:', error);
                        }
                    }
                });
                watchers.push(watcher);
            });
            // Clean up watchers when the server is closed
            (_a = server.httpServer) === null || _a === void 0 ? void 0 : _a.once('close', function () {
                watchers.forEach(function (watcher) { return watcher.close(); });
            });
        },
        // Provide a virtual module to get slides data
        resolveId: function (id) {
            if (id === 'slidev:content') {
                return id;
            }
        },
        load: function (id) {
            if (id === 'slidev:content') {
                try {
                    var slides = (0, getSlideFrontmatter_1.getAllSlidesFrontmatter)();
                    return "export const slidesData = ".concat(JSON.stringify(slides, null, 2), ";\nexport default slidesData;");
                }
                catch (error) {
                    console.error('Error loading slides data:', error);
                    return "export const slidesData = [];\nexport default slidesData;";
                }
            }
        },
    };
}
