# Dynamic Budgeting App Proposal

## Overview

For our final project, we plan to build a **dynamic budgeting app** that helps users
manage their money more easily. The app will let users create budgets, track
spending, upload receipts, and organize expenses into categories that make sense to
them.

The main goal is to make budgeting simpler and more visual, especially for people who
want to see where their money is going each month. The frontend will be built with
**React**, and the backend will use **Django** to handle authentication, data
storage, and receipt uploads.

## Feature List

### Must-Have Features
1. **View Monthly and Yearly Budgets**
Users can see their budget and actual spending for each category in a simple table
format.

2. **Upload Receipts**
Users can upload pictures of receipts to keep a record of purchases. (Initially, this
may just save the image.)

3. **Login and Authentication**
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
2. **Braden Tolman** A02364087
