
window.onload = function(e) {

	ajax('test/tpl.index.html', function(e, html) {
		var div = document.createElement('div');
		div.innerHTML = html;
		document.body.insertBefore(div, document.body.firstElementChild);

		ajax('select0r.bookmarklet.js', function(e, js) {
			if ( location.host != 'localhost' ) {
				js = js.replace(/\.\/select0r\./g, 'http://rawgithub.com/rudiedirkx/select0r/master/select0r.');
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
