var request = require('request'),
	cheerio = require('cheerio'),
	fs 		= require('fs'),
	btoa 	= require('btoa'),
	diff 	= require('deep-diff').diff;

var plataforma = 'acamica'
var dominio = 'https://www.acamica.com'
var path_cursos = 'json/cursos-'+plataforma+'.json' 
var path_clasificaciones = 'json/clasificaciones-'+plataforma+'.json' 
var path_instructores =  'json/instructores-'+plataforma+'.json'
var api_path = 'https://api.acamica.com/search/courses'

var listado_cursos = new Promise((resolve, reject) => {
	request({url: api_path, encoding: 'utf8' }, function(err, resp, body){
		if(!err && resp.statusCode == 200){
			var info = JSON.parse(body);
			var numero_de_paginas = info.last_page;
			var lista_curos = []
			cursos_api = [];
			function indexacion_cursos(pagina){
			    return new Promise(function (resolve, reject){
			        request({url: api_path+'?page='+pagina, encoding: 'utf8' }, function(err, resp, body){
			        	JSON.parse(body).data.forEach( curso_acamica => {
			        		
			        		var nombre_curso = curso_acamica.name
			        		var id_curso = btoa(plataforma+":"+nombre_curso)
			        		var plataforma_curso = plataforma
							imagen_curso = curso_acamica.images.badge;
							url_curso = curso_acamica.url.full;
							description_curso = curso_acamica.subtitle;
							color_curso = '#'+curso_acamica.bg_color;
							if(curso_acamica.level == 'beginner'){ nivel_curso = 'Básico'}
							if(curso_acamica.level == 'intermediate'){ nivel_curso = 'Intermedio'}
							if(curso_acamica.level == 'advanced'){ nivel_curso = 'Avanzado'}
							if(curso_acamica.in_subscription == 0){ costo_curso = 'Gratis'}
							if(curso_acamica.in_subscription == 1){ costo_curso = 'Menbresia'}						
							
							var clasificacion_curso = []
			        		curso_acamica.tags.forEach( tag => {
			        			var nombre_clasificacion = tag.name
								var id_clasificacion = btoa(plataforma+":"+nombre_clasificacion)
								var link_clasificacion = dominio + '/tag/' + tag.url_name
								var plataforma_clasificacion = plataforma;
								clasificacion_curso.push(nombre_clasificacion)
								var clasificaciones = leer_archivo(path_clasificaciones)
								if(!clasificaciones.find(elemento_grabado => elemento_grabado.id_clasificacion == id_clasificacion)){
									cursos_classificacion = [], cursos_classificacion.push(nombre_curso)
								}else{
									clasificaciones.forEach((elemento_grabado,indice) => {
										if(elemento_grabado.id_clasificacion == id_clasificacion){
											cursos_classificacion = elemento_grabado.cursos_classificacion;
											if(!cursos_classificacion.find(nombre_curso_grabado => nombre_curso_grabado == nombre_curso)){
												cursos_classificacion.push(nombre_curso)	
											}
										}
									})
								}
								var clasificacion = {
									nombre_clasificacion: nombre_clasificacion,
									id_clasificacion: id_clasificacion,
									link_clasificacion: link_clasificacion,
									plataforma_clasificacion: plataforma_clasificacion,
									cursos_classificacion: cursos_classificacion,
								}
								var clasificaciones = leer_archivo(path_clasificaciones)
								evaluar_clasificacion(path_clasificaciones,clasificaciones,clasificacion)
							})

							var nombre_instructores_curso = [], id_instructores_curso = []
			        		curso_acamica.teachers.forEach( teacher => {
			        			var nombre_instructor = teacher.full_name
								var id_instructor = btoa(plataforma+":"+nombre_instructor)
								var imagen_instructor = teacher.image_url
								var link_instructor = teacher.url.full
								var plataforma_instructor = plataforma;
								
								nombre_instructores_curso.push(nombre_instructor)
								id_instructores_curso.push(path_instructores)

								var instructores = leer_archivo(path_instructores)
								if(!instructores.find(elemento_grabado => elemento_grabado.id_instructor == id_instructor)){
									nombre_cursos_dictados = [], nombre_cursos_dictados.push(nombre_curso)
									id_cursos_dictados = [], id_cursos_dictados.push(id_curso)
								}else{
									instructores.forEach((elemento_grabado,indice) => {
										if(elemento_grabado.id_instructor == id_instructor){
											nombre_cursos_dictados = elemento_grabado.nombre_cursos_dictados;
											if(!nombre_cursos_dictados.find(nombre_curso_grabado => nombre_curso_grabado == nombre_curso)){
												nombre_cursos_dictados.push(nombre_curso)	
											}											
											id_cursos_dictados = elemento_grabado.id_cursos_dictados;
											if(!id_cursos_dictados.find(id_curso_grabado => id_curso_grabado == id_curso)){
												id_cursos_dictados.push(id_curso)	
											}											
										}
									})
								}
								instructor = {
									plataforma_instructor: plataforma,
									id_instructor: id_instructor,
									nombre_instructor: nombre_instructor,
									imagen_instructor: imagen_instructor,
									link_instructor: link_instructor,
									nombre_cursos_dictados: nombre_cursos_dictados,
									id_cursos_dictados: id_cursos_dictados,
								}
								var instructores = leer_archivo(path_instructores)
								evaluar_instructor(path_instructores,instructores,instructor)
							})

							var curso = {
								id_curso: id_curso,
								plataforma_curso: plataforma,
								nombre_curso: nombre_curso,
								url_curso: url_curso,
								imagen_curso: imagen_curso,
								costo_curso: costo_curso,
								description_curso: description_curso,
								nivel_curso: nivel_curso,
								color_curso: color_curso,
								clasificacion_curso: clasificacion_curso,
								nombre_instructores_curso: nombre_instructores_curso,
								id_instructores_curso: id_instructores_curso,

							}
							var cursos = leer_archivo(path_cursos)
							evaluar_curso(path_cursos,cursos,curso)
							console.log('Indexamos el curso '+nombre_curso)

							cursos_api.push(curso_acamica)
			        	})
						resolve(cursos_api)
			        })	
			       
			    });
			}

			var paginas = [];
			for (var n = 1; n <= numero_de_paginas; n++) {
			    paginas.push(indexacion_cursos(n));
			}

			Promise.all(paginas).then(function(results){
				results.forEach(function(obj) {
			        console.log(obj.length);
			        fs.writeFileSync('acamica.html', JSON.stringify(cursos_api))
			    });

				function temario_curso(curso_acamica){
					return new Promise(function (resolve, reject){
			        	request( {url: 'https://api.acamica.com/courses/'+curso_acamica.id, encoding: 'utf8' }, function(err, resp, body){
			        		var path_curso = JSON.parse(body).url.name
			        		var niveles = JSON.parse(body).levels;
			        		temario_curso = []
			        		niveles.forEach(nivel =>{
			        			titulo_capitulo = nivel.name
			        			temas_capitulo = []
			        			nivel.lessons.forEach( leccion => {
			        				titulo_tema = leccion.lesson.name;
			        				tipo_tema = leccion.lesson.type;
			        				link_tema = dominio+'/clases/'+leccion.id+'/'+path_curso+'/'+leccion.lesson.cname
			        				var tema = {
			        					titulo_tema: titulo_tema,
			        					tipo_tema: tipo_tema,
			        					link_tema: link_tema,
			        					video_tema: 'https://www.youtube.com/watch?v=' + leccion.lesson.video_url.youtube 
			        				}
			        				temas_capitulo.push(tema)
			        			})
			        			var capitulo = {
			        				titulo_capitulo:titulo_capitulo,
			        				temas_capitulo:temas_capitulo,	
			        			}
			        			temario_curso.push(capitulo)
			        		})
			        		var description_curso = JSON.parse(body).about;
			        		var curso_id = btoa(plataforma+":"+curso_acamica.name)
			        		var cursos = leer_archivo(path_cursos)
							cursos.forEach((curso_gravado,indice) => {
								if(curso_gravado.id_curso == curso_id){
									cursos[indice].description_curso = description_curso
									cursos[indice].temario_curso = temario_curso
									fs.writeFileSync(path_cursos, JSON.stringify(cursos))
								}
							})

			        		resolve(curso_acamica.name)	
			        	})
			        })
				}

				var cursos_req = []
			    cursos_api.forEach(curso_acamica => {
			    	cursos_req.push(temario_curso(curso_acamica));
			    })


			    Promise.all(cursos_req).then(function(name){
			    	console.log(name)
			    })
			})

			resolve(lista_curos)	
		}else{

			reject(err)
		}
	})
})

