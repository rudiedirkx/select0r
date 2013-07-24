
select0r = {
	HTML_HILITING: 'select0r-hiliting',
	HTML_SELECTING: 'select0r-selecting',
	ITEM_CLASS: 'select0r-hilited-item',

	// hiliting: false,
	target: null,
	inc: 1,
	$select0r: null,
	$ancestors: null,
	$selectors: null,

	clickSelector: function(e) {
		var sel = this.dataset.select0r;
		alert(sel + '\n\nAnd now what?');
	},
	clickAncestor: function(e) {
		select0r.$ancestors.querySelector('.active').classList.remove('active');
		this.classList.add('active');

		var el = document.querySelector('[data-select0r-id="' + this.dataset.select0r + '"]'),
			ul = select0r.$selectors;
		select0r.target = el;

		var selectors = select0r.selectors(el),
			html = '';
		selectors.forEach(function(sel, i) {
			var num = document.querySelectorAll(sel).length;
			html += '<li class="selector" data-select0r="' + sel + '">' + '[' + num + '] ' + sel + '</li>';
		});
		ul.innerHTML = html;
	},
	hoverAncestor: function(e) {
		var el = document.querySelector('[data-select0r-id="' + this.dataset.select0r + '"]');
		select0r.unhilite();
		select0r.hilite(el);
	},
	unhoverAncestor: function(e) {
		select0r.unhilite();
		select0r.hilite(select0r.target);
	},
	select: function(el) {
		document.documentElement.classList.add(select0r.HTML_SELECTING);
		select0r.unhilite();

		var ul = select0r.$ancestors;

		var ancestors = select0r.ancestors(el),
			html = '';
		ancestors.forEach(function(anc, i) {
			var active = i == ancestors.length-1 ? 'active' : '',
				rid = select0r.inc++;
			anc.dataset.select0rId = rid;
			html += '<li class="ancestor ' + active + '" data-select0r="' + rid + '">' + select0r.el(anc) + '</li>';
		});
		ul.innerHTML = html;

		select0r.clickAncestor.call(ul.lastElementChild, {});

		select0r.hilite(el);
	},
	selectors: function(el) {
		select0r.unhilite();
		var id = el.id,
			classes = [].join.call(el.classList, '.'),
			prev = el.previousElementSibling || false,
			prevClasses = prev ? [].join.call(prev.classList, '.') : '',
			first = !prev,
			last = !el.nextElementSibling,
			list = [];

		// [id]
		id && list.push('#' + id);
		// [id] + first
		id && first && list.push('#' + id + ':first-child');
		// [id] + last
		id && last && list.push('#' + id + ':last-child');
		// [class]
		classes && list.push('.' + classes);
		// [class] + first
		classes && first && list.push('.' + classes + ':first-child');
		// [class] + last
		classes && last && list.push('.' + classes + ':last-child');

		// prev[id] + [id]
		id && prev.id && list.push('#' + prev.id + ' + ' + '#' + id);
		// prev[class] + [id]
		id && prevClasses && list.push('.' + prevClasses + ' + ' + '#' + id);

		// prev[id] + [class]
		classes && prev.id && list.push('#' + prev.id + ' + ' + '.' + classes);
		// prev[class] + [class]
		classes && prevClasses && list.push('.' + prevClasses + ' + ' + '.' + classes);

		// Do something with parent [id] and/or [class] as well...

		select0r.hilite(el);
		return list;
	},
	ancestors: function(el) {
		var list = [el];
		while ( el.parentNode && el.parentNode != document ) {
			list.push(el = el.parentNode);
		}
		return list.reverse();
	},
	el: function(el) {
		var tag = el.nodeName.toLowerCase(),
			id = el.id,
			classes = [].join.call(el.classList, '.');
		return tag + ( id ? '#' + id : '' ) + ( classes ? '.' + classes : '' );
	},

	hilite: function(el) {
		el.classList.add(select0r.ITEM_CLASS);
	},
	unhilite: function() {
		var old = document.querySelector('.' + select0r.ITEM_CLASS);
		old && old.classList.remove(select0r.ITEM_CLASS);
	},

	hiliter: function(e) {
		select0r.unhilite();

		select0r.target = e.target;
		select0r.hilite(select0r.target);
	},
	clicker: function(e) {
		e.preventDefault();
		e.stopPropagation();

		if ( e.type == 'click' ) {
			select0r.end();
			select0r.select(select0r.target);
		}
	},

	build: function() {
		var div = document.createElement('div');
		select0r.$select0r = div;
		div.id = 'select0r';

		div.addEventListener('click', function(e) {
			if ( e.target.classList.contains('ancestor') ) {
				select0r.clickAncestor.call(e.target, e);
			}
			else if ( e.target.classList.contains('selector') ) {
				select0r.clickSelector.call(e.target, e);
			}
		}, true);

		div.addEventListener('mouseover', function(e) {
			if ( e.target.classList.contains('ancestor') ) {
				select0r.hoverAncestor.call(e.target, e);
			}
		}, true);

		div.addEventListener('mouseout', function(e) {
			select0r.unhoverAncestor.call(e.target, e);
		}, true);

		var close = document.createElement('span');
		close.textContent = 'x';
		close.className = 'close';
		div.appendChild(close);

		close.addEventListener('click', function(e) {
			select0r.teardown();
		});

		var ul = document.createElement('ul');
		div.appendChild(select0r.$ancestors = ul);
		ul.className = 'ancestors';

		var ul = document.createElement('ul');
		div.appendChild(select0r.$selectors = ul);
		ul.className = 'selectors';

		document.body.appendChild(div);
	},
	teardown: function() {
		document.documentElement.classList.remove(select0r.HTML_SELECTING);
		select0r.unhilite();
	},
	start: function() {
		select0r.$select0r || select0r.build();

		// select0r.hiliting = true;
		document.documentElement.classList.add(select0r.HTML_HILITING);

		document.addEventListener('mouseover', select0r.hiliter, false);
		document.addEventListener('mousedown', select0r.clicker, false);
		document.addEventListener('click', select0r.clicker, false);
	},
	end: function() {
		// select0r.unhilite();
		document.documentElement.classList.remove(select0r.HTML_HILITING);
		// select0r.hiliting = false;

		document.removeEventListener('mouseover', select0r.hiliter, false);
		document.removeEventListener('mousedown', select0r.clicker, false);
		document.removeEventListener('click', select0r.clicker, false);
	},
};

select0r.start();
