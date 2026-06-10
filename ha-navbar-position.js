class NavbarPosition {
  constructor() {
    this.applyChangesTimeout = null;
    this.dashboardPositions = null;
    this.dashboardPositionOwner = null;
    this.lastAppHeader = null;
    this.lastContentContainer = null;
  }

  start() {
    this.refresh();
  }

  refresh() {
    const positions = this.getConfiguredPositions();

    this.stopReschedule();

    try {
      this.applyNavbarPositionChanges(positions.verticalPosition, positions.horizontalPosition);
      this.applyPaddingChanges(positions.verticalPosition);
    } catch (e) {
      console.error('ERROR while applying navbar changes:', e);
    } finally {
      if (this.shouldContinueApplyingChanges(positions)) {
        this.applyChangesTimeout = setTimeout(() => this.refresh(), 1000);
      }
    }
  }

  stopReschedule() {
    if (this.applyChangesTimeout !== null) {
      clearTimeout(this.applyChangesTimeout);
      this.applyChangesTimeout = null;
    }
  }

  shouldContinueApplyingChanges(positions) {
    return positions.verticalPosition === 'bottom' || positions.horizontalPosition !== null;
  }

  get queryParams() {
    return new URLSearchParams(window.location.search);
  }

  getConfiguredPositions() {
    const dashboardPositions = this.getDashboardPositions();

    return {
      verticalPosition: dashboardPositions?.verticalPosition ?? this.getVerticalPosition(),
      horizontalPosition: dashboardPositions?.horizontalPosition ?? null
    };
  }

  getDashboardPositions() {
    return this.dashboardPositions;
  }

  getVerticalPosition() {
    return this.normalizeVerticalPosition(this.queryParams.get('navbar')) || 'top';
  }

  setDashboardPositions(owner, { verticalPosition, horizontalPosition }) {
    const dashboardPositions = {};

    if (verticalPosition !== undefined) {
      const normalizedVerticalPosition = this.normalizeVerticalPosition(verticalPosition);

      if (normalizedVerticalPosition !== null) {
        dashboardPositions.verticalPosition = normalizedVerticalPosition;
      }
    }

    if (horizontalPosition !== undefined) {
      const normalizedHorizontalPosition = this.normalizeHorizontalPosition(horizontalPosition);

      if (normalizedHorizontalPosition !== null) {
        dashboardPositions.horizontalPosition = normalizedHorizontalPosition;
      }
    }

    this.dashboardPositions = dashboardPositions;
    this.dashboardPositionOwner = owner;
    this.refresh();
  }

  clearDashboardPositions(owner) {
    if (owner && this.dashboardPositionOwner !== owner) {
      return;
    }

    if (this.dashboardPositions === null) {
      return;
    }

    this.dashboardPositions = null;
    this.dashboardPositionOwner = null;
    this.refresh();
  }

  toggleVerticalPosition(owner) {
    this.setDashboardPositions(owner, {
      verticalPosition: this.getConfiguredPositions().verticalPosition === 'bottom' ? 'top' : 'bottom'
    });
  }

  normalizeVerticalPosition(value) {
    const normalizedValue = value?.toLowerCase();

    if (normalizedValue === 'bottom' || normalizedValue === 'top') {
      return normalizedValue;
    }

    return null;
  }

  normalizeHorizontalPosition(value) {
    const normalizedValue = value?.toLowerCase();

    if (normalizedValue === 'left' || normalizedValue === 'center' || normalizedValue === 'right') {
      return normalizedValue;
    }

    return null;
  }

  get huiRootElement() {
    return document
      .querySelector("home-assistant")?.shadowRoot
      ?.querySelector("home-assistant-main")?.shadowRoot
      ?.querySelector("ha-panel-lovelace")?.shadowRoot
      ?.querySelector("hui-root")?.shadowRoot;
  }

  applyNavbarPositionChanges(verticalPosition, horizontalPosition) {
    let appHeader = this.huiRootElement?.querySelector(".header");

    if (this.lastAppHeader && this.lastAppHeader !== appHeader) {
      this.resetNavbarPositionChanges(this.lastAppHeader);
    }

    if (!appHeader) {
      this.lastAppHeader = null;
      return;
    }

    if (verticalPosition === 'bottom') {
      if (appHeader.style.top !== 'auto' || appHeader.style.bottom !== '0px') {
        appHeader.style.setProperty('top', 'auto', 'important');
        appHeader.style.setProperty('bottom', '0px', 'important');
      }
    } else {
      appHeader.style.removeProperty('top');
      appHeader.style.removeProperty('bottom');
    }

    this.applyHorizontalPositionChanges(appHeader, horizontalPosition);
    this.lastAppHeader = appHeader;
  }

  resetNavbarPositionChanges(appHeader) {
    appHeader.style.removeProperty('top');
    appHeader.style.removeProperty('bottom');
    appHeader.style.removeProperty('left');
    appHeader.style.removeProperty('right');
    appHeader.style.removeProperty('transform');
    appHeader.style.removeProperty('width');
    appHeader.style.removeProperty('max-width');
  }

  applyHorizontalPositionChanges(appHeader, horizontalPosition) {
    if (horizontalPosition === 'left') {
      appHeader.style.setProperty('left', 'env(safe-area-inset-left)', 'important');
      appHeader.style.setProperty('right', 'auto', 'important');
      appHeader.style.setProperty('transform', 'none', 'important');
      appHeader.style.setProperty('width', 'fit-content', 'important');
      appHeader.style.setProperty('max-width', '100%', 'important');
      return;
    }

    if (horizontalPosition === 'center') {
      appHeader.style.setProperty('left', '50%', 'important');
      appHeader.style.setProperty('right', 'auto', 'important');
      appHeader.style.setProperty('transform', 'translateX(-50%)', 'important');
      appHeader.style.setProperty('width', 'fit-content', 'important');
      appHeader.style.setProperty('max-width', '100%', 'important');
      return;
    }

    if (horizontalPosition === 'right') {
      appHeader.style.setProperty('left', 'auto', 'important');
      appHeader.style.setProperty('right', 'env(safe-area-inset-right)', 'important');
      appHeader.style.setProperty('transform', 'none', 'important');
      appHeader.style.setProperty('width', 'fit-content', 'important');
      appHeader.style.setProperty('max-width', '100%', 'important');
      return;
    }

    appHeader.style.removeProperty('left');
    appHeader.style.removeProperty('right');
    appHeader.style.removeProperty('transform');
    appHeader.style.removeProperty('width');
    appHeader.style.removeProperty('max-width');
  }

  applyPaddingChanges(verticalPosition) {
    let contentContainer = this.huiRootElement?.querySelector("#view");

    const topPadding = 'env(safe-area-inset-top)';
    const bottomPadding = 'calc(var(--header-height) + env(safe-area-inset-bottom))';

    if (this.lastContentContainer && this.lastContentContainer !== contentContainer) {
      this.resetPaddingChanges(this.lastContentContainer);
    }

    if (!contentContainer) {
      this.lastContentContainer = null;
      return;
    }

    if (verticalPosition === 'bottom') {
      if (contentContainer.style.paddingTop !== topPadding || contentContainer.style.paddingBottom !== bottomPadding) {
        contentContainer.style.setProperty('padding-top', 'env(safe-area-inset-top)');
        contentContainer.style.setProperty('padding-bottom', 'calc(var(--header-height) + env(safe-area-inset-bottom))');
      }

      this.lastContentContainer = contentContainer;

      return;
    }

    this.resetPaddingChanges(contentContainer);
    this.lastContentContainer = contentContainer;
  }

  resetPaddingChanges(contentContainer) {
    contentContainer.style.removeProperty('padding-top');
    contentContainer.style.removeProperty('padding-bottom');
  }
}

