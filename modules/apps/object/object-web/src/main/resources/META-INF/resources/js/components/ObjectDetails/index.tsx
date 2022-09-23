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
import {Input, InputLocalized} from '@liferay/object-js-components-web';
import React from 'react';

import Sheet from './Sheet';

import './index.scss';
import {useObjectDetailsForm} from './useObjectDetailsForm';

interface IObjectDefinition extends ObjectDefinition {
	objectDefinitionId: number;
}

interface IProps {
	dbTableName: string;
	label: LocalizedValue<string>;
	objectDefinition: IObjectDefinition;
	pluralLabel: LocalizedValue<string>;
	shortName: string;
}

export default function ObjectDetails({
	label,
	objectDefinition,
	pluralLabel,
	shortName,
}: IProps) {
	console.log('objectDefinition', objectDefinition);

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
					displayTitle={Liferay.Language.get('object-data')}
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
							label={Liferay.Language.get('table-name')}
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
					<ClayPanel.Body>Content</ClayPanel.Body>
				</ClayPanel>

				<ClayPanel
					collapsable
					displayTitle={Liferay.Language.get('scope')}
					displayType="unstyled"
				>
					<ClayPanel.Body>Content</ClayPanel.Body>
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
