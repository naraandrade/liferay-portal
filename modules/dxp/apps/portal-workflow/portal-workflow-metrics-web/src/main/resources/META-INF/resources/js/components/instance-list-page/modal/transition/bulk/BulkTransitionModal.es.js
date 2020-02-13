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

import ClayButton from '@clayui/button';
import ClayModal, {useModal} from '@clayui/modal';
import React, {useCallback, useContext, useMemo, useState} from 'react';

import StepOfBar from '../../../../../shared/components/step-bar/StepBar.es';
import {ModalContext} from '../../ModalProvider.es';
import {SelectTasksStep} from '../../shared/select-tasks-step/SelectTasksStep.es';

const BulkTransitionModal = () => {
	const {
		processId,
		selectTasks: {selectAll, tasks},
		setSelectTasks,
		setVisibleModal,
		visibleModal
	} = useContext(ModalContext);
	const [currentStep, setCurrentStep] = useState('selectTasks');

	const {observer, onClose} = useModal({
		onClose: () => {
			setSelectTasks({selectAll: false, tasks: []});
			setVisibleModal('');
		}
	});

	const [fetching, setFetching] = useState(false);
	const handleNext = useCallback(() => {
		console.log('next step');
	}, []);

	const getStep = useCallback(
		step => {
			const steps = {
				selectTasks: {
					component: SelectTasksStep,
					nextBtn: {
						disabled: tasks.length === 0 || fetching,
						handle: handleNext,
						text: Liferay.Language.get('next')
					},
					order: 1,
					previousBtn: false,
					subtitle: Liferay.Language.get('select-steps'),
					title: Liferay.Language.get('select-steps-to-transition')
				}
			};

			return steps[step];
		},
		[fetching, handleNext, tasks.length]
	);

	const step = useMemo(() => getStep(currentStep), [currentStep, getStep]);

	return (
		<>
			{visibleModal === 'bulkTransition' && (
				<ClayModal
					data-testid="bulkTransitionModal"
					observer={observer}
					size="lg"
				>
					<ClayModal.Header>{step.title}</ClayModal.Header>

					<StepOfBar
						current={step.order}
						title={step.subtitle}
						total={2}
					/>

					<step.component
						processId={processId}
						setErrorToast={() => {}}
					/>

					<ClayModal.Footer
						first={
							<ClayButton
								data-testid="cancelButton"
								displayType="secondary"
								onClick={onClose}
							>
								{Liferay.Language.get('cancel')}
							</ClayButton>
						}
						last={
							<>
								{step.previousBtn && (
									<ClayButton
										className="mr-3"
										data-testid="previousButton"
										displayType="secondary"
									>
										{Liferay.Language.get('previous')}
									</ClayButton>
								)}

								<ClayButton data-testid="nextButton">
									{Liferay.Language.get('next')}
								</ClayButton>
							</>
						}
					/>
				</ClayModal>
			)}
		</>
	);
};

export default BulkTransitionModal;
