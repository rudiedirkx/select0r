
window.onload = function(e) {

	ajax('test/tpl.index.html?_=' + Math.random(), function(e, html) {
		var div = document.createElement('div');
		div.innerHTML = html;
		document.body.insertBefore(div, document.body.firstElementChild);

		ajax('select0r.bookmarklet.js?_=' + Math.random(), function(e, js) {
			// js = js.replace(/return\s/g, 'return####').replace(/\s+/g, '').replace(/####/g, ' '); //  Strips all white space
			js = js.replace(/\s+/g, ' '); // Strips only newlines
			if ( location.host.indexOf('home.') != 0 ) {
				js = js.replace(/\.\/select0r\./g, '//rawgit.com/rudiedirkx/select0r/master/select0r.');
			}
			document.querySelector('#select0r-bookmarklet').href = js.trim();
		});
	});

};

function ajax(url, cb) {
	var xhr = new XMLHttpRequest;
	xhr.open('get', url, true);
	xhr.onreadystatechange = function(e) {
		if ( this.readyState == 4 && this.status == 200 ) {
			cb(e, this.responseText);
		}
	};
	setTimeout(function() { xhr.send(); }, 1);
	return xhr;
}
