var request = require('request'),
	cheerio = require('cheerio'),
	fs 		= require('fs')
	btoa = require('btoa')
var plataforma = 'platzi'

var clasificaciones = {}
var cursos = {}
var profesores = {}

request({url: 'https://platzi.com/cursos/', encoding: 'utf8' }, function(err, resp, body){
	if(!err && resp.statusCode == 200){
		
		var $ = cheerio.load(body);
		
		// Directorio de Carreras y cursos
		
		clasificacion = []		
		cursos = []

		$('.Career').each(function(){
			
			//Informacion de la carreras

			var nombre_clasificacion = $(this).find('.Career-name').html();
			var imagen_clasificacion = $(this).find('.Career-headerPrimary img').attr('src');
			
			console.log(nombre_clasificacion)
			console.log(imagen_clasificacion)

			var clasificacion = {
				plataforma_clasificacion: plataforma,
				nombre_clasificacion: nombre_clasificacion,
				imagen_clasificacion: imagen_clasificacion,
			};

			//Informacion de cada una de las carreras

			var Career = cheerio.load( $(this).html() )
			var courses = {}
			courses = []
			Career('.CareerCourse').each(function(){
				
				var nombre_curso = $(this).find('.CareerCourse-name').html();
				var link_curso = $(this).attr('href');
				var url_cursos = 'https://platzi.com/cursos' + link_curso.slice(7, -1);
				var url_clases = 'https://platzi.com/clases' + link_curso.slice(7, -1);
				var id_curso = btoa(plataforma+":"+nombre_curso)
				var imagen_curso = $(this).find('.CareerCourse-badge img').attr('src');
				
				if (nombre_curso == 'Curso Gratis de Programaci&#xF3;n B&#xE1;sica' ||
					nombre_curso == 'Curso Gratis de Marketing Voz a Voz' ||
					nombre_curso == 'Curso de Marca Personal' ||
					nombre_curso == 'Comunidad Platzi'){
					costo = 'Gratis'
				}else{
					costo = 'Menbresia'
				}
				//Agregamos el curso a la lista de la carreras
				courses.push(nombre_curso)
				var curso = {
					id_curso: id_curso,
					plataforma_curso: plataforma,
					nombre_curso: nombre_curso,
					link_curso: link_curso,
					imagen_curso: imagen_curso,
					url_curso: url_cursos,
					url_clases: url_clases,
					costo_curso: costo
				}
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
			
			})			
			clasificacion.cursos_clasificacion = courses
			clasificaciones.push(clasificacion)

		});

		
		profesores = []

		fs.writeFileSync("json/platzi-clasificaciones.json", JSON.stringify(clasificaciones));
		fs.writeFileSync("json/platzi-cursos.json", JSON.stringify(cursos));
		fs.writeFileSync("json/platzi-profesores.json", JSON.stringify(profesores));


		//cursos.length

		//Buscamos infomacion individual de cada curso
		for (var i = 0; i < cursos.length ; i++){
	
			request({url: cursos[i].url_curso, encoding: 'utf8'}, function(err, resp, body){
				if (err){
					console.log(err)
				}else if( resp.statusCode == 200){
					
					var curso_page = cheerio.load(body);
					// Capturamos informacion de cada curso
					var nombre_curso = curso_page('.BannerTop-courseInfo h1').html(); 
					var id_curso = btoa(plataforma+":"+nombre_curso);
					var description_curso = curso_page('.BannerTop-description').html();
					var video_curso = curso_page('.u-videoSource').attr('src');
					
					//	Capturamos informacion de los profesores 					
					var nombre_instructores_curso = []
					var id_instructores_curso = []
					var profesor					
					curso_page('.Teacher').each(function(){
						var nombre_instructor  = $(this).find('.Teacher-name').html()
						profesor = {
							plataforma_instructor: 'platzi',
							nombre_instructor: nombre_instructor,
							id_instructor: btoa(nombre_instructor),
							twitter_user_instructor: $(this).find('.Teacher-link').html(),
							twitter_link_instructor: $(this).find('.Teacher-link').attr('href'),
							descripcion_corta_instructor: $(this).find('.Teacher-label').html(),
							imagen_instructor:  $(this).find('.Teacher-image img').attr('src')
						}
						nombre_instructores_curso.push(nombre_instructor)
						id_instructores_curso.push(btoa(nombre_instructor))
						// Obtener los profesores ya registrados
						var instructores_actuales = JSON.parse(fs.readFileSync('json/platzi-profesores.json', 'utf8'));
						console.log(instructores_actuales.length)
						// Si no existen profesores agregamos el primero
						if(instructores_actuales.length == 0){
							profesor.nombre_cursos_dictados = []
							profesor.id_cursos_dictados = []
							profesor.nombre_cursos_dictados.push(nombre_curso)
							profesor.id_cursos_dictados.push(btoa(plataforma+":"+nombre_curso))
							instructores_actuales[instructores_actuales.length] = profesor
						}else{
							// Busca si el instructor ya existe solo le agrega el curso
							var test = false
							for (i=0;i<instructores_actuales.length;i++){
								if (instructores_actuales[i].id_instructor == profesor.id_instructor){
									instructores_actuales[i].nombre_cursos_dictados.push(nombre_curso)
									instructores_actuales[i].id_cursos_dictados.push(id_curso)
									test = true
								}
							}
							// Si no existe aun el instructor lo agrega a la lista
							if(test == false) {
								profesor.nombre_cursos_dictados = []
								profesor.id_cursos_dictados = []
								profesor.nombre_cursos_dictados.push(nombre_curso)
								profesor.id_cursos_dictados.push(id_curso)
								instructores_actuales[instructores_actuales.length] = profesor
							}
						}
						// Actualizamos la base de datos de los intructores
						fs.writeFileSync("json/platzi-profesores.json", JSON.stringify(instructores_actuales));	
					})
									
					// 
					var cursos_actuales = JSON.parse(fs.readFileSync('json/platzi-cursos.json', 'utf8'));			

					for (i=0; i <cursos_actuales.length;i++){
						if (cursos_actuales[i].id_curso == id_curso){
							cursos_actuales[i].description_curso = description_curso
							cursos_actuales[i].video_curso = video_curso
							cursos_actuales[i].nombre_instructores_curso = nombre_instructores_curso
							cursos_actuales[i].id_instructores_curso = id_instructores_curso
							console.log(cursos_actuales[i].nombre_curso)
							// Actualizamos la informacion del curso
							fs.writeFileSync("json/platzi-cursos.json", JSON.stringify(cursos_actuales));
						}
					}
				}else{
					console.log("Otro error")	
				}
			})


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
		
		
		console.log('Fin');
	}
});



