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

import ClayForm from '@clayui/form';
import React, {useState} from 'react';

import Editor from '../Editor/Editor';
import InputLocalized from '../Form/InputLocalized/InputLocalized';
import Select from '../Form/Select';
import ObjectValidationFormBase from '../ObjectValidationFormBase';

function BasicInfo({defaultLocale, disabled, label, locales}: IBasicInfo) {
	const [activeValidation, setActiveValidation] = useState<boolean>(false);
	const [values, setValues] = useState({label: {}});
	const [locale, setSelectedLocale] = useState(
		defaultLocale as {
			label: string;
			symbol: string;
		}
	);

	return (
		<ClayForm className="lfr-objects__edit-object-field">
			<div className="sheet">
				<h2 className="sheet-title">{label}</h2>

				<InputLocalized
					disabled={disabled}
					label={Liferay.Language.get('label')}
					locales={locales}
					onSelectedLocaleChange={setSelectedLocale}
					onTranslationsChange={(label) => setValues({label})}
					required
					selectedLocale={locale}
					translations={values.label as LocalizedValue<string>}
				/>

				<ObjectValidationFormBase
					activeValidation={activeValidation}
					objectValidationTypes={[
						{
							label: 'Groovy',
						},
					]}
					setActiveValidation={setActiveValidation}
				/>
			</div>

			<TriggerEventContainer
				eventTypes={[Liferay.Language.get('on-submission')]}
			/>
		</ClayForm>
	);
}

function Conditions({content, defaultLocale, disabled, locales}: IConditions) {
	const defaultContent = `<#-- Insert a Groovy Script to define your validation. -->`;

	const [values, setValues] = useState({message: {}});

	const [locale, setSelectedLocale] = useState(
		defaultLocale as {
			label: string;
			symbol: string;
		}
	);

	return (
		<ClayForm className="lfr-objects__groovy-field">
			<div className="sheet">
				<h2 className="sheet-title">
					{Liferay.Language.get('groovy')}
				</h2>

				<Editor content={content || defaultContent} />
			</div>

			<div className="mt-4 sheet">
				<h2 className="sheet-title">
					{Liferay.Language.get('error-message')}
				</h2>

				<InputLocalized
					disabled={disabled}
					label={Liferay.Language.get('message')}
					locales={locales}
					onSelectedLocaleChange={setSelectedLocale}
					onTranslationsChange={(message) => setValues({message})}
					required
					selectedLocale={locale}
					translations={values.message as LocalizedValue<string>}
				/>
			</div>
		</ClayForm>
	);
}

function TriggerEventContainer({eventTypes}: ITriggerEventProps) {
	return (
		<div className="mt-4 sheet">
			<h2 className="sheet-title">
				{Liferay.Language.get('trigger-event')}
			</h2>

			<Select
				label={Liferay.Language.get('event')}
				options={eventTypes}
			/>
		</div>
	);
}

interface ITriggerEventProps {
	eventTypes: string[];
}

interface IBasicInfo {
	defaultLocale: {label: string; symbol: string};
	disabled: boolean;
	label: string;
	locales: Array<any>;
}

interface IConditions {
	content: string;
	defaultLocale: {label: string; symbol: string};
	disabled: boolean;
	locales: Array<any>;
}

export {BasicInfo, Conditions};
