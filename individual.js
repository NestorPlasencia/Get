var request = require('request'),
	cheerio = require('cheerio'),
	fs 		= require('fs'),
	btoa 	= require('btoa'),
	diff 	= require('deep-diff').diff;

var plataforma = 'codigo_facilito'
//curso = {}


//curso.url_curso = 'https://codigofacilito.com/cursos/crea-un-bot-para-facebook-messenger'
//curso.nombre_curso = 'Curso para crear un administrador de proyectos'
var path ='json/cursos-codigo.json'
//var path ='json/codigo/cursos-codigo-'+ curso.url_curso.slice(34) +'.json'

var cursos_lista 
if (!fs.readFileSync('json/cursos-codigo.json','utf8')) {
	cursos_lista = {},cursos_lista = []
}else {
	cursos_lista = JSON.parse(fs.readFileSync('json/cursos-codigo.json', 'utf8'));
}
console.log(cursos_lista)

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

			description_curso = description_curso.split("\n").join('')
			if(tiempo_curso) { tiempo_curso.split("\n").join('') }

			curso.numero_videos_curso = numero_videos_curso
			curso.tiempo_curso = tiempo_curso
			curso.description_curso = description_curso
			curso.temario_curso = []


			var temario_completo = new Promise((resolve, reject) => {
			$('#playlist_course ul li ').each(function(){
					
				if($(this).find('header a div div div.text-left .box').text() != ""){
					

					var titulo_capitulo = $(this).find('header a div div div.text-left .box').text()
					titulo_capitulo = titulo_capitulo.slice(titulo_capitulo.indexOf('-') + 2,titulo_capitulo.lenght)
					titulo_capitulo = titulo_capitulo.split("\n").join('')
					
					var req_url = 'https://codigofacilito.com' + $(this).find('header a').attr('href')
					
					
					request({url: req_url,encoding: 'utf8',	headers: {'X-Requested-With': 'XMLHttpRequest',	'User-Agent': 'UserAgent' } }, function(err, resp, body){
						
						if(!err && resp.statusCode == 200){
							capitulos = []
							
							body = body.split('\\n').join('')
							body = body.split('\\').join('')
							body = body.split('>n').join('>')
							body = body.split('&nbsp;n').join('')												
							var inicio = body.lastIndexOf(').html(') + 7
							var final = body.lastIndexOf(');}}).call(this);')
							var ul = body.substring(inicio,final)
							var lista = cheerio.load(ul);
							
							temas_indi = []
							
							lista('li.top-space').each(function(i,elm){
								var titulo_tema = $(this).find('a div div.col-xs .box').text()
								titulo_tema = titulo_tema.slice(titulo_tema.lastIndexOf('-') + 2,titulo_tema.lenght)
								var tiempo_tema = $(this).find('a div div.text-left .box span').text()
								var link_tema = 'https://codigofacilito.com' + $(this).find('a').attr('href')
								var tema = {
									titulo_tema: titulo_tema,
									tipo_tema: 'Video',
									tiempo_tema: tiempo_tema,
									link_tema: link_tema,
								}
								temas_indi.push(tema)
							})
							var capitulo = {
								titulo_capitulo: titulo_capitulo,
								temas_capitulo: temas_indi,
							}
							//console.log('Existen '+temas_indi.length+ ' temas en el capitulo ' + capitulo.titulo_capitulo + ' en el curso ' + curso.nombre_curso )
							capitulos.push(capitulo)
							console.log('Existen '+ capitulos.length + ' capitulos en el curso ' + curso.nombre_curso )
							curso.temario_curso = capitulos
							resolve(curso)

						}
					
					})
				}				
			})
			})

			temario_completo
				.then(function(curso){

					console.log("Se va a afgregar contenido")
					
					curso.temario_curso.forEach()
					
					if (!fs.readFileSync(path, 'utf8')) {
						cursos_actuales = {},cursos_actuales = []
						fs.writeFileSync(path, JSON.stringify(cursos_actuales))
					}else {
						cursos_actuales =JSON.parse(fs.readFileSync(path, 'utf8'));
					}
					var existe = false
					cursos_actuales.forEach(function(curso_actual,indice){
						if(curso_actual.id_curso == curso.id_curso) {
							existe = true
							if(diff(curso_actual,curso)){
								console.log('El curso'+ curso.nombre_curso + ' ya existe pero tenemos que actualizarlo')
								cursos_actuales[indice] = curso;
							}
						}
					})
					if(existe== false){
						console.log('Vamos a agregar '+ curso.nombre_curso )
						cursos_actuales.push(curso);	
					}
					fs.writeFileSync(path, JSON.stringify(cursos_actuales))	
				})			
			//Termino de la promesa	 

		}else{
			console.log(err)
		}
	})
})	