/**
 * Copyright (c) 2000-present Liferay, Inc. All rights reserved.
 *
 * This library is free software; you can redistribute it and/or modify it under
 * the terms of the GNU Lesser General Public License as published by the Free
 * Software Foundation; either version 2.1 of the License, or (at your option)
 * any later version.
 *
 * This library is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more
 * details.
 */

import {
	FormError,
	invalidateRequired,
	useForm,
} from '@liferay/object-js-components-web';

interface IUseObjectDetailsForm {
	initialValues: ObjectDefinition;
	onSubmit: (field: ObjectDefinition) => void;
}

export type ObjectDetailsErrors = FormError<Partial<ObjectDefinition>>;

const defaultLanguageId = Liferay.ThemeDisplay.getDefaultLanguageId();
const REQUIRED_MSG = Liferay.Language.get('required');

export function useObjectDetailsForm({
	initialValues,
	onSubmit,
}: IUseObjectDetailsForm) {
	const validate = (objectDefinition: Partial<ObjectDefinition>) => {
		const errors: ObjectDetailsErrors = {};

		const label = objectDefinition.label?.[defaultLanguageId];

		if (invalidateRequired(label)) {
			errors.label = REQUIRED_MSG;
		}

		return errors;
	};

	const {errors, handleChange, handleSubmit, setValues, values} = useForm<
		ObjectDefinition
	>({
		initialValues,
		onSubmit,
		validate,
	});

	return {errors, handleChange, handleSubmit, setValues, values};
}
