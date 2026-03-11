Role: Act as Sr.Developer who is expert in google Sheet and web based app integration

Context : Currently I am rewriting the existing app to use google app sheet instead of Firebase storage. The budget is allocated to each from each month income to envelopes from the envelop  expense happen. for 2026-03 the budget of EMI is 85000, Then all EMI transaction will from EMI Envelope

Ask : you rewrite , reconstruct if necessary to use to save any data such as income, expense, transfer or budget of each MONTH, CATEGORY TO GOOGLE SHEET API. only single authorization is required per user. if sheet is not available create a sheet else use existing . each specific function have separate sheet. always use a optimized code best coding practices to improve the performance
Make sure no data should be override or loose in any case, use oath 2 for authorization.Never use Firebase Database or local Storage
Always make sure application should have best performance. Remove Bulk, CSV, IMPORT, EXPORT , DATA , Backup and its associated code.

Redesing this Budget Planner - Google Sheets Dashboard where use can configure payment mode, add budget to each month , 
add income , add expense, transfer . make sure it always mobile friendly. maintain the income,expense,transfer transaction in single sheet
This are the row header of sheet
Month	Type	Description	Envelope	Amount	Payment Method

Here month is 2026-01,2026-02 and so on

Type is Income, Expense and Transfer

Description is paud for like tea, Milk etc

Envelope are like category which are configurable from UI, SUnch as EMI, Vegetable and so on, Amount is Money which is income or expense or transfer ,

Payment Method Can me Like HDFC Bank, SBI Bank which is canfigurable from UI

The Google sheet will be single source of truth. Always remove dead code. Make this app is deployed in firebase hosting and data is save or fetch from google sheet.

If Google spredshhet  of name  "Budget Tracker"  exist then use it else create new "Budget Tracker", Cretae a dynamic sheet name such based on requirement.The data should alway be normalized , dont want repetaive or duplicate

Once Authentication done, no verification of google sheet required. maintain two view one for desktop and other mor mobile which has same feature just desktop and mobile responsibe 

The payment method is configure in profile section, in Budget is allocated each month so Envelope (Category) should be Dropdown and also have month field which ia gain dropdown

The Envelope (Category) is global and it is configured in profile section.

In expense entry allow user to select Enevelope from dropdown, For Income the default envelope dropdown values is Income, for transfer envelope dropdown it is transfer  

SAMAPLE dATA:

Month	Type	Description	Envelope	Category	Amount	Payment Method
2026-01	Expense	Quick expense	BAI	BAI	5000	HDFC
2026-01	Expense	Car wash	BAI	BAI	400	HDFC
2026-01	Expense	Pav	DMART	DMART	108	HDFC
2026-01	Expense	Butter	DMART	DMART	118	HDFC
2026-01	Expense	Dmart 	DMART	DMART	7372	SBI Credit Card
2026-01	Expense	Pav	DMART	DMART	120	HDFC
2026-01	Expense	pav	DMART	DMART	20	HDFC
2026-01	Expense	curd	DMART	DMART	50	HDFC
2026-01	Expense	Keli Chips	DMART	DMART	40	HDFC
2026-01	Expense	Curd and Dahi	DMART	DMART	110	HDFC
2026-01	Expense	For Oil editable 	DMART	DMART	900	HDFC
2026-01	Expense	Dmart	DMART	DMART	1594	HDFC
2026-01	Expense	Snack	EATOUT	EATOUT	12	HDFC