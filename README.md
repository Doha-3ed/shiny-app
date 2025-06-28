# Skin, Hair & Body Care App — Backend

This is the complete **backend** for a Skin, Hair, and Body Care mobile application. It is built using **Node.js**, **Express**, and **MongoDB (Mongoose)**, with **Cloudinary** used for image uploads. The backend supports different user roles and personalized content based on user types.

---

## 🚀 Features by Role

### 👤 User
- Signs up and selects role as a **user**.
- Optionally takes quizzes to determine:
  - **Skin type**
  - **Hair type**
- Gets redirected to **Home Screen** with:
  - Product recommendations based on skin/hair type
  - Full product catalog
- Can:
  - Chat with doctors for consultation
  - Place orders from pharmacies

### 🧑‍⚕️ Doctor
- Registers as a **doctor**.
- Can:
  - Post advice (e.g., skin/hair care tips)
  - Set fixed consultation times
  - Manage appointments for users
  - Chat with users and pharmacies
- Gets **real-time notifications** when:
  - A user likes, comments, or replies on their post

### 🏪 Pharmacy
- Registers as a **pharmacy**.
- Can:
  - Add new products with images (Cloudinary)
  - Edit product information
  - Receive notifications when an order is placed by a user
  - Chat with doctors
- Each order notification includes:
  - Order number
  - Products in the user's cart

---

## 💬 Chat & Notifications
- Real-time chat between:
  - Users ↔️ Doctors
  - Doctors ↔️ Pharmacies
- **Notifications** sent in real-time for:
  - Post likes/comments/replies (for doctors)
  - New orders (for pharmacies)

---

## 🤖 ChatBot
- Integrated chatbot feature to answer basic user inquiries about skin, hair, and body care.

---

## 🛠️ Tech Stack

| Layer       | Tech                           |
|-------------|--------------------------------|
| Language    | JavaScript                     |
| Backend     | Node.js, Express.js            |
| Database    | MongoDB, Mongoose              |
| Image Upload| Cloudinary                     |
| Real-Time   | Socket.IO                      |
| Auth        | JWT-based Authentication       |

---

## 📁 Project Structure (Simplified)
/src
/modules
/models
/middlewares
/services
/utilities
.gitignore
README.md
package.json

------

## 🧪 Optional Quizzes
- **Skin Type Quiz**: Helps users identify their skin type.
- **Hair Type Quiz**: Helps users identify their hair type.
- Used to improve recommendation accuracy.

---

## 📦 Installation & Setup

```bash
# Clone the repo
git clone https://github.com/your-username/your-repo.git
cd your-repo

# Install dependencies
npm install

# Create a .env file and configure:
# - MongoDB URI
# - JWT Secret
# - Cloudinary credentials

# Start the server
npm run dev
