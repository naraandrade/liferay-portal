import React from 'react';
import ReactDOM from 'react-dom';

import GetAppModal from './GetAppModal';

class WebComponent extends HTMLElement {
	connectedCallback() {
		ReactDOM.render(
			<React.StrictMode>
				<GetAppModal appId={Number(this.getAttribute('appId')) || 0} />
			</React.StrictMode>,
			this
		);
	}
}
const ELEMENT_ID = 'modal-root';

if (!customElements.get(ELEMENT_ID)) {
	customElements.define(ELEMENT_ID, WebComponent);
}
