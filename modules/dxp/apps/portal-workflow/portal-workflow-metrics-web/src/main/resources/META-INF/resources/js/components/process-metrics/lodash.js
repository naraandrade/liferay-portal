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

import {
	cloneDeep,
	constant,
	defaults,
	each,
	filter,
	find,
	flatten,
	forEach,
	forIn,
	has,
	isUndefined,
	last,
	map,
	mapValues,
	max,
	merge,
	min,
	minBy,
	now,
	pick,
	range,
	reduce,
	sortBy,
	uniqueId,
	values,
	zipObject,
} from 'lodash';

var lodash;

if (typeof require === 'function') {
	try {
		lodash = {
			cloneDeep,
			constant,
			defaults,
			each,
			filter,
			find,
			flatten,
			forEach,
			forIn,
			has,
			isUndefined,
			last,
			map,
			mapValues,
			max,
			merge,
			min,
			minBy,
			now,
			pick,
			range,
			reduce,
			sortBy,
			uniqueId,
			values,
			zipObject,
		};
	} catch (event) {
		// continue regardless of error
	}
}

if (!lodash) {
	lodash = window._;
}

export default lodash;
