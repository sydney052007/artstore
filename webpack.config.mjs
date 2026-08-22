import path from "path";
import { fileURLToPath } from "url";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import CopyWebpackPlugin from "copy-webpack-plugin";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
    mode: "development",
    entry: "./src/admin/client.js",
    devtool: "source-map",
    output: {
        // Vercel ignores express.static() entirely and only serves files
        // placed under public/**, so build output has to land there.
        path: path.resolve(__dirname, "public"),
        filename: "bundle.js"
    },
    devServer: {
        watchFiles: ["./templates/admin","./templates/supplier"],
        port: 5100,
        client: { webSocketURL: "http://localhost:5000/ws" }
    },
    module:{
        rules: [
            { test: /\.handlebars$/, loader: "handlebars-loader" },
            {
                test: /\.css$/,
                use: [MiniCssExtractPlugin.loader , "css-loader"]
            }
        ]
    },
    resolve: {
        alias: {
            "@templates": path.resolve(__dirname, "templates")
        }
    },
    plugins: [
        new MiniCssExtractPlugin({ filename: "style.css" }),
        new CopyWebpackPlugin({
            patterns: [
                { from: "src/admin/pics", to: "pics" },
                { from: "node_modules/bootstrap/dist/css/bootstrap.min.css", to: "css/bootstrap.min.css" },
                { from: "node_modules/bootstrap/dist/js/bootstrap.bundle.min.js", to: "js/bootstrap.bundle.min.js" },
                { from: "node_modules/bootstrap-icons/font", to: "font" },
                { from: "node_modules/flatpickr/dist/flatpickr.min.css", to: "dist/flatpickr.min.css" },
                { from: "node_modules/htmx.org/dist/htmx.min.js", to: "htmx.min.js" }
            ]
        })
    ]
}
