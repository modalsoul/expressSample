
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path');

/**
 * expressのサーバ生成メソッドの実行
 * Webサーバの機能を参照するインスタンスをセット
 */
var app = express();

/**
 * log4jsの読み込み
 */
var log4js = require('log4js');
/**
 * ログのファイル出力先とローテーション規則、ローテーションしたログファイルのPostFixの指定
 */
log4js.configure({
	appenders: [{
	"type": "dateFile",
	"filename": "logs/access.log",
	"pattern": "-yyyy-MM-dd"
	}]
});
/**
 * Loggerの取得
 */
var logger = log4js.getLogger('dateFile');

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  
  /**
   * アクセスログの出力
   */
  app.use(function(req, res, next){
	  logger.info([
			  req.headers['x-forwarded-for'] || req.client.remoteAddress,
		      new Date().toLocaleString(),
		      req.method,
		      req.url,
		      res.statusCode,
		      req.headers.referer || '-',
		      req.headers['user-agent'] || '-'
		      ].join('\t')
		      );
      next();
  });
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);
app.get('/users', user.list);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
