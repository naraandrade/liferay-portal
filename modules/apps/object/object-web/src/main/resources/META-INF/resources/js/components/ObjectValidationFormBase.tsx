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

import ClayForm, {ClayInput, ClayToggle} from '@clayui/form';
import React, {ReactNode} from 'react';

import CustomSelect from './Form/CustomSelect/CustomSelect';

export default function ObjectValidationFormBase({
	activeValidation,
	children,
	objectValidationTypes,
	setActiveValidation,
}: IProps) {
	return (
		<>
			<CustomSelect<ObjectValidationType>
				disabled={true}
				label={Liferay.Language.get('type')}
				options={objectValidationTypes}
				value="Groovy"
			/>

			<ClayForm.Group>
				<label htmlFor="description">
					{Liferay.Language.get('description')}
				</label>

				<ClayInput component="textarea" id="description" type="text" />
			</ClayForm.Group>

			{children}
			<ClayToggle
				label={Liferay.Language.get('active-validation')}
				name="required"
				onToggle={(active) => setActiveValidation(active)}
				toggled={activeValidation}
			/>
		</>
	);
}

// export function useObjectFieldForm({
// 	initialValues,
// 	onSubmit,
// }: IUseObjectFieldForm) {
// 	const validate = (field: Partial<ObjectField>) => {
// 		const label = field.label?.[defaultLanguageId];

// 		const settings: {
// 			[key in ObjectFieldSettingName]?: string | number | boolean;
// 		} = {};

// 		field.objectFieldSettings?.forEach(({name, value}) => {
// 			settings[name] = value;
// 		});

// 		if (invalidateRequired(label)) {
// 			errors.label = REQUIRED_MSG;
// 		}

// 		if (invalidateRequired(field.name ?? label)) {
// 			errors.name = REQUIRED_MSG;
// 		}

// 		if (!field.businessType) {
// 			errors.businessType = REQUIRED_MSG;
// 		} else if (field.businessType === 'Attachment') {
// 			if (
// 				invalidateRequired(
// 					settings.acceptedFileExtensions as string | undefined
// 				)
// 			) {
// 				errors.acceptedFileExtensions = REQUIRED_MSG;
// 			}
// 			if (!settings.fileSource) {
// 				errors.fileSource = REQUIRED_MSG;
// 			}
// 			if (!settings.maximumFileSize) {
// 				errors.maximumFileSize = REQUIRED_MSG;
// 			} else if (settings.maximumFileSize < 0) {
// 				errors.maximumFileSize = Liferay.Util.sub(
// 					Liferay.Language.get(
// 						'only-integers-greater-than-or-equal-to-x-are-allowed'
// 					),
// 					0
// 				);
// 			}
// 		} else if (
// 			field.businessType === 'Text' ||
// 			field.businessType === 'LongText'
// 		) {
// 			if (settings.showCounter && !settings.maxLength) {
// 				errors.maxLength = REQUIRED_MSG;
// 			}
// 		} else if (field.businessType === 'Picklist') {
// 			if (!field.listTypeDefinitionId) {
// 				errors.listTypeDefinitionId = REQUIRED_MSG;
// 			}
// 		}

// 		return errors;
// 	};

// 	const {errors, handleChange, handleSubmit, setValues, values} = useForm<
// 		ObjectField,
// 		{[key in ObjectFieldSettingName]: any}
// 	>({
// 		initialValues,
// 		onSubmit,
// 		validate,
// 	});

// 	return {errors, handleChange, handleSubmit, setValues, values};
// }

// interface IUseObjectFieldForm {
// 	initialValues: Partial<ObjectField>;
// 	onSubmit: (field: ObjectField) => void;
// }

interface IProps {
	activeValidation: boolean;
	children?: ReactNode;
	objectValidationTypes: ObjectValidationType[];
	setActiveValidation: (active: boolean) => void;
}