function leer_archivo(path){
	if (!fs.existsSync(path)) {
		var inicial = {}, inicial = []
		fs.writeFileSync(path, JSON.stringify(inicial))
		return JSON.parse(fs.readFileSync(path,'utf8'));
	}else{
		if (!fs.readFileSync(path,'utf8')) {
			var inicial = {}, inicial = []
			fs.writeFileSync(path, JSON.stringify(inicial))
			return JSON.parse(fs.readFileSync(path,'utf8'));
		}else {
			return JSON.parse(fs.readFileSync(path, 'utf8'));
		}
	}
}

function evaluar_curso(path,listado_cursos,curso){
	if(!listado_cursos.find(curso_gravado => curso_gravado.id_curso == curso.id_curso)){
		listado_cursos.push(curso)
		fs.writeFileSync(path, JSON.stringify(listado_cursos))
	}else{
		listado_cursos.forEach((curso_gravado,indice) => {
			if(curso_gravado.id_curso == curso.id_curso){
				listado_cursos[indice] = curso
				fs.writeFileSync(path, JSON.stringify(listado_cursos))
			}
		})
	}
}

function evaluar_clasificacion(path,listado,elemento){
	if(!listado.find(elemento_grabado => elemento_grabado.id_clasificacion == elemento.id_clasificacion)){
		listado.push(elemento)
		fs.writeFileSync(path, JSON.stringify(listado))
	}else{
		listado.forEach((elemento_grabado,indice) => {
			if(elemento_grabado.id_clasificacion == elemento.id_clasificacion){
				listado[indice] = elemento
				fs.writeFileSync(path, JSON.stringify(listado))
			}
		})
	}
}

function evaluar_instructor(path,listado,elemento){
	if(!listado.find(elemento_grabado => elemento_grabado.id_instructor == elemento.id_instructor)){
		listado.push(elemento)
		fs.writeFileSync(path, JSON.stringify(listado))
	}else{
		listado.forEach((elemento_grabado,indice) => {
			if(elemento_grabado.id_instructor == elemento.id_instructor){
				listado[indice] = elemento
				fs.writeFileSync(path, JSON.stringify(listado))
			}
		})
	}
}