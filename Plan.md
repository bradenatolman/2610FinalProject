# Dynamic Budgeting App Design Plan

## Must-Have Features
### 1. **View Monthly and Yearly Budgets**
* Users can see their budget and actual spending for each category in a simple table format.
* Requirments:
    * Button to switch view between
* Design Plan


### 2. **Upload Receipts**
Users can upload pictures of receipts to keep a record of purchases. (Initially, this
may just save the image.)
* Requirments:
    * 
* Design Plan

### 3. **Login and Authentication** ``Completed``
Each user will have their own account so they can securely access their personal
budget data.
* Requirments:
    * 
* Design Plan

### 4. **Editable Budgets (Two Modes)**
 * Requirments:
    * 
* Design Plan

	 #### 4.1  **Setup Mode:** Create or adjust the planned budget.
  	* Requirments:
   	 * 
	* Design Plan
	 #### 4.2  **Expense Mode:** Enter actual expenses and track progress.
  	* Requirments:
    	* 
	* Design Plan

### 5. **Custom Categories**
Users can group expenses however they want (for example: Food, Rent, Entertainment, etc.).
* Requirments:
    * Models
* Design Plan


## Nice-to-Have Features
### 6. **OCR Receipt Reading**
* Automatically read text from uploaded receipts and fill in expense details.
* Requirments:
    * an OCR tool like **Tesseract**
* Design Plan

### 7. **Automatic Expense Categorization**
* Use simple machine learning or keyword rules to guess which category a purchase
belongs to.
* Requirments:
    * 
* Design Plan

### 8. **Graphs and Visuals**
* Show charts comparing planned vs. actual spending over time using something like
* Requirments:
    * **Chart.js** or **Recharts**.
* Design Plan

## Technical Challenges

- **Sorting Expenses into Categories**
We’ll need to design a system that lets users create their own categories but can also
handle automatic sorting later.

- **OCR Integration**
Learning how to connect an OCR library like `pytesseract` to Django and process
uploaded images will take research.

- **File Upload System**
We’ll need to figure out how to upload and store receipt images securely using
Django’s media setup.

- **Optional Machine Learning**
If time allows, we’ll explore how to train a small model or use text-matching to sort
receipts into categories automatically.

## Requirements

| Requirement | How Our Project Meets It |
|-------------|--------------------------|
| **Single-page app using React and Django** | The app will use React for the frontend
and Django REST Framework for the backend API. |
| **Multiple pages with client-side routing** | We'll use React Router to handle routes
like `/login`, `/dashboard`, `/upload`, and `/reports`. |
| **Requires authentication** | Django’s built-in authentication (included in the starter
code) will protect user data. |
| **App must be useful** | This app helps users organize and visualize their budgets in
one place, solving a real-world problem. |
| **Consistent, intentional design** | We’ll use a modern design library like Tailwind
CSS or Material UI to keep the app clean and consistent. |
| **Meaningful backend and database use** | Django will handle all data storage,
including user accounts, budgets, and receipt uploads, while also managing OCR
tasks. |

## Components

Frontend:
1. List view of purchases
    - Edit mode and view mode
2. Table view of monthly budget
    - Edit mode and view mode
3. Summary of past 12 months
4. Add Categories
    - Summarize categories
    - Add categories
4. Graph Visualization


Backend
1. OCR and uploading docs

2. Graphing libraries


Database Schema

Categories

id | category |

Sub-Categories

id | category_string | subcategory | 

Purchases

id | category_string | subcategory_string | spent | month | day | year | pic_id |

Reciepts

id | reciept |

Budget

id | category_string | subcategory_string | budget

Month

id | month | budget



## Group Members
1. **Dallin Moon** A02338740
2. **Braden Tolman** A02364087# 


## Running the appliction
1. In the `client` directory run `npm run dev`
2. In the `_server` directory (with your poetry env activated) run `python manage.py runserver`
3. Visit your application at `http://localhost:8000`

## Using this project for future classes/personal projects
Many students in the past have chosen to use this starter app template for projects in other classes like CS3450 and for personal projects. I strongly encourage you to do so! Please check with your other instructors before you use this project as a starting point for their classes. You may also want to add your name to the author field in the `pyproject.toml` file.
