var request = require('request'),
	cheerio = require('cheerio'),
	fs 		= require('fs'),
	btoa 	= require('btoa'),
	diff 	= require('deep-diff').diff;

var plataforma = 'devcode'


var clasificaciones_actuales 
if (!fs.readFileSync('json/clasificaciones.json','utf8')) {
	clasificaciones_actuales = {},clasificaciones_actuales = []
}else {
	clasificaciones_actuales =JSON.parse(fs.readFileSync('json/clasificaciones.json', 'utf8'));
}
console.log('=======================================================')
console.log(' Obtengamos la lista de los cursos y su clasificación')
console.log('=======================================================')
var lectura_pagina_principal = new Promise((resolve, reject) => {
	request({url: 'https://devcode.la/cursos/', encoding: 'utf8' }, function(err, resp, body){
			if(!err && resp.statusCode == 200){			
			var $ = cheerio.load(body);			
			// Directorio de Carreras y cursos
			var cursos_lista = []

			$('.courses__filter li').each(function(){				
				//Informacion de la carreras
				var nombre_clasificacion = $(this).html();
				var id_clasificacion = btoa(plataforma+":"+nombre_clasificacion)
				console.log('Hemos encontrado la clasificación ' + nombre_clasificacion)

				var clasificacion = {
					plataforma_clasificacion: plataforma,
					nombre_clasificacion: nombre_clasificacion,
					id_clasificacion: id_clasificacion,
				};
				clasificacion.cursos_classificacion = []
				var existe = false
				clasificaciones_actuales.forEach(function(clasificacion_actual,indice){
					if( id_clasificacion == clasificacion_actual.id_clasificacion ){
						existe = true
						if(!diff(clasificacion_actual,clasificacion)){
							console.log('La clasificacion '+ nombre_clasificacion + ' ya existe, no la actualizaremos')
						}else{
							console.log('La clasificacion '+ nombre_clasificacion + ' ya existe, y tenemos que actualizarla')
							clasificaciones_actuales[indice] = clasificacion;
						}
					}
				})
				if(existe== false){
					console.log('Vamos a agregar la '+ nombre_clasificacion )
					clasificaciones_actuales.push(clasificacion);	
				}	
			});
			$('.course__item').each(function(){				
				//Informacion de la carreras
				var nombre_curso = $(this).find('.course__item_body h3 a').html();
				var link_curso = $(this).find('.course__item_body h3 a').attr('href');
				var url_cursos = 'https://devcode.la/cursos' + link_curso.slice(7, -1);   
				var imagen_curso = imagenes[link_curso.slice(8, -1).split('-').join('_')];
				var nivel_curso = $(this).find('.course__nivel').html();
				var costo = $(this).find('.course__type').html();
				var costo_curso
				if (costo == "PREMIUM") {costo_curso = 'Menbresia' }
				if (costo == "GRATIS") {costo_curso = 'Gratis' }	
				var id_curso = btoa(plataforma+":"+nombre_curso)
				

				var clasificacion = $(this).attr('name').slice(20)


				var curso = {
					id_curso: id_curso,
					plataforma_curso: plataforma,
					nombre_curso: nombre_curso,
					url_curso: url_cursos,
					imagen_curso: imagen_curso,
					nivel_curso: nivel_curso,
					costo_curso: costo_curso,
				}
				curso.clasificacion_curso = []
				curso.clasificacion_curso.push(clasificacion) 

				clasificaciones_actuales.forEach(function(clasificacion_actual){
					if(clasificacion_actual.nombre_clasificacion == clasificacion){
						clasificacion_actual.cursos_classificacion.push(curso)
					}
				})
				//cursos_classificacion.push(curso);
				if(!cursos_lista.find(cur => cur.id_curso == curso.id_curso)){
					cursos_lista.push(curso)
				}	
			});
			//clasificacion.cursos_classificacion = cursos_classificacion;				
					
			fs.writeFileSync("json/clasificaciones.json", JSON.stringify(clasificaciones_actuales));
			resolve(cursos_lista)
		}else{
			reject( new Error('No se leyo pagina principal'))
		}
	});	
})

