var request = require('request'),
	cheerio = require('cheerio'),
	fs 		= require('fs'),
	btoa 	= require('btoa'),
	diff 	= require('deep-diff').diff;

var plataforma = 'codigo_facilito'


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
	request({url: 'https://codigofacilito.com/cursos', encoding: 'utf8' }, function(err, resp, body){
		if(!err && resp.statusCode == 200){			
			var $ = cheerio.load(body);			
			// Directorio de Carreras y cursos
			var clasificaciones_lista = []

			$('.quick-filters li').each(function(){				
				//Informacion de la carreras
				var nombre_clasificacion = $(this).find('a').html();
				var id_clasificacion = btoa(plataforma+":"+nombre_clasificacion)
				var link_clasificacion = 'https://codigofacilito.com' + $(this).find('a').attr('href');
				console.log('Hemos encontrado la clasificación ' + nombre_clasificacion)

				var clasificacion = {
					plataforma_clasificacion: plataforma,
					nombre_clasificacion: nombre_clasificacion,
					id_clasificacion: id_clasificacion,
					link_clasificacion: link_clasificacion
				};
				clasificacion.cursos_classificacion = []
				clasificaciones_lista.push(clasificacion)
				
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
			fs.writeFileSync("json/clasificaciones.json", JSON.stringify(clasificaciones_actuales));
			resolve(clasificaciones_lista)
		}else{
			reject( new Error('No se leyo pagina principal'))
		}
	})
})			

