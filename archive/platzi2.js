var request = require('request'),
	cheerio = require('cheerio'),
	fs 		= require('fs')
	btoa = require('btoa')
	diff = require('deep-diff').diff;

var plataforma = 'platzi'

var clasificaciones_actuales 
if (!fs.readFileSync('json/clasificaciones.json','utf8')) {
	clasificaciones_actuales = {}
	clasificaciones_actuales = []
}else {
	clasificaciones_actuales =JSON.parse(fs.readFileSync('json/clasificaciones.json', 'utf8'));
}

request({url: 'https://platzi.com/cursos/', encoding: 'utf8' }, function(err, resp, body){
	if(!err && resp.statusCode == 200){
		
		var $ = cheerio.load(body);
		
		// Directorio de Carreras y cursos
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
			})
			clasificacion.cursos_classificacion = cursos_classificacion;
			
			var existe = false
			clasificaciones_actuales.forEach(function(clasificacion_actual,indice){
				if( id_clasificacion == clasificacion_actual.id_clasificacion ){
					console.log('La clasificacion '+ nombre_clasificacion + ' ya existe')
					existe = true
					if(!diff(clasificacion_actual,clasificacion)){
						console.log('Sin cambios')
					}else{
						console.log('Pero tenemos que actualizarla')
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
		console.log('Fin');
	}
});	

if (!fs.readFileSync('json/cursos.json', 'utf8')) {
	cursos_actuales = {}
	cursos_actuales = []
}else {
	cursos_actuales =JSON.parse(fs.readFileSync('json/cursos.json', 'utf8'));
}

clasificaciones_actuales.forEach(function(clasificacion_actual){

	clasificacion_actual.cursos_classificacion.forEach(function(curso){
		
		request({url: curso.url_curso, encoding: 'utf8' }, function(err, resp, body){
			if(!err && resp.statusCode == 200){
				
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
							console.log('El instructor '+ instructor.nombre_instructor + ' ya esta registrado')
							/*if( instructor_actual.nombre_instructor == 'Leonidas Esteban'){
								console.log('================================================================================')
								console.log(instructor)
								console.log('================================================================================')
							}
*/
							existe = true
							instructor.nombre_cursos_dictados = instructor_actual.nombre_cursos_dictados
							instructor.id_cursos_dictados = instructor_actual.id_cursos_dictados
							instructor.nombre_cursos_dictados.push(curso.nombre_curso)
							instructor.id_cursos_dictados.push(curso.id_curso)
							if(!diff(instructor_actual,instructor)){
								console.log('Sin cambios')
							}else{
								console.log('Pero tenemos que actualizarlo')
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
						console.log('Vamos a agregar al '+ instructor.nombre_instructor  + ' con su curso '+ curso.nombre_curso)
						/*if( instructor.nombre_instructor == 'Leonidas Esteban'){
							console.log('================================================================================')
							console.log(instructor)
							console.log('================================================================================')
						}*/
						instructores_actuales.push(instructor);	
					}
					fs.writeFileSync("json/profesores.json", JSON.stringify(instructores_actuales))
	
				})

				curso.nombre_instructores_curso = nombre_instructores_curso
				curso.id_instructores_curso = id_instructores_curso

				// BLOQUE DE ACTUALIZACION / CREACION

				if (!fs.readFileSync('json/cursos.json', 'utf8')) {
					cursos_actuales = {}
					cursos_actuales = []
				}else {
					cursos_actuales =JSON.parse(fs.readFileSync('json/cursos.json', 'utf8'));
				}
				var existe = false
				cursos_actuales.forEach(function(curso_actual,indice){
					if(curso_actual.id_curso == curso.id_curso) {
						console.log('El curso'+ curso.nombre_curso + ' ya existe')
						existe = true
						if(!diff(curso_actual,curso)){
							console.log('Sin cambios')
						}else{
							console.log('Pero tenemos que actualizarla')
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

			}
		})

	})
})
			//Informacion de cada una de las carreras
			
			
				/*
				var imagen_curso = $(this).find('.CareerCourse-badge img').attr('src');
				
				
				*/

				//Agregamos el curso a la lista de la carreras
				
				
					
				/*
				// Busca si la carrera ya existe o no en la lista 
				var test = false
				for (var i = 0; i < cursos.length; i++){
				  if (cursos[i].nombre_curso == curso.nombre_curso){
				  	cursos[i].clasificacion_curso.push(clasificacion.nombre_clasificacion)				  
				  	test = true
				  }
				}
				// Si no existe la agrega
				if (test == false) {
					curso.clasificacion_curso = []
					curso.clasificacion_curso.push(clasificacion.nombre_clasificacion)
					cursos.push(curso)
				}
				*/
			
			
						
			
			

		

		
		//profesores = []

		//fs.writeFileSync("json/cursos.json", JSON.stringify(cursos));
		//fs.writeFileSync("json/profesores.json", JSON.stringify(profesores));


		//cursos.length

		//Buscamos infomacion individual de cada curso

		/*
		for (var i = 0; i < cursos.length ; i++){
	
			request({url: cursos[i].url_curso, encoding: 'utf8'}, function(err, resp, body){
				


			//Temario de cada curso	
			request({url: cursos[i].url_clases, encoding: 'utf8'}, function(err, resp, body){
				if (err){
					console.log(err)
				}else if( resp.statusCode == 200){
					
					var clase_page = cheerio.load(body);
					var nombre_curso = clase_page('.CourseBanner-title span').html(); 
					var id_curso = btoa(plataforma+":"+nombre_curso);					
					var capitulos_curso = {}
					capitulos_curso = []
					// Si el curso aun no esta disponible	
					if (!clase_page('.Concept')){
						var tiempo_falta = clase_page('.EmptyCourse-counter- p strong').html(); 
						capitulos_curso.push(tiempo_falta)
					}
					// Si el temario ya esta disponible
					clase_page('.Concept').each(function(){
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
						capitulos_curso.push(capitulo)
					})

					var cursos_actuales = JSON.parse(fs.readFileSync('json/platzi-cursos.json', 'utf8'));
					
					for (i=0;i <cursos_actuales.length;i++){
						if (cursos_actuales[i].id_curso == id_curso){
							cursos_actuales[i].temario_curso = capitulos_curso
							console.log("Temario de ")
							console.log(cursos_actuales[i].nombre_curso)
							fs.writeFileSync("json/platzi-cursos.json", JSON.stringify(cursos_actuales));
						}
					}
				}else{
					console.log("Otro error")	
				}
			})
			
		}
		
		*/
		



