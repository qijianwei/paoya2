const path = require('path')
let config = {
    mode: 'none',
    entry: './src/index.ts',
    target: 'web',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'paoya.core.js'
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader'
            },
            {
                test: /\.js$/,
                exclude: [
                    /(node_modules|bower_components)/,
                    path.resolve(__dirname,'src/dataTrack/mta_analysis.js')
                ],
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            }
        ]
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js']
    }
}
module.exports = config