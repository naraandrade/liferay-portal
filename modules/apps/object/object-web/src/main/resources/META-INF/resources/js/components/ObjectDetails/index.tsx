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

import {ClayToggle} from '@clayui/form';
import ClayPanel from '@clayui/panel';
import {
	Input,
	InputLocalized,
	SingleSelect,
} from '@liferay/object-js-components-web';
import React, {useMemo} from 'react';

import {defaultLanguageId} from '../../utils/constants';

import './index.scss';
import Sheet from './Sheet';
import {useObjectDetailsForm} from './useObjectDetailsForm';

interface IObjectDefinition extends ObjectDefinition {
	objectDefinitionId: number;
}

interface IObjectField extends ObjectField {
	objectFieldId: number;
}

interface IProps {
	accountEntryRelationshipObjectFields: ObjectField[];
	dbTableName: string;
	label: LocalizedValue<string>;
	nonRelationshipObjectFieldsInfo: {
		label: LocalizedValue<string>;
		name: string;
	}[];
	objectDefinition: IObjectDefinition;
	objectFields: IObjectField[];
	pluralLabel: LocalizedValue<string>;
	shortName: string;
}

export default function ObjectDetails({
	accountEntryRelationshipObjectFields,
	label,
	nonRelationshipObjectFieldsInfo,
	objectDefinition,
	objectFields,
	pluralLabel,
	shortName,
}: IProps) {
	console.log('objectDefinition', objectDefinition);

	objectFields = objectFields.map((objectField) => {
		return {...objectField, id: objectField.objectFieldId};
	});

	const titleFieldOptions = useMemo(() => {
		return nonRelationshipObjectFieldsInfo.map(({label, name}) => {
			return {label: label[defaultLanguageId] ?? '', name};
		});
	}, [nonRelationshipObjectFieldsInfo]);

	const {errors, handleChange, setValues, values} = useObjectDetailsForm({
		initialValues: {
			...objectDefinition,
			id: objectDefinition.objectDefinitionId,
			label,
			name: shortName,
			pluralLabel,
		},
		onSubmit: () => {},
	});

	return (
		<div className="lfr-objects__object-definition-details">
			<Sheet title={Liferay.Language.get('basic-information')}>
				<ClayPanel
					displayTitle={Liferay.Language.get(
						'object-definition-data'
					)}
					displayType="unstyled"
				>
					<ClayPanel.Body>
						<Input
							error={errors.name}
							label={Liferay.Language.get('object-id')}
							name="object-id"
							onChange={handleChange}
							required
							value={values.id}
						/>

						<Input
							error={errors.name}
							label={Liferay.Language.get('name')}
							name="name"
							onChange={handleChange}
							required
							value={values.name}
						/>

						<InputLocalized
							error={errors.label}
							label={Liferay.Language.get('label')}
							onChange={(label) => setValues({label})}
							required
							translations={
								values.label as LocalizedValue<string>
							}
						/>

						<InputLocalized
							error={errors.pluralLabel}
							label={Liferay.Language.get('plural-label')}
							onChange={(pluralLabel) => setValues({pluralLabel})}
							required
							translations={
								values.pluralLabel as LocalizedValue<string>
							}
						/>

						<Input
							error={errors.name}
							label={Liferay.Language.get(
								'object-definition-table-name'
							)}
							name="name"
							onChange={handleChange}
							required
							value={values.DBTableName}
						/>

						<ClayToggle
							label={Liferay.Language.get('active')}
							name="active"
							onToggle={(active) => setValues({active})}
							toggled={values.active}
						/>
					</ClayPanel.Body>
				</ClayPanel>

				<ClayPanel
					collapsable
					displayTitle={Liferay.Language.get('entry-display')}
					displayType="unstyled"
				>
					<ClayPanel.Body>
						<SingleSelect<{label: string; name: string}>
							error={errors.titleObjectFieldId}
							label={Liferay.Language.get(
								'title-object-field-id'
							)}
							onChange={(target: {
								label: string;
								name: string;
							}) => {
								const field = objectFields.find(
									({name}) => name === target.name
								);

								setValues({
									titleObjectFieldId: field?.id,
								});
							}}
							options={titleFieldOptions}
							value={
								objectFields.find(
									({id}) => id === values.titleObjectFieldId
								)?.label[defaultLanguageId]
							}
						/>
					</ClayPanel.Body>
				</ClayPanel>

				<ClayPanel
					collapsable
					displayTitle={Liferay.Language.get('scope')}
					displayType="unstyled"
				>
					<ClayPanel.Body>
						<SingleSelect<{label: string; name: string}>
							error={errors.titleObjectFieldId}
							label={Liferay.Language.get('scope')}
							onChange={(target: {
								label: string;
								name: string;
							}) => {
								const field = objectFields.find(
									({name}) => name === target.name
								);

								setValues({
									titleObjectFieldId: field?.id,
								});
							}}
							options={titleFieldOptions}
							value={values.scope}
						/>

						<SingleSelect<{label: string; name: string}>
							error={errors.titleObjectFieldId}
							label={Liferay.Language.get('panelCategoryKey')}
							onChange={(target: {
								label: string;
								name: string;
							}) => {
								const field = objectFields.find(
									({name}) => name === target.name
								);

								setValues({
									titleObjectFieldId: field?.id,
								});
							}}
							options={titleFieldOptions}
							value={values.panelCategoryKey}
						/>
					</ClayPanel.Body>
				</ClayPanel>

				<ClayPanel
					collapsable
					displayTitle={Liferay.Language.get('account-restriction')}
					displayType="unstyled"
				>
					<ClayPanel.Body>Content</ClayPanel.Body>
				</ClayPanel>

				<ClayPanel
					collapsable
					displayTitle={Liferay.Language.get('display')}
					displayType="unstyled"
				>
					<ClayPanel.Body>Content</ClayPanel.Body>
				</ClayPanel>
			</Sheet>
		</div>
	);
}