lectura_pagina_principal
	.then( function (clasificaciones_lista){
		var cursos_lista = []
		clasificaciones_lista.forEach(function(clasificaciones_lista_actual){
			var clasificacion_individual = new Promise((resolve, reject) => {
				request({url: clasificaciones_lista_actual.link_clasificacion, encoding: 'utf8' }, function(err, resp, body){
					if(!err && resp.statusCode == 200){
						var $ = cheerio.load(body);
					
						$('.course').each(function(){				
							var nombre_curso = $(this).find('.white h2 a').html();
							var link_curso = $(this).find('.white h2 a').attr('href');
							//console.log(link_curso)
							var url_cursos = 'https://codigofacilito.com/cursos' + link_curso.slice(7,link_curso.lenght );   
							var imagen_curso = 'https://codigofacilito.com' + $(this).find('.avatar').attr('src');
							var nivel_curso =  $(this).find('.row.bottom-xs div div span').html();
							var costo = $(this).find('.row .box .middle-block').html();
							if ($(this).hasClass('premium')) {costo_curso = 'Menbresia' }
							if ($(this).hasClass('free')) {costo_curso = 'Gratis' }	
							var id_curso = btoa(plataforma+":"+nombre_curso)
							var color_curso = $(this).find('header').attr('style').split(':')[1];

							var curso = {
								id_curso: id_curso,
								plataforma_curso: plataforma,
								nombre_curso: nombre_curso,
								url_curso: url_cursos,
								imagen_curso: imagen_curso,
								nivel_curso: nivel_curso,
								costo_curso: costo_curso,
								color_curso: color_curso,
							}

							clasificaciones_actuales.forEach(function(clasificacion_actual,indice){
								if( clasificaciones_lista_actual.id_clasificacion == clasificacion_actual.id_clasificacion ){
									clasificaciones_actuales[indice].cursos_classificacion.push(curso)
								}	
							})

							
							if(!cursos_lista.find(cur => cur.id_curso == curso.id_curso)){
								cursos_lista.push(curso)
							}

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
										//console.log('El curso'+ curso.nombre_curso + ' ya existe pero tenemos que actualizarlo')
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
						});
						resolve(cursos_lista)
					}else{
						reject( new Error('No se leyo pagina de clasificacion'))
					}
				})
			})
			clasificacion_individual
				.then(function(cursos_lista){
					cursos_lista.forEach(function(curso){
						request({url: curso.url_curso, encoding: 'utf8' }, function(err, resp, body){
							if(!err && resp.statusCode == 200){
								
								console.log('=======================================================')
								console.log(' Vamos a analizar el ' + curso.nombre_curso)
								console.log('=======================================================')

								var $ = cheerio.load(body);
								// Capturamos informacion de cada curso
								var numero_videos_curso, tiempo_curso
								$('header .box .col-xs').each(function(i,elm){
									if(i == 0) {numero_videos_curso = parseInt($(this).html())	}
									if(i == 1) {tiempo_curso = $(this).text()}
								})
								var description_curso = "";
								$('#about_course').each(function(i,elm){
									description_curso = description_curso + $(this).text()
								})
																
								curso.temario_curso = []
								
								
								$('#playlist_course ul li ').each(function(){
									
									if($(this).find('header a div div div.text-left .box').text() != ""){
										curso.temario_curso.push({
											titulo_capitulo: $(this).find('header a div div div.text-left .box').text()
										})	
									}
									if($(this).find('a div div.col-xs .box').text() != ""){
										curso.temario_curso.push({
											titulo_capitulo: $(this).find('a div div.col-xs .box').text()
										})	
									}
								})	
							
								curso.numero_videos_curso = numero_videos_curso
								curso.tiempo_curso = tiempo_curso
								curso.description_curso = description_curso
								//Profesores del curso
								var nombre_instructores_curso = []
								var id_instructores_curso = []
								var instructor					
								$('a div.card').each(function(i,elm){
									
									var nombre_instructor,correo_instructor
									var elemento = $(this).find('.large-padding .row')

									elemento.each(function(i,elm2){
										if(i == 0) {
											nombre_instructor = $(this).find('div.col-xs div.box').text()
										}	
									})
									var  imagen_instructor = $(this).find('.circle').attr('style').slice(15, -1)
									var  imagen_instructor = imagen_instructor.slice(0,imagen_instructor.indexOf(';') - 1)
								
									instructor = {
										plataforma_instructor: 'codigo_facilito',
										nombre_instructor: nombre_instructor,
										id_instructor: btoa(nombre_instructor),
										imagen_instructor:  imagen_instructor,
									}
									
									// Agregamos informacion de docentes a los cursos
									nombre_instructores_curso.push(nombre_instructor)
									id_instructores_curso.push(btoa(nombre_instructor))
									
									// Obtener los profesores ya registrados
									if (!fs.readFileSync('json/profesores.json', 'utf8')) {
										instructores_actuales = {}
										instructores_actuales = []
									}else {
										instructores_actuales =JSON.parse(fs.readFileSync('json/profesores.json', 'utf8'));
									}
									var existe = false
									instructores_actuales.forEach(function(instructor_actual,indice){
										if(instructor_actual.id_instructor == instructor.id_instructor) {
											existe = true
											instructor.nombre_cursos_dictados = instructor_actual.nombre_cursos_dictados
											instructor.id_cursos_dictados = instructor_actual.id_cursos_dictados	
											if (!instructor_actual.nombre_cursos_dictados.find(cur => cur == curso.nombre_curso)){
												instructor.nombre_cursos_dictados.push(curso.nombre_curso)
												instructor.id_cursos_dictados.push(curso.id_curso)
											}
											if(!diff(instructor_actual,instructor)){
												//console.log('El instructor '+ instructor.nombre_instructor + ' ya esta registrado sin cambios')
											}else{
												//console.log('El instructor '+ instructor.nombre_instructor + ' ya esta registrado pero tenemos que actualizarlo')
												instructores_actuales[indice] = instructor;
												//console.log(diff(instructor_actual,instructor))
											}
										}
									})								
									if(existe == false){
										instructor.nombre_cursos_dictados = []
										instructor.id_cursos_dictados = []
										instructor.nombre_cursos_dictados.push(curso.nombre_curso)
										instructor.id_cursos_dictados.push(curso.id_curso)
										//console.log('Vamos a agregar a '+ instructor.nombre_instructor  + ' con su curso '+ curso.nombre_curso)
										instructores_actuales.push(instructor);	
									}
									fs.writeFileSync("json/profesores.json", JSON.stringify(instructores_actuales))
					
								})

								curso.nombre_instructores_curso = nombre_instructores_curso
								curso.id_instructores_curso = id_instructores_curso
																
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
		})

	})
	
