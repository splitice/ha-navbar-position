# Navbar Position

A Home Assistant frontend plugin that allows the navigation bar to be moved to the bottom of the screen. 

# Note: This repo has been updated to work with HA versions > 2023.04, it will not work on anything lower, please keep this in mind if you open an issue and are using an older version. 

![screenshot](images/screenshot.png)

# Installation

Install via HACS by searching for "Navbar Position".

Or install manually by dropping `ha-navbar-position.js` into your Lovelace dashboard resources.

# Usage

## Via the URL

The primary way this plugin is activated is by adding `navbar=bottom` to the dashboard URL, like so:

```
http://<hass>:8123/some-dashboard/some-view?navbar=bottom
```

The navigation bar will be moved to the bottom of the screen until the next page refresh.

There will likely be additional ways to configure this plugin in the future - pull requests gladly accepted.

## Via custom card

For scenarios where it isn't possible to edit the URL directly (e.g. when using the Home Assistant mobile apps), you can use the `Navbar Position Configuration Card` custom card.

Add it to a dashboard of your choosing, then click the card's "toggle navigation bar position" button to switch between the default top position and a temporary bottom position for the current page.

The card also supports a few optional configuration values:

```yaml
type: custom:navbar-position-configuration-card
hidden: yes
vertical-position: bottom
horizontal-position: center
```

- `hidden: yes` applies the configured position without rendering a card or button.
- `vertical-position` accepts `top` or `bottom`.
- `horizontal-position` accepts `left`, `center`, or `right`.

If either `vertical-position` or `horizontal-position` is provided, the card applies that configuration as soon as the page loads and resets back to the default top/left layout when you navigate to a page that does not include the card. These configured positions are temporary and are not persisted. If neither is provided, the card behaves like a temporary toggle button for the current page.

# Limitations

The page is scanned every second to see if the header has appeared or has been replaced. This means that while switching between views within a single dashboard leaves the navbar at the bottom, **switching between dashboards or other pages in the Home Assistant UI will cause the navbar to jump back to the top for ~1 second when you return to a dashboard.** PRs gladly accepted to sprinkle some more `MutationObserver`s around to get rid of that delay.

This also only moves the dashboard navigation bar; it doesn't move navigation bars associated with any other screens. PRs welcome to handle that as well.

