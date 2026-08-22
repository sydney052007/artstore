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
        path: path.resolve(__dirname, "dist/admin"),
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
                { from: "src/admin/pics", to: "pics" }
            ]
        })
    ]
}