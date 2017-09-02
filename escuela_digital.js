var request = require('request'),
	cheerio = require('cheerio'),
	fs 		= require('fs'),
	btoa 	= require('btoa'),
	diff 	= require('deep-diff').diff;

var plataforma = 'escuela_digital'
var dominio = 'https://ed.team'
var path_cursos = 'json/cursos-'+plataforma+'.json' 
var path_clasificaciones = 'json/clasificaciones-'+plataforma+'.json' 
var path_instructores =  'json/instructores-'+plataforma+'.json'

var listado_cursos = new Promise((resolve, reject) => {
	request({url: dominio + '/cursos', encoding: 'utf8' }, function(err, resp, body){
		if(!err && resp.statusCode == 200){
			var $ = cheerio.load(body);
			fs.writeFileSync('acamica.html',body)
			var lista_curos = []
			$('.main-view-cursos .views-row').each(function(){
				var nombre_curso = $(this).find('.curso-grid-item__title a').html();
				var url_curso = dominio + $(this).find('.curso-grid-item__title a').attr('href');
				var imagen_curso = dominio + $(this).find('.curso-grid-item__img a img').attr('src');
				var costo_dolares_curso = $(this).find('.curso-grid-item__price').html();
				var costo_curso = 'Pago Unico';
				var id_curso = btoa(plataforma+":"+nombre_curso)
				var curso = {
					id_curso: id_curso,
					plataforma_curso: plataforma,
					nombre_curso: nombre_curso,
					url_curso: url_curso,
					imagen_curso: imagen_curso,
					costo_curso: costo_curso,
					costo_dolares_curso: costo_dolares_curso,
				}
				lista_curos.push(curso)
				var cursos = leer_archivo(path_cursos)
				evaluar_curso(path_cursos,cursos,curso)
				
			})
			resolve(lista_curos)	
		}else{
			reject(err)
		}
	})
})

listado_cursos.then(function(lista_curos){
	console.log('Se encontro '+lista_curos.length+' cursos')
	var listado_clasificaciones = new Promise((resolve, reject) => {
		lista_curos.forEach(function(curso){
			request({url: curso.url_curso, encoding: 'utf8' }, function(err, resp, body){
				if(!err && resp.statusCode == 200){
					var $ = cheerio.load(body);
					
					var description_curso = $('.courseDescription div p').text();
					var video_curso = $('.ed-video iframe').attr('src');

					var temario_curso = []
					$('.curso-clase').each(function(clase,indice){
						var titulo_capitulo = $(this).find('h3').html()
						if(titulo_capitulo){
							var indice =titulo_capitulo.indexOf('<span class="fecha">')
							if(indice > 0) {
								titulo_capitulo = titulo_capitulo.slice(0,indice)
							}						
						}
						var temas_capitulo = []
						var temas =  $(this).find('ul li')
						temas.each(function(){
							titulo_tema = $(this).text();
							tema = {
								titulo_tema: titulo_tema,
								tipo_tema : 'Video',
							}
							temas_capitulo.push(tema)
						})
						capitulo = {
							titulo_capitulo: titulo_tema,
							temas_capitulo : temas_capitulo,
						}
						temario_curso.push(capitulo)
					})
					
					var nombre_instructores_curso = []
					var id_instructores_curso = []
					$('.field_profesor .user-profile').each(function(){
						var nombre_instructor = $(this).find('.hide div').text();
						var imagen_instructor = dominio + $(this).find('.user-profile__img img').attr('src');
						var link_instructor = dominio + $(this).find('.user-profile__img a').attr('href');
						var id_instructor = btoa(plataforma+":"+nombre_instructor)
						nombre_instructores_curso.push(nombre_instructor);
						id_instructores_curso.push(id_instructor);

						instructor = {
							plataforma_instructor: plataforma,
							id_instructor: id_instructor,
							nombre_instructor: nombre_instructor,
							imagen_instructor: imagen_instructor,
							link_instructor: link_instructor,
						}
						var instructores = leer_archivo(path_instructores)
						evaluar_instructor(path_instructores,instructores,instructor)
					})

					var clasificacion_curso = []
					$('.tags-container .tags-item').each(function(){
						var nombre_clasificacion = $(this).find('a').text();
						var link_clasificacion = dominio + $(this).find('a').attr('href');
						var id_clasificacion = btoa(plataforma+":"+nombre_clasificacion)
						clasificacion_curso.push(nombre_clasificacion);
						clasificacion = {
							id_clasificacion: id_clasificacion,
							nombre_clasificacion: nombre_clasificacion,
							link_clasificacion: link_clasificacion,
							plataforma_clasificacion: plataforma,
						}
						var clasificaciones = leer_archivo(path_clasificaciones)
						evaluar_clasificacion(path_clasificaciones,clasificaciones,clasificacion)
					})

					var cursos = leer_archivo(path_cursos)
					cursos.forEach((curso_gravado,indice) => {
						if(curso_gravado.id_curso == curso.id_curso){
							cursos[indice].description_curso = description_curso
							cursos[indice].video_curso = video_curso
							cursos[indice].temario_curso = temario_curso
							cursos[indice].clasificacion_curso = clasificacion_curso
							cursos[indice].id_instructores_curso = id_instructores_curso
							cursos[indice].nombre_instructores_curso = nombre_instructores_curso
							fs.writeFileSync(path_cursos, JSON.stringify(cursos))
						}
					})
					var clasificaciones = leer_archivo(path_clasificaciones)
					resolve(clasificaciones)
				}else{
					reject(err)
				}
			})	
		})
	})
	listado_clasificaciones.then(function(clasificaciones){
		console.log('Se encontro '+ clasificaciones.length +' clasificaciones')
		clasificaciones.forEach(function(clasificacion){
			request({url: clasificacion.link_instructor, encoding: 'utf8' }, function(err, resp, body){
				if(!err && resp.statusCode == 200){
					var $ = cheerio.load(body);
					cursos_classificacion = [];
					$('.views-row .curso-grid-item__data').each(function(clase,indice){
						var nombre_curso = $(this).find('.curso-grid-item__title a').text();
						cursos_classificacion.push(nombre_curso)
					})
					clasificacion.cursos_classificacion = cursos_classificacion
					var clasificaciones = leer_archivo(path_clasificaciones)
					evaluar_clasificacion(path_clasificaciones,clasificaciones,clasificacion)
				}															
			})
		})
		var instructores = leer_archivo(path_instructores)
		console.log('Se encontro '+ instructores.length +' instructores')
		instructores.forEach(function(instructor){
			request({url: instructor.link_instructor, encoding: 'utf8' }, function(err, resp, body){
				if(!err && resp.statusCode == 200){
					var $ = cheerio.load(body);
					nombre_cursos_dictados = [];
					$('.views-row .curso-grid-item__data').each(function(clase,indice){
						var nombre_curso = $(this).find('.curso-grid-item__title a').text();
						nombre_cursos_dictados.push(nombre_curso)
					})
					var descripcion_instructor = "";
					$('.user-profile__bio div p').each(function(i,elm){
						descripcion_instructor = descripcion_instructor + $(this).text()
					})
					instructor.nombre_cursos_dictados = nombre_cursos_dictados
					instructor.descripcion_instructor = descripcion_instructor
					var instructores = leer_archivo(path_instructores)
					evaluar_instructor(path_instructores,instructores,instructor)
				}															
			})
		})
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
	