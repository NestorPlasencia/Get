var request = require('request'),
	cheerio = require('cheerio'),
	fs 		= require('fs'),
	btoa 	= require('btoa'),
	diff 	= require('deep-diff').diff;

var plataforma = 'udemy'
var dominio = 'https://www.udemy.com'
var path_cursos = 'json/cursos-'+plataforma+'.json' 
var path_clasificaciones = 'json/clasificaciones-'+plataforma+'.json' 
var path_instructores =  'json/instructores-'+plataforma+'.json'
var api_path = 'https://www.udemy.com/api-2.0/channels/'

channels = [1640,1624,1646,1626,1642,1628]
nombres = [ 'Desarrollo',
			'Negocios',
			'Informática y software',
			'Diseño',
			'Marketing',
			'Fotografía'
		  ]

clasificaciones_udemy = {}
clasificaciones_udemy = []
channels.forEach((channel,ind) => {
	var clasificacion_udemy = {
		channel: channel,
		nombre: nombres[ind],
	}
	clasificaciones_udemy.push(clasificacion_udemy)
})


function extrac_subcategorias(clasificacion_udemy){
	return new Promise(function (resolve, reject){
		request({url: api_path+clasificacion_udemy.channel+'/hierarchy-channels', encoding: 'utf8' }, function(err, resp, body){
			if(!err && resp.statusCode == 200){
				var data = JSON.parse(body).results;
				data.forEach( classificacion => {
					var nombre_clasificacion = ''
					canales.forEach( canal => { 
						if(classificacion.id == canal.canal) { 
							nombre_clasificacion = canal.nombre
						}
					})
					var plataforma_clasificacion = plataforma
					var id_clasificacion = btoa(plataforma+":"+nombre_clasificacion)
					var link_clasificacion = dominio + classificacion.url_title
					var id_classificacion_udemy = classificacion.id
					var clasificacion = {
						id_clasificacion: id_clasificacion,
						plataforma_clasificacion: plataforma_clasificacion,
						nombre_clasificacion: nombre_clasificacion,
						link_clasificacion: link_clasificacion,
						id_classificacion_udemy: id_classificacion_udemy,
					} 
					var clasificaciones = leer_archivo(path_clasificaciones)
					evaluar_clasificacion(path_clasificaciones,clasificaciones,clasificacion)
					
				})
				resolve(clasificacion_udemy.nombre)
			}else{
				reject(err)
			}
		})
	})
}
var categorias = [];
clasificaciones_udemy.forEach(clasificacion_udemy => {
	categorias.push(extrac_subcategorias(clasificacion_udemy));
})
Promise.all(categorias).then(function(results){
	results.forEach(function(obj) {
        console.log(obj);
    })
    var clasificaciones = leer_archivo(path_clasificaciones)
    console.log(clasificaciones.length)
    function subcategorias_individuales(clasificacion){
    	var path_req = api_path + clasificacion.id_classificacion_udemy+'/courses?is_angular_app=true&is_topic_filters_enabled=false&lang=es&price=price-free'
		return new Promise(function (resolve, reject){
			request({url: path_req, encoding: 'utf8' }, function(err, resp, body){
				if(!err && resp.statusCode == 200){
					var data = JSON.parse(body);
					var num = data.count
					var clasificacion_id = clasificacion.id_clasificacion
					var path_req_num = api_path + clasificacion.id_classificacion_udemy+'/courses?is_angular_app=true&is_topic_filters_enabled=false&lang=es&price=price-free&page_size='+num
					request({url: path_req_num, encoding: 'utf8' }, function(err, resp, body){
						if(!err && resp.statusCode == 200){
							var data = JSON.parse(body).results;
							data.forEach(curso_udemy => {
								var nombre_curso = curso_udemy.title
				        		var id_curso = btoa(plataforma+":"+nombre_curso)
				        		var plataforma_curso = plataforma
								imagen_curso = curso_udemy.image_480x270;
								url_curso = dominio + curso_udemy.url;
								if(curso_udemy.instructional_level == 'Beginner Level'){ nivel_curso = 'Básico'}
								if(curso_udemy.instructional_level == 'Intermediate Level'){ nivel_curso = 'Intermedio'}
								if(curso_udemy.instructional_level == 'Advanced Level'){ nivel_curso = 'Avanzado'}
								if(curso_udemy.instructional_level == 'Expert Level'){ nivel_curso = 'Avanzado'}
								if(curso_udemy.instructional_level == 'All Levels'){ nivel_curso = 'Básico'}
								if(curso_udemy.is_paid == false){ costo_curso = 'Gratis'}
								if(curso_udemy.is_paid == true){ costo_curso = 'Precio Unico'}						
								
								//Agregamos la clasificacion al curso
								var cursos = leer_archivo(path_cursos)
								if(!cursos.find(elemento_grabado => elemento_grabado.id_curso == id_curso)){
									clasificacion_curso = [], clasificacion_curso.push(clasificacion.nombre_clasificacion)
								}else{
									cursos.forEach((elemento_grabado,indice) => {
										if(elemento_grabado.id_curso == id_curso){
											clasificacion_curso = elemento_grabado.clasificacion_curso;
											if(!clasificacion_curso.find(nombre_clasificacion_grabado => nombre_clasificacion_grabado == clasificacion.nombre_clasificacion)){
												clasificacion_curso.push(clasificacion.nombre_clasificacion)	
											}
										}
									})
								}

								//Agregamos el curso en su clasificaion
								var clasificacion_actual
								var clasificaciones = leer_archivo(path_clasificaciones)
								clasificaciones.forEach((elemento_grabado,indice) => {
									//console.log(clasificacion_id)
									if(elemento_grabado.id_clasificacion == clasificacion_id){
										clasificacion_actual = elemento_grabado
										
										if(!clasificacion_actual.cursos_classificacion){
											clasificacion_actual.cursos_classificacion = [];
											clasificacion_actual.cursos_classificacion.push(nombre_curso)
										}else{
											cursos_classificacion = clasificacion_actual.cursos_classificacion;
											if(!cursos_classificacion.find(nombre_curso_grabado => nombre_curso_grabado == nombre_curso)){
												clasificacion_actual.cursos_classificacion.push(nombre_curso)	
											}
										}
									}
								})
								evaluar_clasificacion(path_clasificaciones,clasificaciones,clasificacion_actual)


								var nombre_instructores_curso = [], id_instructores_curso = []
				        		curso_udemy.visible_instructors.forEach( teacher => {
				        			var nombre_instructor = teacher.title
									var id_instructor = btoa(plataforma+":"+nombre_instructor)
									var imagen_instructor = teacher.image_100x100
									var link_instructor = dominio + teacher.url
									var plataforma_instructor = plataforma;
									
									nombre_instructores_curso.push(nombre_instructor)
									id_instructores_curso.push(id_instructor)

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
									nivel_curso: nivel_curso,
									clasificacion_curso: clasificacion_curso,
									nombre_instructores_curso: nombre_instructores_curso,
									id_instructores_curso: id_instructores_curso,
								}

								var cursos = leer_archivo(path_cursos)
								evaluar_curso(path_cursos,cursos,curso)
								console.log('Indexamos el curso '+ nombre_curso)
							})
								
						}else{
							reject(err)	
						}
					})
					resolve(num)
				}else{
					reject(err)
				}
			})
		})
    }
    var subcategorias = []
    clasificaciones.forEach(clasificacion => {
    	subcategorias.push(subcategorias_individuales(clasificacion));
    })
    Promise.all(subcategorias).then(function(results){
		results.forEach(function(obj) {
			console.log(obj);
		})
		console.log('Vamos por los temarios')
		
		function temario_curso(curso_udemy){
			return new Promise(function (resolve, reject){
	        	request( {url: curso_udemy.url_curso, encoding: 'utf8' }, function(err, resp, body){
	        		if(!err && resp.statusCode == 200){
	        			var $ = cheerio.load(body);
		        		temario_curso = []
		        		$('.content-container').each( function(){
		        			
		        			titulo_capitulo = $(this).find('.lecture-title-text').html();
		        			console.log(titulo_capitulo)
		        			temas_capitulo = []
		        			var subtemas = $(this).find('.lectures-container .lecture-container')
		        			subtemas.each( function(){
		        				titulo_tema = $(this).find('.title').text().trim();
		        				//tipo_tema = $(this).find('.title');
		        				link_tema = curso_udemy.url_curso
		        				var tema = {
		        					titulo_tema: titulo_tema,
		        					//tipo_tema: tipo_tema,
		        					link_tema: link_tema,
		        					//video_tema: 'https://www.youtube.com/watch?v=' + leccion.lesson.video_url.youtube 
		        				}
		        				temas_capitulo.push(tema)
		        			})
		        			var capitulo = {
		        				titulo_capitulo:titulo_capitulo,
		        				temas_capitulo:temas_capitulo,	
		        			}
		        			temario_curso.push(capitulo)
		        		})
		        		
		        		var description_curso = "";
						$('.description p').each(function(i,elm){
							description_curso = description_curso + $(this).text()
						})
						description_curso = description_curso.trim();

						var numero_videos_curso  = $('.num-lectures').text().trim();
						var tiempo_curso = $('.curriculum-header-length').text().trim();

		        		var curso_id = btoa(plataforma+":"+curso_udemy.nombre_curso)
		        		var cursos = leer_archivo(path_cursos)
						cursos.forEach((curso_gravado,indice) => {
							if(curso_gravado.id_curso == curso_id){
								cursos[indice].description_curso = description_curso
								cursos[indice].temario_curso = temario_curso
								cursos[indice].tiempo_curso = tiempo_curso
								cursos[indice].numero_videos_curso = numero_videos_curso
								fs.writeFileSync(path_cursos, JSON.stringify(cursos))
							}
						})
		        		resolve(curso_udemy.nombre_curso)		
	        		}
	        		
	        	})
	        })
		}
		var cursos = leer_archivo(path_cursos)
		var cursos_req = []
	    cursos.forEach(curso_udemy => {
	    	cursos_req.push(temario_curso(curso_udemy));
	    })

	    Promise.all(cursos_req).then(function(name){
	    	console.log(name)
	    })

	})	
})








/*

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
								id_instructores_curso.push(id_instructor)

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

*/

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

var canales = []

canales[0] = {	canal:1646,	nombre:	'Informática y software', }
canales[1] = {	canal:1766,	nombre:	'Certificaciones de TI', }
canales[2] = {	canal:1768,	nombre:	'Redes y seguridad', }
canales[3] = {	canal:1770,	nombre:	'Hardware', }
canales[4] = {	canal:1772,	nombre:	'Sistemas operativos', }
canales[5] = {	canal:1774,	nombre:	'Otros', }
canales[6] = {	canal:1640,	nombre:	'Desarrollo', }
canales[7] = {	canal:1656,	nombre:	'Desarrollo web', }
canales[8] = {	canal:1658,	nombre:	'Aplicaciones móviles', }
canales[9] = {	canal:1660,	nombre:	'Lenguajes de programación', }
canales[10] = {	canal:1662,	nombre:	'Desarrollo de videojuegos', }
canales[11] = {	canal:1664,	nombre:	'Bases de datos', }
canales[12] = {	canal:1666,	nombre:	'Testeo de software', }
canales[13] = {	canal:1668,	nombre:	'Ingeniería de software', }
canales[14] = {	canal:1930,	nombre:	'Herramientas de desarrollo', }
canales[15] = {	canal:1934,	nombre:	'Comercio electrónico', }
canales[16] = {	canal:1624,	nombre:	'Negocios', }
canales[17] = {	canal:1670,	nombre:	'Finanzas', }
canales[18] = {	canal:1672,	nombre:	'Emprendimiento', }
canales[19] = {	canal:1674,	nombre:	'Comunicación', }
canales[20] = {	canal:1676,	nombre:	'Gestión empresarial', }
canales[21] = {	canal:1678,	nombre:	'Ventas', }
canales[22] = {	canal:1680,	nombre:	'Estrategia', }
canales[23] = {	canal:1682,	nombre:	'Operaciones', }
canales[24] = {	canal:1684,	nombre:	'Gestión de proyectos', }
canales[25] = {	canal:1686,	nombre:	'Derecho empresarial', }
canales[26] = {	canal:1688,	nombre:	'Datos y análisis', }
canales[27] = {	canal:1690,	nombre:	'Negocios desde casa', }
canales[28] = {	canal:1692,	nombre:	'Recursos humanos', }
canales[29] = {	canal:1694,	nombre:	'Industria', }
canales[30] = {	canal:1696,	nombre:	'Medios de comunicación', }
canales[31] = {	canal:1698,	nombre:	'Bienes inmuebles', }
canales[32] = {	canal:1700,	nombre:	'Otros', }
canales[33] = {	canal:1642,	nombre:	'Marketing', }
canales[34] = {	canal:1702,	nombre:	'Marketing digital', }
canales[35] = {	canal:1704,	nombre:	'SEO', }
canales[36] = {	canal:1706,	nombre:	'Social Media', }
canales[37] = {	canal:1708,	nombre:	'Branding', }
canales[38] = {	canal:1710,	nombre:	'Fundamentos de marketing', }
canales[39] = {	canal:1712,	nombre:	'Análisis y automatización', }
canales[40] = {	canal:1714,	nombre:	'Relaciones públicas', }
canales[41] = {	canal:1716,	nombre:	'Publicidad', }
canales[42] = {	canal:1718,	nombre:	'Marketing con vídeo y móviles', }
canales[43] = {	canal:1720,	nombre:	'Marketing de contenidos', }
canales[44] = {	canal:1722,	nombre:	'Marketing tradicional', }
canales[45] = {	canal:1724,	nombre:	'Growth Hacking', }
canales[46] = {	canal:1726,	nombre:	'Marketing de afiliados', }
canales[47] = {	canal:1728,	nombre:	'Marketing de producto', }
canales[48] = {	canal:1730,	nombre:	'Otros', }
canales[49] = {	canal:1626,	nombre:	'Diseño', }
canales[50] = {	canal:1654,	nombre:	'Diseño web', }
canales[51] = {	canal:1746,	nombre:	'Diseño gráfico', }
canales[52] = {	canal:1748,	nombre:	'Herramientas de diseño', }
canales[53] = {	canal:1750,	nombre:	'Experiencia de usuario', }
canales[54] = {	canal:1752,	nombre:	'Diseño de juegos', }
canales[55] = {	canal:1754,	nombre:	'Design Thinking', }
canales[56] = {	canal:1756,	nombre:	'3D y animación', }
canales[57] = {	canal:1758,	nombre:	'Diseño de Moda', }
canales[58] = {	canal:1760,	nombre:	'Diseño arquitectónico', }
canales[59] = {	canal:1762,	nombre:	'Diseño de interiores', }
canales[60] = {	canal:1764,	nombre:	'Otros', }
canales[61] = {	canal:1628,	nombre:	'Fotografía', }
canales[62] = {	canal:1824,	nombre:	'Fotografía digital', }
canales[63] = {	canal:1826,	nombre:	'Fundamentos de fotografía', }
canales[64] = {	canal:1828,	nombre:	'Fotografía de Retratos', }
canales[65] = {	canal:1830,	nombre:	'Fotografía de Paisajes', }
canales[66] = {	canal:1832,	nombre:	'Fotografía en blanco y negro', }
canales[67] = {	canal:1834,	nombre:	'Herramientas de fotografía', }
canales[68] = {	canal:1836,	nombre:	'Fotografía móvil', }
canales[69] = {	canal:1838,	nombre:	'Fotografía de viajes', }
canales[70] = {	canal:1840,	nombre:	'Fotografía comercial', }
canales[71] = {	canal:1842,	nombre:	'Fotografía para bodas', }
canales[72] = {	canal:1844,	nombre:	'Fotografía de naturaleza', }
canales[73] = {	canal:1846,	nombre:	'Diseño de video', }
canales[74] = {	canal:1936,	nombre:	'Otros', }