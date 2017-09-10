var request = require('request'),
	cheerio = require('cheerio'),
	fs 		= require('fs'),
	btoa 	= require('btoa'),
	diff 	= require('deep-diff').diff;

var dominio = 'http://www.fiverr.com/categories/programming-tech/wordpress-services'

request({url: dominio , encoding: 'utf8' , port:80, headers: {'user-agent': 'node.js'} }, function(err, resp, body){
	if(!err && resp.statusCode == 200){
			var $ = cheerio.load(body);
			$('.gig-item').each(function(){
				console.log($(this).find('.gig-link-main h3').text().trim())
				console.log($(this).attr('data-gig-id'))
			})
			console.log(resp.statusCode)
	}else{
		console.log(resp.statusCode)
	}
})