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
						<?php	the_archive_title( '<h2 class="page-title">', '</h2>' );?>
					</header>


					<div class="posts">
						<?php
						while ( have_posts() ) : the_post();
							if(get_the_archive_title() == "Archivos: Instructores") {
								get_template_part( 'content-instructor', get_post_format() );	
							}

							if(get_the_archive_title() == "Archivos: Cursos") {
								get_template_part( 'content-curso', get_post_format() );		
							}
						endwhile;
						?>
					</div> 
					<!-- <div class="posts">
					<?php  echo do_shortcode('[ajax_load_more container_type="div" post_type="cursos" posts_per_page="6" scroll_distance="10" transition="fade"]')?>
					</div> -->
				</section>
		</div>
	</div>
	<!-- Sidebar -->					
	<?php get_sidebar(); ?>
	<?php get_footer(); ?>
</div>

