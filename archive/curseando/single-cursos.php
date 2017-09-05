<?php get_header(); ?>

<!-- Wrapper -->
<div id="wrapper">
	<!-- Main -->
	<div id="main">
		<div class="inner">
			<!-- Header -->
			<header id="header">
				<a href="http://localhost/curseando" class="logo"><strong><- Regresar</strong></a>
				<!-- <ul class="icons">
					<li><a href="#" class="icon fa-twitter"><span class="label">Twitter</span></a></li>
					<li><a href="#" class="icon fa-facebook"><span class="label">Facebook</span></a></li>
					<li><a href="#" class="icon fa-snapchat-ghost"><span class="label">Snapchat</span></a></li>
					<li><a href="#" class="icon fa-instagram"><span class="label">Instagram</span></a></li>
					<li><a href="#" class="icon fa-medium"><span class="label">Medium</span></a></li>
				</ul> -->
			</header>

			<?php while ( have_posts() ) : the_post(); ?>	
				<section class="single_curso">
					
					
					<section class='container'>
						<header class="main center">
							<a href=<?php the_field('url_curso');?> class='titulo' target="_blank">
								<?php  the_title(''); ?>
							</a>
								
						</header>
						<div class="caracteristicas">
							<div class=<?php the_field('costo_curso') ?>> 
								<div>
									<?php the_field('costo_curso') ?>
								</div>
							</div>
							<div class="plataforma">
					        	<img src= <?php  echo "http://localhost/curseando/wp-content/uploads/".get_field('plataforma_curso') ."_logo.png" ?> />   	
					    	</div>
						</div>
					</section>	
					<section class='container'>
						<article class="image_post_curso">
							<?php if( get_field('plataforma_curso') == 'codigo_facilito' || get_field('plataforma_curso') == 'acamica' ): ?>
								<div class="codigo_facilito_fondo" style=<?php echo 'background-color:'.get_field('color_curso') ?>>
									<img src=<?php the_field('imagen_curso'); ?> alt="" />
								</div>
							<?php else: ?>									
								<img src=<?php the_field('imagen_curso'); ?> alt="" />
							<?php endif ?>
						</article>
						<article class="descripcion_post_curso">
							<h3>Descripcion:</h3>
							<p><?php the_field('description_curso'); ?></p>
						</article>	
					</section>
				<!--<section class='container'>

						<iframe width="420" height="315"
							src=<?php the_field('video_curso'); ?>>
						</iframe>

					</section>	 -->
					<h3>Temario:</h3>
					<?php $temario = get_field('temario_curso'); ?>
					<ul class="capitulos">
						<?php foreach ($temario as  $capitulo) { ?>
							<li class="capitulo">
								<?php echo $capitulo["titulo_capitulo"]; ?> 
								<ul class="temas">
									<?php if( $capitulo["temas_capitulo"] ) : ?>
										<?php foreach ($capitulo["temas_capitulo"] as  $tema) { ?>
											<li  class="tema">
												<a href=<?php echo( $tema["link_tema"])  ?> target="_blank"_>
													<?php echo( $tema["titulo_tema"]) ?>
												</a>	
											</li>
										<?php }	?> 
									<?php endif; ?>
								</ul>							
						    </li>
						<?php } ?>
					</ul>

					
					
				</section>		
			<?php endwhile; ?>
		</div>	
	</div>
	<?php get_sidebar(); ?>
</div>	
<?php get_footer(); ?>