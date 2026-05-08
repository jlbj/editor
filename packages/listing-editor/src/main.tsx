import React from 'react';
import { createRoot } from 'react-dom/client';
import { ListingEditor } from './ListingEditor';
import './index.css';

class ListingEditorElement extends HTMLElement {
  private root: ReturnType<typeof createRoot> | null = null;

  static get observedAttributes() {
    return ['property-id', 'api-url', 'anon-key'];
  }

  attributeChangedCallback(_name: string, oldValue: string, newValue: string) {
    if (oldValue !== newValue && this.root) {
      this.render();
    }
  }

  connectedCallback() {
    this.render();
  }

  disconnectedCallback() {
    this.root?.unmount();
    this.root = null;
  }

  private render() {
    const propertyId = this.getAttribute('property-id');
    const apiUrl = this.getAttribute('api-url');
    const anonKey = this.getAttribute('anon-key');

    if (!propertyId || !apiUrl || !anonKey) {
      this.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:center;height:100vh;color:#dc2626;">
          <div style="text-align:center;">
            <div style="font-size:24px;margin-bottom:8px;">⚠️</div>
            <div>Missing required attributes: property-id, api-url, anon-key</div>
          </div>
        </div>
      `;
      return;
    }

    if (!this.root) {
      this.innerHTML = '';
      const container = document.createElement('div');
      this.appendChild(container);
      this.root = createRoot(container);
    }

    this.root.render(
      React.createElement(ListingEditor, {
        propertyId,
        apiUrl,
        anonKey,
      })
    );
  }
}

if (!customElements.get('listing-editor')) {
  customElements.define('listing-editor', ListingEditorElement);
}

export { ListingEditorElement };