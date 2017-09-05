<?php
/**
 * The default template for displaying content
 *
 * Used for both single and index/archive/search.
 *
 * @package WordPress
 * @subpackage Twenty_Fifteen
 * @since Twenty Fifteen 1.0
 */
?>


<article>
	<a href="#" class="image"><img src=<?php the_field('imagen_curso'); ?> alt="" /></a>
	<?php
		if ( is_single() ) :
			the_title( '<h3 class="titulo">', '</h3>' );
		else :
			the_title( sprintf( '<h3 class="titulo"><a href="%s" rel="bookmark">', esc_url( get_permalink() ) ), '</a></h3>' );
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