/*
				var Career = cheerio.load( $(this).html() )
				var cursos_classificacion = {}
				cursos_classificacion = []
				
				Career('.CareerCourse').each(function(){
					
					var nombre_curso = $(this).find('.CareerCourse-name').html();
					var link_curso = $(this).attr('href');
					var url_cursos = 'https://platzi.com/cursos' + link_curso.slice(7, -1);
					var url_clases = 'https://platzi.com/clases' + link_curso.slice(7, -1);
					var id_curso = btoa(plataforma+":"+nombre_curso)
					var curso = {
						id_curso: id_curso,
						plataforma_curso: plataforma,
						nombre_curso: nombre_curso,
						url_curso: url_cursos,
						url_clases: url_clases,
					}
					cursos_classificacion.push(curso);
					if(!cursos_lista.includes(curso)){
						cursos_lista.push(curso)
					}	
				})
				clasificacion.cursos_classificacion = cursos_classificacion;				
				var existe = false
				clasificaciones_actuales.forEach(function(clasificacion_actual,indice){
					if( id_clasificacion == clasificacion_actual.id_clasificacion ){
						existe = true
						if(!diff(clasificacion_actual,clasificacion)){
							console.log('La clasificacion '+ nombre_clasificacion + ' ya existe, no la actualizaremos')
						}else{
							console.log('La clasificacion '+ nombre_clasificacion + ' ya existe, y tenemos que actualizarla')
							clasificaciones_actuales[indice] = clasificacion;
						}
					}
				})
				if(existe== false){
					console.log('Vamos a agregar la '+ nombre_clasificacion )
					clasificaciones_actuales.push(clasificacion);	
				}	
*/

lectura_pagina_principal
	.then( function (cursos_lista){
		console.log('=======================================================')
		console.log(' Tenemos la lista vamos a guardar los cursos')
		console.log('=======================================================')
		cursos_lista.forEach(function(curso){
			request({url: curso.url_curso, encoding: 'utf8' }, function(err, resp, body){
			if(!err && resp.statusCode == 200){
				
				console.log('=======================================================')
				console.log(' Vamos a analizar el ' + curso.nombre_curso)
				console.log('=======================================================')

				var $ = cheerio.load(body);
				// Capturamos informacion de cada curso
				//var imagen_curso = $('.BannerTop-badge-v2 img').attr('src');
				var description_curso = $('.course__rigth__about__content').html();
				var imagen =  $('.course__rigth__about__figure img').attr('src');
				curso.description_curso = description_curso
				curso.imagen = imagen
				curso.temario_curso = []
				curso.temario_curso.push({
					titulo_capitulo: "Temas del curso",
				}) 
				curso.temario_curso[0].temas_capitulo = []

				$('.course__agenda li').each(function(){
					var tema = $(this).find('a').html()
					
					curso.temario_curso[0].temas_capitulo.push(tema.slice(tema.indexOf(' ') + 1,tema.lenght))
				})
				// BLOQUE DE ACTUALIZACION / CREACION
  
				if (!fs.readFileSync('json/cursos.json', 'utf8')) {
					cursos_actuales = {},cursos_actuales = []
				}else {
					cursos_actuales =JSON.parse(fs.readFileSync('json/cursos.json', 'utf8'));
				}
				var existe = false
				cursos_actuales.forEach(function(curso_actual,indice){
					if(curso_actual.id_curso == curso.id_curso) {
						existe = true
						if(!diff(curso_actual,curso)){
							//console.log('El curso'+ curso.nombre_curso + ' ya existe sin cambios')
						}else{
							console.log('El curso'+ curso.nombre_curso + ' ya existe pero tenemos que actualizarlo')
							cursos_actuales[indice] = curso;
							//console.log(diff(curso_actual,curso))
						}
					}
				})
				if(existe== false){
					console.log('Vamos a agregar '+ curso.nombre_curso )
					cursos_actuales.push(curso);	
				}
				fs.writeFileSync("json/cursos.json", JSON.stringify(cursos_actuales))	
				
			}else{
				console.log(err)
			}
		})
		})	
	})	


