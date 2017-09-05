<?php get_header(); ?>
<!-- Wrapper -->
<div id="wrapper">
	<!-- Main -->
	<div id="main">
		<div class="inner">
			<!-- Header -->
			<header id="header">
				<a href="index.html" class="logo"><strong>Editorial</strong> by HTML5 UP</a>
				<ul class="icons">
					<li><a href="#" class="icon fa-twitter"><span class="label">Twitter</span></a></li>
					<li><a href="#" class="icon fa-facebook"><span class="label">Facebook</span></a></li>
					<li><a href="#" class="icon fa-snapchat-ghost"><span class="label">Snapchat</span></a></li>
					<li><a href="#" class="icon fa-instagram"><span class="label">Instagram</span></a></li>
					<li><a href="#" class="icon fa-medium"><span class="label">Medium</span></a></li>
				</ul>
			</header>
				<section>


					<header class="major">
						<?php
							the_archive_title( '<h2 class="page-title">', '</h2>' );
						?>
					</header>


					<div class="posts">
						<?php	while ( have_posts() ) : the_post(); ?>
							<article>
								<a href=<?php the_permalink() ?> class="image curso">
									<?php if( get_field('plataforma_curso') == 'codigo_facilito' || get_field('plataforma_curso') == 'acamica' ): ?>
										<div class="codigo_facilito_fondo" style=<?php echo 'background-color:'.get_field('color_curso') ?>>
											<img src=<?php the_field('imagen_curso'); ?> alt="" />
										</div>
									<?php else: ?>									
										<img src=<?php the_field('imagen_curso'); ?> alt="" />
									<?php endif ?>

								</a>
								<?php
									if ( is_single() ) :
										the_title( '<h3 class="titulo">', '</h3>' );
									else :
										the_title( sprintf( '<h4 class="titulo"><a href="%s" rel="bookmark">', esc_url( get_permalink() ) ), '</a></h4>' );
									endif;
								?>
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
							</article>
						<?php endwhile;	?>
					</div> 
					<!-- <div class="posts">
					<?php  //echo do_shortcode('[ajax_load_more container_type="div" post_type="cursos" posts_per_page="6" scroll_distance="10" transition="fade"]')?>
					</div> -->
				</section>
		</div>
	</div>
	<!-- Sidebar -->					
	<?php get_sidebar(); ?>
	<?php get_footer(); ?>
</div>

