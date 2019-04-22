基本安装:
	• 本地安装webpack  
	npm init -y     // 初始化npm
	npm install webpack webpack-cli --save-dev
	
	"private":true        确保我们的安装包是私有的，移除main入口，这可以防止意外发布你的代码
	<script>标签之间存在隐式依赖关系使用这种方法去管理JavaScript会有一些问题：
	        1. 无法立即体现，脚本的执行依赖于外部扩展库
		2. 如果依赖不存在，或者引入顺序错误，应用程序将无法正常执行
		3.如果依赖被引入但是没有使用，浏览器将被迫下载无用代码
	webpack.config.js
	const path = require('path');
		module.exports = {
		entry: './src/index.js',
		output: {
			filename: 'bundle.js',
			path: path.resolve(__dirname,'dist')
		}
	}
	
	将 src内的文件导出为bundle.js
	
资源管理：

webpack.config.js
	module:{
	rules:[
		{
			test:/\.css$/,
				use:[
				'style-loader',
				'css-loader'
				]
			},
			{
				test: /\.(png|svg|jpg|gif)$/,
				use: [
				'file-loader'
				]
			},
			{
				test: /\.(woff|woff2|eot|ttf|otf)$/,
				use: [
				'file-loader'
				]
			},
			{
				test: /\.(csv|tsv)$/,
				use: [
				'csv-loader'
				]
			},
			{
				test: /\.xml$/,
				use: [
				'xml-loader'
				]
			}
		]
	}
将src文件内的相关文件用相应组件编译，输出到dist内的bundle文件中

管理输出：
对于有多个js文件，通过名字的不同。将多个js文件同时编译输出

webpack.config.js
entry:{
		app: './src/index.js',
		print: './src/print.js'
	},
	output: {
		// filename: 'bundle.js',
		filename: '[name].bundle.js',
		path: path.resolve(__dirname,'dist')
	}
}
HtmlWebpackPlugin会用新生成的index.html文件，把我们原来的替换
npm install --save-dev html-webpack-plugin     npm 安装依赖

const HtmlWebpackPlugin = require('html-webpack-plugin')  导入插件
plugins:[
	new HtmlWebpackPlugin({
		title: 'Output Management'                                       构建类
	})
],
clean-webpack-plugin 是一个管理插件，可以清理未使用的输出文件
npm install clean-webpack-plugin --save-dev  

webpack.config.js
const CleanWebpackPlugin = require('clean-webpack-plugin')
plugins:[
	new CleanWebpackPlugin(['dist'])
],

开发：
       当webpack打包源码时，可能会很难追踪到错误和警告在源码中的原始位置。JavaScript提供了source map功能，将编译后的代码映射回原始源码。使用的inline-source-map选项，这有助于解释说明我们的目的（仅解释说明，不要用于生产环境）
webpack.config.js
module.exports = {
	devtool: 'inline-source-map'
}

package.json
使用观察模式：
{
	"scripts": {
		"watch":"webpack --watch"
	}
}
使用webpack-dev-server:
webpack-dev-server为你提供了一个简单的web服务器，并且能够实时重新加载
npm install --save-dev webpack-dev-server

webpack.config.js 
module.exports = {
	devServer:{
		contentBase: './dist'
	}
}
修改配置文件，告诉开发服务器，在哪里查找文件
"scripts": {
	"test": "echo \"Error: no test specified\" && exit 1",
	"build": "webpack",
	"watch": "webpack --watch",
	"start": "webpack-dev-server --open"        
	运行npm start,就会看到自动加载页面和刷新
},

使用webpack-dev-middleware：
webpack-dev-middleware是一个容器，可以把webpack处理后的文件传递给一个服务器。webpack-dev-server在内部使用了它，同时，它也可以作为一个单独的包来，以便进行更多自定义设置来实现更多的需求

模块热替换：
模块热替换是webpack提供的最有用的功能之一，它允许在运行时更新各种模块，而无需进行完全刷新
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const webpack = require('webpack')
module.exports = {
	devServer:{
		contentBase: './dist',
		hot: true
	},
	plugins:[
		new webpack.NamedModulesPlugin(),
		new webpack.HotModuleReplacementPlugin()
	]
}

tree shaking: 
为了使用tree shaking，你必须：
	• 使用es2015模块语法（即import和export）
	• 在项目package.json文件中，添加一个"sideEffects"入口
	• 引入一个能够删除未引用代码的压缩工具
	{
		"name": "webpack-demo",
		"sideEffects": [
			"./src/some-side-effectful-file.js",
			"*.css"
		]
	}
	如果所有的代码都不包含副作用，我们就可以简单的将该属性标记为false，来告诉webpack，可以安全的删除export导出
	副作用的定义是，在导入时会执行特殊行为的代码，而不是仅仅暴露一个export或多个export。
	如果你的代码确实有一些副作用，那么可以改为提供一个数组
	注意：任何导入文件都会受到tree shaking的影响。这意味着，如果在项目中使用类似css-loader并导入css文件，则需要将其添加到side effect列表中，以免在生产模式中将它删除
	
	module.exports = {
		mode:"production",
	}
	从webpack4开始，可以通过mode配置选项轻松切换到压缩输出。只需要设置为“production”
	
生产环境构建:
                                                                                    entry
                                         webpack.common.js ----> plugins
                                                                                    output
                                                                                   
webpack.config.js ----->  webpack.dev.js         ----->devtool   
                                                                                    devServer
                                         webpack.prod.js        ----->plugins   -->UglifyJSPlugin

