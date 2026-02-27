# CSV Import Feature

## How to Use

1. Click the **CSV** button in the Quick Expense section
2. Download the template CSV file
3. Fill in your expenses following the format
4. Upload the completed CSV file
5. Review the preview and click Import

## CSV Format

```csv
envelope,amount,description,paymentMethod,date
needs.grocery,2500,Monthly groceries,HDFC,2026-01-15
needs.milk,450,Daily milk,Cash,2026-01-16
needs.vegetable,800,Weekly vegetables,GPay,2026-01-17
needs.petrol,3000,Fuel for car,Credit Card,2026-01-18
needs.electricity,1200,Monthly bill,HDFC,2026-01-19
needs.water,300,Water bill,HDFC,2026-01-20
needs.gas,900,LPG cylinder,Cash,2026-01-21
needs.medical,500,Pharmacy,HDFC,2026-01-22
wants.misc,1000,Entertainment,Credit Card,2026-01-23
wants.salary-bai,5000,House help salary,Cash,2026-01-24
```

### Fields:
- **envelope**: category.name format
  - **Needs**: needs.emi, needs.grocery, needs.milk, needs.gas, needs.water, needs.electricity, needs.petrol, needs.school, needs.vegetable, needs.medical, needs.insurance
  - **Savings**: savings.wife sip, savings.my sip, savings.ssy
  - **Wants**: wants.salary-bai, wants.vacation, wants.misc

- **amount**: numeric value (e.g., 500, 1200.50)

- **description**: text description (optional, max 100 characters)
  - Defaults to "CSV import" if empty

- **paymentMethod**: must match existing payment methods
  - Common: HDFC, Credit Card, Cash, GPay, etc.
  - Defaults to first payment method if empty

- **date**: YYYY-MM-DD format
  - Example: 2026-01-15
  - Defaults to today if empty

## Bulk Add Feature

Alternatively, use the **Bulk** button to manually add multiple expenses in a form interface.
