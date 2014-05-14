
/**
 * To do:
 * [x] Use overlay with ClientRect & z-index instead of outline
 * [x] Selector selection per class, instead of all or none
 * [x] Remove selection in teardown()
 * [ ] ? Hilite all matches of current selection
 * [ ] ? No-cache/random js/css loading in bookmarklet
 * [ ] ? Another test page
 */

NodeList.prototype._map = [].map;
Array.prototype._has = function(item) { return this.indexOf(item) != -1; };

select0r = {
	HTML_HILITING: 'select0r-hiliting',
	HTML_SELECTING: 'select0r-selecting',
	OVERLAY_ITEM_CLASS: 'select0r-overlay-item',
	ITEM_TMP_HILITING: 'select0r-tmp-hiliting',

	target: null,
	$overlay: null,
	inc: 1,
	$select0r: null,
	$ancestors: null,
	$selectors: null,
	$selector: null,

	subselector: function(sel, types) {
		types.length || types.push('tag:0');

		var subsel = '';
		types.forEach(function(t) {
			t = t.split(':');
			subsel += sel[ t[0] ][ t[1] ];
		});
		return subsel;
	},
	enabledTypes: function(type) {
		var sel = type ? '.select0r-' + type + ' ul :checked' : '.select0r-selectors > li > :checked';
		return select0r.$selectors.querySelectorAll(sel)._map(function(type) {
			return type.value;
		});
	},
	changeSelector: function(e) {
		var el = select0r.target,
			types = select0r.enabledTypes(),
			sel,
			type2s,
			selector = '';

		if ( types._has('parent') && el.parentElement ) {
			sel = select0r.selector(el.parentElement);
			type2s = select0r.enabledTypes('parent');
			selector += select0r.subselector(sel, type2s) + ' > ';
		}

		if ( types._has('previous') && el.previousElementSibling ) {
			sel = select0r.selector(el.previousElementSibling);
			type2s = select0r.enabledTypes('previous');
			selector += select0r.subselector(sel, type2s) + ' + ';
		}

		sel = select0r.selector(el);
		type2s = select0r.enabledTypes('self');
		selector += select0r.subselector(sel, type2s);

		select0r.$selector.value = select0r.$selector.textContent = selector;
		select0r.$selectors.dataset.matches = document.querySelectorAll(selector).length;
	},
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
						sel2.forEach(function(item, i) {
							html += '<li class="select0r-' + type2 + '"><input id="select0r-tmp-' + type + '-' + type2 + '-' + i + '" type=checkbox value="' + type2 + ':' + i + '" ' + checked2 + '><label for="select0r-tmp-' + type + '-' + type2 + '-' + i + '"> ' + item + '</label></li>';
						});
					}
				}
				html += '</ul>';
			}
			html += '</li>';
		}

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
		sel.tag = [el.nodeName.toLowerCase()];
		sel.id = el.id ? ['#' + el.id] : false;

		sel.classes = el.classList.length ? ('.' + [].join.call(el.classList, '#.')).split('#') : false;

		return sel;
	},
	ancestors: function(el) {
		var list = [el];
		while ( el.parentElement && el.parentElement != document.body ) {
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

	hilite: function(el, many) {
		if ( !select0r.$overlay ) {
			var div = document.createElement('div');
			div.className = select0r.OVERLAY_ITEM_CLASS;
			document.body.appendChild(select0r.$overlay = div);
		}

		var offset = many ? 1 : 0;

		var rect = el.getBoundingClientRect(),
			scrollX = document.body.scrollLeft || document.documentElement.scrollLeft,
			scrollY = document.body.scrollTop || document.documentElement.scrollTop;
		select0r.$overlay.style.left = (scrollX + rect.left + offset) + 'px';
		select0r.$overlay.style.top = (scrollY + rect.top + offset) + 'px';
		select0r.$overlay.style.width = (rect.width - 2*offset) + 'px';
		select0r.$overlay.style.height = (rect.height - 2*offset) + 'px';
	},
	unhilite: function() {
		// Hide element?
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

		// result.addEventListener('dblclick', function(e) {
		// 	setTimeout(function() {
		// 		select0r.$selector.select && select0r.$selector.select();
		// 	}, 1);
		// }, true);

		result.addEventListener('mouseover', function(e) {
			// hilite all elements according to current selector
			var sel = select0r.$selector.value;
			[].forEach.call(document.querySelectorAll(sel), function(el) {
				el.classList.add(select0r.ITEM_TMP_HILITING);
			});
		});
		result.addEventListener('mouseout', function() {
			// unhilite all temporary elements
			[].forEach.call(document.querySelectorAll('.' + select0r.ITEM_TMP_HILITING), function(el) {
				el.classList.remove(select0r.ITEM_TMP_HILITING);
			});
		});

		document.body.appendChild(div);
	},
	teardown: function() {
		document.documentElement.classList.remove(select0r.HTML_SELECTING);
		select0r.unhilite();
	},
	start: function() {
		select0r.$select0r || select0r.build();

		document.documentElement.classList.add(select0r.HTML_HILITING);

		document.addEventListener('mouseover', select0r.hiliter, false);
		document.addEventListener('mousedown', select0r.clicker, false);
		document.addEventListener('click', select0r.clicker, false);
	},
	end: function() {
		document.documentElement.classList.remove(select0r.HTML_HILITING);

		document.removeEventListener('mouseover', select0r.hiliter, false);
		document.removeEventListener('mousedown', select0r.clicker, false);
		document.removeEventListener('click', select0r.clicker, false);
	},
};

select0r.start();
