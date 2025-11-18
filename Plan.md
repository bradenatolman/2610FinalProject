# Dynamic Budgeting App Design Plan

## Overview


## Feature List

### Must-Have Features
1. **View Monthly and Yearly Budgets**
Users can see their budget and actual spending for each category in a simple table
format.
	Design
	

2. **Upload Receipts**
Users can upload pictures of receipts to keep a record of purchases. (Initially, this
may just save the image.)

3. **Login and Authentication** ``Completed``
Each user will have their own account so they can securely access their personal
budget data.

4. **Editable Budgets (Two Modes)**
- **Setup Mode:** Create or adjust the planned budget.
- **Expense Mode:** Enter actual expenses and track progress.

5. **Custom Categories**
Users can group expenses however they want (for example: Food, Rent,
Entertainment, etc.).


### Nice-to-Have Features
1. **OCR Receipt Reading**
Use an OCR tool like **Tesseract** to automatically read text from uploaded receipts
and fill in expense details.

2. **Automatic Expense Categorization**
Use simple machine learning or keyword rules to guess which category a purchase
belongs to.

3. **Graphs and Visuals**
Show charts comparing planned vs. actual spending over time using something like
**Chart.js** or **Recharts**.

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

## Group Members
1. **Dallin Moon** A02338740
2. **Braden Tolman** A02364087# 2610 Django + Vite Starting Point
This project serves as a starting point you to use as a starting point for Django applications that use Vite as the asset server for development. You are welcome to us this project for all of your assignments beginning with Module 5.

## Strategy
This application is a hybrid MPA and SPA. It reuses all of the login stuff that we did at the end of module 3 - there is a separate page for signup/signin. Once a user is logged in they are redirected to the / view which then renders the SPA application created using React and Vite.

## Creating a new application
1. Clone the repo `git clone git@github.com:dittonjs/2610DjangoViteStarter.git <your-new-project-name>`. Replace `<your-new-project-name>` with the name you want give to your project.
   - If you are using GitHub for version control, a better option would be to fork the repository instead of clone it.
3. Open the pyproject.toml file and change the `name` property. You should use `-` to separate words in your name for this property.
4. This project was set up using Python 3.11. You might have an older version installed. If you run into an error later that says that your activated Python version isn't compatible, the in the pyproject.toml file, just change the version there to match the version that you have installed. If you do this, you need to make sure that the lock file gets regenerated. You can do this by running `poetry lock --no-update` or by simply deleting the poetry.lock file (it will get regenerated when you run poetry install)/

## Initial Setup
1. Change the name property in the `pyproject.toml` file to be something unique to your project.
1. In the root directory, install the python dependencies `poetry install --no-root`
2. In the `client` directory, install the javascript dependencies `npm install`
3. In the `_server` directory, create a new file called `.env`
4. Copy the contents of `_server/.env.example` into the newly created `.env` file.
5. Activate the poetry env `poetry shell`, or, if you do not have the poetry shell plugin use `poetry run <the command you want to run>` to run somesomething
6. In the `_server` directory, run the migrations `python manage.py migrate`

## Running the appliction
1. In the `client` directory run `npm run dev`
2. In the `_server` directory (with your poetry env activated) run `python manage.py runserver`
3. Visit your application at `http://localhost:8000`

## Using this project for future classes/personal projects
Many students in the past have chosen to use this starter app template for projects in other classes like CS3450 and for personal projects. I strongly encourage you to do so! Please check with your other instructors before you use this project as a starting point for their classes. You may also want to add your name to the author field in the `pyproject.toml` file.
