<?php
/**
 * The sidebar containing the main widget area
 *
 * @package WordPress
 * @subpackage Twenty_Fifteen
 * @since Twenty Fifteen 1.0
 */

if ( has_nav_menu( 'primary' ) || has_nav_menu( 'social' ) || is_active_sidebar( 'sidebar-1' )  ) : ?>

	<!-- Sidebar -->
					<div id="sidebar">
						<div class="inner">

							<!-- Search -->
								<section id="search" class="alt">
									<!-- <form method="post" action="#">
										<input type="text" name="query" id="query" placeholder="Search" />
									</form> -->
									<?php get_search_form();?>

								</section>

							<!-- Menu -->
								<nav id="menu">
									<header class="major">
										<h2>Filtros</h2>
									</header>
									<ul>
										<li>
											<span class="">Plataforma</span>
											<ul>
												<li><input type="checkbox" id='devcode' name='devcode'> <label for='devcode' >Todos</label></li>
												<li><input type="checkbox" id='devcode' name='devcode'> <label for='devcode' >Devcode</label></li>
												<li><input type="checkbox" id='platzi' name='platzi'> <label for='platzi' >Platzi</label></li>
												<li><input type="checkbox" id='udemy' name='udemy'> <label for='udemy' >Udemy</label></li>
												<li><input type="checkbox" id='codigofacilito' name='codigofacilito'> <label for='codigofacilito' >Codigo Facilito</label></li>
												<li><input type="checkbox" id='acamica' name='acamica'> <label for='acamica' >Acamica</label></li>
												<li><input type="checkbox" id='escueladigital' name='escueladigital'> <label for='escueladigital' >Escuela Digital</label></li>
											</ul>
										</li>
										<li>
											<span class="">Costo</span>
											<ul>
												<li><input type="checkbox" id='gratis' name='gratis'> <label for='gratis' >Gratis</label></li>
												<li><input type="checkbox" id='menbresia' name='menbresia'> <label for='menbresia' >Menbresía</label></li>
												<li><input type="checkbox" id='unico' name='unico'> <label for='unico' >Pago Único</label></li>
											</ul>
										</li>
									</ul>
								</nav>

							<!-- Section -->
								<!-- <section>
									<header class="major">
										<h2>Ante interdum</h2>
									</header>
									<div class="mini-posts">
										<article>
											<a href="#" class="image"><img src="images/pic07.jpg" alt="" /></a>
											<p>Aenean ornare velit lacus, ac varius enim lorem ullamcorper dolore aliquam.</p>
										</article>
										<article>
											<a href="#" class="image"><img src="images/pic08.jpg" alt="" /></a>
											<p>Aenean ornare velit lacus, ac varius enim lorem ullamcorper dolore aliquam.</p>
										</article>
										<article>
											<a href="#" class="image"><img src="images/pic09.jpg" alt="" /></a>
											<p>Aenean ornare velit lacus, ac varius enim lorem ullamcorper dolore aliquam.</p>
										</article>
									</div>
									<ul class="actions">
										<li><a href="#" class="button">More</a></li>
									</ul>
								</section> -->

							<!-- Section -->
							<!-- 	<section>
									<header class="major">
										<h2>Get in touch</h2>
									</header>
									<p>Sed varius enim lorem ullamcorper dolore aliquam aenean ornare velit lacus, ac varius enim lorem ullamcorper dolore. Proin sed aliquam facilisis ante interdum. Sed nulla amet lorem feugiat tempus aliquam.</p>
									<ul class="contact">
										<li class="fa-envelope-o"><a href="#">information@untitled.tld</a></li>
										<li class="fa-phone">(000) 000-0000</li>
										<li class="fa-home">1234 Somewhere Road #8254<br />
										Nashville, TN 00000-0000</li>
									</ul>
								</section>
 -->
							<!-- Footer -->
								<!-- <footer id="footer">
									<p class="copyright">&copy; Untitled. Todos rights reserved. Demo Images: <a href="https://unsplash.com">Unsplash</a>. Design: <a href="https://html5up.net">HTML5 UP</a>.</p>
								</footer>
 -->
						</div>
					</div>

			</div>

<?php endif; ?>


<!-- Sidebar -->
					