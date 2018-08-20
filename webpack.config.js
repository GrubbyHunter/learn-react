/**
 * @desc webpack 配置文件
 * @author Grubby
 */
const Visualizer = require('webpack-visualizer-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
let path = require('path')


module.exports = {
  watch: true,
  devtool: 'cheap-module-eval-source-map',

  entry: path.resolve(__dirname, './index.js'),
  output: {
    path: path.resolve(__dirname, './build'),
    filename: 'bundle.js'
  },

  module: {
    rules: [
      {
        test: /[.js|.jsx]$/,
        use: {
          loader: 'babel-loader',
          options: {//具体的编译的类型，
            compact: false,//表示不压缩
            presets: ['es2015', 'react']//我们需要编译的是es6和react
          }
        },
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx', '.json'],
    alias: {
      'React': 'anujs',
      'ReactDOM': 'anujs'
    }
  },
  plugins: [
    // 生成可视化的打包配置图
    new Visualizer({
      filename: './stats.html'
    }),
    new HtmlWebpackPlugin()
  ]
}