# 🤖 Smart Categorization Guide

## Overview

The system learns from your category assignments and automatically categorizes future transactions from the same vendors!

## How It Works

### 1. You Assign a Category Once
```
Transaction: SAMRUDDHI SNACKS
You assign: Eatout
```

### 2. System Learns
```
✅ Learned: "SAMRUDDHI SNACKS" → "Eatout"
```

### 3. Future Transactions Auto-Categorized
```
Next import with SAMRUDDHI SNACKS
→ Automatically assigned to "Eatout" ✨
```

## Example Workflow

### First Time Import
```
Import transactions:
1. SAMRUDDHI SNACKS - ₹20 (no category)
2. PANKAJ HARDWARE - ₹825 (no category)
3. SMART BAZAAR - ₹150 (no category)
```

### Assign Categories
```
1. SAMRUDDHI SNACKS → Eatout
2. PANKAJ HARDWARE → Shopping
3. SMART BAZAAR → Groceries
```

### System Learns
```
✅ Learned 3 mappings:
   SAMRUDDHI SNACKS → Eatout
   PANKAJ HARDWARE → Shopping
   SMART BAZAAR → Groceries
```

### Next Import (Automatic!)
```
Import new transactions:
1. SAMRUDDHI SNACKS - ₹12 → Eatout ✨ (auto-assigned)
2. PANKAJ HARDWARE - ₹500 → Shopping ✨ (auto-assigned)
3. NEW VENDOR - ₹100 (no category - needs assignment)
```

## Where Learning Happens

### 1. Transaction Table (Double-Click Edit)
```
Transactions Tab → Double-click category cell → Select category
→ System learns immediately!
```

### 2. Transaction Review Modal
```
Review transaction → Assign category → Save
→ System learns!
```

### 3. Bulk Edit
```
Select multiple transactions → Bulk assign category
→ System learns from each!
```

## Managing Learned Mappings

### Apply to Existing Transactions
1. Go to **Profile** (click profile button)
2. Scroll to **"🤖 Smart Categorization"**
3. Click **"✨ Apply to Existing"**
4. Review preview of what will be categorized
5. Confirm to apply

**What it does:**
- Finds all uncategorized expense transactions
- Matches them against learned vendor mappings
- Automatically assigns categories
- Shows preview before applying

**Example:**
```
You have 50 uncategorized transactions
System finds 30 matching learned vendors
Preview shows:
  SAMRUDDHI SNACKS → Eatout
  PANKAJ HARDWARE → Shopping
  SMART BAZAAR → Groceries
  ...and 27 more

Confirm → 30 transactions auto-categorized! ✨
20 remaining need manual categorization
```

### View Learned Mappings
1. Go to **Profile** (click profile button)
2. Scroll to **"🤖 Smart Categorization"**
3. Click **"📋 View Learned Mappings"**
4. See all vendor-to-category mappings

### Clear All Mappings
1. Go to **Profile** → **Smart Categorization**
2. Click **"🗑️ Clear All"**
3. Confirm to remove all learned mappings

**Note:** Clearing mappings doesn't affect existing transactions, only future auto-assignments.

## Real-World Examples

### Food & Dining
```
SAMRUDDHI SNACKS → Eatout
BHAGYALAXMI SNACKS → Eatout
S B FOOD CORNER → Eatout
SMART BAZAAR → Groceries
```

### Shopping
```
FLIPKART → Shopping
AMAZON → Shopping
BEAUTIFUL CHOICE → Shopping
```

### Utilities
```
GOOGLE → Subscriptions
PHONEPE → Transfers
```

### Personal
```
AMRUTA VITTHAL RAUT → Personal
GUPTA BINAYKUMAR → Personal
```

## Benefits

✅ **Save Time** - No need to categorize same vendors repeatedly
✅ **Consistent** - Same vendor always gets same category
✅ **Automatic** - Works on import without manual intervention
✅ **Smart** - Learns from your preferences
✅ **Flexible** - Can change mappings anytime

## Tips for Best Results

### 1. Use Consistent Vendor Names
The system matches exact vendor names (case-insensitive). Thanks to our description cleaning, vendor names are already consistent!

### 2. Categorize Common Vendors First
Start with vendors you transact with frequently:
- Regular grocery stores
- Favorite restaurants
- Common online shops

### 3. Review Auto-Assignments
After import, quickly review auto-assigned categories to ensure accuracy.

### 4. Update Mappings as Needed
If a vendor changes (e.g., restaurant becomes takeout), just reassign and the system learns the new mapping.

## How It's Stored

### localStorage Key
```
vendorCategoryMappings
```

### Format
```json
{
  "samruddhi snacks": "Eatout",
  "pankaj hardware": "Shopping",
  "smart bazaar": "Groceries"
}
```

### Backup
Vendor mappings are included in data exports, so they're backed up with your other data!

## Console Commands

### View Mappings
```javascript
const mappings = JSON.parse(localStorage.getItem('vendorCategoryMappings') || '{}');
console.table(mappings);
```

### Add Manual Mapping
```javascript
const mappings = JSON.parse(localStorage.getItem('vendorCategoryMappings') || '{}');
mappings['new vendor'] = 'Category Name';
localStorage.setItem('vendorCategoryMappings', JSON.stringify(mappings));
```

### Clear Specific Mapping
```javascript
const mappings = JSON.parse(localStorage.getItem('vendorCategoryMappings') || '{}');
delete mappings['vendor name'];
localStorage.setItem('vendorCategoryMappings', JSON.stringify(mappings));
```

## Troubleshooting

### Auto-Assignment Not Working

**Check if mapping exists:**
```javascript
const mappings = JSON.parse(localStorage.getItem('vendorCategoryMappings') || '{}');
console.log(mappings['vendor name']);
```

**Check vendor name format:**
- Vendor names are stored in lowercase
- Must match exactly (after cleaning)

### Wrong Category Assigned

**Solution:** Just reassign the correct category
- The system will learn the new mapping
- Future transactions will use the updated category

### Too Many Mappings

**Solution:** Clear all and start fresh
- Profile → Smart Categorization → Clear All
- Re-assign categories for your most common vendors

## Privacy & Security

- ✅ Stored locally in your browser
- ✅ Not sent to any server
- ✅ Included in data exports
- ✅ Can be cleared anytime

## Summary

The smart categorization system learns from your category assignments and automatically applies them to future transactions from the same vendors. This saves time and ensures consistency across your transaction history!

Just assign categories once, and let the system handle the rest! 🎉
