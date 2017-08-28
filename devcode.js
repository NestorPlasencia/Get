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
				var imagen_curso = $(this).find('.course__item_img a').attr('href');
				var nivel_curso = $(this).find('.course__nivel').html();
				var costo = $(this).find('.course__type').html();
				var costo_curso
				if (costo == "PREMIUM") {costo_curso = 'Menbresia' }
				if (costo == "GRATIS") {costo_curso = 'Gratis' }	
				var id_curso = btoa(plataforma+":"+nombre_curso)
				var curso = {
					id_curso: id_curso,
					plataforma_curso: plataforma,
					nombre_curso: nombre_curso,
					url_curso: url_cursos,
					imagen_curso: imagen_curso,
					nivel_curso: nivel_curso,
					costo_curso: costo_curso,
				}
				//cursos_classificacion.push(curso);
				if(!cursos_lista.find(cur => cur.nombre_curso == curso.nombre_curso)){
					cursos_lista.push(curso)
				}	
			});
			//clasificacion.cursos_classificacion = cursos_classificacion;				
					
			fs.writeFileSync("json/clasificaciones.json", JSON.stringify(cursos_lista));
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