window.navbarPosition = new NavbarPosition();
window.navbarPosition.start();

// This is the quickest, hackiest thing I could throw together to allow the
// navbar to be moved on devices that don't readily allow inputting a custom
// URL (like the HA mobile apps). It really ought to be redone to actually
// look halfway decent.
class NavbarPositionConfigurationCard extends HTMLElement {
  set hass(hass) {
    this._hass = hass;
    this.render();
    this.applyConfiguredPositions();
  }

  setConfig(config) {
    this.config = config || {};
    this.configuredPositionsApplied = false;
    this.render();

    if (!this.hasConfiguredPositions()) {
      window.navbarPosition?.clearDashboardPositions(this);
    }
  }

  disconnectedCallback() {
    this.configuredPositionsApplied = false;
    window.navbarPosition?.clearDashboardPositions(this);
  }

  render() {
    if (this.isHidden()) {
      this.innerHTML = '';
      this.button = null;
      this.content = null;
      this.style.display = 'none';
      return;
    }

    this.style.display = '';

    if (!this.content) {
      this.innerHTML = `
        <ha-card>
          <div class="card-content">
            <button type="button"></button>
          </div>
        </ha-card>
      `;

      this.content = this.querySelector('ha-card');
      this.button = this.querySelector('button');
      this.button.addEventListener('click', () => this.handleButtonClick());
    }

    this.button.textContent = this.hasConfiguredPositions()
      ? 'Apply navigation bar position'
      : 'Toggle navigation bar position';
  }

  handleButtonClick() {
    if (this.hasConfiguredPositions()) {
      window.navbarPosition?.setDashboardPositions(this, this.getConfiguredPositionPayload());

      return;
    }

    window.navbarPosition?.toggleVerticalPosition(this);
  }

  applyConfiguredPositions() {
    if (this.configuredPositionsApplied || !this.hasConfiguredPositions()) {
      return;
    }

    window.navbarPosition?.setDashboardPositions(this, this.getConfiguredPositionPayload());

    this.configuredPositionsApplied = true;
  }

  hasConfiguredPositions() {
    return Object.keys(this.getConfiguredPositionPayload()).length > 0;
  }

  getConfiguredPositionPayload() {
    const positions = {};
    const verticalPosition = this.getVerticalPosition();
    const horizontalPosition = this.getHorizontalPosition();

    if (verticalPosition !== null) {
      positions.verticalPosition = verticalPosition;
    }

    if (horizontalPosition !== null) {
      positions.horizontalPosition = horizontalPosition;
    }

    return positions;
  }

  getVerticalPosition() {
    return window.navbarPosition?.normalizeVerticalPosition(this.config?.['vertical-position']) || null;
  }

  getHorizontalPosition() {
    return window.navbarPosition?.normalizeHorizontalPosition(this.config?.['horizontal-position']) || null;
  }

  isHidden() {
    const hiddenValue = this.config?.hidden;

    if (typeof hiddenValue === 'boolean') {
      return hiddenValue;
    }

    return ['yes', 'true'].includes(hiddenValue?.toString().toLowerCase());
  }

  getCardSize() {
    return this.isHidden() ? 0 : 1;
  }
}

customElements.define('navbar-position-configuration-card', NavbarPositionConfigurationCard);
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'navbar-position-configuration-card',
  name: 'Navbar Position Configuration Card',
  description: 'A simple card that allows toggling where the dashboard navigation bar is shown'
});
