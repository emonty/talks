/*!
 * configuation for this presentation
 */

// Full list of configuration options available here:
// https://github.com/hakimel/reveal.js#configuration
Reveal.initialize({
  controls: true,
  progress: true,
  history: true,
  center: true,
  width: 1500,


	theme: Reveal.getQueryHash().theme, // available themes are in /css/theme
	transition: Reveal.getQueryHash().transition || 'default', // default/cube/page/concave/zoom/linear/fade/none

	// Optional libraries used to extend on reveal.js
	dependencies: [
		{ src: 'lib/js/classList.js', condition: function() { return !document.body.classList; } },
		{ src: 'lib/js/highlight.js', async: true, callback: function() { hljs.initHighlightingOnLoad(); } },
		{ src: 'lib/js/zoom.js', async: true, condition: function() { return !!document.body.classList; } },
	]
});

