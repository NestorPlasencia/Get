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

var listado_cursos = new Promise((resolve, reject) => {
	request({url: 'https://api.acamica.com/search/courses', encoding: 'utf8' }, function(err, resp, body){
		if(!err && resp.statusCode == 200){
			fs.writeFileSync('acamica.html',body)
			var $ = cheerio.load(body);
			
			var lista_curos = []
			/*
			$('.card').each(function(){
				var nombre_curso = $(this).find('.title').text();
				//var url_curso = dominio + $(this).find('.curso-grid-item__title a').attr('href');
				//var imagen_curso = dominio + $(this).find('.curso-grid-item__img a img').attr('src');
				//var costo_dolares_curso = $(this).find('.curso-grid-item__price').html();
				//var costo_curso = 'Pago Unico';
				//var id_curso = btoa(plataforma+":"+nombre_curso)
				var curso = {
					//id_curso: id_curso,
					//plataforma_curso: plataforma,
					nombre_curso: nombre_curso,
					//url_curso: url_curso,
					//imagen_curso: imagen_curso,
					//costo_curso: costo_curso,
					//costo_dolares_curso: costo_dolares_curso,
				}
				lista_curos.push(curso)
				var cursos = leer_archivo(path_cursos)
				evaluar_curso(path_cursos,cursos,curso)
				
			})
			*/
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