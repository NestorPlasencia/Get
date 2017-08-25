var request = require('request'),
	cheerio = require('cheerio'),
	fs 		= require('fs'),
	btoa 	= require('btoa'),
	diff 	= require('deep-diff').diff,
	https 	= require('https'),
	express = require('express'),
	app = new express()




app.get('/', function (req, res) {
	var plataforma = 'platzi'


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
		request({url: 'https://platzi.com/cursos/', encoding: 'utf8' }, function(err, resp, body){
			if(!err && resp.statusCode == 200){			
				var $ = cheerio.load(body);			
				// Directorio de Carreras y cursos
				var cursos_lista = []
				$('.Career').each(function(){				
					//Informacion de la carreras
					var nombre_clasificacion = $(this).find('.Career-name').html();
					var imagen_clasificacion = $(this).find('.Career-headerPrimary img').attr('src');
					var id_clasificacion = btoa(plataforma+":"+nombre_clasificacion)
					var link_clasificacion = 'https://platzi.com'+$(this).find('.Career-headerLink').attr('href');
					
					console.log('Hemos encontrado la clasificación ' + nombre_clasificacion)

					var clasificacion = {
						plataforma_clasificacion: plataforma,
						nombre_clasificacion: nombre_clasificacion,
						imagen_clasificacion: imagen_clasificacion,
						id_clasificacion: id_clasificacion,
						link_clasificacion: link_clasificacion,
					};

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
				});	
				fs.writeFileSync("json/clasificaciones.json", JSON.stringify(clasificaciones_actuales));
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
			console.log('=======================================================')
			
			//do{
				cursos_lista.forEach(function(curso){
					var curso_individual = new Promise((resolve, reject) => {
						const options = {
						  hostname: 'platzi.com',
						  port: 443,
						  path: curso.url_curso,
						  method: 'GET'
						};

						const req = https.request(options, (res) => {
						  //console.log('statusCode:', res.statusCode);
						  //console.log('headers:', res.headers);

						  res.on('data', (d) => {
						    //process.stdout.write(d);
						    resolve(curso.nombre_curso)
						  });
						});

						req.on('error', (e) => {
							reject( new Error('No se leyo el ' + curso.nombre_curso + e))
						  	//console.error(e);
						});
						req.end();

						/*request({url: curso.url_curso, encoding: 'utf8' }, function(err, resp, body){
							if(!err && resp.statusCode == 200){
								
									
								resolve(curso.nombre_curso)
							}else{
								reject( new Error('No se leyo el ' + curso.nombre_curso + err))
							}
						})*/
					});

					curso_individual
						.then( function(nombre_curso){ 
							cursos_lista.splice(cursos_lista.lastIndexOf(curso), 1)
							console.log("Se ha analizado el "+ cursos_lista.length) 
						})
				})


			//}while(cursos_lista.length>0)
			
		})
})
 
app.listen(3000,() => console.log("Escuchando en el puerto 3000"))
/*
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
										if (!instructor_actual.nombre_cursos_dictados.includes(curso.nombre_curso)){
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
*/