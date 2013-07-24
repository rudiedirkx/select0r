
NodeList.prototype.map = [].map;
Array.prototype.contains = function(item) { return this.indexOf(item) != -1; };

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
	$selector: null,

	subselector: function(sel, types) {
		types.length || types.push('tag');

		return ( types.contains('tag') ? sel.tag : '' ) + ( types.contains('id') ? sel.id : '' ) + ( types.contains('classes') ? sel.classes : '' );
	},
	enabledTypes: function(type) {
		var sel = type ? '.select0r-' + type + ' ul :checked' : '.select0r-selectors > li > :checked';
		return select0r.$selectors.querySelectorAll(sel).map(function(type) {
			return type.value;
		});
	},
	changeSelector: function(e) {
		var el = select0r.target,
			types = select0r.enabledTypes(),
			sel,
			type2s,
			selector = '';

		if ( types.contains('parent') && el.parentElement ) {
			sel = select0r.selector(el.parentElement);
			type2s = select0r.enabledTypes('parent');
			selector += select0r.subselector(sel, type2s) + ' > ';
		}

		if ( types.contains('previous') && el.previousElementSibling ) {
			sel = select0r.selector(el.previousElementSibling);
			type2s = select0r.enabledTypes('previous');
			selector += select0r.subselector(sel, type2s) + ' + ';
		}

		sel = select0r.selector(el);
		type2s = select0r.enabledTypes('self');
		selector += select0r.subselector(sel, type2s);

		select0r.$selector.value = select0r.$selector.textContent = selector;
		select0r.$selectors.dataset.matches = document.querySelectorAll(selector).length;
		select0r.$select0r.scrollTop = 9999;
	},
	/**
	clickSelector: function(e) {
		var sel = this.dataset.select0r;
		alert(sel + '\n\nAnd now what?');
	},
	/**/
	clickAncestor: function(e) {
		select0r.$ancestors.querySelector('.select0r-active').classList.remove('select0r-active');
		this.classList.add('select0r-active');

		var el = document.querySelector('[data-select0r-id="' + this.dataset.select0r + '"]'),
			ul = select0r.$selectors;
		select0r.target = el;

		var sels = {
			parent: el.parentElement && select0r.selector(el.parentElement),
			previous: el.previousElementSibling && select0r.selector(el.previousElementSibling),
			self: select0r.selector(el)
		};

		var html = '';
		for ( var type in sels ) {
			var sel = sels[type];

			if ( sel ) {
				var checked = type == 'self' ? ' checked' : '',
					disabled = type == 'self' ? ' disabled' : '';

				html += '<li class="select0r-' + type + '">';
				html += '<input id="select0r-tmp-' + type + '" type=checkbox value="' + type + '" ' + checked + disabled + '><label for="select0r-tmp-' + type + '"> ' + type + '</label>';
				html += '<ul>';
				var preferred2 = select0r.preferredSelector(sel);
				for ( var type2 in sel ) {
					var sel2 = sel[type2];

					if ( sel2 ) {
						var checked2 = type2 == preferred2 ? 'checked' : '';
						html += '<li class="select0r-' + type2 + '"><input id="select0r-tmp-' + type + '-' + type2 + '" type=checkbox value="' + type2 + '" ' + checked2 + '><label for="select0r-tmp-' + type + '-' + type2 + '"> ' + sel2 + '</label></li>';
					}
				}
				html += '</ul>';
			}
			html += '</li>';
		}

		// var selectors = select0r.selectors(el),
			// html = '';
		// selectors.forEach(function(sel, i) {
			// var num = document.querySelectorAll(sel).length;
			// html += '<li class="select0r-selector" data-select0r="' + sel + '">' + '[' + num + '] ' + sel + '</li>';
		// });

		ul.innerHTML = html;

		select0r.changeSelector({});
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
			var active = i == ancestors.length-1 ? 'select0r-active' : '',
				rid = select0r.inc++;
			anc.dataset.select0rId = rid;
			html += '<li class="select0r-ancestor ' + active + '" data-select0r="' + rid + '">' + select0r.el(anc) + '</li>';
		});
		ul.innerHTML = html;

		select0r.clickAncestor.call(ul.lastElementChild, {});

		select0r.hilite(el);
	},
	preferredSelector: function(sel) {
		return sel.id ? 'id' : sel.classes ? 'classes' : 'tag';
	},
	selector: function(el) {
		var sel = {};
		sel.tag = el.nodeName.toLowerCase();
		sel.id = el.id ? '#' + el.id : false;

		var cn = el.className;
		el.classList.remove(select0r.ITEM_CLASS);
		sel.classes = el.classList.length ? '.' + [].join.call(el.classList, '.') : false;
		el.className = cn;

		return sel;
	},
	/**
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
	/**/
	ancestors: function(el) {
		var list = [el];
		while ( el.parentElement ) {
			list.push(el = el.parentElement);
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
			if ( e.target.classList.contains('select0r-ancestor') ) {
				select0r.clickAncestor.call(e.target, e);
			}
			/**
			else if ( e.target.classList.contains('select0r-selector') ) {
				select0r.clickSelector.call(e.target, e);
			}
			/**/
		}, true);

		div.addEventListener('mouseover', function(e) {
			if ( e.target.classList.contains('select0r-ancestor') ) {
				select0r.hoverAncestor.call(e.target, e);
			}
		}, true);

		div.addEventListener('mouseout', function(e) {
			select0r.unhoverAncestor.call(e.target, e);
		}, true);


		var close = document.createElement('span');
		close.textContent = 'x';
		close.className = 'select0r-close';
		div.appendChild(close);

		close.addEventListener('click', function(e) {
			select0r.teardown();
		});


		var ul = document.createElement('ul');
		div.appendChild(select0r.$ancestors = ul);
		ul.className = 'select0r-ancestors';


		var ul = document.createElement('ul');
		div.appendChild(select0r.$selectors = ul);
		ul.className = 'select0r-selectors';

		div.addEventListener('change', function(e) {
			select0r.changeSelector.call(e.target, e);
		}, true);


		var result = document.createElement('pre');
		div.appendChild(select0r.$selector = result);
		result.className = 'select0r-selector';

		result.addEventListener('dblclick', function(e) {
			setTimeout(function() {
				select0r.$selector.select && select0r.$selector.select();
			}, 1);
		}, true);

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
