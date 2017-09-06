var request = require('request'),
	cheerio = require('cheerio'),
	fs 		= require('fs'),
	btoa 	= require('btoa'),
	diff 	= require('deep-diff').diff;

var plataforma = 'edx'
var dominio = 'https://www.edx.org'
var path_cursos = 'json/cursos-'+plataforma+'.json' 
var path_clasificaciones = 'json/clasificaciones-'+plataforma+'.json' 
var path_instructores =  'json/instructores-'+plataforma+'.json'
var api_path = 'https://www.edx.org/api/v1/catalog/search?&page_size=3000&selected_facets[]=language_exact%3ASpanish&selected_facets[]=subjects_exact%3A'

subject_uuids = [	'409d43f7-ff36-4834-9c28-252132347d87',
					'e52e2134-a4e4-4fcb-805f-cbef40812580',
					'a168a80a-4b6c-4d92-9f1d-4c235206feaf',
				]
subject = [ 'Business%20%26%20Management',
			'Computer%20Science',
			'Data%20Analysis%20%26%20Statistics',
		  ]
español = [ 'Negocios',
			'Informatica',
			'Analisis de datos',
		  ]

clasificaciones_edx = {}
clasificaciones_edx= []
subject.forEach((channel,ind) => {
	var clasificacion_edx = {
		subject_uuids: subject_uuids[ind],
		subject: subject[ind],
		español: español[ind],
	}
	clasificaciones_edx.push(clasificacion_edx)
})


function extrac_cursos(clasificacion_edx){
	return new Promise(function (resolve, reject){
		request({url: api_path+clasificacion_edx.subject, encoding: 'utf8' }, function(err, resp, body){
			if(!err && resp.statusCode == 200){
				var data = JSON.parse(body).objects.results;
				data.forEach(curso_edx=>{
					var nombre_curso = curso_edx.title
	        		var id_curso = btoa(plataforma+":"+nombre_curso)
	        		var plataforma_curso = plataforma
					imagen_curso = curso_edx.image_url;
					url_curso = curso_edx.marketing_url;
					if(curso_edx.level_type == 'Introductory'){ nivel_curso = 'Básico'}
					if(curso_edx.level_type == 'Intermediate'){ nivel_curso = 'Intermedio'}
					if(curso_edx.level_type == 'Advanced'){ nivel_curso = 'Avanzado'}
					if(curso_edx.level_type == 'Expert'){ nivel_curso = 'Avanzado'}
					if(curso_edx.level_type == 'All'){ nivel_curso = 'Básico'}
					if(curso_edx.type == 'verified'){ costo_curso = 'Gratis'}
					if(curso_edx.type == 'professional'){ costo_curso = 'Precio Unico'}
					var curso = {
						id_curso: id_curso,
						key_edx: curso_edx.key,
						plataforma_curso: plataforma,
						nombre_curso: nombre_curso,
						url_curso: url_curso,
						imagen_curso: imagen_curso,
						costo_curso: costo_curso,
						nivel_curso: nivel_curso,
					}
					var cursos = leer_archivo(path_cursos)
					evaluar_curso(path_cursos,cursos,curso)
					console.log('Indexamos el curso '+ nombre_curso)
				})

				resolve(clasificacion_edx.español)
			}else{
				reject(err)
			}
		})
	})
}
var cursos = [];
clasificaciones_edx.forEach(clasificacion_edx => {
	cursos.push(extrac_cursos(clasificacion_edx));
})

Promise.all(cursos).then(function(results){
	results.forEach(function(obj) {
        console.log(obj);
    })

    function temario_curso(curso_edx){
		return new Promise( (resolve, reject)=>{
        	request({	url:'https://www.edx.org/api/catalog/v2/courses/' + curso_edx.key,
        				encoding: 'utf8', 
        				headers: {
        					'X-Requested-With': 'XMLHttpRequest',
        					'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.115 Safari/537.36',
        					'Referer': curso_edx.url_curso,
        					'Accept': 'application/json, text/javascript, */*; q=0.01'
        				}
        			},function(err, resp, body){
        		if(!err && resp.statusCode == 200){
        			var data = JSON.parse(body);
        			console.log(data)

        			resolve(curso_edx.nombre_curso)		
        		}else{
        			reject(err)
        		}
        	})
        })
	}

	var cursos = leer_archivo(path_cursos)
	var cursos_req = []
    cursos.forEach(curso_edx => {
    	cursos_req.push(temario_curso(curso_edx));
    })

    Promise.all(cursos_req).then(function(name){
    	console.log(name)
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

