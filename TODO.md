# TODO - Fix student login/search

## Step 1: Inspect backend login/search implementation
- [x] Read backend login route and student matching functions
- [x] Confirm CSV path is correct (server/students.csv)

## Step 2: Implement robust student ID/email matching
- [ ] Add console logs (entered email/legacyId, total students loaded, matched result)
- [ ] Ensure case-insensitive comparison + trim before comparison
- [ ] Ensure comparisons use EXACT CSV column names (Legacy_ID, Email, Password)
- [x] Update login route to support login by Legacy_ID OR Email


## Step 3: Ensure password validation is correct
- [ ] Compare entered password to row Password with trim (and keep existing fallback password behavior if needed)

## Step 4: Verify no async loading issue
- [ ] Ensure findStudent fully resolves before sending response

## Step 5: Sanity test
- [ ] Use /students preview endpoint to verify data shape
- [ ] Test login using known Legacy_ID and Email from students.csv

