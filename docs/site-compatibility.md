# Site compatibility register

## Current release: 0.1.0

No site-specific integrations have been implemented or verified. Users can manually label records with a site name; that does not mean that site endorses this project or has been tested for automatic data access.

## When a site belongs here

Add a site when there is a real, documented feature specific to that site: for example a CSV import adapter or a tested game-title reader. A name/domain mapping by itself should be described as a label shortcut, not comprehensive support.

For each entry, record:

- Site name and canonical HTTPS URL.
- Exact supported feature and its limitations.
- Extension version and browser version tested.
- Test date and reproducible steps.
- A link to the feature's code and its usage guide.
- Status: experimental, tested, or currently broken.
- Any ownership, sponsorship, or affiliate relationship.

Only create a working link after verifying the destination. Link text should be the site's name. Links document compatibility; they do not imply a recommendation, affiliation, or operator endorsement.

## Entry template

Copy this only after implementing and testing a real integration:

```text
Site: <site name>
Canonical URL: <verified HTTPS address>
Feature: <precise behavior>
Status: <experimental / tested / broken>
Extension version: <version>
Browser and version: <browser>
Test date: <YYYY-MM-DD>
Code: <relative source path>
Guide: <relative documentation path>
Limitations: <known gaps>
Relationship: <independent / owned by maintainer / sponsored, with details>
```

Use "Tested integrations" for technical compatibility. Use "Sponsors" only for actual sponsors who have agreed to be listed. Proposed sites should be discussed as requests until the functionality exists.
