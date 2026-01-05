# How to Share Your Database

Since you are currently using a **Local Database** (`mongodb://localhost...`), other people cannot access your data directly because it lives only on your specific computer.

To share your data, you have two options:

## Option 1: The "Easy" Way (Moving to Cloud) - Recommended
This allows everyone to connect to the *same* live database. If you add a user, your friend sees it immediately.

1.  **Create an Account:** Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) and sign up.
2.  **Create a Project:** If asked, give your project a name (e.g., "LMS Project") and click "Next" -> "Create Project".
3.  **Create a Database User (Use this password!):**
    *   Go to the **Security** tab on the left -> **Database Access**.
    *   Click the green **+ Add New Database User** button.
    *   **Username:** (e.g., `admin`)
    *   **Password:** Click "Autogenerate Secure Password" (COPY THIS! This is the password you need).
    *   Click **Add User**.
4.  **Network Access (Important!):**
    *   Go to **Security** -> **Network Access**.
    *   Click **+ Add IP Address**.
    *   Click **Allow Access from Anywhere** (0.0.0.0/0).
    *   Click **Confirm**.
5.  **Build a Database:**
4.  **Get Connection String:**
    *   Wait 1-3 minutes for the cluster to start.
    *   Once it says "Active", click the **Connect** button.
    *   Choose **Drivers** -> Copy the connection string.
4.  **Update Your Code:**
    *   Open your `.env` file in `lms-backend`.
    *   Replace `MONGODB_URI=mongodb://localhost:27017/lms` with your new Atlas URL.
    *   *Note: Replace `<password>` with your actual database password.*
5.  **Share the URL:** Give this same `.env` line to your friends. Now you are all using the same cloud database!

---

## Option 2: The "Offline" Way (Export/Import)
Use this if you want to send a snapshot of your data to a friend, but keep your databases separate.

### Step 1: Export Your Data
Run this command in your terminal to save your data to a JSON file:

```bash
# Export Users
mongoexport --db lms --collection users --out users.json

# Export Courses
mongoexport --db lms --collection courses --out courses.json
```

### Step 2: Share the Files
Send the generated `users.json` and `courses.json` files to your friend.

### Step 3: Import (For your friend)
Your friend runs this command to load your data into their computer:

```bash
# Import Users
mongoimport --db lms --collection users --file users.json

# Import Courses
mongoimport --db lms --collection courses --file courses.json
```
