# Zeno Life Medicare — Firebase + GitHub Pages

## Upload
This package is intentionally FLAT. Upload all files to the root of your GitHub repository:
- index.html
- customer.html
- customer.js
- dashboard.html
- dashboard.js
- firebase.js
- style.css
- firestore.rules

Then enable GitHub Pages from Settings → Pages → Deploy from branch → main → /(root).

## Firebase
1. Authentication → Sign-in method → Email/Password → Enable.
2. Create the Admin user in Firebase Authentication.
3. The Admin user's UID must be:
   s1qDKY8MuXN4pgi5k69WxSxLUkW2
4. Firestore → create database.
5. Create collection `admins`.
6. Document ID = the Admin UID above.
7. Fields:
   role: "admin"
   status: "active"
8. Publish the included `firestore.rules`.

## Customer accounts
The Admin dashboard creates Firebase Auth customer accounts using an internal synthetic email based on Customer ID. Customers only type their Customer ID and password on the website.

## Important
- Firebase Web API keys are identifiers, not passwords. Never put a Firebase Admin SDK service-account JSON into GitHub.
- The Admin login in this package uses the Firebase Admin account email + password. The UID is checked server-side by Firestore Rules and client-side before opening the dashboard.
- A separate website access password cannot be made securely with only frontend JavaScript. If you require a secret site gate, use Firebase App Check / a backend or another server-side mechanism.
- Firestore reads are document-level, so private values are kept in `medicinesPrivate` and public customer fields in `medicinesPublic`.
- P. Rate, GST and transport are admin-only.
