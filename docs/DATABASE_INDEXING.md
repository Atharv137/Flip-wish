# Database Indexing

## Cart Collection

**Indexed Field**: `user`
**Type**: Single Field Index (Ascending)

**Actual Query**:
The cart collection is frequently queried by the `user` field when retrieving a user's cart items or adding a new item to their cart. 

**Why the index improves lookup performance**:
Without an index, MongoDB would perform a collection scan (checking every document in the `Cart` collection) to find the cart items belonging to a specific user. By adding an index on `user: 1`, MongoDB uses an efficient B-tree traversal to instantly find the relevant documents.

**Read-Performance Benefit**:
Lookups become `O(log N)` instead of `O(N)`. This leads to significantly faster response times for fetching the cart.

**Write/Update/Delete Maintenance Cost**:
Every time a document is inserted, updated (if the `user` field changes), or deleted, the index must be updated. However, the read-heavy nature of cart retrievals makes this slight write penalty highly worthwhile.
