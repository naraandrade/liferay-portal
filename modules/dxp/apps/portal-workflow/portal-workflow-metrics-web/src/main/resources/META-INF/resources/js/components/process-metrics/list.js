/**
 * Copyright (c) 2000-present Liferay, Inc. All rights reserved.
 *
 * The contents of this file are subject to the terms of the Liferay Enterprise
 * Subscription License ("License"). You may not use this file except in
 * compliance with the License. You can obtain a copy of the License by
 * contacting Liferay, Inc. See the License for the specific language governing
 * permissions and limitations under the License, including but not limited to
 * distribution rights of the Software.
 */

/*
 * Simple doubly linked list implementation derived from Cormen, et al.,
 * "Introduction to Algorithms".
 */

export default function List() {
	var sentinel = {};
	sentinel._next = sentinel._prev = sentinel;
	this._sentinel = sentinel;
}

List.prototype.dequeue = function () {
	var sentinel = this._sentinel;
	var entry = sentinel._prev;
	if (entry !== sentinel) {
		unlink(entry);

		return entry;
	}
};

List.prototype.enqueue = function (entry) {
	var sentinel = this._sentinel;
	if (entry._prev && entry._next) {
		unlink(entry);
	}
	entry._next = sentinel._next;
	sentinel._next._prev = entry;
	sentinel._next = entry;
	entry._prev = sentinel;
};

List.prototype.toString = function () {
	var strs = [];
	var sentinel = this._sentinel;
	var curr = sentinel._prev;
	while (curr !== sentinel) {
		strs.push(JSON.stringify(curr, filterOutLinks));
		curr = curr._prev;
	}

	return '[' + strs.join(', ') + ']';
};

function unlink(entry) {
	entry._prev._next = entry._next;
	entry._next._prev = entry._prev;
	delete entry._next;
	delete entry._prev;
}

function filterOutLinks(k, v) {
	if (k !== '_next' && k !== '_prev') {
		return v;
	}
}