现在：在webpack.common.js中，我们设置了entry和output配置，并且在其中引入这两个公用部分的全部插件，在webpack.dev.js中，我们为此环境添加了推荐的devtool(强大的source map)和简单的devServer配置，最后在，webpack.prod.js中，我们引入了之前在tree shaking指南中介绍过的UglifyJSPlugin
webpack.config.js
{
	"scripts": {
		"test": "echo \"Error: no test specified\" && exit 1",
		"watch": "webpack --watch",
		"start": "webpack-dev-server --open --config webpack.dev.js",
		"build": "webpack --config webpack.prod.js"
	}
}
source map
source map 对调试源码和运行基准测试很有帮助，虽然有如此强大的功能，然而还是应该针对生成环境用途，选择一个构建快速的推荐配置。我们将在生产环境中使用source-map选项，而不是在开发环境中用到inline-source-map:
const UglifyJSPlugin = require('uglifyjs-webpack-plugin')
module.exports = {
	devtool:'source-map',
	plugins:[
		new UglifyJSPlugin({
		sourceMap: true
		})
	]
}
避免在生产中使用inline-和eval-，因为他们可以增加bundle大小，并降低整体性能

指定环境：
许多libray将通过与process.env.NODE_ENV环境变量关联，以决定library中应该应用哪些内容。其实，当使用process.env.NODE_ENV === 'production' 时，一些library可能针对具体用户的环境进行代码优化，从而删除或添加一些重要代码，我们可以使用webpack内置的DefinePlugin为所有依赖定义这个变量
const webpack = require('webpack')
module.exports = {
	plugins:[
		new webpack.DefinePlugin({
		'process.env.NODE_ENV' :JSON.stringify('production')
		})
	]
}

缓存：
通过使用output.filename进行文件名替换，可以确保浏览器获取到修改后的文件，[hash]替换可以用于在文件名中包含一个构建相关的hash，但是更好的方式是使用[chunkhash]替换，在文件名中包含一个chunk相关的哈希
webpack.config.js
output: {
	filename:'[name].[chunkhash].js',
	path: path.resolve(__dirname,'dist'),
},
提取模板：webpack4移除了CommonsChunkPlugin,所以需要作出相应的修改
module.exports = {
	optimization: {
		splitChunks: {
		name: 'vendor'
		}
	},
}
将第三方库提取到单独的vendor chunk文件中，是比较推荐的做法。因为他们很少想本地的源代码那样频繁的修改，因此通过实现以上步骤，利用客户端的长效缓存机制，可以通过命中缓存来消除请求，并减少向服务器获取资源，同时还能保证客户端和服务端的代码版本一致。
webpack.config.js
entry:{
	app: './src/index.js',
	vendor: [
		'lodash'
	]
},
模块标识符
module.exports = {
plugins:[
	new CleanWebpackPlugin(['dist']),
	new HtmlWebpackPlugin({
		title: 'Output Management'
	}),
	new webpack.HashedModuleIdsPlugin()
	],
optimization: {
	splitChunks: {
		name: 'vendor'
	}
     }
}

渐进式网络应用程序：
         渐进式网络是一种可以提供类似原生应用程序体验的网络应用程序，PWA可以来做很多事，在离线时应用程序能够继续运行功能，这是通过使用名为server workers的网络技术来实现。
使用一个简易服务器，搭建出我们所需要的离线体验。

首先: npm install  http-server --save-dev
webpack.config.js
{
	"scripts": {
		"test": "echo \"Error: no test specified\" && exit 1",
		"build": "webpack",
		"watch": "webpack --watch",
		"start": "http-server dist"
	}
}

添加workbox-webpack-plugin插件,并调整webpack.config.js
npm install workbox-webpack-plugin --save-dev

const WorkboxPlugin = require('workbox-webpack-plugin')

module.exports = {
plugins:[
	new WorkboxPlugin.GenerateSW({
		clientsClaim:true,
		skipWaiting:true
	})
}

注册server worker
import _ from 'lodash'
if ('serviceWorker' in navigator) {
	window.addEventListener('load', () => {
		navigator.serviceWorker.register('/service-worker.js').then(registration => {
			console.log('SW registered: ', registration);
		}).catch(registrationError => {
			console.log('SW registration failed: ', registrationError);
		});
	});
	// 当前缓存版本的唯一标识符，用当前时间代替
var cacheKey = new Date().toISOString();
	// 当前缓存白名单，在新脚本的 install 事件里将使用白名单里的 key
var cacheWhitelist = [cacheKey];
	// 需要被缓存的文件的 URL 列表
var cacheFileList = [
  '/index.html',
  'app.js',
  'app.css'
];
	// 监听 install 事件
self.addEventListener('install', function (event) {
  // 等待所有资源缓存完成时，才可以进行下一步
  event.waitUntil(
    caches.open(cacheKey).then(function (cache) {
      // 要缓存的文件 URL 列表
      return cache.addAll(cacheFileList);
    })
  );
});
	// 拦截网络请求
self.addEventListener('fetch', function (event) {
  event.respondWith(
    // 去缓存中查询对应的请求
    caches.match(event.request).then(function (response) {
        // 如果命中本地缓存，就直接返回本地的资源
        if (response) {
          return response;
        }
        // 否则就去用 fetch 下载资源
        return fetch(event.request);
      }
    )
  );
});
	// 新 Service Workers 线程取得控制权后，将会触发其 activate 事件
self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames.map(function (cacheName) {
          // 不在白名单的缓存全部清理掉
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            // 删除缓存
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
})
	};


