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
import React, {useContext} from 'react';

import {ModalContext} from '../../ModalProvider.es';

const BulkTransitionModal = () => {
	const {bulkTransition, setBulkTransition} = useContext(ModalContext);

	const {observer, onClose} = useModal({
		onClose: () => {
			setBulkTransition({selectedTasks: [], visible: false});
		}
	});

	const {visible} = bulkTransition;

	return (
		<>
			{visible && (
				<ClayModal
					data-testid="bulkReassignModal"
					observer={observer}
					size="lg"
				>
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
								<ClayButton
									className="mr-3"
									data-testid="previousButton"
									displayType="secondary"
								>
									{Liferay.Language.get('previous')}
								</ClayButton>

								<ClayButton data-testid="nextButton"></ClayButton>
							</>
						}
					/>
				</ClayModal>
			)}
		</>
	);
};

export default BulkTransitionModal;
