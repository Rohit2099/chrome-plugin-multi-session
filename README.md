# Objective

Optimize time spent testing Fiori direct access URLs with multiple user IDs. Currently, testing GCP URLs across multiple users in the same browser takes considerable time due to repeated logins and logouts.

# Solution

A Chrome extension is required to create new sessions in Chrome while sharing SAP cookies. Some existing Chrome extensions offer partial functionality but don’t fully meet our needs.  
Here are a few existing solutions:

-   [Managing Browsing Sessions in Chrome](https://www.makeuseof.com/tag/manage-browsing-sessions-google-chrome/)
-   [Multi-Account Containers (Firefox)](https://addons.mozilla.org/en-US/firefox/addon/multi-account-containers/?src=search)
-   [Temporary Containers (Firefox)](https://addons.mozilla.org/en-US/firefox/addon/temporary-containers/?src=search)

# Requirements

The Chrome extension should include the following functionalities:

-   **Quick option to create a new session or duplicate tab.**
-   **Chrome tab context menu** should offer:
    -   Create New Session
    -   Duplicate Tab in a New Session
-   **Cookie management:**
    -   Clear cookies when the last tab of a session is closed.
-   **Customization options:**
    -   Number each session.
    -   Assign a unique color to each session, ideally with a colored window for visual distinction.
    -   Option to share SAP cookies across sessions.

### Relevant GCP Cookies

-   `___.cloud.sap`
-   `_.hana.ondemand.com`
-   `_.ariba.com`
-   `_.successfactors.*`
-   `_.internal.sde.cloud.sap`
-   `_.fgvms.com`
-   `_.concursolutions.com`
-   `_.s4hana.ondemand.com`

# Design

### Menu Options

-   **New Session (Duplicate)**
-   **New Session (Global)**
    -   Clear All Cookies
    -   Clear GCP Cookies

### Chrome Extension Name

**UX Multi Session**
