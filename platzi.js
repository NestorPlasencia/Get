var request = require('request'),
	cheerio = require('cheerio'),
	fs 		= require('fs'),
	btoa 	= require('btoa'),
	diff 	= require('deep-diff').diff,
	https 	= require('https');

	var plataforma = 'platzi'

	//IMporta archivo clasificicaciones si no encuentra lo inicia
	var clasificaciones_actuales 
	if (!fs.readFileSync('json/clasificaciones-platzi.json','utf8')) {
		clasificaciones_actuales = {},clasificaciones_actuales = []
	}else {
		clasificaciones_actuales =JSON.parse(fs.readFileSync('json/clasificaciones-platzi.json', 'utf8'));
	}

	console.log('=======================================================')
	console.log(' Obtengamos la lista de los cursos y su clasificación')
	console.log('=======================================================')


	var lectura_pagina_principal = new Promise((resolve, reject) => {
		request({url: 'https://platzi.com/cursos/', encoding: 'utf8' }, function(err, resp, body){
			if(!err && resp.statusCode == 200){			
				var $ = cheerio.load(body);			
				
				// cursos_lista sera el resultado a la siguiente fase
				var cursos_lista = []
				
				$('.Career').each(function(){				
				
					//Informacion de la clasificacion
					var nombre_clasificacion = $(this).find('.Career-name').html();
					var imagen_clasificacion = $(this).find('.Career-headerPrimary img').attr('src');
					var id_clasificacion = btoa(plataforma+":"+nombre_clasificacion)
					var link_clasificacion = 'https://platzi.com'+$(this).find('.Career-headerLink').attr('href');
					var clasificacion = {
						plataforma_clasificacion: plataforma,
						nombre_clasificacion: nombre_clasificacion,
						imagen_clasificacion: imagen_clasificacion,
						id_clasificacion: id_clasificacion,
						link_clasificacion: link_clasificacion,
					};
					console.log('Hemos encontrado la clasificación ' + clasificacion.nombre_clasificacion)

					var Career = cheerio.load( $(this).html() )
					
					//Lista de cursos de esta clasificacion
					var cursos_classificacion = {}
					cursos_classificacion = []
					
					Career('.CareerCourse').each(function(){

						//Informacion del curso encontrado
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
						//Agregamos el curso a los cursos de la clasificacion actual
						cursos_classificacion.push(curso);

						//Agregamos el curso a la lista de cursos y agregamos la clasificacion al curso
						if(!cursos_lista.find(curso_actual_lista=> curso_actual_lista.id_curso == curso.id_curso)){
							curso.clasificacion_curso = []
							curso.clasificacion_curso.push(clasificacion.nombre_clasificacion)
							cursos_lista.push(curso)
						}else{
							cursos_lista.forEach(function(curso_actual_lista){
								if(curso_actual_lista.id_curso == curso.id_curso){
									if(!curso_actual_lista.clasificacion_curso){
										curso_actual_lista.clasificacion_curso = []
										curso_actual_lista.clasificacion_curso.push(clasificacion.nombre_clasificacion)
									}else{
										curso_actual_lista.clasificacion_curso.push(clasificacion.nombre_clasificacion)
									}
								}
							})
						}	
					})

					clasificacion.cursos_classificacion = cursos_classificacion;

					// Agregamos la clasficacion a la lista de clasificaciones
					if(!clasificaciones_actuales.find( clasificacion_actual => clasificacion_actual.id_clasificacion == clasificacion.id_clasificacion)){
						console.log('Vamos a agregar la clasificacion de '+ nombre_clasificacion )
						clasificaciones_actuales.push(clasificacion);
					}else{
						clasificaciones_actuales.forEach(function(clasificacion_actual){
							if(clasificacion_actual.id_clasificacion == clasificacion.id_clasificacion){
								//console.log(clasificacion_actualclasificacion))
								if(!diff(clasificacion_actual,clasificacion)){
									console.log('La clasificacion '+ nombre_clasificacion + ' ya existe, no la actualizaremos')
								}else{
									console.log('La clasificacion '+ nombre_clasificacion + ' ya existe, y tenemos que actualizarla')
									clasificacion_actual = clasificacion;									
								}
							}
						})
					}		
	
				});	
				// Actualizamos el listado de clasificaciones
				fs.writeFileSync("json/clasificaciones-platzi.json", JSON.stringify(clasificaciones_actuales));
				// Devolvemos la lista de cursos
				resolve(cursos_lista)
			}else{
				reject( new Error('No se leyo pagina principal'))
			}
		});	
	})

	lectura_pagina_principal
		.then( function (cursos_lista){
			
			console.log('=======================================================')
			console.log(' Tenemos la lista vamos a guardar los cursos')
			console.log('=======================================================')
			
				cursos_lista.forEach(function(curso){

					var curso_individual = new Promise((resolve, reject) => {
						request({url: curso.url_curso, encoding: 'utf8' }, function(err, resp, body){
							if(!err && resp.statusCode == 200){
								console.log('=======================================================')
								console.log(' Vamos a analizar el ' + curso.nombre_curso)
								console.log('=======================================================')

								var $ = cheerio.load(body);
								// Capturamos informacion de cada curso
								var imagen_curso = $('.BannerTop-badge-v2 img').attr('src');
								var description_curso = $('.BannerTop-description').html();
								var video_curso = $('.u-videoSource').attr('src');
								if (curso.nombre_curso == 'Curso Gratis de Programaci&#xF3;n B&#xE1;sica' ||
									curso.nombre_curso == 'Curso Gratis de Marketing Voz a Voz' ||
									curso.nombre_curso == 'Curso de Marca Personal' ||
									curso.nombre_curso == 'Comunidad Platzi'){
									costo = 'Gratis'
								}else{
									costo = 'Menbresia'
								}
								var costo_curso = costo;

								curso.imagen_curso = imagen_curso
								curso.description_curso = description_curso
								video_curso ? curso.video_curso = video_curso : curso.video_curso = 'Aun no existe video disponible'
								curso.costo_curso = costo_curso

								//Capturamos informacion de los profesores 					
								
								var nombre_instructores_curso = []
								var id_instructores_curso = []
								var instructor					
								$('.Teacher').each(function(){
									var nombre_instructor  = $(this).find('.Teacher-name').html()
									instructor = {
										plataforma_instructor: 'platzi',
										nombre_instructor: nombre_instructor,
										id_instructor: btoa(nombre_instructor),
										twitter_user_instructor: $(this).find('.Teacher-link').html(),
										twitter_link_instructor: $(this).find('.Teacher-link').attr('href'),
										descripcion_corta_instructor: $(this).find('.Teacher-label').html(),
										imagen_instructor:  $(this).find('.Teacher-image img').attr('src')
									}
									
									// Agregamos informacion de docentes a los cursos
									nombre_instructores_curso.push(nombre_instructor)
									id_instructores_curso.push(btoa(nombre_instructor))
									
									// Obtener los profesores ya registrados
									if (!fs.readFileSync('json/profesores-platzi.json', 'utf8')) {
										instructores_actuales = {}
										instructores_actuales = []
									}else {
										instructores_actuales =JSON.parse(fs.readFileSync('json/profesores-platzi.json', 'utf8'));
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
												console.log('El instructor '+ instructor.nombre_instructor + ' ya esta registrado pero tenemos que actualizarlo')
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
										console.log('Vamos a agregar a '+ instructor.nombre_instructor  + ' con su curso '+ curso.nombre_curso)
										instructores_actuales.push(instructor);	
									}
									fs.writeFileSync("json/profesores-platzi.json", JSON.stringify(instructores_actuales))
					
								})

								curso.nombre_instructores_curso = nombre_instructores_curso
								curso.id_instructores_curso = id_instructores_curso
								
								// BLOQUE DE ACTUALIZACION / CREACION

								if (!fs.readFileSync('json/cursos-platzi.json', 'utf8')) {
									cursos_actuales = {},cursos_actuales = []
								}else {
									cursos_actuales =JSON.parse(fs.readFileSync('json/cursos-platzi.json', 'utf8'));
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
								fs.writeFileSync("json/cursos-platzi.json", JSON.stringify(cursos_actuales))
									
								
							}else{
								reject( new Error('No se leyo el ' + curso.nombre_curso + err))
							}
						})
						request({url: curso.url_clases, encoding: 'utf8'}, function(err, resp, body){
							if (err){
								console.log(err)
							}else if( resp.statusCode == 200){
								
								var $ = cheerio.load(body);
								var nombre_curso = $('.CourseBanner-title span').html(); 
								var id_curso = btoa(plataforma+":"+nombre_curso);					
								var temario_curso = {}
								temario_curso = []
								// Si el curso aun no esta disponible	
								if (!$('.Concept')){
									var tiempo_falta = $('.EmptyCourse-counter- p strong').html(); 
									temario_curso.push(tiempo_falta)
								}
								// Si el temario ya esta disponible
								$('.Concept').each(function(){
									var titulo_capitulo = $(this).find('.Concept-title').text()
									var concepto = cheerio.load( $(this).html() )
									var temas = {}
									temas = []
									concepto('.Material').each(function(){
										var titulo_tema = $(this).find('.MaterialContent-title').text()
										var clase = $(this).find('.MaterialType span').attr('class') 
										var tipo
										if (clase == "icon-doc") { tipo = "Lectura" }
										if (clase == "icon-play_A") { tipo = "Video" }
										if (clase == "icon-cog") { tipo = "Subiendo" }											
										var instructor_tema = $(this).find('.MaterialAuthor-name').html()
										var tiempo_tema =  $(this).find('.MaterialMeta-duration span').text()
										if($(this).find('a').attr('href') != null){
											var link_tema = 'https://platzi.com' + $(this).find('a').attr('href')
										}
										var material = {
											titulo_tema: titulo_tema,
											tipo_tema: tipo,
											instructor_tema: instructor_tema,
											id_instructor_tema: btoa(instructor_tema),
											link_tema:	link_tema,
											tiempo_tema: tiempo_tema,
										}
										temas.push(material)
									})
									var capitulo ={
										titulo_capitulo: titulo_capitulo,
										temas_capitulo: temas,
									}
									temario_curso.push(capitulo)
								})

								curso.temario_curso = temario_curso

								if (!fs.readFileSync('json/cursos-platzi.json', 'utf8')) {
									cursos_actuales = {},cursos_actuales = []
								}else {
									cursos_actuales =JSON.parse(fs.readFileSync('json/cursos-platzi.json', 'utf8'));
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
								fs.writeFileSync("json/cursos-platzi.json", JSON.stringify(cursos_actuales))
								resolve(curso.nombre_curso)
							}else{
								console.log("Otro error")	
							}
						})
					});

					curso_individual
						.then( function(nombre_curso){ 
							cursos_lista.splice(cursos_lista.lastIndexOf(curso), 1)
							console.log("Se ha analizado el "+ cursos_lista.length) 
						})
				})
		
		})