var imagenes = {
	pruebas_unitarias_php : "https://s3-us-west-2.amazonaws.com/devcode/media/courses/PHP_unit_85x85.png",
	grid: "https://s3-us-west-2.amazonaws.com/devcode/media/courses/CSS_Grid-02.png",
	pruebas_unitarias_javascript: "https://s3-us-west-2.amazonaws.com/devcode/media/courses/Pruebas Unitarias Js_85 px.png",
	bootstrap_4: "https://s3-us-west-2.amazonaws.com/devcode/media/courses/Bootstrap_4_85 px.png",
	animaciones_svg: "https://s3-us-west-2.amazonaws.com/devcode/media/courses/Anim_SVG_CSS-01.png",
	linux: "https://s3-us-west-2.amazonaws.com/devcode/media/courses/Linux_80x80.png",
	woocommerce: "https://s3-us-west-2.amazonaws.com/devcode/media/courses/WOO_comerce_85 px.png",
	ui: "https://s3-us-west-2.amazonaws.com/devcode/media/courses/UI_85px.png",
	ajax_jquery: "https://s3-us-west-2.amazonaws.com/devcode/media/courses/ajax_85 px.png",
	laravel: "https://s3-us-west-2.amazonaws.com/devcode/media/courses/laravel_icon_color-01.png",
	poo_php: "https://s3-us-west-2.amazonaws.com/devcode/media/courses/PHP_poo_85x85.png",
	photoshop: "https://s3-us-west-2.amazonaws.com/devcode/media/courses/Icon_Photoshop_85 px.png",
	poo_javascript: "https://s3-us-west-2.amazonaws.com/devcode/media/courses/Js_poo_85x85.png",
	plugins_wordpress: "https://s3-us-west-2.amazonaws.com/devcode/media/courses/wordpress_plugins_85px.png",
	lumen: "https://s3-us-west-2.amazonaws.com/devcode/media/courses/Lumen_85 px.png",
	android: "https://s3-us-west-2.amazonaws.com/devcode/media/courses/icon_android-01.png",
	git: "https://s3-us-west-2.amazonaws.com/devcode/media/courses/Github-02.png",
	selenium: "https://s3-us-west-2.amazonaws.com/devcode/media/courses/Selenium_80x80.png",
	tipos_de_referencia_en_js: "https://s3-us-west-2.amazonaws.com/devcode/media/courses/Tipo_referencias_80x80.png",
	react: "https://s3-us-west-2.amazonaws.com/devcode/media/courses/React_85x85.png",
	python_3: "https://s3-us-west-2.amazonaws.com/devcode/media/courses/python_85x85-05.png",
	creacion_temas_para_wordpress: "https://s3-us-west-2.amazonaws.com/devcode/media/courses/templates_wordpress_85x85.png",
	kotlin: "https://s3-us-west-2.amazonaws.com/devcode/media/courses/kotlin_01-01(1).png",
	php_7: "https://s3-us-west-2.amazonaws.com/devcode/media/courses/PHP_7-02.png",
	grunt: "https://s3-us-west-2.amazonaws.com/devcode/media/courses/grunt_icon-01.png",
	django_fundamentos: "https://s3-us-west-2.amazonaws.com/devcode/media/courses/django_2-01.png",
	javascript_fundamentos: "https://s3-us-west-2.amazonaws.com/devcode/media/courses/11-02.png",
	wordpress_fundamentos: "https://s3-us-west-2.amazonaws.com/devcode/media/courses/ícono_wordpress-01.png",
	base_de_datos: "https://s3-us-west-2.amazonaws.com/devcode/media/courses/icon_curso_base_datos_01.png",
	angular_2_fundamentos: "https://s3-us-west-2.amazonaws.com/devcode/media/courses/icon_angular_2-01.png",
	como_crear_una_pagina_web: "https://s3-us-west-2.amazonaws.com/devcode/media/courses/icono_01.png",
	fundamentos_java: "https://s3-us-west-2.amazonaws.com/devcode/media/courses/icon_java-01.png",
	apis_html5: "https://s3-us-west-2.amazonaws.com/devcode/media/courses/icon_apis_html5.png",
	typescript: "https://s3-us-west-2.amazonaws.com/devcode/media/courses/icon_typescript-01.png",
	fundamentos_ecmascript_6: "https://s3-us-west-2.amazonaws.com/devcode/media/courses/icono_ES6-01.png",
	illustrator: "https://s3-us-west-2.amazonaws.com/devcode/media/courses/icon_illustrator.png",
	fundamentos_de_ror: "https://s3-us-west-2.amazonaws.com/devcode/media/courses/logo-ruby-on-rails.png",
	fundamentos_angularjs: "https://s3-us-west-2.amazonaws.com/devcode/media/courses/icon_angular.png",
	curso_ios: "https://s3-us-west-2.amazonaws.com/devcode/media/courses/icon_ios.png",
	fundamentos_de_ruby: "https://s3-us-west-2.amazonaws.com/devcode/media/courses/icon_ruby.png",
	angularjs_avanzado: "https://s3-us-west-2.amazonaws.com/devcode/media/courses/Angular_Js_Adv_2.png",
	nodejs_avanzado: "https://s3-us-west-2.amazonaws.com/devcode/media/courses/Node_Js_Avanzado_2.png",
	testing_ruby_y_ruby_on_rails: "https://s3-us-west-2.amazonaws.com/devcode/media/courses/icon_ruby_on_rails-01.png",
	django_16: "https://s3-us-west-2.amazonaws.com/devcode/media/courses/Django_1.6-01.png",
	apis_en_rubyon_rails: "https://s3-us-west-2.amazonaws.com/devcode/media/courses/icon_apis_rubyonrails.png",
	fundamentos_nodejs: "https://s3.amazonaws.com/devcodela/cursos/Icono_Node_Js-01.png",
	jquery: "https://s3.amazonaws.com/devcodela/cursos/icon-jquery.png" ,
	html_css: "https://s3-us-west-2.amazonaws.com/devcode/media/courses/icon_html5.png",
	bootstrap3: "https://s3.amazonaws.com/devcodela/cursos/icon-bootstrap3.png",
	curso_basico_de_android: "https://s3.amazonaws.com/devcodela/cursos/icon-basic-android.png",
	nodejs: "https://s3.amazonaws.com/devcodela/cursos/icon-nodejs.png",
	curso_basico_de_responsive_web_design: "https://s3.amazonaws.com/devcodela/cursos/icon-basic-rwd.png" ,
	curso_basico_de_backbonejs: "https://s3.amazonaws.com/devcodela/cursos/icon-basic-backbonejs.png",
	marionettejs: "https://s3-us-west-2.amazonaws.com/devcode/media/courses/icon_marionette.png",
	python: "https://s3-us-west-2.amazonaws.com/devcode/media/courses/icon_python.png",
	backbonejs: "https://s3-us-west-2.amazonaws.com/devcode/media/courses/icon_backbone.png",
	django: "https://s3.amazonaws.com/devcodela/cursos/icon-django.png" ,
	css3: "https://s3.amazonaws.com/devcodela/cursos/icon-css3.png",
	responsive_web_design: "https://s3.amazonaws.com/devcodela/cursos/icon-responsivewebdesign.png" ,
	javascript: "https://s3.amazonaws.com/devcodela/cursos/icon-javascript.png",
	jqueryui: "https://s3.amazonaws.com/devcodela/cursos/icon-jqueryui.png",
}
