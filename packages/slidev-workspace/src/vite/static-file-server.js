"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.staticFilePlugin = staticFilePlugin;
var node_fs_1 = require("node:fs");
var node_path_1 = require("node:path");
var node_url_1 = require("node:url");
var config_1 = require("../scripts/utils/config");
var mimeTypes = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
};
// 静态文件服务插件
function staticFilePlugin(workspaceCwd, config) {
    return {
        name: 'static-file-server',
        configureServer: function (server) {
            var _a;
            var baseUrl = ((_a = config.baseUrl) === null || _a === void 0 ? void 0 : _a.startsWith('/')) ? config.baseUrl.slice(1) : config.baseUrl;
            var slidesDirs = (0, config_1.resolveSlidesDirs)(config, workspaceCwd);
            var slideDistMap = new Map();
            // 构建幻灯片目录映射
            for (var _i = 0, slidesDirs_1 = slidesDirs; _i < slidesDirs_1.length; _i++) {
                var slidesDir = slidesDirs_1[_i];
                if (!(0, node_fs_1.existsSync)(slidesDir))
                    continue;
                var slides = (0, node_fs_1.readdirSync)(slidesDir, { withFileTypes: true })
                    .filter(function (dirent) { return dirent.isDirectory(); })
                    .map(function (dirent) { return dirent.name; });
                for (var _b = 0, slides_1 = slides; _b < slides_1.length; _b++) {
                    var slideName = slides_1[_b];
                    var slideDistDir = (0, node_path_1.resolve)(slidesDir, slideName, 'dist');
                    if ((0, node_fs_1.existsSync)(slideDistDir)) {
                        slideDistMap.set(slideName, slideDistDir);
                    }
                }
            }
            server.middlewares.use(function (req, res, next) {
                var url = (0, node_url_1.parse)(req.url || '', true);
                var pathname = url.pathname || '';
                // 检查是否是预览路径
                var previewMatch = pathname.match(new RegExp("^/".concat(baseUrl, "/([\\d\\-]+)(/.*)?$")));
                if (previewMatch) {
                    var pathname_1 = previewMatch[0], slideName = previewMatch[1];
                    var distDir = slideDistMap.get(slideName);
                    var assetPreviewMatch = pathname_1.match(new RegExp("^/".concat(baseUrl, "/(\\d{4}-\\d{2}-\\d{2})/assets/.+$")));
                    if (assetPreviewMatch) {
                        var slidevPathName = pathname_1.match(/\/assets\/(.*)$/)[0];
                        var dateStr = assetPreviewMatch[1];
                        var content = (0, node_fs_1.readFileSync)((0, node_path_1.join)(slideDistMap.get(dateStr), slidevPathName), 'utf8').replace(/assets\//g, "".concat(baseUrl, "/").concat(dateStr, "/assets/"));
                        var ext = (0, node_path_1.extname)(slidevPathName);
                        res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream');
                        res.end(content);
                        return;
                    }
                    // 处理入口文件
                    if (distDir) {
                        var targetPath = (0, node_path_1.resolve)(distDir, 'index.html');
                        try {
                            if ((0, node_fs_1.existsSync)(targetPath)) {
                                var content = (0, node_fs_1.readFileSync)(targetPath, 'utf8')
                                    .replace(/href="\/assets\//g, "href=\"/".concat(baseUrl, "/").concat(slideName, "/assets/"))
                                    .replace(/src="\/assets\//g, "src=\"/".concat(baseUrl, "/").concat(slideName, "/assets/"));
                                var ext = (0, node_path_1.extname)(targetPath);
                                res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream');
                                res.end(content);
                                return;
                            }
                        }
                        catch (error) {
                            console.error('Error serving file:', error);
                        }
                    }
                }
                next();
            });
        },
    };
}
